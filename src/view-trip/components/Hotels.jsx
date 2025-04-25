import React, { useState, useEffect } from 'react';

// Collection of hotel images
const hotelImageCollection = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',  // Luxury hotel 1
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',     // Luxury hotel 2
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',  // Luxury hotel 3
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',     // Hotel room 1
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200',  // Hotel room 2
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200',  // Hotel room 3
  'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200',  // Hotel lobby 1
  'https://images.unsplash.com/photo-1565031491910-e57fac031c41?w=1200',  // Hotel lobby 2
  'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200',  // Resort 1
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',  // Resort 2
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200',  // Resort pool
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=1200',  // Boutique hotel 1
  'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=1200',  // Boutique hotel 2
  'https://images.unsplash.com/photo-1561501878-aabd62634533?w=1200',     // Business hotel
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',  // Hotel exterior 1
  'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1200',     // Hotel exterior 2
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',  // Budget hotel
  'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200',     // Hotel bathroom
  'https://images.unsplash.com/photo-1552858725-2758b5fb1286?w=1200',     // Hotel view
  'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?w=1200'      // Hotel breakfast
];

// Fallback image
const fallbackImage = '/moderate1.jpg';

function Hotels({ trip }) {
  const [hotelImages, setHotelImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const destination = trip?.tripData?.trip?.destination || '';

  useEffect(() => {
    if (trip?.tripData?.hotels && trip.tripData.hotels.length > 0) {
      assignHotelImages();
    }
  }, [trip]);

  // Function to consistently map a hotel name to an image from the collection
  const getConsistentImageForHotel = (hotelName) => {
    // Create a simple hash from the hotel name
    let hash = 0;
    for (let i = 0; i < hotelName.length; i++) {
      hash = hotelName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to pick a consistent image from the collection
    const index = Math.abs(hash) % hotelImageCollection.length;
    return hotelImageCollection[index];
  };

  // Assign images to hotels
  const assignHotelImages = () => {
    const newImages = { ...hotelImages };
    const newLoadingStates = { ...loadingImages };
  
    // Simulate loading state for a brief moment
    trip.tripData.hotels.forEach(hotel => {
      if (!newImages[hotel.name]) {
        newLoadingStates[hotel.name] = true;
      }
    });
    
    setLoadingImages(newLoadingStates);
  
    // Use setTimeout to simulate network delay (optional)
    setTimeout(() => {
      // Process each hotel
      for (const hotel of trip.tripData.hotels) {
        if (!newImages[hotel.name]) {
          try {
            // Get a consistent image for this hotel
            const imageUrl = getConsistentImageForHotel(hotel.name);
            newImages[hotel.name] = imageUrl;
          } catch (error) {
            console.error(`Error assigning image for ${hotel.name}:`, error);
            newImages[hotel.name] = fallbackImage;
          } finally {
            // Update loading state for this hotel
            newLoadingStates[hotel.name] = false;
          }
        }
      }
    
      setHotelImages(newImages);
      setLoadingImages(newLoadingStates);
    }, 300); // Simulate a short delay for loading effect
  };

  // Function to get image for a specific hotel
  const getImageForHotel = (hotel) => {
    return hotelImages[hotel.name] || fallbackImage;
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
                  <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <img 
                  src={getImageForHotel(hotel)} 
                  className='w-full h-full object-cover rounded-xl cursor-pointer'
                  alt={hotel.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                  }}
                  loading="lazy"
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