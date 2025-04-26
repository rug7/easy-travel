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
        if (!user?.email) return;
        
        // First load Google Maps
        await loadGoogleMapsScript();
        
        const q = query(
          collection(db, 'AITrips'),
          where('userEmail', '==', user.email)
        );
        
        const querySnapshot = await getDocs(q);
        const tripsData = [];
        
        querySnapshot.forEach((doc) => {
          tripsData.push({
            id: doc.id,
            ...doc.data()
          });
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
  }, []);
  
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
    const spending = { accommodation: 0, food: 0, activities: 0, transportation: 0, shopping: 0 };
    
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
      
      // Mock budget data
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
    } // <-- The issue was here - brace was misplaced
    
    // Update stats
    setStats({
      totalTrips: validTrips.length,
      countriesVisited: countries.size,
      continentsExplored: continents.size || Math.min(3, Math.floor(countries.size / 3)),
      totalSpent: Object.values(spending).reduce((sum, val) => sum + val, 0),
      upcomingTrips: upcomingCount,
      averageTripLength: validTrips.length ? (totalDays / validTrips.length).toFixed(1) : 0
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
    
    setBudgetData({
      labels: ['Accommodation', 'Food', 'Activities', 'Transportation', 'Shopping'],
      datasets: [{
        label: 'Average Spend per Trip (USD)',
        data: [
          spending.accommodation / tripCount, 
          spending.food / tripCount, 
          spending.activities / tripCount, 
          spending.transportation / tripCount, 
          spending.shopping / tripCount
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
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
    <div className="min-h-screen bg-gray-900 pt-[100px] pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Travel Analytics Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Trips"
            value={stats.totalTrips}
            icon="🌍"
            color="bg-blue-600"
          />
          <StatsCard
            title="Countries Visited"
            value={stats.countriesVisited}
            icon="🏁"
            color="bg-purple-600"
          />
          <StatsCard
            title="Continents Explored"
            value={stats.continentsExplored}
            icon="🧭"
            color="bg-green-600"
          />
          <StatsCard
            title="Total Spent"
            value={`$${stats.totalSpent.toLocaleString()}`}
            icon="💰"
            color="bg-yellow-600"
          />
          <StatsCard
            title="Upcoming Trips"
            value={stats.upcomingTrips}
            icon="✈️"
            color="bg-red-600"
          />
          <StatsCard
            title="Avg. Trip Length"
            value={`${stats.averageTripLength} days`}
            icon="📅"
            color="bg-indigo-600"
          />
        </div>
        
        {/* Map and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Travel Map */}
          <div className="bg-gray-800 rounded-xl p-4 lg:col-span-2 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Your Travel Map</h2>
            <div className="h-[400px] rounded-lg overflow-hidden">
              {destinations.length > 0 ? (
                    <MapWithNoSSR destinations={destinations} />

              ) : (
                <div className="h-full flex items-center justify-center bg-gray-700 rounded-lg">
                  <p className="text-gray-400">No travel data to display</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Travel Style */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Travel Style</h2>
            <div className="h-[400px] flex items-center justify-center">
              <Pie 
                data={activityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'white',
                        font: {
                          size: 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Budget Breakdown */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Budget Breakdown</h2>
          <div className="h-[300px]">
            <Bar 
              data={budgetData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    ticks: { color: 'rgba(255,255,255,0.7)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  x: {
                    ticks: { color: 'rgba(255,255,255,0.7)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'white'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Recent Trips Timeline */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Trip Timeline</h2>
          <div className="space-y-4">
            {trips.length > 0 ? trips.slice(0, 5).map((trip, index) => (
              <TimelineItem 
                key={trip.id}
                trip={trip}
                index={index}
              />
            )) : (
              <p className="text-gray-400 text-center py-10">No trips to display</p>
            )}
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
      className={`${color} rounded-xl p-6 shadow-lg`}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-opacity-80 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );
}

function TimelineItem({ trip, index }) {
    const destination = trip.tripData?.trip?.destination || 'Unknown Destination';
    const startDate = trip.userSelection?.startDate ? new Date(trip.userSelection?.startDate) : null;
    const isUpcoming = startDate && startDate > new Date();
    
    return (
      <motion.div 
        className="flex gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUpcoming ? 'bg-blue-500' : 'bg-green-500'}`}>
            <span className="text-white text-sm">{isUpcoming ? '🔜' : '✓'}</span>
          </div>
          {index < 4 && <div className="w-0.5 h-full bg-gray-700 mt-2"></div>}
        </div>
        <div className="bg-gray-700 rounded-lg p-4 flex-1 mb-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-white">{destination}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isUpcoming ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
              {isUpcoming ? 'Upcoming' : 'Completed'}
            </span>
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {startDate ? startDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'No date specified'}
            {trip.tripData?.trip?.duration && ` · ${trip.tripData.trip.duration}`}
          </div>
          <div className="flex gap-2 mt-3">
            <div className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
              {trip.userSelection?.travelers || 'Solo'}
            </div>
            <div className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
              {trip.userSelection?.budget || 'Standard'} Budget
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  export default TravelDashboard;