function Activities({ trip }) {
    return (
        <div className="w-full max-w-[1400px] mx-auto">
            <h2 className='font-bold text-xl mt-5 text-white'>Daily Activities</h2>
            
            {/* Map through each day */}
            {Object.entries(trip?.tripData?.itinerary || {}).map(([day, activities], index) => (
                <div key={day} className="mt-6">
                    <h3 className='text-lg font-semibold text-white mb-3'>Day {index + 1}</h3>
                    
                    {/* Activities grid for each day */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {activities.map((activity, activityIndex) => (
                            <div 
                                key={activityIndex}
                                className='bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-all'
                                onClick={() => window.open(activity?.bookingLinks?.googleMaps, '_blank', 'noopener,noreferrer')}
                            >
                                {/* Activity Time Badge */}
                                <div className='bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full w-fit mb-3'>
                                    {activity.bestTime}
                                </div>

                                {/* Activity Name and Price */}
                                <div className='flex justify-between items-start mb-2'>
                                    <h4 className='text-white font-medium flex-1'>
                                        {activity.activity}
                                    </h4>
                                    {activity.price && (
                                        <span className='text-white text-sm ml-2'>
                                            {activity.price}
                                        </span>
                                    )}
                                </div>

                                {/* Activity Details */}
                                <div className='text-gray-400 text-sm space-y-2'>
                                    {/* Duration */}
                                    {activity.duration && (
                                        <div className='flex items-center'>
                                            <span className='mr-2'>⏱️</span>
                                            {activity.duration}
                                        </div>
                                    )}

                                    {/* Travel Time */}
                                    {activity.travelTime && (
                                        <div className='flex items-center'>
                                            <span className='mr-2'>🚗</span>
                                            {activity.travelTime}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className='text-gray-400 mt-2'>
                                        {activity.description}
                                    </div>
                                </div>

                                {/* Booking Links */}
                                {(activity.bookingLinks?.official || 
                                  activity.bookingLinks?.tripadvisor || 
                                  activity.bookingLinks?.googleMaps) && (
                                    <div className='flex gap-2 mt-3'>
                                        {activity.bookingLinks.official && (
                                            <a 
                                                href={activity.bookingLinks.official}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className='text-blue-400 hover:text-blue-300 text-sm'
                                                onClick={e => e.stopPropagation()}
                                            >
                                                Official Site
                                            </a>
                                        )}
                                        {activity.bookingLinks.tripadvisor && (
                                            <a 
                                                href={activity.bookingLinks.tripadvisor}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className='text-green-400 hover:text-green-300 text-sm'
                                                onClick={e => e.stopPropagation()}
                                            >
                                                TripAdvisor
                                            </a>
                                        )}
                                        {activity.bookingLinks.googleMaps && (
                                            <a 
                                                href={activity.bookingLinks.googleMaps}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className='text-red-400 hover:text-red-300 text-sm'
                                                onClick={e => e.stopPropagation()}
                                            >
                                                Maps
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Activities;