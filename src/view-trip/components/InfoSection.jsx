// import React, { useEffect, useState } from "react";
// import { formatDate } from "@/utils/formatUtils";
// import { IoIosSend } from "react-icons/io";
// import { Button } from "@/components/ui/button";
// import fallbackImage from '/moderate1.jpg';
// import destinationsData from '@/context/destinations.json';
// import ShareTripModal from "./ShareTripModal";
// import { useLanguage } from "@/context/LanguageContext";
// import { translateTripData } from "@/utils/translateTripData";


// function InfoSection({ trip, onShareClick }) {
//     const [photoUrl, setPhotoUrl] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [imageError, setImageError] = useState(false);
//     const { translate, language } = useLanguage();
//     const isRTL = language === "he";
//     const translatedTrip = language === "en" ? trip : translateTripData(trip, language);


//     // const [showShareModal, setShowShareModal] = useState(false);

//     useEffect(() => {
//         if (trip) {
//             getDestinationImage();
//         }
//     }, [trip]);

//     // Function to find the best matching image from destinations.json
//     const getDestinationImage = () => {
//         setLoading(true);
//         setImageError(false);
        
//         try {
//             const locationQuery = (trip?.userSelection?.location?.label || trip.tripData?.trip?.destination || '').toLowerCase();
            
//             if (!locationQuery) {
//                 setImageError(true);
//                 setPhotoUrl(fallbackImage);
//                 return;
//             }
            
//             // First try to find an exact match
//             let matchedCountry = destinationsData.countries.find(country => 
//                 country.name.toLowerCase() === locationQuery
//             );
            
//             // If no exact match, check country aliases
//             if (!matchedCountry) {
//                 matchedCountry = destinationsData.countries.find(country => 
//                     country.aliases.some(alias => locationQuery.includes(alias.toLowerCase()))
//                 );
//             }
            
//             // If still no match, look for partial matches in country names
//             if (!matchedCountry) {
//                 matchedCountry = destinationsData.countries.find(country => 
//                     locationQuery.includes(country.name.toLowerCase()) || 
//                     country.name.toLowerCase().includes(locationQuery)
//                 );
//             }
            
//             // If still no match, look for partial matches in aliases
//             if (!matchedCountry) {
//                 matchedCountry = destinationsData.countries.find(country => 
//                     country.aliases.some(alias => 
//                         locationQuery.includes(alias.toLowerCase()) || 
//                         alias.toLowerCase().includes(locationQuery)
//                     )
//                 );
//             }
            
//             if (matchedCountry) {
//                 console.log(`Found match for "${locationQuery}": ${matchedCountry.name}`);
//                 setPhotoUrl(matchedCountry.imageUrl);
//             } else {
//                 console.log(`No match found for "${locationQuery}"`);
//                 setImageError(true);
//                 setPhotoUrl(fallbackImage);
//             }
//         } catch (error) {
//             console.error("Error getting destination image:", error);
//             setImageError(true);
//             setPhotoUrl(fallbackImage);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getBackgroundStyle = () => {
//         return {
//             backgroundImage: `url(${photoUrl || fallbackImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             filter: 'brightness(0.9) contrast(1.1)',
//         };
//     };

//     // Function to format the budget display based on language
//     const formatBudgetDisplay = () => {
//         if (language === "he") {
//             // For Hebrew, we need to prepend "תקציב" (Budget) to the value
//             return `תקציב ${translatedTrip.userSelection?.budget}`;
//         } else {
//             // For other languages, display the translated budget value followed by the translated word "budget"
//             return `${translatedTrip.userSelection?.budget} ${translate("infoSection.budget")}`;
//         }
//     };

//     if (!trip) return null;

//     return (
//         <div className="relative w-full mt-4 px-4 sm:px-6 lg:px-8">
//             <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
//                 {/* Hero Image Section */}
//                 <div className="aspect-[16/9] sm:aspect-[16/6] relative rounded-xl overflow-hidden">
//                     <div
//                         className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
//                         style={getBackgroundStyle()}
//                         onError={() => {
//                             setImageError(true);
//                             setPhotoUrl(fallbackImage);
//                         }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

//                     {loading && (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
//                         </div>
//                     )}

//                     {/* Destination Title and Duration */}
//                     <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
//                         <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
//                             {trip.tripData?.trip?.destination || 'Your Trip'}
//                         </h1>
//                         <div className="flex items-center gap-2">
//                             <span className="text-lg sm:text-xl font-semibold text-white/90">
//                                 📅 {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Trip Details Section */}
//                 <div className="mt-4 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
//                     {/* Details Pills - Stack on mobile, row on desktop */}
//                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//                         {/* Budget Pill */}
//                         <div 
//                             className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 justify-center sm:justify-start"
//                             style={{ direction: isRTL ? "rtl" : "ltr" }}
//                         >
//                             <span>💰</span>
//                             <span className="font-medium text-gray-700 text-sm sm:text-base">
//                                 {formatBudgetDisplay()}
//                             </span>
//                         </div>

