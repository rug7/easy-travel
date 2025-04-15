import React from 'react'

function Hotels({trip}) {
  return (
    <div className="w-full max-w-[1400px] mx-auto"> {/* Added container with max-width and center alignment */}
        <h2 className='font-bold text-xl mt-5 text-white'>Hotel Recommendation</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>
            {trip?.tripData?.hotels.map((hotel,index)=>(
                <div key={index}>
                    <a href={hotel.bookingLinks.googleMaps} target="_blank" rel="noopener noreferrer">
                        <img 
                            src='/moderate1.jpg' 
                            className='rounded-xl cursor-pointer'
                            alt={hotel.name}
                        />
                    </a>
                    <div className='my-2'>
                        <h2 className='text-white font-medium'>{hotel?.name}</h2>    
                        <h2 className='text-gray-300 text-xs'>📍 {hotel?.address}</h2>    
                        <h2 className='text-white text-sm'>💰 {hotel?.priceRange}</h2>
                        <h2 className='text-white text-sm'>⭐ {hotel?.rating} Stars</h2>

                    </div>
                </div>   
            ))}
        </div>
    </div>
  )
}

export default Hotels