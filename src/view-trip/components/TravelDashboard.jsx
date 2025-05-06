import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { translateTripData, translateTripDetails } from "@/utils/translateTripData"

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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useLanguage } from "@/context/LanguageContext";




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
  const dashboardRef = useRef(null);
  const { colorMode } = useAccessibility();
  const { translate, language } = useLanguage();
const isRTL = language === "he";
  const [stats, setStats] = useState({
    totalTrips: 0,
    countriesVisited: 0,
    continentsExplored: 0,
    totalSpent: 0,
    upcomingTrips: 0,
    averageTripLength: 0
  });
  const [activityData, setActivityData] = useState({
    labels: [
      translate("cultural"), 
      translate("adventure"), 
      translate("relaxation"), 
      translate("foodAndDining"), 
      translate("nature")
    ],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
      ]
    }]
  });
  const [budgetData, setBudgetData] = useState({
    labels: [
      translate("flightCost"),
      translate("accommodationCost"), 
      translate("foodCost"), 
      translate("activitiesCost"), 
      translate("transportationCost"), 
      translate("shoppingCost")
    ],
    datasets: [{
      label: translate("averageSpendPerTrip"),
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(54, 162, 235, 0.6)'
    }]
  });
  const [destinations, setDestinations] = useState([]);

  const getAccessibleColor = (colorType) => {
    // Map standard color names to your colorMode-specific colors
    const colorMap = {
      default: {
        primary: '#3b82f6', // blue-500
        secondary: '#8b5cf6', // purple-500
        success: '#10b981', // green-500
        danger: '#ef4444', // red-500
        warning: '#f59e0b', // amber-500
        info: '#3b82f6', // blue-500
        iconColor: '#ffffff', // White for normal mode
      },
      protanopia: {
        primary: '#2563eb', // More bluish
        secondary: '#7c3aed', // More visible purple
        success: '#059669', // Adjusted green
        danger: '#9ca3af', // Gray instead of red
        warning: '#d97706', // Darker amber
        info: '#0284c7', // Darker blue
        iconColor: '#3b82f6', // Use accessible colors for color-blind modes
      },
      deuteranopia: {
        primary: '#1d4ed8', // Deeper blue
        secondary: '#6d28d9', // Deeper purple
        success: '#0f766e', // Teal instead of green
        danger: '#b91c1c', // More visible red
        warning: '#b45309', // Darker amber
        info: '#1e40af', // Deeper blue
        iconColor: '#1d4ed8',
      },
      tritanopia: {
        primary: '#4f46e5', // Indigo
        secondary: '#7e22ce', // Darker purple
        success: '#15803d', // Darker green
        danger: '#dc2626', // Bright red
        warning: '#ca8a04', // Darker yellow
        info: '#4338ca', // Indigo
        iconColor: '#4f46e5',

      },
      monochromacy: {
        primary: '#4b5563', // Gray-600
        secondary: '#6b7280', // Gray-500
        success: '#374151', // Gray-700
        danger: '#1f2937', // Gray-800
        warning: '#6b7280', // Gray-500
        info: '#4b5563', // Gray-600
        iconColor: '#4f46e5',

      },
      highContrast: {
        primary: '#1d4ed8', // Deep blue
        secondary: '#6d28d9', // Deep purple
        success: '#047857', // Deep green
        danger: '#b91c1c', // Deep red
        warning: '#b45309', // Deep amber
        info: '#1e40af', // Deep blue
        iconColor: '#4b5563',

      }
    };
  
    // Use CSS variables if they exist, otherwise fall back to the hardcoded colors
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

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
  }, [refreshKey,language]);




  const handlePrint = () => {
    // Open print dialog
    window.print();
  };

  
  // Function to export dashboard as PDF
  // Function to export dashboard as PDF
  const handleExportPDF = async () => {
  setLoading(true);
  
  try {
    // Modify the dashboard style to be PDF-friendly - single page optimized format
    const pdfContent = `
      <div style="font-family: 'Helvetica', Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <h1 style="font-size: 24px; color: #1e3a8a; text-align: center; margin-bottom: 5px;">Travel Dashboard</h1>
        <p style="text-align: center; color: #666; font-size: 12px; margin-bottom: 20px;">Generated on ${new Date().toLocaleString()}</p>
        
        <!-- Stats Row -->
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h2 style="font-size: 16px; margin-bottom: 10px; color: #4b5563; font-weight: 600;">Travel Statistics</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Total Trips</div>
              <div style="font-size: 18px; font-weight: bold; color: ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#3b82f6'}">${stats.totalTrips}</div>

            </div>
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Countries Visited</div>
              <div style="font-size: 18px; font-weight: bold;">${stats.countriesVisited}</div>
            </div>
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Continents Explored</div>
              <div style="font-size: 18px; font-weight: bold;">${stats.continentsExplored}</div>
            </div>
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Total Spent</div>
              <div style="font-size: 18px; font-weight: bold;">$${stats.totalSpent.toLocaleString()}</div>
            </div>
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Upcoming Trips</div>
              <div style="font-size: 18px; font-weight: bold;">${stats.upcomingTrips}</div>
            </div>
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Avg. Trip Length</div>
              <div style="font-size: 18px; font-weight: bold;">${stats.averageTripLength} days</div>
            </div>
          </div>
        </div>
        
        <!-- Spending Section -->
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h2 style="font-size: 16px; margin-bottom: 10px; color: #4b5563; font-weight: 600;">Spending Breakdown</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            ${budgetData.labels.map((label, i) => `
              <div style="background: #f9fafb; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">${label}</div>
                <div style="font-size: 18px; font-weight: bold;">$${Math.round(budgetData.datasets[0].data[i]).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-size: 10px; color: #6b7280; font-style: italic; margin-top: 10px;">
            Flight costs are based on ${stats.tripsWithFlightData} trips with available flight data. All other expenses are calculated based on your selected budget level for each trip.
          </div>
        </div>
        
        <!-- Trips Section -->
        <div>
          <h2 style="font-size: 16px; margin-bottom: 10px; color: #4b5563; font-weight: 600;">Recent Trips</h2>
          ${trips.slice(0, 5).map((trip, index) => {
            const destination = trip.tripData?.trip?.destination || 'Unknown Destination';
            const startDate = trip.userSelection?.startDate ? new Date(trip.userSelection.startDate) : null;
            const isUpcoming = startDate && startDate > new Date();
            const formattedDate = startDate ? startDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'No date specified';
            
            const budget = trip.userSelection?.budget || 'Standard';
            const travelers = trip.userSelection?.travelers || 'Solo';
            const duration = trip.tripData?.trip?.duration || '';
            
            return `
              <div style="w-full display: flex; align-items: flex-start; margin-bottom: 10px; background: #f9fafb; border-radius: 6px; overflow: hidden;">
                <div style="width: 12px; background-color: ${isUpcoming ? '#3b82f6' : '#10b981'}; align-self: stretch; margin-right: 10px;"></div>
                <div style="padding: 10px 10px 10px 0;">
                  <div style="display: flex; align-items: center;  margin-bottom: 5px;">
                    <div style="font-weight: 600; font-size: 14px; flex-grow: 1;">${destination}</div>
                    <div style="font-size: 10px; background: ${isUpcoming ? '#3b82f6' : '#10b981'}; color: white; padding: 2px 6px; border-radius: 12px;">${isUpcoming ? 'Upcoming' : 'Completed'}</div>
                  </div>
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">${formattedDate}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <span style="font-size: 10px; background: #e5e7eb; color: #4b5563; padding: 2px 6px; border-radius: 4px;">${travelers}</span>
                    <span style="font-size: 10px; background: #e5e7eb; color: #4b5563; padding: 2px 6px; border-radius: 4px;">${budget} Budget</span>
                    ${duration ? `<span style="font-size: 10px; background: #e5e7eb; color: #4b5563; padding: 2px 6px; border-radius: 4px;">${duration}</span>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; padding-top: 10px;">
          Generated by Travel Dashboard on ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    
    // Create a container with a fixed size and controlled layout
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = 'auto';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.innerHTML = pdfContent;
    document.body.appendChild(container);
    
    try {
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate PDF with jsPDF directly
      // Create canvas and convert to PDF in a controlled manner
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        logging: false, // Reduce console noise
        windowWidth: 800
      });
      
      // Calculate dimensions
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit on one page if possible
      const imgWidth = pageWidth - 20; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (imgHeight <= pageHeight - 20) {
        // It fits on one page
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      } else {
        // Need multiple pages - with proper scaling and no duplication
        const contentRatio = canvas.height / canvas.width;
        const pageHeightWithMargins = pageHeight - 20;
        const contentHeightOnPage = imgWidth * contentRatio;
        
        // How many pages we need
        const totalPages = Math.ceil(contentHeightOnPage / pageHeightWithMargins);
        
        // For each page
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          // Calculate which part of the image to use
          const sourceY = (i * canvas.height / totalPages);
          const sourceHeight = canvas.height / totalPages;
          
          pdf.addImage(
            imgData, 
            'JPEG', 
            10, // x position
            10, // y position
            imgWidth, 
            pageHeightWithMargins,
            null, // alias
            'FAST', // compression
            i * (-pageHeightWithMargins / contentRatio * canvas.width / imgWidth) // source y position (cropping)
          );
        }
      }
      
      // Save PDF
      pdf.save('travel-dashboard.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Error creating PDF:', error);
    alert('There was an error creating the PDF: ' + error.message);
  } finally {
    setLoading(false);
  }
};

const formatedDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';

      // Get day, month, and year
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
  } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
  }
};
  
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
      labels: [ translate("cultural"), 
        translate("adventure"), 
        translate("relaxation"), 
        translate("foodAndDining"), 
        translate("nature")],
      datasets: [{
        data: [
          activities.cultural, 
          activities.adventure, 
          activities.relaxation, 
          activities.food, 
          activities.nature
        ],
        backgroundColor: [
          getAccessibleColor('danger'),
          getAccessibleColor('primary'),
          getAccessibleColor('warning'),
          getAccessibleColor('success'),
          getAccessibleColor('secondary')
        ]
      }]
    });
    
    // Update budget data to include flights
    setBudgetData({
      labels: [translate("flightCost"),translate("accommodationCost"), translate("foodCost"),translate("activitiesCost"),translate("transportationCost"),translate("shoppingCost")],
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
          getAccessibleColor('danger') ,+ '99', // Red for flights
          getAccessibleColor('primary') + '99', // Blue
          getAccessibleColor('success') + '99', // Green
          getAccessibleColor('warning') + '99', // Yellow
          getAccessibleColor('secondary') + '99', // Purple
          getAccessibleColor('info') + '99'  // Sky
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-[140px] pb-10 px-4 md:px-8"style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <div ref={dashboardRef} className="max-w-7xl mx-auto dashboard-container">
        {/* Header with subtitle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
          <h1 className="text-3xl font-bold text-white" style={{ direction: isRTL ? "rtl" : "ltr" }}>
  {translate("dashboardTitle")}
</h1>
<p className="text-gray-400 mt-1" style={{ direction: isRTL ? "rtl" : "ltr" }}> 
  {translate("dashboardDescription")}
</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 items-center"style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <p className="text-gray-400 text-sm">{translate("lastUpdated")}{formatedDate(new Date().toLocaleDateString())}</p>
            <button 
    onClick={() => setRefreshKey(old => old + 1)}
    style={{
      backgroundColor: getAccessibleColor('primary'),
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      transition: 'all 0.2s',
    }}
    className="hover:opacity-90"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isRTL ? 'transform scale-x-[-1]' : ''}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
    {translate("refreshData")}
  </button>
</div>
        </div>
          
        {/* Stats Cards - enhanced design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <StatsCard
  title={translate("totalTrips")}
  value={stats.totalTrips}
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  }
  color="bg-gradient-to-br from-blue-600 to-blue-700"
/>

<StatsCard
  title={translate("countriesVisited")}
  value={stats.countriesVisited}
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  }
  color="bg-gradient-to-br from-purple-600 to-purple-700"
/>

<StatsCard
  title={translate("continentsExplored")}
  value={stats.continentsExplored}
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  }
  color="bg-gradient-to-br from-green-600 to-green-700"
/>

<StatsCard
  title={translate("totalSpent")}
  value={`$${stats.totalSpent.toLocaleString()}`}
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  }
  color="bg-gradient-to-br from-yellow-500 to-yellow-600"
/>

<StatsCard
  title={translate("upcomingTrips")}
  value={stats.upcomingTrips}
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  }
  color="bg-gradient-to-br from-red-600 to-red-700"
/>

<StatsCard
  title={translate("avgTripLength")}
  value={`${stats.averageTripLength} ${translate("days")}`}
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
        <div className="flex justify-between items-center mb-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
  <h2 className="text-xl font-bold text-white flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    {translate("spendingBreakdown")}
  </h2>
  <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300">
    {stats.tripsWithFlightData} {translate("tripsWithFlightData")}
  </div>
</div>
  
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {budgetData.labels.map((label, index) => {
    // Generate the accessible color on each render based on current colorMode
    const accessibleColor = 
      index === 0 ? getAccessibleColor('danger') + '99' : // Flights
      index === 1 ? getAccessibleColor('primary') + '99' : // Accommodation
      index === 2 ? getAccessibleColor('success') + '99' : // Food
      index === 3 ? getAccessibleColor('warning') + '99' : // Activities
      index === 4 ? getAccessibleColor('secondary') + '99' : // Transportation
      getAccessibleColor('info') + '99'; // Shopping
    
    const value = budgetData.datasets[0].data[index] || 0;
    
    // Translate the labels
    const translatedLabel = 
    index === 0 ? translate("flightCost") :
    index === 1 ? translate("accommodationCost") :
    index === 2 ? translate("foodCost") :
    index === 3 ? translate("activitiesCost") :
    index === 4 ? translate("transportationCost") :
    translate("shoppingCost");
    
      return (
        <div 
          key={`spending-item-${index}-${colorMode}`}
          className={`bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 transition-colors ${
            colorMode === 'default' ? 'hover:border-blue-500/30' : 'hover:border-gray-500/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: accessibleColor }}
            ></div>
            <span className="text-gray-300 text-sm font-medium">{translatedLabel}</span>
          </div>
          <div className="text-white font-bold text-2xl">
            ${Math.round(value).toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {translate("averageSpendPerTrip")}
          </div>
        </div>
      );
    })}
</div>
</div>
        
        {/* Map and Charts - enhanced design */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
  {/* Travel Map */}
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 lg:col-span-2"style={{ direction: isRTL ? "rtl" : "ltr" }}>
    <div className="bg-gray-800/80 backdrop-blur p-4 border-b border-gray-700/50 flex justify-between items-center">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
  {translate("travelMap")}
</h2>
<div className="text-sm text-gray-400">
  {destinations.length} {translate("destinationsMapped")}
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
  <p className="text-gray-500 text-lg">{translate("noTravelData")}</p>
</div>
      )}
    </div>
  </div>
  
  {/* Travel Style */}
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700"style={{ direction: isRTL ? "rtl" : "ltr" }}>
    <div className="bg-gray-800/80 backdrop-blur p-4 border-b border-gray-700/50 flex justify-between items-center">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
  {translate("travelStyle")}
</h2>
    </div>
    <div className="p-6 flex flex-col items-center">
  <div className="h-[260px] w-[260px] relative">
    <Pie 
      key={`pie-chart-${colorMode}-${language}`} // This forces complete re-render when colorMode changes
      data={{
        ...activityData,
        datasets: [{
          ...activityData.datasets[0],
          backgroundColor: [
            getAccessibleColor('danger'),
            getAccessibleColor('primary'),
            getAccessibleColor('warning'),
            getAccessibleColor('success'),
            getAccessibleColor('secondary')
          ]
        }]
      }}
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
          style={{ 
            backgroundColor: [
              getAccessibleColor('danger'),
              getAccessibleColor('primary'),
              getAccessibleColor('warning'),
              getAccessibleColor('success'),
              getAccessibleColor('secondary')
            ][index] 
          }}
        ></div>
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
    ))}
  </div>
</div>
  </div>
</div>
          
        {/* Budget Breakdown - enhanced design */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 mb-10"style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {translate("budgetBreakdown")}
              </h2>
              <div className="text-gray-400 text-xs mt-1">
  {translate("avgSpendCategory")}
</div>
            </div>
          </div>
          
          <div className="p-6"style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <div className="h-[300px]">
  <Bar 
    key={`budget-chart-${colorMode}-${language}`} // Force re-render on colorMode change
    data={{
      ...budgetData,
      datasets: [{
        ...budgetData.datasets[0],
        backgroundColor: [
          getAccessibleColor('danger') + '99',
          getAccessibleColor('primary') + '99',
          getAccessibleColor('success') + '99',
          getAccessibleColor('warning') + '99',
          getAccessibleColor('secondary') + '99',
          getAccessibleColor('info') + '99'
        ]
      }]
    }}
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
                      },
                      position: isRTL ? 'right' : 'left', 
                    },
                    x: {
                      ticks: { color: 'rgba(255,255,255,0.7)' },
                      grid: { 
                        display: false,
                        drawBorder: false
                      },
                      reverse: isRTL,
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
            <div 
  className="mt-6 flex items-start gap-3 p-4 rounded-lg"
  style={{
    backgroundColor: `${getAccessibleColor('primary')}15`,
    borderWidth: '1px',
    borderColor: `${getAccessibleColor('primary')}30`,
    direction: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "right" : "left"
    
  }}
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 mt-0.5 flex-shrink-0" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    style={{ color: getAccessibleColor('primary') }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <div style={{ color: `${getAccessibleColor('primary')}ee` }}>
    <p className="text-sm">
      {translate("flightDataInfo1")} {stats.tripsWithFlightData} {translate("flightDataInfo2")}
    </p>
    <p className="text-sm mt-1">
      {translate("flightDataInfo3")}
    </p>
  </div>
</div>
          </div>
        </div>
          
        {/* Recent Trips Timeline - enhanced design */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700"style={{ direction: isRTL ? "rtl" : "ltr" }}>
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
  {translate("tripTimeline")}
</h2>
<div className="text-sm text-gray-400">
  {trips.length} {translate("totalTripsCount")}
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
                    <p className="text-gray-400 mb-3">{translate("noTripsFound")}</p>
<a 
  href="/create-trip" 
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition-colors"
>
  {translate("createFirstTrip")}
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
  {translate("viewAllTrips")}
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
          {translate("dashboardUpdated")} {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-4">
            
            <button 
  onClick={handlePrint}
  style={{ color: getAccessibleColor('iconColor') }}
  className="hover:opacity-80 transition-all hover:scale-105"
  title={translate("print")}
>
  <span className="sr-only">{translate("print")}</span>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
  </svg>
</button>

<button 
  onClick={handleExportPDF}
  style={{ color: getAccessibleColor('iconColor') }}
  className="hover:opacity-80 transition-all hover:scale-105"
  title={translate("export")}
>
  <span className="sr-only">{translate("export")}</span>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
</button>
          </div>
        </div>
      </div>
    </div>
  );

  function StatsCard({ title, value, icon, color }) {
    // Map color prop to accessibility-friendly colors
    const getCardBgColor = () => {
      const colorMappings = {
        'bg-gradient-to-br from-blue-600 to-blue-700': `linear-gradient(to bottom right, ${getAccessibleColor('primary')}, ${getAccessibleColor('primary')}dd)`,
        'bg-gradient-to-br from-purple-600 to-purple-700': `linear-gradient(to bottom right, ${getAccessibleColor('secondary')}, ${getAccessibleColor('secondary')}dd)`,
        'bg-gradient-to-br from-green-600 to-green-700': `linear-gradient(to bottom right, ${getAccessibleColor('success')}, ${getAccessibleColor('success')}dd)`,
        'bg-gradient-to-br from-yellow-500 to-yellow-600': `linear-gradient(to bottom right, ${getAccessibleColor('warning')}, ${getAccessibleColor('warning')}dd)`,
        'bg-gradient-to-br from-red-600 to-red-700': `linear-gradient(to bottom right, ${getAccessibleColor('danger')}, ${getAccessibleColor('danger')}dd)`,
        'bg-gradient-to-br from-indigo-600 to-indigo-700': `linear-gradient(to bottom right, ${getAccessibleColor('info')}, ${getAccessibleColor('info')}dd)`,
      };
      
      return colorMappings[color] || colorMappings['bg-gradient-to-br from-blue-600 to-blue-700'];
    };
  
    return (
      <motion.div 
        style={{
          background: getCardBgColor(),
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
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

  function TimelineItem({ trip:originalTrip, index }) {
    
    const { language } = useLanguage();
    const { colorMode } = useAccessibility();
    const isRTL = language === "he";
    
    // Translate trip data
    const trip = translateTripDetails(originalTrip, language);
    
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
      return daysDiff === 1 ? translate("tomorrow") : translate("daysAway").replace("{days}", daysDiff);
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
          <div 
            style={{ 
              width: '2rem', 
              height: '2rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isUpcoming ? 
                'linear-gradient(to bottom right, white, white)' : 
                `linear-gradient(to bottom right, ${getAccessibleColor('success')}, ${getAccessibleColor('success')}dd)`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span className="text-white text-md">{isUpcoming ? '🔜' : '✓'}</span>
          </div>
          {index < 9 && <div className="w-0.5 h-full bg-gray-700 mt-2"></div>}
        </div>
        <div 
          style={{
            borderRadius: '0.75rem',
            padding: '1rem',
            flex: '1',
            marginBottom: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: 'scale(1)',
            border: '1px solid',
            borderColor: isUpcoming ? 
              `${getAccessibleColor('primary')}33` : 
              'rgba(75, 85, 99, 0.5)',
            backgroundColor: isUpcoming ? 
              `${getAccessibleColor('primary')}15` : 
              'rgba(55, 65, 81, 1)'
          }}
          className="hover:scale-[1.02]"
          onClick={handleTripClick}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-white text-lg">{destination}</h3>
            <span 
              style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                backgroundColor: isUpcoming ? 
                  getAccessibleColor('primary') : 
                  getAccessibleColor('success'),
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
{isUpcoming ? translate("upcoming") : translate("completed")}
</span>
          </div>
          <div className="text-gray-300 text-sm mt-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(startDate)}
            {daysUntil && (
              <span className={`ml-1 inline-flex items-center font-medium ${colorMode === 'default' ? 'text-blue-300' : ''}`}
              style={{ 
                color: colorMode !== 'default' ? getAccessibleColor('primary') : undefined
              }}
            >

                ({daysUntil})
              </span>
            )}
          </div>
          
          <div className="flex gap-2 mt-3">
        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/70 px-2 py-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {trip.userSelection?.travelers || translate("solo")}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/70 px-2 py-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {trip.userSelection?.budget || 'Standard'} {translate("budgetType")}
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
      {translate("flightPrice")} {trip.tripData?.flights?.options?.best?.pricePerPerson}
    </div>
    <div className="text-gray-400">
      {translate("flyingWith")} {trip.tripData?.flights?.options?.best?.airline}
    </div>
  </div>
)}
          
          {/* View button */}
          <div className="mt-3 flex justify-end">
  <button 
    className={`flex items-center gap-1 text-xs text-white px-3 py-1.5 rounded-xl transition-colors shadow-sm ${
      colorMode === 'default' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : ''
    }`}
    style={
      colorMode !== 'default' 
        ? {
            background: `linear-gradient(to right, ${getAccessibleColor('primary')}, ${getAccessibleColor('primary')}dd)`,
            color: 'white'
          } 
        : {}
    }
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    {translate("viewTripDetails")}
    </button>
</div>
        </div>
      </motion.div>
    );
  }
}


// Enhanced Timeline Item


  
  export default TravelDashboard;