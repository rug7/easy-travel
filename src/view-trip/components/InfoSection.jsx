import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/formatUtils";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { GetPlaceDetails } from "@/service/GlobalApi";
import fallbackImage from '/public/moderate1.jpg';

function InfoSection({ trip }) {
    const [photoUrl, setPhotoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (trip) {
            GetPlacePhoto();
        }
    }, [trip]);

    const GetPlacePhoto = async () => {
        setLoading(true);
        setImageError(false);
        
        try {
            const data = {
                textQuery: trip?.userSelection?.location?.label || trip.tripData?.trip?.destination,
                languageCode: "en"
            };
            
            const result = await GetPlaceDetails(data);
            console.log("Places API response:", result.data);
            
            if (result.data?.places?.[0]?.photos?.length > 0) {
                // Try to use photo index 3 like in the YouTube example
                const photoIndex = result.data.places[0].photos.length > 3 ? 3 : 0;
                const photo = result.data.places[0].photos[photoIndex];
                
                if (photo && photo.name) {
                    console.log("Using photo:", photo.name);
                    
                    // Use the original Places API URL - this works for background images
                    const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1000&maxWidthPx=1000&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
                    
                    setPhotoUrl(photoUrl);
                } else {
                    setImageError(true);
                    setPhotoUrl(fallbackImage);
                }
            } else {
                setImageError(true);
                setPhotoUrl(fallbackImage);
            }
        } catch (error) {
            console.error("Error fetching photo:", error);
            setImageError(true);
            setPhotoUrl(fallbackImage);
        } finally {
            setLoading(false);
        }
    };

    // Use an actual image element instead of background-image
    if (!trip) return null;

    return (
        <div className="relative w-full mt-4">
            <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
                <div className="aspect-[16/6] relative rounded-xl overflow-hidden bg-gray-900">
                    {/* Use an actual image element for better control */}
                    <img 
                        src={photoUrl || fallbackImage}
                        alt={trip.tripData?.trip?.destination || "Destination"}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            console.error("Image failed to load:", e.target.src);
                            setImageError(true);
                            e.target.src = fallbackImage;
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