import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { db } from '@/service/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import dynamic from 'next/dynamic';
const MapWithNoSSR = dynamic(() => import('./MapComponent'), { ssr: false });



ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function TravelDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalTrips: 0,
    countriesVisited: 0,
    continentsExplored: 0,
    totalSpent: 0,
    upcomingTrips: 0,
    averageTripLength: 0
  });
  const [activityData, setActivityData] = useState({
    labels: ['Cultural', 'Adventure', 'Relaxation', 'Food & Dining', 'Nature'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
      ]
    }]
  });
  const [budgetData, setBudgetData] = useState({
    labels: ['Accommodation', 'Food', 'Activities', 'Transportation', 'Shopping'],
    datasets: [{
      label: 'Average Spend per Trip (USD)',
      data: [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(54, 162, 235, 0.6)'
    }]
  });
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.email) {
          console.log("No user email found in localStorage");
          return;
        }
        
        console.log("Fetching trips for:", user.email);
        
        // First load Google Maps
        await loadGoogleMapsScript();
        
        const q = query(
          collection(db, 'AITrips'),
          where('userEmail', '==', user.email)
        );
        
        const querySnapshot = await getDocs(q);
        const tripsData = [];
        
        console.log(`Found ${querySnapshot.size} trips for this user`);
        
        querySnapshot.forEach((doc) => {
          const tripData = {
            id: doc.id,
            ...doc.data()
          };
          console.log("Trip found:", tripData.tripData?.trip?.destination, 
                      "Start date:", tripData.userSelection?.startDate);
          tripsData.push(tripData);
        });
        
        setTrips(tripsData);
        await analyzeTrips(tripsData);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrips();
  }, [refreshKey]);
  
  // Add this function to load Google Maps
  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        const checkGoogleExists = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleExists);
            resolve();
          }
        }, 100);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps'));
      };
      
      document.head.appendChild(script);
    });
  };
  
  const analyzeTrips = async (tripsData) => {
    // Simple stats
    const tripCount = tripsData.length;
    
    // Extract unique countries
    const countries = new Set();
    const continents = new Set();
    const locations = [];
    let totalDays = 0;
    let upcomingCount = 0;
    
    // Category counters
    const activities = { cultural: 0, adventure: 0, relaxation: 0, food: 0, nature: 0 };
    
    // Use real flight data
    const spending = { 
      flights: 0, 
      accommodation: 0, 
      food: 0, 
      activities: 0, 
      transportation: 0, 
      shopping: 0 
    };
    
    // Count how many trips have flight data to calculate average
    let tripsWithFlightData = 0;
    
    const validTrips = tripsData.filter(trip => 
      trip.tripData?.trip?.destination && 
      trip.userSelection?.numDays
    );
    
    for (const trip of validTrips) {
      // Add country
      const destination = trip.tripData?.trip?.destination;
      if (destination) {
        const country = destination.includes(',') 
          ? destination.split(',')[1]?.trim() 
          : destination;
        
        countries.add(country);
        
        const days = parseInt(trip.userSelection?.numDays || '0');
        
        // Handle map coordinates using geocoding
        // This mimics what's done in MyTrips component
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const results = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: destination }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        const position = results[0].geometry.location;
        
        locations.push({
          id: trip.id,
          name: destination,
          days: days,
          coordinates: [position.lat(), position.lng()],
          startDate: trip.userSelection?.startDate,
        });
      } catch (error) {
        console.error(`Failed to geocode ${destination}:`, error);
        // Fallback to random coordinates
        locations.push({
          id: trip.id,
          name: destination,
          days: days,
          coordinates: getApproximateCoordinates(destination),
          startDate: trip.userSelection?.startDate,
        });
      }
    } else {
      // If Google Maps API is not available, use random coordinates
      locations.push({
        id: trip.id,
        name: destination,
        days: days,
        coordinates: getApproximateCoordinates(destination),
        startDate: trip.userSelection?.startDate,
      });
    }
        
        totalDays += days;
      }
      
      // Check if upcoming
      const startDate = trip.userSelection?.startDate;
      if (startDate && new Date(startDate) > new Date()) {
        upcomingCount++;
      }
      
      // Get real flight price data from the trip if available
      if (trip.tripData?.flights?.options) {
        let flightPrice = 0;
        const bestPrice = trip.tripData?.flights?.options?.best?.pricePerPerson;
        const cheapestPrice = trip.tripData?.flights?.options?.cheapest?.pricePerPerson;
        
        // Extract numeric price value from string (remove $ and convert to number)
        if (bestPrice) {
          const bestPriceValue = parseFloat(bestPrice.replace(/[^\d.]/g, ''));
          if (!isNaN(bestPriceValue)) {
            flightPrice = bestPriceValue;
          }
        } else if (cheapestPrice) {
          const cheapestPriceValue = parseFloat(cheapestPrice.replace(/[^\d.]/g, ''));
          if (!isNaN(cheapestPriceValue)) {
            flightPrice = cheapestPriceValue;
          }
        }
        
        if (flightPrice > 0) {
          spending.flights += flightPrice;
          tripsWithFlightData++;
        }
      }
      
      // Mock analysis of activities
      const tripActivities = trip.tripData?.itinerary || {};
      Object.values(tripActivities).forEach(dayActivities => {
        if (Array.isArray(dayActivities)) {
          dayActivities.forEach(activity => {
            const desc = (activity.activity + ' ' + activity.description).toLowerCase();
            
            // Categorize activities (simplified)
            if (desc.includes('museum') || desc.includes('culture') || desc.includes('historic')) {
              activities.cultural++;
            } else if (desc.includes('hike') || desc.includes('adventure') || desc.includes('trek')) {
              activities.adventure++;
            } else if (desc.includes('beach') || desc.includes('spa') || desc.includes('rest')) {
              activities.relaxation++;
            } else if (desc.includes('restaurant') || desc.includes('food') || desc.includes('dinner')) {
              activities.food++;
            } else if (desc.includes('nature') || desc.includes('park') || desc.includes('garden')) {
              activities.nature++;
            }
          });
        }
      });
      
      // Mock budget data for other categories
      const budget = trip.userSelection?.budget || '';
      const budgetMultiplier = 
        budget.includes('Luxury') ? 1000 : 
        budget.includes('Comfort') ? 500 : 
        budget.includes('Budget') ? 200 : 300;
      
      spending.accommodation += budgetMultiplier * 0.4;
      spending.food += budgetMultiplier * 0.2;
      spending.activities += budgetMultiplier * 0.15;
      spending.transportation += budgetMultiplier * 0.15;
      spending.shopping += budgetMultiplier * 0.1;
    }
    
    // Calculate flight average based on trips with flight data
    const flightAverage = tripsWithFlightData > 0 
      ? spending.flights / tripsWithFlightData 
      : 0;
      
    // Total spent including actual flight data
    const totalSpent = Object.values(spending).reduce((sum, val) => sum + val, 0);
    
    // Update stats
    setStats({
      totalTrips: validTrips.length,
      countriesVisited: countries.size,
      continentsExplored: continents.size || Math.min(3, Math.floor(countries.size / 3)),
      totalSpent: totalSpent,
      upcomingTrips: validTrips.filter(trip => {
        const startDate = trip.userSelection?.startDate;
        return startDate && new Date(startDate) > new Date();
      }).length,
      averageTripLength: validTrips.length ? (totalDays / validTrips.length).toFixed(1) : 0,
      tripsWithFlightData: tripsWithFlightData
    });
    
    // Update chart data
    setActivityData({
      labels: ['Cultural', 'Adventure', 'Relaxation', 'Food & Dining', 'Nature'],
      datasets: [{
        data: [
          activities.cultural, 
          activities.adventure, 
          activities.relaxation, 
          activities.food, 
          activities.nature
        ],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }]
    });
    
    // Update budget data to include flights
    setBudgetData({
      labels: ['Flights', 'Accommodation', 'Food', 'Activities', 'Transportation', 'Shopping'],
      datasets: [{
        label: 'Average Spend per Trip (USD)',
        data: [
          flightAverage,
          spending.accommodation / tripCount, 
          spending.food / tripCount, 
          spending.activities / tripCount, 
          spending.transportation / tripCount, 
          spending.shopping / tripCount
        ],
        backgroundColor: [
          'rgba(220, 38, 38, 0.6)', // Red for flights
          'rgba(59, 130, 246, 0.6)', // Blue
          'rgba(16, 185, 129, 0.6)', // Green
          'rgba(245, 158, 11, 0.6)', // Yellow
          'rgba(139, 92, 246, 0.6)', // Purple
          'rgba(14, 165, 233, 0.6)'  // Sky
        ]
      }]
    });
    
    setDestinations(locations);
  };
  
  const getApproximateCoordinates = (location) => {
    // This would be replaced with a proper geocoding service
    // For now, return random coordinates
    return [
      (Math.random() * 140) - 70, // latitude between -70 and 70
      (Math.random() * 340) - 170  // longitude between -170 and 170
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-[140px] pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with subtitle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Travel Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Insights and statistics about your travel history and plans</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            <button 
              onClick={() => setRefreshKey(old => old + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
          
        {/* Stats Cards - enhanced design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatsCard
            title="Total Trips"
            value={stats.totalTrips}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-gradient-to-br from-blue-600 to-blue-700"
          />
          <StatsCard
            title="Countries Visited"
            value={stats.countriesVisited}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            }
            color="bg-gradient-to-br from-purple-600 to-purple-700"
          />
          <StatsCard
            title="Continents Explored"
            value={stats.continentsExplored}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            color="bg-gradient-to-br from-green-600 to-green-700"
          />
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toLocaleString()}`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatsCard
            title="Upcoming Trips"
            value={stats.upcomingTrips}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
            color="bg-gradient-to-br from-red-600 to-red-700"
          />
          <StatsCard
            title="Avg. Trip Length"
            value={`${stats.averageTripLength} days`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="bg-gradient-to-br from-indigo-600 to-indigo-700"
          />
        </div>
  
        {/* Add detailed spending breakdown */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl mb-10 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Travel Spending Breakdown
            </h2>
            <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300">
              {stats.tripsWithFlightData} trips with flight data
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {budgetData.datasets[0].data.map((value, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: budgetData.datasets[0].backgroundColor[index] }}></div>
                  <span className="text-gray-300 text-sm font-medium">{budgetData.labels[index]}</span>
                </div>
                <div className="text-white font-bold text-2xl">
                  ${Math.round(value).toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  per trip average
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Map and Charts - enhanced design */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
  {/* Travel Map */}
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 lg:col-span-2">
    <div className="bg-gray-800/80 backdrop-blur p-4 border-b border-gray-700/50 flex justify-between items-center">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Your Travel Map
      </h2>
      <div className="text-sm text-gray-400">
        {destinations.length} destinations mapped
      </div>
    </div>
    <div className="h-[400px] relative bg-gray-900/70">
      {destinations.length > 0 ? (
        <MapWithNoSSR destinations={destinations} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-gray-500 text-lg">No travel data to display</p>
        </div>
      )}
    </div>
  </div>
  
  {/* Travel Style */}
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
    <div className="bg-gray-800/80 backdrop-blur p-4 border-b border-gray-700/50 flex justify-between items-center">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Travel Style
      </h2>
    </div>
    <div className="p-6 flex flex-col items-center">
      <div className="h-[260px] w-[260px] relative">
        <Pie 
          data={activityData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: {
                  size: 14,
                  family: "'Inter', sans-serif",
                  weight: 'bold'
                },
                bodyFont: {
                  size: 13,
                  family: "'Inter', sans-serif"
                },
                borderColor: 'rgba(75, 85, 99, 0.3)',
                borderWidth: 1,
                displayColors: true,
                boxPadding: 6,
                cornerRadius: 8
              }
            },
            cutout: '0%',
            radius: '90%'
          }}
        />
      </div>
      
      {/* Custom legend */}
      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 w-full">
        {activityData.labels.map((label, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activityData.datasets[0].backgroundColor[index] }}
            ></div>
            <span className="text-gray-300 text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
          
        {/* Budget Breakdown - enhanced design */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 mb-10">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Budget Breakdown
              </h2>
              <div className="text-sm text-gray-400">
                Average spend per category, per trip
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-[300px]">
              <Bar 
                data={budgetData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      ticks: { 
                        color: 'rgba(255,255,255,0.7)',
                        callback: (value) => `$${value}`
                      },
                      grid: { 
                        color: 'rgba(255,255,255,0.1)',
                        drawBorder: false
                      }
                    },
                    x: {
                      ticks: { color: 'rgba(255,255,255,0.7)' },
                      grid: { 
                        display: false,
                        drawBorder: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif",
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13,
                        family: "'Inter', sans-serif"
                      },
                      borderColor: 'rgba(75, 85, 99, 0.3)',
                      borderWidth: 1,
                      displayColors: true,
                      boxPadding: 6,
                      cornerRadius: 8,
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: 'USD' 
                            }).format(context.parsed.y);
                          }
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* Flight data source info */}
            <div className="mt-6 flex items-start gap-3 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-300 text-sm">
                  Flight costs are based on {stats.tripsWithFlightData} trips with available flight data. 
                  For trips without flight information, estimates are derived from destinations and budget preferences.
                </p>
                <p className="text-blue-300 text-sm mt-1">
                  All other expenses are calculated based on your selected budget level for each trip.
                </p>
              </div>
            </div>
          </div>
        </div>
          
        {/* Recent Trips Timeline - enhanced design */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Trip Timeline
              </h2>
              <div className="text-sm text-gray-400">
                {trips.length} total trips
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {trips.length > 0 ? 
                trips
                  .slice()
                  .sort((a, b) => {
                    const dateA = a.userSelection?.startDate ? new Date(a.userSelection.startDate) : new Date(0);
                    const dateB = b.userSelection?.startDate ? new Date(b.userSelection.startDate) : new Date(0);
                    const today = new Date();
                    
                    const aIsUpcoming = dateA > today;
                    const bIsUpcoming = dateB > today;
                    
                    if (aIsUpcoming && !bIsUpcoming) return -1;
                    if (!aIsUpcoming && bIsUpcoming) return 1;
                    
                    return aIsUpcoming ? dateA - dateB : dateB - dateA;
                  })
                  .slice(0, 10)
                  .map((trip, index) => (
                    <TimelineItem 
                      key={trip.id}
                      trip={trip}
                      index={index}
                    />
                  )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <p className="text-gray-400 mb-3">No trips found in your account</p>
                  <a 
                    href="/create-trip" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition-colors"
                  >
                    Create Your First Trip
                  </a>
                </div>
              )
            }
          </div>
          
          {/* Show more trips button */}
          {trips.length > 10 && (
            <div className="mt-6 text-center">
              <a 
                href="/my-trips" 
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                View all trips
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer with user experience info */}
      <div className="mt-10 flex items-center justify-between text-gray-500 text-sm">
        <div>
          Dashboard updated at {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-white transition-all hover:scale-105">
            <span className="sr-only">Accessibility Settings</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-white hover:text-white transition-all hover:scale-105">
            <span className="sr-only">Print Dashboard</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-white hover:text-white transition-all hover:scale-105 ">
            <span className="sr-only">Export Data</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

// Helper Components
function StatsCard({ title, value, icon, color }) {
  return (
    <motion.div 
      className={`${color} rounded-xl overflow-hidden shadow-lg relative`}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 transform rotate-45 translate-x-6 -translate-y-6"></div>
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/80 font-medium text-sm">{title}</p>
            <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-white">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Timeline Item
function TimelineItem({ trip, index }) {
  const destination = trip.tripData?.trip?.destination || 'Unknown Destination';
  const startDate = trip.userSelection?.startDate ? new Date(trip.userSelection?.startDate) : null;
  const isUpcoming = startDate && startDate > new Date();
  
  const formatDate = (date) => {
    if (!date) return 'No date specified';
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString(undefined, options);
  };
  
  const getDaysUntil = (date) => {
    if (!date) return null;
    
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 0) return null;
    return daysDiff === 1 ? 'Tomorrow' : `in ${daysDiff} days`;
  };
  
  const daysUntil = getDaysUntil(startDate);

  const handleTripClick = () => {
    window.location.href = `/view-trip/${trip.id}`;
  };
  
  return (
    <motion.div 
      className="flex gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUpcoming ? 'bg-gradient-to-br from-white to-white' : 'bg-gradient-to-br from-green-500 to-green-600'} shadow-lg`}>
          <span className="text-white text-md">{isUpcoming ? '🔜' : '✓'}</span>
        </div>
        {index < 9 && <div className="w-0.5 h-full bg-gray-700 mt-2"></div>}
      </div>
      <div 
        className={`rounded-xl p-4 flex-1 mb-4 cursor-pointer transition-all transform hover:scale-[1.02] border ${isUpcoming ? 'bg-blue-900/20 border-blue-800/50 hover:border-blue-500/50' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}
        onClick={handleTripClick}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-white text-lg">{destination}</h3>
          <span className={`text-xs font-medium px-3 py-1 rounded-full shadow-sm ${isUpcoming ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'}`}>
            {isUpcoming ? 'Upcoming' : 'Completed'}
          </span>
        </div>
        <div className="text-gray-300 text-sm mt-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(startDate)}
          {daysUntil && (
            <span className="ml-1 inline-flex items-center text-blue-300 font-medium">
              ({daysUntil})
            </span>
          )}
        </div>
        
        <div className="flex gap-2 mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/70 px-2 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {trip.userSelection?.travelers || 'Solo'}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/70 px-2 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {trip.userSelection?.budget || 'Standard'} Budget
          </div>
          {trip.tripData?.trip?.duration && (
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/70 px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {trip.tripData?.trip?.duration}
            </div>
          )}
        </div>
        
        {/* Flight data if available */}
        {trip.tripData?.flights?.options?.best?.pricePerPerson && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-300">
            <div className="flex items-center gap-1 bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Flight: {trip.tripData?.flights?.options?.best?.pricePerPerson}
            </div>
            <div className="text-gray-400">
              {trip.tripData?.flights?.options?.best?.airline}
            </div>
          </div>
        )}
        
        {/* View button */}
        <div className="mt-3 flex justify-end">
          <button className="flex items-center gap-1 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Trip Details
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  export default TravelDashboard;