import React, { useEffect, useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { GetPlaceDetails } from "@/service/GlobalApi";

// Cache keys
const TRIPS_CACHE_KEY = 'cached_trips';
const IMAGES_CACHE_KEY = 'cached_trip_images';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

function MyTrips() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tripImages, setTripImages] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        loadTripsWithCache();
    }, []);

    // Load trips with caching
    const loadTripsWithCache = async () => {
        // Try to get cached data first
        const cachedData = getCachedData();
        
        if (cachedData) {
            // Use cached data
            setTrips(cachedData.trips);
            setTripImages(cachedData.images);
            setLoading(false);
            
            // Refresh in background if cache is older than 5 minutes
            if (Date.now() - cachedData.timestamp > 5 * 60 * 1000) {
                refreshTripsInBackground();
            }
        } else {
            // No cache, load from Firestore
            await fetchTrips();
        }
    };

    // Get cached data if available and not expired
    const getCachedData = () => {
        try {
            const cachedTripsJson = localStorage.getItem(TRIPS_CACHE_KEY);
            const cachedImagesJson = localStorage.getItem(IMAGES_CACHE_KEY);
            
            if (cachedTripsJson && cachedImagesJson) {
                const cachedTrips = JSON.parse(cachedTripsJson);
                const cachedImages = JSON.parse(cachedImagesJson);
                
                // Check if cache is still valid
                if (Date.now() - cachedTrips.timestamp < CACHE_EXPIRY) {
                    return {
                        trips: cachedTrips.data,
                        images: cachedImages.data,
                        timestamp: cachedTrips.timestamp
                    };
                }
            }
        } catch (error) {
            console.error('Error reading from cache:', error);
        }
        return null;
    };

    // Update cache with new data
    const updateCache = (trips, images) => {
        try {
            const timestamp = Date.now();
            localStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify({
                data: trips,
                timestamp
            }));
            localStorage.setItem(IMAGES_CACHE_KEY, JSON.stringify({
                data: images,
                timestamp
            }));
        } catch (error) {
            console.error('Error updating cache:', error);
        }
    };

    // Refresh trips in background without showing loading state
    const refreshTripsInBackground = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'AITrips'));
            const tripsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Fetch only new images
            const currentImages = {...tripImages};
            for (const trip of tripsData) {
                const destination = trip.tripData?.trip?.destination;
                if (destination && !currentImages[trip.id]) {
                    const imageUrl = await fetchTripImage(destination);
                    if (imageUrl) {
                        currentImages[trip.id] = imageUrl;
                    }
                }
            }
            
            // Update state and cache
            setTrips(tripsData);
            setTripImages(currentImages);
            updateCache(tripsData, currentImages);
        } catch (error) {
            console.error('Error refreshing trips:', error);
        }
    };

    const fetchTripImage = async (destination) => {
        try {
            const data = {
                textQuery: destination,
                languageCode: "en"
            };
            
            const result = await GetPlaceDetails(data);
            
            if (result.data?.places?.[0]?.photos?.[0]?.name) {
                const photoName = result.data.places[0].photos[0].name;
                return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
            }
            return null;
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    };

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'AITrips'));
            const tripsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData);

            // Fetch images for each trip
            const images = {};
            const promises = tripsData.map(async (trip) => {
                const destination = trip.tripData?.trip?.destination;
                if (destination) {
                    const imageUrl = await fetchTripImage(destination);
                    if (imageUrl) {
                        images[trip.id] = imageUrl;
                    }
                }
            });
            
            // Wait for all image fetches to complete
            await Promise.all(promises);
            
            setTripImages(images);
            
            // Update cache
            updateCache(tripsData, images);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 pt-[140px] pb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">My Trips</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center size-xs text-white hover:text-white hover:scale-105 hover:shadow-lg transition-all"
                    >
                        <IoArrowBack className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                onClick={() => navigate(`/view-trip/${trip.id}`)}
                                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] duration-300"
                            >
                                <div className="relative h-48">
                                    <img
                                        src={tripImages[trip.id] || `/moderate1.jpg`}
                                        alt={trip.tripData?.trip?.destination}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/moderate1.jpg';
                                        }}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h2 className="text-white text-xl font-bold">
                                            {trip.tripData?.trip?.destination || 'Unnamed Trip'}
                                        </h2>
                                        <p className="text-white/90">
                                            {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <span className="mr-1">📅</span>
                                            {new Date(trip.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-1">👥</span>
                                            {trip.userSelection?.travelers} travelers
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && trips.length === 0 && (
                    <div className="text-center py-12 bg-gray-700/50 rounded-xl">
                        <p className="text-gray-300 text-lg mb-4">No trips found</p>
                        <button
                            onClick={() => navigate('/create-trip')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
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