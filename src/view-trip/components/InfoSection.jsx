import React from "react";
import { formatDate } from "@/utils/formatUtils";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";


function InfoSection({ trip }) {
    if (!trip) return null;

    return (
        <div className="relative w-full mt-4">
            {/* Hero Container */}
            <div className="relative w-full max-w-[1400px] mx-auto overflow-hidden"> {/* Removed rounded-xl from here */}
    {/* Background Image Container with fixed aspect ratio */}
    <div className="aspect-[16/6] relative rounded-xl overflow-hidden"> {/* Added rounded-xl here */}
        
                    <div
                className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
                style={{
                            backgroundImage: "url('/moderate1.jpg')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'brightness(0.9) contrast(1.1)',
                        }}
                    />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

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