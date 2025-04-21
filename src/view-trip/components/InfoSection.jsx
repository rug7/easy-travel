import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/formatUtils";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { GetPlaceDetails } from "@/service/GlobalApi";

const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1200&maxWidthPx=2000&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function InfoSection({ trip }) {
    const [photoUrl, setPhotoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (trip) {
            getPlacePhoto();
        }
    }, [trip]);

    const getPlacePhoto = async () => {
        if (!trip?.tripData?.trip?.destination) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = {
                textQuery: trip.tripData.trip.destination
            };
            
            const result = await GetPlaceDetails(data);
            console.log("API response:", result.data);
            
            if (result.data?.places?.[0]?.photos && result.data.places[0].photos.length > 0) {
                // Try to find a landscape-oriented photo (wider than tall)
                let bestPhotoIndex = 0;
                
                // Log all available photos for debugging
                result.data.places[0].photos.forEach((photo, index) => {
                    console.log(`Photo ${index}:`, photo);
                });
                
                // Use the first photo as default
                const photoName = result.data.places[0].photos[bestPhotoIndex].name;
                // Request a wider image by adjusting the dimensions
                const photoUrlValue = PHOTO_REF_URL.replace('{NAME}', photoName);
                setPhotoUrl(photoUrlValue);
                console.log("Photo URL set:", photoUrlValue);
            } else {
                console.warn("No photos found for this destination");
                setPhotoUrl('');
            }
        } catch (err) {
            console.error("Error fetching place photo:", err);
            setError("Failed to load destination image");
            setPhotoUrl('');
        } finally {
            setIsLoading(false);
        }
    };

    // For direct image URL testing (uncomment to test with a specific image)
    // useEffect(() => {
    //     setPhotoUrl('https://lh3.googleusercontent.com/place-photos/ADOrq0tbk3XLs7zhf8RubVD4A9ePnzjrXKVODkURkNjuUt5_vAHBSDiZSP46ktmOQj61wObyJaODFKJ8VXnYqGXKVODkURkNjuUt5');
    //     setIsLoading(false);
    // }, []);

    if (!trip) return null;

    // Default background if no photo is available
    const defaultBackground = "linear-gradient(to right, #4b6cb7, #182848)";

    return (
        <div className="relative w-full mt-4">
            {/* Hero Container */}
            <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden">
                {/* Background Image Container with wider aspect ratio */}
                <div className="aspect-[21/9] relative rounded-xl overflow-hidden"> {/* Changed aspect ratio to 21:9 for wider look */}
                    {/* Background Image or Gradient */}
                    <div
                        className={`absolute inset-0 w-full h-full ${isLoading ? 'animate-pulse bg-gray-300' : ''}`}
                        style={{
                            backgroundImage: photoUrl ? `url(${photoUrl})` : defaultBackground,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'brightness(0.85) contrast(1.1)',
                        }}
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                    {/* Content Container */}
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
                <div className="flex flex-wrap justify-between items-center mt-4 px-1">
                    {/* Pills Container */}
                    <div className="flex flex-wrap gap-3">
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-lg transition-all duration-300 hover:scale-105 mt-3 sm:mt-0"
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