// src/components/ProgressiveTripView.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

// Import your components
import DestinationCard from '@/components/custom/DestinationCard';
import FlightOptions from '@/components/custom/FlightOptions';
import HotelOptions from '@/components/custom/HotelOptions';
import Activities from '@/components/custom/Activities';

const ProgressiveTripView = () => {
  const { id } = useParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [visibleSections, setVisibleSections] = useState({
    destination: false,
    flights: false,
    hotels: false,
    activities: false
  });
  
  // Fetch trip data
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripDoc = await getDoc(doc(db, "AITrips", id));
        if (tripDoc.exists()) {
          setTripData(tripDoc.data());
        } else {
          setError("Trip not found");
        }
      } catch (err) {
        setError("Error loading trip data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTripData();
    }
  }, [id]);
  
  // Progressively show sections
  useEffect(() => {
    if (!tripData) return;
    
    // Show destination immediately
    setVisibleSections(prev => ({ ...prev, destination: true }));
    
    // Show flights after a delay
    setTimeout(() => {
      setVisibleSections(prev => ({ ...prev, flights: true }));
    }, 800);
    
    // Show hotels after another delay
    setTimeout(() => {
      setVisibleSections(prev => ({ ...prev, hotels: true }));
    }, 1600);
    
    // Show activities after final delay
    setTimeout(() => {
      setVisibleSections(prev => ({ ...prev, activities: true }));
    }, 2400);
  }, [tripData]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">
        Your Trip to {tripData?.tripData?.trip?.destination}
      </h1>
      
      {/* Destination Section */}
      {visibleSections.destination && tripData?.tripData?.trip && (
        <section className="mb-12 animate-fadeIn">
          <h2 className="text-2xl font-semibold mb-4 text-white">Destination</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {tripData.tripData.trip.destination}
            </h3>
            <p className="text-gray-300">
              {tripData.tripData.trip.duration} • {tripData.tripData.trip.travelers}
            </p>
          </div>
        </section>
      )}
      
      {/* Flights Section */}
      {visibleSections.flights && tripData?.tripData?.flights && (
        <section className="mb-12 animate-fadeIn">
          <h2 className="text-2xl font-semibold mb-4 text-white">Flights</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Your flight component here */}
            <p className="text-white">Flight options for {tripData.tripData.trip.destination}</p>
          </div>
        </section>
      )}
      
      {/* Hotels Section */}
      {visibleSections.hotels && tripData?.tripData?.hotels && (
        <section className="mb-12 animate-fadeIn">
          <h2 className="text-2xl font-semibold mb-4 text-white">Accommodations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripData.tripData.hotels.map((hotel, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{hotel.name}</h3>
                  <p className="text-gray-300 mb-4">{hotel.location}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-white">{hotel.rating} Stars</span>
                    </div>
                    <span className="text-white font-bold">{hotel.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Activities Section */}
      {visibleSections.activities && tripData?.tripData?.itinerary && (
        <section className="mb-12 animate-fadeIn">
          <h2 className="text-2xl font-semibold mb-4 text-white">Activities</h2>
          <Activities trip={{ tripData: tripData.tripData }} />
        </section>
      )}
    </div>
  );
};

export default ProgressiveTripView;