import React, { useEffect, useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

function MyTrips() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'AITrips'));
            const tripsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-[72px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-[72px] p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <IoArrowBack className="mr-2" />
                        Back to Home
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-8">My Trips</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => navigate(`/view-trip/${trip.id}`)}
                        >
                            <div className="relative h-48">
                                <img
                                    src={`https://source.unsplash.com/800x600/?${encodeURIComponent(trip.tripData?.trip?.destination || 'travel')}`}
                                    alt={trip.tripData?.trip?.destination}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h2 className="text-white text-xl font-bold">
                                        {trip.tripData?.trip?.destination || 'Unnamed Trip'}
                                    </h2>
                                    <p className="text-white/80 text-sm">
                                        {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📅 {new Date(trip.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>👥 {trip.userSelection?.travelers} travelers</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {trips.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No trips found</p>
                        <button
                            onClick={() => navigate('/create-trip')}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Trip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyTrips;