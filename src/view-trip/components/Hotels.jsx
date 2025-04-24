import React, { useState, useEffect } from 'react';
import { GetPlaceDetails } from "@/service/GlobalApi";

const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1000&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function Hotels({ trip }) {
  const [hotelImages, setHotelImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const destination = trip?.tripData?.trip?.destination || '';

  useEffect(() => {
    if (trip?.tripData?.hotels && trip.tripData.hotels.length > 0) {
      fetchHotelImages();
    }
  }, [trip]);

  const fetchHotelImages = async () => {
    const newImages = { ...hotelImages };
    const newLoadingStates = { ...loadingImages };
  
    // Start loading state for all hotels
    trip.tripData.hotels.forEach(hotel => {
      if (!newImages[hotel.name]) {
        newLoadingStates[hotel.name] = true;
      }
    });
    setLoadingImages(newLoadingStates);
  
    // Process each hotel
    for (const hotel of trip.tripData.hotels) {
      if (!newImages[hotel.name]) {
        try {
          // Create a more specific search query for better results
          const searchQuery = `${hotel.name} hotel in ${destination}`;
          
          const data = {
            textQuery: searchQuery
          };
          
          const result = await GetPlaceDetails(data);
          
          if (result.data?.places?.[0]?.photos?.[0]?.name) {
            // Use the photo reference to construct the URL - this seems to be working for you
            const photoUrl = PHOTO_REF_URL.replace('{NAME}', result.data.places[0].photos[0].name);
            console.log(`Using photo reference URL for ${hotel.name}:`, photoUrl);
            newImages[hotel.name] = photoUrl;
          } else {
            // Use default image if no photos found
            newImages[hotel.name] = '/moderate1.jpg';
          }
        } catch (error) {
          console.error(`Error fetching image for ${hotel.name}:`, error);
          newImages[hotel.name] = '/moderate1.jpg';
        } finally {
          // Update loading state for this hotel
          newLoadingStates[hotel.name] = false;
        }
      }
    }
  
    setHotelImages(newImages);
    setLoadingImages(newLoadingStates);
  };

  // Function to get image for a specific hotel
  const getImageForHotel = (hotel) => {
    return hotelImages[hotel.name] || '/moderate1.jpg';
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <h2 className='font-bold text-xl mt-5 text-white'>Hotel Recommendation</h2>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>

        {Array.isArray(trip?.tripData?.hotels) ? 
        
        trip?.tripData?.hotels.map((hotel, index) => (
          <div key={index} className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'>
            <a href={hotel.bookingLinks?.googleMaps || `https://www.google.com/maps/search/${encodeURIComponent(hotel.name + ' ' + destination)}`} 
               target="_blank" 
               rel="noopener noreferrer">
              <div className="relative h-[180px] w-full rounded-xl overflow-hidden">
                {/* Loading indicator */}
                {loadingImages[hotel.name] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
                )}
                <img 
                  src={getImageForHotel(hotel)} 
                  className='w-full h-full object-cover rounded-xl cursor-pointer'
                  alt={hotel.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/moderate1.jpg';
                  }}
                />
              </div>
            </a>
            <div className='my-2'>
              <h2 className='text-white font-medium'>{hotel?.name}</h2>    
              <h2 className='text-gray-300 text-xs'>📍 {hotel?.address}</h2>    
              <h2 className='text-white text-sm'>💰 {hotel?.priceRange || hotel?.price}</h2>
              <h2 className='text-white text-sm'>⭐ {hotel?.rating} Stars</h2>
            </div>
          </div>   
        ))
        :
        <p>No hotels available</p>
        
        }
      </div>
    </div>
  );
}

export default Hotels;