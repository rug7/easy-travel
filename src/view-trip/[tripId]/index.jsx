// In your view-trip/[tripId]/index.jsx file
import React, { useEffect, useState } from "react";
import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Flights from "../components/Flights";
import Activities from "../components/Activities";
import WeatherForecast from "../components/WeatherForecast"; // Import the weather component


function Viewtrip() {
    // Get tripId directly from useParams
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State to track which sections are visible for animation
    const [visibleSections, setVisibleSections] = useState({
        info: false,
        weather:false,
        flights: false,
        hotels: false,
        activities: false
    });

    useEffect(() => {
        if (tripId) {
            GetTripData();
        }
    }, [tripId]);

    // Progressive loading effect
    useEffect(() => {
        if (!trip) return;
        
        // Show info section immediately
        setVisibleSections(prev => ({ ...prev, info: true }));

        // show weather after a short delay
        setTimeout(() => {
            setVisibleSections(prev => ({ ...prev, weather: true }));
        }, 400);
        
        // Show flights after a delay
        setTimeout(() => {
            setVisibleSections(prev => ({ ...prev, flights: true }));
        }, 800);
        
        // Show hotels after another delay
        setTimeout(() => {
            setVisibleSections(prev => ({ ...prev, hotels: true }));
        }, 1600);
        
        // Show activities after final delay
        setTimeout(() => {
            setVisibleSections(prev => ({ ...prev, activities: true }));
        }, 2400);
    }, [trip]);

    const GetTripData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'AITrips', tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document: ", docSnap.data());
                setTrip(docSnap.data());
            } else {
                console.log("No Such Document");
                toast.error('No trip Found!');
            }
        } catch (error) {
            console.error("Error fetching trip:", error);
            toast.error('Error loading trip data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Trip not found</div>
            </div>
        );
    }

    return (
        <div className='pt-[72px] p-10 md:px-20 lg:px-44 xl:px-56'>
            {/* Info Section */}
            {visibleSections.info && (
                <div className="animate-fadeIn">
                    <InfoSection trip={trip} />
                </div>
            )}

            

            {/* Flights Section */}
            {visibleSections.flights && (
                <div className="animate-fadeIn">
                    <Flights trip={trip} />
                </div>
            )}

            {/* Hotels Section */}
            {visibleSections.hotels && (
                <div className="animate-fadeIn">
                    <Hotels trip={trip} />
                </div>
            )}

            {/* Activities Section */}
            {visibleSections.activities && (
                <div className="animate-fadeIn">
                    <Activities trip={trip} />
                </div>
            )}

             {/* Weather Section */}
             {visibleSections.weather && (
                <div className="animate-fadeIn">
                    <WeatherForecast 
                        destination={trip.tripData?.trip?.destination} 
                        startDate={trip.userSelection?.startDate}
                        endDate={trip.userSelection?.endDate}
                    />
                </div>
            )}
        </div>
    );
}

export default Viewtrip;