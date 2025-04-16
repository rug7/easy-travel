import React, { useState } from 'react';

function Activities({ trip }) {
    const [selectedDay, setSelectedDay] = useState(1);
    const dayKeys = trip?.tripData?.itinerary ? Object.keys(trip.tripData.itinerary) : [];
    
    // Function to get reliable image for activity type
    const getActivityImage = (activity) => {
        // Map of activity keywords to reliable image URLs
        const activityImages = {
            // Nature & Outdoors
            "hike": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800",
            "trek": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800",
            "trail": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800",
            "mountain": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800",
            "forest": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800",
            "park": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800",
            "garden": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800",
            
            // Water Activities
            "beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
            "sea": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800",
            "ocean": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800",
            "swim": "https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=800",
            "boat": "https://images.unsplash.com/photo-1527431293370-0cd7ef7c90f3?auto=format&fit=crop&w=800",
            "cruise": "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800",
            "thermal": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800",
            "bath": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800",
            "spring": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800",
            
            // Cultural Activities
            "museum": "https://images.unsplash.com/photo-1565060169861-2d4b3c5126ab?auto=format&fit=crop&w=800",
            "gallery": "https://images.unsplash.com/photo-1594388572748-608588c3c145?auto=format&fit=crop&w=800",
            "art": "https://images.unsplash.com/photo-1594388572748-608588c3c145?auto=format&fit=crop&w=800",
            "castle": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=800",
            "palace": "https://images.unsplash.com/photo-1548248823-ce16a73b6d49?auto=format&fit=crop&w=800",
            "cathedral": "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&w=800",
            "church": "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&w=800",
            "temple": "https://images.unsplash.com/photo-1580889272861-dc2dbea5468d?auto=format&fit=crop&w=800",
            "ruins": "https://images.unsplash.com/photo-1548080819-68c6ab23e822?auto=format&fit=crop&w=800",
            "historic": "https://images.unsplash.com/photo-1558526944-1f9be3bea5a9?auto=format&fit=crop&w=800",
            
            // Food & Drink
            "restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800",
            "dinner": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800",
            "lunch": "https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=800",
            "breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800",
            "food": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800",
            "wine": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800",
            "bar": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800",
            "cafe": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800",
            
            // Entertainment & Shopping
            "shopping": "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=800",
            "market": "https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&w=800",
            "tour": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800",
            "show": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800",
            "concert": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800",
            "theater": "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=800",
            
            // Adventure Activities
            "adventure": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800",
            "zip": "https://images.unsplash.com/photo-1622293088055-b3a3362a9842?auto=format&fit=crop&w=800",
            "climb": "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800",
            "kayak": "https://images.unsplash.com/photo-1463694372132-6c267f6ba561?auto=format&fit=crop&w=800",
            "rafting": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800",
            "fishing": "https://images.unsplash.com/photo-1542643299-be5d00d22db3?auto=format&fit=crop&w=800",
            
            // Relaxation
            "spa": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800",
            "massage": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800",
            "relax": "https://images.unsplash.com/photo-1531685250784-7569952593d2?auto=format&fit=crop&w=800",
            
            // Locations
            "village": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800",
            "town": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800",
            "city": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800",
            "countryside": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800",
            "landscape": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800",
            "crete": "https://images.unsplash.com/photo-1586447795110-b0a2d5f3e671?auto=format&fit=crop&w=800",
            "tuscany": "https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?auto=format&fit=crop&w=800",
            "italy": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800",
            "sentiero": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800",
            "saturnia": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800"
        };
        
        // Check activity name and description for keywords
        const activityText = `${activity.activity} ${activity.description}`.toLowerCase();
        
        // Find matching image based on keywords
        for (const [keyword, url] of Object.entries(activityImages)) {
            if (activityText.includes(keyword.toLowerCase())) {
                return url;
            }
        }
        
        // Default images based on time of day
        const timeOfDay = activity.bestTime.toLowerCase();
        if (timeOfDay.includes('am') || timeOfDay.includes('morning')) {
            return 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800'; // Morning
        } else if (timeOfDay.includes('pm') && parseInt(activity.bestTime.split(':')[0]) < 6) {
            return 'https://images.unsplash.com/photo-1502209524164-acea936639a2?auto=format&fit=crop&w=800'; // Afternoon
        } else {
            return 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&w=800'; // Evening
        }
    };
    
    // Function to create reliable Google Maps link
    const createGoogleMapsLink = (activity) => {
        // Extract destination from trip data
        const destination = trip?.tripData?.trip?.destination || '';
        
        // Create search query from activity name and destination
        const searchQuery = encodeURIComponent(`${activity.activity} ${destination}`);
        
        // Return Google Maps search URL
        return `https://www.google.com/maps/search/${searchQuery}`;
    };
    
    // Function to create TripAdvisor search link
    const createTripAdvisorLink = (activity) => {
        // Extract destination from trip data
        const destination = trip?.tripData?.trip?.destination || '';
        
        // Create search query from activity name and destination
        const searchQuery = encodeURIComponent(`${activity.activity} ${destination}`);
        
        // Return TripAdvisor search URL
        return `https://www.tripadvisor.com/Search?q=${searchQuery}`;
    };
    
    // Function to format price display
    const formatPrice = (price) => {
        if (!price) return 'Free (transportation costs may apply)';
        
        // If price is already formatted with currency
        if (price.includes('$') || price.includes('€') || price.includes('£')) {
            return price;
        }
        
        // Try to extract numeric value
        const matches = price.match(/\d+/);
        if (matches) {
            return `$${matches[0]}`;
        }
        
        return price;
    };
    
    return (
        <div className="w-full max-w-[1400px] mx-auto">
            <h2 className='font-bold text-2xl mt-8 mb-6 text-white'>Daily Activities</h2>
            
            {/* Day selector tabs */}
            <div className="flex overflow-x-auto mb-6 pb-2 scrollbar-hide">
                {dayKeys.map((day, index) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(index + 1)}
                        className={`px-6 py-3 rounded-full mr-3 whitespace-nowrap transition-all ${
                            selectedDay === index + 1 
                                ? 'bg-blue-600 text-white font-medium' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Day {index + 1}
                    </button>
                ))}
            </div>
            
            {/* Activities for selected day */}
            {dayKeys.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {trip?.tripData?.itinerary[`day${selectedDay}`]?.map((activity, index) => (
                        <div 
                            key={index}
                            className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                        >
                            {/* Activity image */}
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={getActivityImage(activity)} 
                                    alt={activity.activity}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800";
                                    }}
                                />
                                                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent"></div>
                                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {activity.bestTime}
                                </div>
                                <div className="absolute top-4 right-4 bg-gray-900/80 text-white px-3 py-1 rounded-full text-sm">
                                    {formatPrice(activity.price)}
                                </div>
                            </div>
                            
                            {/* Activity content */}
                            <div className="p-5">
                                <h3 className="text-xl font-semibold text-white mb-2">{activity.activity}</h3>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {activity.duration && (
                                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {activity.duration}
                                        </span>
                                    )}
                                    
                                    {activity.travelTime && (
                                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                            </svg>
                                            {activity.travelTime}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-gray-400 text-sm mb-4">{activity.description}</p>
                                
                                {/* Booking links */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {/* Only show official site button if we have a valid URL */}
                                    {activity.bookingLinks?.official && 
                                     activity.bookingLinks.official.startsWith('http') && (
                                        <a 
                                            href={activity.bookingLinks.official}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                            </svg>
                                            Official Site
                                        </a>
                                    )}
                                    
                                    {/* Always show Google Maps button with reliable link */}
                                    <a 
                                        href={createGoogleMapsLink(activity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        View on Maps
                                    </a>
                                    
                                    {/* Always show TripAdvisor button with reliable link */}
                                    <a 
                                        href={createTripAdvisorLink(activity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        TripAdvisor
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Empty state */}
            {(!dayKeys.length || !trip?.tripData?.itinerary[`day${selectedDay}`]?.length) && (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <h3 className="text-xl font-medium text-white mb-2">No activities found</h3>
                    <p className="text-gray-400">There are no activities planned for this day yet.</p>
                </div>
            )}
        </div>
    );
}

export default Activities;