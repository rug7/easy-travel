import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";

// Collection of activity images by category
const activityImages = {
  // Nature & Outdoors
  "hike": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
  "trek": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
  "trail": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200",
  "mountain": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200",
  "forest": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200",
  "park": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200",
  "garden": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200",

  // Water Activities
  "beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
  "sea": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200",
  "ocean": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200",
  "swim": "https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=1200",
  "boat": "https://images.unsplash.com/photo-1527431293370-0cd7ef7c90f3?auto=format&fit=crop&w=1200",
  "cruise": "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200",
  "whale": "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1200",
  "thermal": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200",
  "bath": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200",
  "spring": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200",

  // Cultural Activities
  "museum": "https://images.unsplash.com/photo-1565060169861-2d4b3c5126ab?auto=format&fit=crop&w=1200",
  "gallery": "https://images.unsplash.com/photo-1594388572748-608588c3c145?auto=format&fit=crop&w=1200",
  "art": "https://images.unsplash.com/photo-1594388572748-608588c3c145?auto=format&fit=crop&w=1200",
  "castle": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=1200",
  "palace": "https://images.unsplash.com/photo-1548248823-ce16a73b6d49?auto=format&fit=crop&w=1200",
  "cathedral": "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&w=1200",
  "church": "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&w=1200",
  "temple": "https://images.unsplash.com/photo-1580889272861-dc2dbea5468d?auto=format&fit=crop&w=1200",
  "ruins": "https://images.unsplash.com/photo-1548080819-68c6ab23e822?auto=format&fit=crop&w=1200",
  "historic": "https://images.unsplash.com/photo-1558526944-1f9be3bea5a9?auto=format&fit=crop&w=1200",
  "saga": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200",

  // Food & Drink
  "restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200",
  "dinner": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200",
  "lunch": "https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=1200",
  "breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200",
  "food": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200",
  "wine": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200",
  "bar": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200",
  "cafe": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200",

  // Locations
  "reykjavik": "https://images.unsplash.com/photo-1504284402718-32d7a151e6a7?auto=format&fit=crop&w=1200",
  "iceland": "https://images.unsplash.com/photo-1504284402718-32d7a151e6a7?auto=format&fit=crop&w=1200",
  "harbour": "https://images.unsplash.com/photo-1520443240718-fce21901db79?auto=format&fit=crop&w=1200",
  "harbor": "https://images.unsplash.com/photo-1520443240718-fce21901db79?auto=format&fit=crop&w=1200",
  "maritime": "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200",
  "village": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200",
  "town": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200",
  "city": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200",
  "countryside": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200",
  "landscape": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200",
  
  // Additional popular activities
  "tour": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200",
  "shopping": "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200",
  "market": "https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&w=1200",
  "concert": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200",
  "theater": "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200",
  "cinema": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200",
  "opera": "https://images.unsplash.com/photo-1580809361436-42a7ec5c14fe?auto=format&fit=crop&w=1200",
  "festival": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200",
  "dance": "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200",
  "nightlife": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200",
  "safari": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200",
  "wildlife": "https://images.unsplash.com/photo-1504173010664-32509aeebb62?auto=format&fit=crop&w=1200",
  "waterfall": "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?auto=format&fit=crop&w=1200",
  "volcano": "https://images.unsplash.com/photo-1621935093281-2b174612a55c?auto=format&fit=crop&w=1200",
  "golf": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200",
  "tennis": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200",
  "skiing": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200",
  "diving": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200",
  "hiking": "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200",
  "surfing": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200",
  "biking": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200",
  "cycling": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200",
  "sightseeing": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200"
};

// Default images based on time of day
const timeOfDayImages = {
  "morning": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200",
  "afternoon": "https://images.unsplash.com/photo-1502209524164-acea936639a2?auto=format&fit=crop&w=1200",
  "evening": "https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&w=1200"
};

// Fallback image
// Fallback image
const fallbackImage = "/moderate1.jpg";