//                         {/* Travelers Pill */}
//                         <div 
//                             className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 justify-center sm:justify-start"
//                             style={{ direction: isRTL ? "rtl" : "ltr" }}
//                         >
//                             <span>👥</span>
//                             <span className="font-medium text-gray-700 text-sm sm:text-base">
//                                 {translate("infoSection.travelers")}: {translatedTrip.userSelection?.travelers}
//                             </span>
//                         </div>

//                         {/* Date Pill */}
//                         <div 
//                             className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 justify-center sm:justify-start"
//                             style={{ direction: isRTL ? "rtl" : "ltr" }}
//                         >
//                             <span>📆</span>
//                             <span className="font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">
//                                 {translate("infoSection.travelDate")}: 
//                                 <span className="hidden sm:inline">
//                                     {formatDate(trip.userSelection?.startDate)} ➡️ {formatDate(trip.userSelection?.endDate)}
//                                 </span>
//                                 <span className="sm:hidden">
//                                     {formatDate(trip.userSelection?.startDate)}
//                                 </span>
//                             </span>
//                         </div>
//                     </div>

//                     {/* Share Button */}
//                     <Button 
//                         onClick={onShareClick}
//                         className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center justify-center gap-3 text-base sm:text-lg transition-all duration-300 hover:scale-105"
//                         style={{ direction: isRTL ? "rtl" : "ltr" }}
//                     >
//                         <IoIosSend className="text-xl" />
//                         <span>{translate("infoSection.share")}</span>
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default InfoSection;


import React, { useEffect, useState, useMemo } from "react";
import { formatDate } from "@/utils/formatUtils";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";
import fallbackImage from '/moderate1.jpg';
import destinationsData from '@/context/destinations.json';
import { useLanguage } from "@/context/LanguageContext";
import { translateTripData } from "@/utils/translateTripData";

// Create a function to initialize lookup maps outside of component render
function createDestinationMaps() {
console.log("Initializing destination lookup maps");
// Normalize text helper function
const normalize = text => text ? text.toLowerCase().trim() : '';

// Create maps for efficient lookups
const exactMap = new Map();
const namePrefixMap = new Map();
const aliasMap = new Map();
const wordMap = new Map();

// Process all countries once on module load
destinationsData.countries.forEach(country => {
    const normalizedName = normalize(country.name);
    
    // Exact name matches
    exactMap.set(normalizedName, country);
    
    // Prefix matches for names (e.g. "united" for "United States")
    const words = normalizedName.split(/\s+/);
    if (words.length > 0) {
        namePrefixMap.set(words[0], [...(namePrefixMap.get(words[0]) || []), country]);
    }
    
    // Add all individual words for partial matching
    words.forEach(word => {
        if (word.length > 2) { // Skip very short words
            wordMap.set(word, [...(wordMap.get(word) || []), country]);
        }
    });
    
    // Process all aliases
    if (country.aliases && country.aliases.length > 0) {
        country.aliases.forEach(alias => {
            const normalizedAlias = normalize(alias);
            aliasMap.set(normalizedAlias, country);
            
            // Add alias words to word map too
            const aliasWords = normalizedAlias.split(/\s+/);
            aliasWords.forEach(word => {
                if (word.length > 2) {
                    wordMap.set(word, [...(wordMap.get(word) || []), country]);
                }
            });
        });
    }
});

return { exactMap, namePrefixMap, aliasMap, wordMap };
}

// Initialize maps once (outside component)
const { exactMap, namePrefixMap, aliasMap, wordMap } = createDestinationMaps();

function InfoSection({ trip, onShareClick }) {
const [photoUrl, setPhotoUrl] = useState('');
const [loading, setLoading] = useState(false);
const [imageError, setImageError] = useState(false);
const { translate, language } = useLanguage();
const isRTL = language === "he";
const translatedTrip = language === "en" ? trip : translateTripData(trip, language);
// Memoize the normalized location query
const locationQuery = useMemo(() => {
    const rawLocation = trip?.userSelection?.location?.label || 
                      trip.tripData?.trip?.destination || '';
    return rawLocation.toLowerCase().trim();
}, [trip]);

// Function to find the best matching destination
const findBestMatch = useMemo(() => {
    return (query) => {
        if (!query) return null;
        
        // Priority 1: Exact match on country name
        if (exactMap.has(query)) {
            return exactMap.get(query);
        }
        
        // Priority 2: Exact match on country alias
        if (aliasMap.has(query)) {
            return aliasMap.get(query);
        }
        
        // Priority 3: Query starts with country name or country name starts with query
        for (const [countryName, country] of exactMap.entries()) {
            if (query.startsWith(countryName) || countryName.startsWith(query)) {
                return country;
            }
        }
        
        // Priority 4: Check first word matches for multi-word queries
        const firstWord = query.split(/\s+/)[0];
        if (firstWord && namePrefixMap.has(firstWord)) {
            return namePrefixMap.get(firstWord)[0]; // Get the first match
        }
        
        // Priority 5: Use a scoring system for partial matches
        const queryWords = query.split(/\s+/).filter(w => w.length > 2);
        if (queryWords.length === 0) return null;
        
        const countryScores = new Map();
        
        // Calculate scores based on word matches
        queryWords.forEach(word => {
            if (wordMap.has(word)) {
                wordMap.get(word).forEach(country => {
                    const currentScore = countryScores.get(country) || 0;
                    countryScores.set(country, currentScore + 1);
                });
            }
        });
        
        // Find country with highest score
        let bestCountry = null;
        let bestScore = 0;
        
        countryScores.forEach((score, country) => {
            if (score > bestScore) {
                bestScore = score;
                bestCountry = country;
            }
        });
        
        if (bestScore > 0) {
            return bestCountry;
        }
        
        // Priority 6: Last-ditch effort - check if any country name contains the query
        // or if query contains any country name
        for (const [countryName, country] of exactMap.entries()) {
            if (countryName.includes(query) || query.includes(countryName)) {
                return country;
            }
        }
        
        return null;
    };
}, []);

useEffect(() => {
    if (!trip) return;
    
    setLoading(true);
    setImageError(false);
    
    try {
        if (!locationQuery) {
            setPhotoUrl(fallbackImage);
            setImageError(true);
            return;
        }
        
        const matchedCountry = findBestMatch(locationQuery);
        
        if (matchedCountry) {
            console.log(`Found match for "${locationQuery}": ${matchedCountry.name}`);
            setPhotoUrl(matchedCountry.imageUrl);
        } else {
            console.log(`No match found for "${locationQuery}"`);
            setPhotoUrl(fallbackImage);
            setImageError(true);
        }
    } catch (error) {
        console.error("Error getting destination image:", error);
        setPhotoUrl(fallbackImage);
        setImageError(true);
    } finally {
        setLoading(false);
    }
}, [trip, locationQuery, findBestMatch]);

const getBackgroundStyle = () => {
    return {
        backgroundImage: `url(${photoUrl || fallbackImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.9) contrast(1.1)',
    };
};

// Function to format the budget display based on language
const formatBudgetDisplay = () => {
    if (language === "he") {
        // For Hebrew, we need to prepend "תקציב" (Budget) to the value
        return `תקציב ${translatedTrip.userSelection?.budget}`;
    } else {
        // For other languages, display the translated budget value followed by the translated word "budget"
        return `${translatedTrip.userSelection?.budget} ${translate("infoSection.budget")}`;
    }
};

const handleImageError = () => {
    setImageError(true);
    setPhotoUrl(fallbackImage);
};

if (!trip) return null;

return (
    <div className="relative w-full mt-4 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
            {/* Hero Image Section */}
            <div className="aspect-[16/9] sm:aspect-[16/6] relative rounded-xl overflow-hidden">
                <div
                    className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
                    style={getBackgroundStyle()}
                    onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Destination Title and Duration */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                        {trip.tripData?.trip?.destination || 'Your Trip'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-semibold text-white/90">
                            📅 {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Trip Details Section */}
            <div className="mt-4 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
                {/* Details Pills - Stack on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* Budget Pill */}
                    <div 
                        className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 justify-center sm:justify-start"
                        style={{ direction: isRTL ? "rtl" : "ltr" }}
                    >
                        <span>💰</span>
                        <span className="font-medium text-gray-700 text-sm sm:text-base">
                            {formatBudgetDisplay()}
                        </span>
                    </div>

                    {/* Travelers Pill */}
                    <div 
                        className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 justify-center sm:justify-start"
                        style={{ direction: isRTL ? "rtl" : "ltr" }}
                    >
                        <span>👥</span>
                        <span className="font-medium text-gray-700 text-sm sm:text-base">
                            {translate("infoSection.travelers")}: {translatedTrip.userSelection?.travelers}
                        </span>
                    </div>

                    {/* Date Pill */}
                    <div 
                        className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 justify-center sm:justify-start"
                        style={{ direction: isRTL ? "rtl" : "ltr" }}
                    >
                        <span>📆</span>
                        <span className="font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">
                            {translate("infoSection.travelDate")}: 
                            <span className="hidden sm:inline">
                                {formatDate(trip.userSelection?.startDate)} ➡️ {formatDate(trip.userSelection?.endDate)}
                            </span>
                            <span className="sm:hidden">
                                {formatDate(trip.userSelection?.startDate)}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Share Button */}
                <Button 
                    onClick={onShareClick}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center justify-center gap-3 text-base sm:text-lg transition-all duration-300 hover:scale-105"
                    style={{ direction: isRTL ? "rtl" : "ltr" }}
                >
                    <IoIosSend className="text-xl" />
                    <span>{translate("infoSection.share")}</span>
                </Button>
            </div>
        </div>
    </div>
);
}

export default InfoSection;