import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/formatUtils";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";
import fallbackImage from '/moderate1.jpg';
import destinationsData from '@/context/destinations.json';
import ShareTripModal from "./ShareTripModal";
import { useLanguage } from "@/context/LanguageContext";
import { translateTripData } from "@/utils/translateTripData";


function InfoSection({ trip, onShareClick }) {
    const [photoUrl, setPhotoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { translate, language } = useLanguage();
    const isRTL = language === "he";
    const translatedTrip = language === "en" ? trip : translateTripData(trip, language);


    // const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        if (trip) {
            getDestinationImage();
        }
    }, [trip]);

    // Function to find the best matching image from destinations.json
    const getDestinationImage = () => {
        setLoading(true);
        setImageError(false);
        
        try {
            const locationQuery = (trip?.userSelection?.location?.label || trip.tripData?.trip?.destination || '').toLowerCase();
            
            if (!locationQuery) {
                setImageError(true);
                setPhotoUrl(fallbackImage);
                return;
            }
            
            // First try to find an exact match
            let matchedCountry = destinationsData.countries.find(country => 
                country.name.toLowerCase() === locationQuery
            );
            
            // If no exact match, check country aliases
            if (!matchedCountry) {
                matchedCountry = destinationsData.countries.find(country => 
                    country.aliases.some(alias => locationQuery.includes(alias.toLowerCase()))
                );
            }
            
            // If still no match, look for partial matches in country names
            if (!matchedCountry) {
                matchedCountry = destinationsData.countries.find(country => 
                    locationQuery.includes(country.name.toLowerCase()) || 
                    country.name.toLowerCase().includes(locationQuery)
                );
            }
            
            // If still no match, look for partial matches in aliases
            if (!matchedCountry) {
                matchedCountry = destinationsData.countries.find(country => 
                    country.aliases.some(alias => 
                        locationQuery.includes(alias.toLowerCase()) || 
                        alias.toLowerCase().includes(locationQuery)
                    )
                );
            }
            
            if (matchedCountry) {
                console.log(`Found match for "${locationQuery}": ${matchedCountry.name}`);
                setPhotoUrl(matchedCountry.imageUrl);
            } else {
                console.log(`No match found for "${locationQuery}"`);
                setImageError(true);
                setPhotoUrl(fallbackImage);
            }
        } catch (error) {
            console.error("Error getting destination image:", error);
            setImageError(true);
            setPhotoUrl(fallbackImage);
        } finally {
            setLoading(false);
        }
    };

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

    if (!trip) return null;

    return (
        <div className="relative w-full mt-4">
            <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
                <div className="aspect-[16/6] relative rounded-xl overflow-hidden">
                    <div
                        className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
                        style={getBackgroundStyle()}
                        onError={() => {
                            console.error("Background image failed to load");
                            setImageError(true);
                            setPhotoUrl(fallbackImage);
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h1 className="text-5xl font-bold text-white mb-2">
                            {trip.tripData?.trip?.destination || 'Your Trip'}
                        </h1>
                        <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-white/90">
                                📅 {trip.tripData?.trip?.duration || `\${trip.userSelection?.numDays} days`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Trip Details Pills - Below the image */}
                <div className="flex justify-between items-center mt-4 px-1">
                    {/* Pills Container */}
                    <div className="flex gap-3">
                        <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                            <span>💰</span>
                            <span className="font-medium text-gray-700">{formatBudgetDisplay()}</span>
                        </div>

                        <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                            <span>👥</span>
                            <span className="font-medium text-gray-700">{translate("infoSection.travelers")}: {translatedTrip.userSelection?.travelers}</span>
                        </div>

                        <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                            <span>📆</span>
                            <span className="font-medium text-gray-700">{translate("infoSection.travelDate")}: {formatDate(trip.userSelection?.startDate)} ➡️ {formatDate(trip.userSelection?.endDate)}</span>
                        </div>
                    </div>
                    {/* Share Button */}
                    <Button 
                        onClick={onShareClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-3 text-lg transition-all duration-300 hover:scale-105 ml-2"
                        style={{ direction: isRTL ? "rtl" : "ltr" }}
                    >
                        <IoIosSend className="text-xl" />
                        <span>{translate("infoSection.share")}</span>
                    </Button>
                </div>
            </div>
            
            {/* Share Trip Modal */}
            {/* <ShareTripModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)}
                tripId={trip.id}
                tripDestination={trip.tripData?.trip?.destination || 'Trip'}
            /> */}
        </div>
    );
}

export default InfoSection;