function Activities({ trip }) {
    const [selectedDay, setSelectedDay] = useState(1);
    const dayKeys = trip?.tripData?.itinerary ? Object.keys(trip.tripData.itinerary) : [];
    const [loadedActivityImages, setLoadedActivityImages] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const destination = trip?.tripData?.trip?.destination || '';
    const { translate, language } = useLanguage();
const isRTL = language === "he";

    // Load images for current day's activities
    useEffect(() => {
        if (dayKeys.length && trip?.tripData?.itinerary[`day${selectedDay}`]) {
            assignActivityImages();
        }
    }, [selectedDay, trip]);

    // Function to find the best image for an activity
    const getActivityImage = (activity) => {
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
            return timeOfDayImages.morning;
        } else if (timeOfDay.includes('pm') && parseInt(activity.bestTime.split(':')[0]) < 6) {
            return timeOfDayImages.afternoon;
        } else {
            return timeOfDayImages.evening;
        }
    };

    // Assign images to activities with simulated loading
    const assignActivityImages = () => {
        const activities = trip.tripData.itinerary[`day${selectedDay}`];
        const newImages = { ...loadedActivityImages };
        const newLoadingStates = { ...loadingImages };
        const usedImagesForDay = new Set();
    
        // Set loading states for all activities in this day
        activities.forEach(activity => {
            const activityId = `${selectedDay}_${activity.activity}`;
            if (!newImages[activityId]) {
                newLoadingStates[activityId] = true;
            }
        });
        setLoadingImages(newLoadingStates);
    
        // Simulate loading delay (remove this setTimeout for instant loading)
        setTimeout(() => {
            // Process each activity
            activities.forEach((activity, index) => {
                const activityId = `${selectedDay}_${activity.activity}`;
                
                if (!newImages[activityId]) {
                    try {
                        // First get all matching keywords
                        const activityText = `${activity.activity} ${activity.description || ''}`.toLowerCase();
                        const matchingKeywords = [];
                        
                        for (const keyword in activityImages) {
                            if (activityText.includes(keyword.toLowerCase())) {
                                matchingKeywords.push(keyword);
                            }
                        }
                        
                        let imageUrl;
                        
                        // Try to find an image we haven't used yet
                        for (const keyword of matchingKeywords) {
                            const potentialImage = activityImages[keyword];
                            if (!usedImagesForDay.has(potentialImage)) {
                                imageUrl = potentialImage;
                                usedImagesForDay.add(potentialImage);
                                break;
                            }
                        }
                        
                        // If all matching images are used or no matches found
                        if (!imageUrl && matchingKeywords.length > 0) {
                            imageUrl = activityImages[matchingKeywords[0]];
                        } else if (!imageUrl) {
                            // Time-of-day based fallback
                            const timeOfDay = (activity.bestTime || '').toLowerCase();
                            if (timeOfDay.includes('am') || timeOfDay.includes('morning')) {
                                imageUrl = timeOfDayImages.morning;
                            } else if (timeOfDay.includes('pm') && parseInt((activity.bestTime || '0:00').split(':')[0]) < 6) {
                                imageUrl = timeOfDayImages.afternoon;
                            } else {
                                imageUrl = timeOfDayImages.evening;
                            }
                        }
                        
                        newImages[activityId] = imageUrl;
                        usedImagesForDay.add(imageUrl);
                    } catch (error) {
                        console.error(`Error assigning image for ${activity.activity}:`, error);
                        newImages[activityId] = fallbackImage;
                    } finally {
                        // Update loading state for this activity
                        newLoadingStates[activityId] = false;
                    }
                }
            });
            
            setLoadedActivityImages(newImages);
            setLoadingImages(newLoadingStates);
        }, 300); // 300ms simulated loading for a smoother experience
    };

    // Function to get image for a specific activity
    const getImageForActivity = (activity, index) => {
        const activityId = `${selectedDay}_${activity.activity}`;
        
        // If image is already loaded, return it
        if (loadedActivityImages[activityId]) {
            return loadedActivityImages[activityId];
        }
        
        const activityText = `${activity.activity} ${activity.description || ''}`.toLowerCase();
        
        // Track already used images for this day to avoid duplicates
        const usedImagesForCurrentDay = new Set();
        trip?.tripData?.itinerary[`day${selectedDay}`]?.forEach((act, i) => {
            if (i < index && loadedActivityImages[`${selectedDay}_${act.activity}`]) {
                usedImagesForCurrentDay.add(loadedActivityImages[`${selectedDay}_${act.activity}`]);
            }
        });
        
        // Find matching keywords for the activity
        const matchingKeywords = [];
        for (const keyword in activityImages) {
            if (activityText.includes(keyword.toLowerCase())) {
                matchingKeywords.push(keyword);
            }
        }
        
        // If we have multiple matching keywords, try to find one with an image we haven't used
        for (const keyword of matchingKeywords) {
            const imageUrl = activityImages[keyword];
            if (!usedImagesForCurrentDay.has(imageUrl)) {
                return imageUrl;
            }
        }
        
        // If all matching images are used or no matches found, use the first matching image or fallback
        if (matchingKeywords.length > 0) {
            return activityImages[matchingKeywords[0]];
        }
        
        // Time-of-day based fallback
        const timeOfDay = (activity.bestTime || '').toLowerCase();
        if (timeOfDay.includes('am') || timeOfDay.includes('morning')) {
            return timeOfDayImages.morning;
        } else if (timeOfDay.includes('pm') && parseInt((activity.bestTime || '0:00').split(':')[0]) < 6) {
            return timeOfDayImages.afternoon;
        } else {
            return timeOfDayImages.evening;
        }
    };

    // Function to create reliable Google Maps link
    const createGoogleMapsLink = (activity) => {
        const searchQuery = encodeURIComponent(`${activity.activity} ${destination}`);
        return `https://www.google.com/maps/search/${searchQuery}`;
    };

    // Function to create TripAdvisor search link
    const createTripAdvisorLink = (activity) => {
        const searchQuery = encodeURIComponent(`${activity.activity} ${destination}`);
        return `https://www.tripadvisor.com/Search?q=${searchQuery}`;
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto">
            

            {/* Day selector tabs */}
            <div className="flex overflow-x-auto mb-6 pb-2 scrollbar-hide">
                {dayKeys.map((day, index) => (
                    <button
                    key={day}
                    onClick={() => setSelectedDay(index + 1)}
                    className={`px-6 py-3 rounded-full mr-3 whitespace-nowrap transition-all ${selectedDay === index + 1
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    style={{ direction: isRTL ? "rtl" : "ltr" }}
                >
                    {translate("activitiesSection.day")} {index + 1}
                </button>
                ))}
            </div>

            {/* Activities for selected day */}
            {dayKeys.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trip?.tripData?.itinerary[`day${selectedDay}`]?.map((activity, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                        >
                            {/* Activity image */}
                            <div className="h-56 overflow-hidden relative">
                                {loadingImages[`${selectedDay}_${activity.activity}`] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                                <img 
    src={getImageForActivity(activity, index)} 
    alt={activity.activity}
    className="w-full h-full object-cover"
    onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallbackImage;
    }}
    loading="lazy"
/>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                                
                                {/* Time badge */}
                                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                    {activity.bestTime}
                                </div>
                                
                                {/* Activity title overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{activity.activity}</h3>
                                </div>
                            </div>

                            {/* Activity content */}
                            <div className="p-5">
                                <div className="text-gray-400 text-sm mb-5 line-clamp-3">
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {activity.duration && (
                                            <span className="bg-gray-800/80 text-gray-200 px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {activity.duration}
                                            </span>
                                        )}
                                        
                                        {activity.travelTime && (
                                            <span className="bg-gray-800/80 text-gray-200 px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                {activity.travelTime}
                                            </span>
                                        )}
                                        
                                        {activity.price && (
                                            <span className="bg-gray-800/80 text-gray-200 px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {activity.price}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Booking links */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Only show official site button if we have a valid URL */}
                                    {activity.bookingLinks?.official &&
                                        activity.bookingLinks.official.startsWith('http') && (
                                            <a
                                                href={activity.bookingLinks.official}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                                                style={{ direction: isRTL ? "rtl" : "ltr" }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                                </svg>
                                                {translate("activitiesSection.bookNow")}
                                            </a>
                                        )}

                                    {/* Always show Google Maps button with reliable link */}
                                    <a
                                        href={createGoogleMapsLink(activity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
    style={{ direction: isRTL ? "rtl" : "ltr" }}
>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    {translate("activitiesSection.viewMap")}
</a>

                                                                        {/* Always show TripAdvisor button with reliable link */}
                                                                        <a
                                        href={createTripAdvisorLink(activity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
    style={{ direction: isRTL ? "rtl" : "ltr" }}
>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
    {translate("activitiesSection.reviews")}
</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {(!dayKeys.length || !trip?.tripData?.itinerary[`day${selectedDay}`]?.length) && (
                <div className="bg-gray-800 rounded-xl p-8 text-center" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <h3 className="text-xl font-medium text-white mb-2">{translate("activitiesSection.noActivities")}</h3>
                <p className="text-gray-400">{translate("activitiesSection.noActivitiesDesc")}</p>
            </div>
            )}
        </div>
    );
}

export default Activities;