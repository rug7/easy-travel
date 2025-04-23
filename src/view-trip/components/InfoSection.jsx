import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/formatUtils";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { GetPlaceDetails } from "@/service/GlobalApi";
import fallbackImage from '/public/moderate1.jpg';

// Keep the same URL format
const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1000&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function InfoSection({ trip }) {
    const [photoUrl, setPhotoUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (trip) {
            GetPlacePhoto();
        }
    }, [trip]);

    const GetPlacePhoto = async () => {
        setLoading(true);
        
        try {
            // Exactly match the YouTube example
            const data = {
                textQuery: trip?.userSelection?.location?.label || trip.tripData?.trip?.destination
            };
            
            const result = await GetPlaceDetails(data);
            
            // Log the full response
            console.log("API Response:", result.data);
            
            // Directly access the 3rd photo (index 3) like in the YouTube example
            if (result.data?.places?.[0]?.photos?.[3]?.name) {
                console.log("Photo name:", result.data.places[0].photos[3].name);
                
                // Set the photo URL directly without any validation
                const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', result.data.places[0].photos[3].name);
                setPhotoUrl(PhotoUrl);
            } else {
                // If no photo at index 3, try index 0
                if (result.data?.places?.[0]?.photos?.[0]?.name) {
                    const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', result.data.places[0].photos[0].name);
                    setPhotoUrl(PhotoUrl);
                } else {
                    setPhotoUrl(fallbackImage);
                }
            }
        } catch (error) {
            console.error("Error fetching photo:", error);
            setPhotoUrl(fallbackImage);
        } finally {
            setLoading(false);
        }
    };

    // Simplify the background style
    const getBackgroundStyle = () => {
        return {
            backgroundImage: `url(${photoUrl || fallbackImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.9) contrast(1.1)',
        };
    };

    if (!trip) return null;

    return (
        <div className="relative w-full mt-4">
            <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
                <div className="aspect-[16/6] relative rounded-xl overflow-hidden">
                    <div
                        className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
                        style={getBackgroundStyle()}
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
                                📅 {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Trip Details Pills - Below the image */}
                <div className="flex justify-between items-center mt-4 px-1">
                    {/* Pills Container */}
                    <div className="flex gap-3">
                        <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2">
                            <span>💰</span>
                            <span className="font-medium text-gray-700">{trip.userSelection?.budget} Budget</span>
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2">
                            <span>👥</span>
                            <span className="font-medium text-gray-700">No. Of Travelers: {trip.userSelection?.travelers}</span>
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2">
                            <span>📆</span>
                            <span className="font-medium text-gray-700">Travel Date: {formatDate(trip.userSelection?.startDate)} ➡️ {formatDate(trip.userSelection?.endDate)}</span>
                        </div>
                    </div>
                    {/* Share Button */}
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-lg transition-all duration-300 hover:scale-105"
                    >
                        <IoIosSend className="text-xl" />
                        <span>Share</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default InfoSection;