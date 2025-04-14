import React from "react";

function InfoSection({ trip }) {
    if (!trip) return null;

    return (
        <div className="relative w-full mt-4">
            {/* Hero Container */}
            <div className="relative w-full max-w-[1400px] mx-auto aspect-[16/6] rounded-xl overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 w-full h-full transform transition-transform duration-300 hover:scale-105"
                    style={{
                        backgroundImage: "url('/moderate1.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.9) contrast(1.1)', // Darkened the image slightly
                    }}
                />
                
                {/* Gradient Overlay - Enhanced for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                {/* Content Container */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
                    <div className="text-white">
                        <h1 className="text-5xl font-bold drop-shadow-lg text-white">
                            {trip.tripData?.trip?.destination || 'Your Trip'}
                        </h1>
                        <p className="mt-2 text-xl font-semibold drop-shadow-lg text-white/90">
                            {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trip Details */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-700">Budget</h3>
                        <p className="mt-1">{trip.userSelection?.budget || 'Not specified'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Travelers</h3>
                        <p className="mt-1">{trip.userSelection?.travelers || 'Not specified'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Travel Dates</h3>
                        <p className="mt-1">{trip.userSelection?.startDate ? new Date(trip.userSelection.startDate).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoSection;