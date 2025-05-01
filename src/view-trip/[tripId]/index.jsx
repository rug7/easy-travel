import React, { useEffect, useState } from "react";
import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Flights from "../components/Flights";
import Activities from "../components/Activities";
import WeatherForecast from "../components/WeatherForecast";
import { ChevronDown } from 'lucide-react'; // Import the chevron icon (or use any other icon library)

function Viewtrip() {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [visibleSections, setVisibleSections] = useState({
        info: false,
        weather: false,
        flights: false,
        hotels: false,
        activities: false
    });

    const [expandedSections, setExpandedSections] = useState({
        info: true,
        flights: true,
        hotels: true,
        activities: true,
        weather: true
    });

    const SectionHeader = ({ title, isExpanded, onToggle }) => (
        <div 
            onClick={onToggle}
            className="flex items-center gap-2 mb-6 cursor-pointer group"
        >
            <ChevronDown 
                className={`w-5 h-5 text-white transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-0' : 'transform -rotate-90'
                }`}
            />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
    );

    useEffect(() => {
        if (tripId) {
            GetTripData();
        }
    }, [tripId]);

    useEffect(() => {
        if (!trip) return;
        
        setVisibleSections(prev => ({ ...prev, info: true }));
        setTimeout(() => setVisibleSections(prev => ({ ...prev, weather: true })), 400);
        setTimeout(() => setVisibleSections(prev => ({ ...prev, flights: true })), 800);
        setTimeout(() => setVisibleSections(prev => ({ ...prev, hotels: true })), 1600);
        setTimeout(() => setVisibleSections(prev => ({ ...prev, activities: true })), 2400);
    }, [trip]);

    const GetTripData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'AITrips', tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTrip(docSnap.data());
            } else {
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
        {visibleSections.info && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Trip Information"
                    isExpanded={expandedSections.info}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        info: !prev.info
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.info ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.info && (
                        <div className="content-enter">
                            <InfoSection trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}
             {visibleSections.flights && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Flight Options"
                    isExpanded={expandedSections.flights}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        flights: !prev.flights
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.flights ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.flights && (
                        <div className="content-enter">
                            <Flights trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {visibleSections.hotels && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Hotel Recommendations"
                    isExpanded={expandedSections.hotels}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        hotels: !prev.hotels
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.hotels ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.hotels && (
                        <div className="content-enter">
                            <Hotels trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {visibleSections.activities && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="DailyActivities"
                    isExpanded={expandedSections.activities}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        activities: !prev.activities
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.activities ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.activities && (
                        <div className="content-enter">
                            <Activities trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {visibleSections.weather && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Weather Forecast"
                    isExpanded={expandedSections.weather}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        weather: !prev.weather
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.weather ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.weather && (
                        <div className="content-enter">
                            <WeatherForecast 
                                destination={trip.tripData?.trip?.destination} 
                                startDate={trip.userSelection?.startDate}
                                endDate={trip.userSelection?.endDate}
                            />
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);
}

export default Viewtrip;