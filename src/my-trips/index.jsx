// import React, { useEffect, useState } from 'react';
// import { db } from '@/service/firebaseConfig';
// import { collection, getDocs } from 'firebase/firestore';
// import { useNavigate } from 'react-router-dom';
// import { IoArrowBack } from 'react-icons/io5';
// import { GetPlaceDetails } from "@/service/GlobalApi";

// // Cache keys
// const TRIPS_CACHE_KEY = 'cached_trips';
// const IMAGES_CACHE_KEY = 'cached_trip_images';
// const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// function MyTrips() {
//     const [trips, setTrips] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [tripImages, setTripImages] = useState({});
//     const navigate = useNavigate();

//     useEffect(() => {
//         loadTripsWithCache();
//     }, []);

//     // Load trips with caching
//     const loadTripsWithCache = async () => {
//         // Try to get cached data first
//         const cachedData = getCachedData();
        
//         if (cachedData) {
//             // Use cached data
//             setTrips(cachedData.trips);
//             setTripImages(cachedData.images);
//             setLoading(false);
            
//             // Refresh in background if cache is older than 5 minutes
//             if (Date.now() - cachedData.timestamp > 5 * 60 * 1000) {
//                 refreshTripsInBackground();
//             }
//         } else {
//             // No cache, load from Firestore
//             await fetchTrips();
//         }
//     };

//     // Get cached data if available and not expired
//     const getCachedData = () => {
//         try {
//             const cachedTripsJson = localStorage.getItem(TRIPS_CACHE_KEY);
//             const cachedImagesJson = localStorage.getItem(IMAGES_CACHE_KEY);
            
//             if (cachedTripsJson && cachedImagesJson) {
//                 const cachedTrips = JSON.parse(cachedTripsJson);
//                 const cachedImages = JSON.parse(cachedImagesJson);
                
//                 // Check if cache is still valid
//                 if (Date.now() - cachedTrips.timestamp < CACHE_EXPIRY) {
//                     return {
//                         trips: cachedTrips.data,
//                         images: cachedImages.data,
//                         timestamp: cachedTrips.timestamp
//                     };
//                 }
//             }
//         } catch (error) {
//             console.error('Error reading from cache:', error);
//         }
//         return null;
//     };

//     // Update cache with new data
//     const updateCache = (trips, images) => {
//         try {
//             const timestamp = Date.now();
//             localStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify({
//                 data: trips,
//                 timestamp
//             }));
//             localStorage.setItem(IMAGES_CACHE_KEY, JSON.stringify({
//                 data: images,
//                 timestamp
//             }));
//         } catch (error) {
//             console.error('Error updating cache:', error);
//         }
//     };

//     // Refresh trips in background without showing loading state
//     const refreshTripsInBackground = async () => {
//         try {
//             const querySnapshot = await getDocs(collection(db, 'AITrips'));
//             const tripsData = querySnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));
            
//             // Fetch only new images
//             const currentImages = {...tripImages};
//             for (const trip of tripsData) {
//                 const destination = trip.tripData?.trip?.destination;
//                 if (destination && !currentImages[trip.id]) {
//                     const imageUrl = await fetchTripImage(destination);
//                     if (imageUrl) {
//                         currentImages[trip.id] = imageUrl;
//                     }
//                 }
//             }
            
//             // Update state and cache
//             setTrips(tripsData);
//             setTripImages(currentImages);
//             updateCache(tripsData, currentImages);
//         } catch (error) {
//             console.error('Error refreshing trips:', error);
//         }
//     };

//     const fetchTripImage = async (destination) => {
//         try {
//             const data = {
//                 textQuery: destination,
//                 languageCode: "en"
//             };
            
//             const result = await GetPlaceDetails(data);
            
//             if (result.data?.places?.[0]?.photos?.[0]?.name) {
//                 const photoName = result.data.places[0].photos[0].name;
//                 return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
//             }
//             return null;
//         } catch (error) {
//             console.error('Error fetching image:', error);
//             return null;
//         }
//     };

//     const fetchTrips = async () => {
//         setLoading(true);
//         try {
//             const querySnapshot = await getDocs(collection(db, 'AITrips'));
//             const tripsData = querySnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));
//             setTrips(tripsData);

//             // Fetch images for each trip
//             const images = {};
//             const promises = tripsData.map(async (trip) => {
//                 const destination = trip.tripData?.trip?.destination;
//                 if (destination) {
//                     const imageUrl = await fetchTripImage(destination);
//                     if (imageUrl) {
//                         images[trip.id] = imageUrl;
//                     }
//                 }
//             });
            
//             // Wait for all image fetches to complete
//             await Promise.all(promises);
            
//             setTripImages(images);
            
//             // Update cache
//             updateCache(tripsData, images);
//         } catch (error) {
//             console.error('Error fetching trips:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-800">
//             {/* Main Content */}
//             <div className="max-w-7xl mx-auto px-4 pt-[140px] pb-12">
//                 <div className="flex justify-between items-center mb-8">
//                     <h1 className="text-3xl font-bold text-white">My Trips</h1>
//                     <button
//                         onClick={() => navigate('/')}
//                         className="flex items-center size-xs text-white hover:text-white hover:scale-105 hover:shadow-lg transition-all"
//                     >
//                         <IoArrowBack className="w-5 h-5 mr-2" />
//                         Back to Home
//                     </button>
//                 </div>

//                 {loading ? (
//                     <div className="flex justify-center items-center h-64">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {trips.map((trip) => (
//                             <div
//                                 key={trip.id}
//                                 onClick={() => navigate(`/view-trip/${trip.id}`)}
//                                 className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] duration-300"
//                             >
//                                 <div className="relative h-48">
//                                     <img
//                                         src={tripImages[trip.id] || `/moderate1.jpg`}
//                                         alt={trip.tripData?.trip?.destination}
//                                         className="w-full h-full object-cover"
//                                         onError={(e) => {
//                                             e.target.onerror = null;
//                                             e.target.src = '/moderate1.jpg';
//                                         }}
//                                         loading="lazy"
//                                     />
//                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
//                                     <div className="absolute bottom-0 left-0 right-0 p-4">
//                                         <h2 className="text-white text-xl font-bold">
//                                             {trip.tripData?.trip?.destination || 'Unnamed Trip'}
//                                         </h2>
//                                         <p className="text-white/90">
//                                             {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="p-4">
//                                     <div className="flex items-center gap-4 text-sm text-gray-600">
//                                         <div className="flex items-center">
//                                             <span className="mr-1">📅</span>
//                                             {new Date(trip.createdAt).toLocaleDateString()}
//                                         </div>
//                                         <div className="flex items-center">
//                                             <span className="mr-1">👥</span>
//                                             {trip.userSelection?.travelers} travelers
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {!loading && trips.length === 0 && (
//                     <div className="text-center py-12 bg-gray-700/50 rounded-xl">
//                         <p className="text-gray-300 text-lg mb-4">No trips found</p>
//                         <button
//                             onClick={() => navigate('/create-trip')}
//                             className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
//                         >
//                             Create Your First Trip
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default MyTrips;


import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoTrashOutline, IoMapOutline, IoCloseOutline, IoExpandOutline } from 'react-icons/io5';
import { GetPlaceDetails } from "@/service/GlobalApi";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function MyTrips() {
    // Existing state
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tripImages, setTripImages] = useState({});
    const [deleting, setDeleting] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);

    // New state for map
    const [showMap, setShowMap] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    
    // Refs
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
        
        // Load Google Maps script on component mount
        if (!window.google) {
            loadGoogleMapsScript();
        }
        
        return () => {
            // Clean up markers on unmount
            if (markersRef.current.length > 0) {
                markersRef.current.forEach(marker => {
                    if (marker) marker.setMap(null);
                });
                markersRef.current = [];
            }
        };
    }, []);

    useEffect(() => {
        if (showMap) {
            if (window.google && window.google.maps) {
                if (!mapInstanceRef.current) {
                    createMap();
                } else {
                    window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
                    if (markersRef.current.length === 0) {
                        addMarkersToMap();
                    }
                }
            } else if (!mapInitialized) {
                loadGoogleMapsScript();
            }
        }
    }, [showMap, mapExpanded]);

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
        try {
            const querySnapshot = await getDocs(collection(db, 'AITrips'));
            const tripsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData);

            // Extract destinations for map
            const destinationsList = tripsData.map(trip => ({
                id: trip.id,
                name: trip.tripData?.trip?.destination || 'Unknown',
                days: trip.tripData?.trip?.duration || trip.userSelection?.numDays || 0
            })).filter(dest => dest.name !== 'Unknown');
            
            setDestinations(destinationsList);

            // Fetch images for each trip
            const images = {};
            for (const trip of tripsData) {
                const destination = trip.tripData?.trip?.destination;
                if (destination) {
                    const imageUrl = await fetchTripImage(destination);
                    if (imageUrl) {
                        images[trip.id] = imageUrl;
                    }
                }
            }
            setTripImages(images);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadGoogleMapsScript = () => {
        if (window.google && window.google.maps) {
            createMap();
            return;
        }

        setMapLoading(true);
        setMapError(null);

        try {
            if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
                const checkGoogleExists = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(checkGoogleExists);
                        setMapLoading(false);
                        setMapInitialized(true);
                        createMap();
                    }
                }, 100);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                setMapLoading(false);
                setMapInitialized(true);
                createMap();
            };
            
            script.onerror = () => {
                setMapLoading(false);
                setMapError('Failed to load Google Maps');
            };
            
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error loading Google Maps:', error);
            setMapLoading(false);
            setMapError('Failed to load Google Maps');
        }
    };

    const createMap = () => {
        if (!mapRef.current || !window.google || !window.google.maps) return;
        
        try {
            if (mapInstanceRef.current) return;

            const mapOptions = {
                zoom: 2,
                center: { lat: 20, lng: 0 },
                mapTypeId: 'roadmap',
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                zoomControlOptions: {
                    position: window.google.maps.ControlPosition.RIGHT_BOTTOM
                },
                styles: [
                    {
                        "elementType": "geometry",
                        "stylers": [{"color": "#1d2c4d"}]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{"color": "#8ec3b9"}]
                    },
                    {
                        "elementType": "labels.text.stroke",
                        "stylers": [{"color": "#1a3646"}]
                    },
                    {
                        "featureType": "administrative.country",
                        "elementType": "geometry.stroke",
                        "stylers": [{"color": "#4b6878"}]
                    },
                    {
                        "featureType": "administrative.land_parcel",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "administrative.province",
                        "elementType": "geometry.stroke",
                        "stylers": [{"color": "#4b6878"}]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "geometry.stroke",
                        "stylers": [{"color": "#334e87"}]
                    },
                    {
                        "featureType": "landscape.natural",
                        "elementType": "geometry",
                        "stylers": [{"color": "#023e58"}]
                    },
                    {
                        "featureType": "poi",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "road",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "transit",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{"color": "#0e1626"}]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": [{"color": "#4e6d70"}]
                    }
                ]
            };

            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
            
            if (destinations.length > 0) {
                addMarkersToMap();
            }

            window.viewTrip = (tripId) => {
                navigate(`/view-trip/${tripId}`);
            };
        } catch (error) {
            console.error('Error creating map:', error);
            setMapError('Failed to create map');
        }
    };

    const addMarkersToMap = () => {
        if (!mapInstanceRef.current || !window.google || !window.google.maps) return;
    
        const map = mapInstanceRef.current;
        const bounds = new window.google.maps.LatLngBounds();
        const geocoder = new window.google.maps.Geocoder();
    
        if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
                if (marker) marker.setMap(null);
            });
            markersRef.current = [];
        }
    
        destinations.forEach((destination, index) => {
            geocoder.geocode({ address: destination.name }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const position = results[0].geometry.location;
                    const markerColors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'];
                    const colorIndex = index % markerColors.length;
                    
                    const marker = new window.google.maps.Marker({
                        position,
                        map,
                        title: destination.name,
                        animation: window.google.maps.Animation.DROP,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: markerColors[colorIndex],
                            fillOpacity: 0.9,
                            strokeWeight: 2,
                            strokeColor: '#FFFFFF',
                            scale: 10
                        }
                    });
                    
                    markersRef.current.push(marker);
                    
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 10px; max-width: 200px; text-align: center; color: #333;">
                                <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: ${markerColors[colorIndex]};">
                                    ${destination.name}
                                </h3>
                                <p style="margin: 4px 0 8px; font-size: 14px;">${destination.days} days</p>
                                <button 
                                    style="background: ${markerColors[colorIndex]}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;"
                                    onclick="window.viewTrip('${destination.id}')"
                                >
                                    View Trip
                                </button>
                            </div>
                        `
                    });
                    
                    marker.addListener('click', () => {
                        if (window.currentInfoWindow) {
                            window.currentInfoWindow.close();
                        }
                        infoWindow.open(map, marker);
                        window.currentInfoWindow = infoWindow;
                    });
                    
                    bounds.extend(position);
                    
                    if (index === destinations.length - 1) {
                        map.fitBounds(bounds);
                        const listener = window.google.maps.event.addListener(map, 'idle', () => {
                            if (map.getZoom() > 5) {
                                map.setZoom(5);
                            }
                            window.google.maps.event.removeListener(listener);
                        });
                    }
                }
            });
        });
    };

    const toggleMap = () => {
        setShowMap(!showMap);
    };

    const toggleMapExpansion = () => {
        setMapExpanded(!mapExpanded);
        setTimeout(() => {
            if (mapInstanceRef.current && window.google && window.google.maps) {
                window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
            }
        }, 400);
    };

    const openDeleteConfirmation = (e, tripId) => {
        e.stopPropagation(); // Prevent navigating to trip details
        setConfirmDelete(tripId);
    };

    const cancelDelete = (e) => {
        e.stopPropagation(); // Prevent navigating to trip details
        setConfirmDelete(null);
    };

    const confirmDeleteTrip = async (e, tripId) => {
        e.stopPropagation(); // Prevent navigating to trip details
        
        try {
            setDeleting(prev => ({ ...prev, [tripId]: true }));
            
            // Delete from Firestore
            await deleteDoc(doc(db, 'AITrips', tripId));
            
            // Update local state
            setTrips(trips.filter(trip => trip.id !== tripId));
            
            toast.success('Trip deleted successfully');
        } catch (error) {
            console.error('Error deleting trip:', error);
            toast.error('Failed to delete trip');
        } finally {
            setDeleting(prev => ({ ...prev, [tripId]: false }));
            setConfirmDelete(null);
        }
    };

    return (
            <div className="min-h-screen bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 pt-[140px] pb-12">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">My Trips</h1>
                        
                        <button
                            onClick={toggleMap}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                        >
                            {showMap ? <IoCloseOutline className="w-5 h-5" /> : <IoMapOutline className="w-5 h-5" />}
                            {showMap ? "Hide Map" : "Show Map"}
                        </button>
                    </div>
    
                    <AnimatePresence>
                        {showMap && (
                            <motion.div 
                                className={`bg-gray-900 rounded-xl overflow-hidden shadow-xl mb-8 ${mapExpanded ? 'h-[500px]' : 'h-[300px]'}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: mapExpanded ? 500 : 300 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="relative w-full h-full">
                                    {mapLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    )}
                                    
                                    {mapError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
                                            <div className="text-white text-center p-4">
                                                <p className="text-red-400 mb-2">{mapError}</p>
                                                <button 
                                                    onClick={loadGoogleMapsScript}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div ref={mapRef} className="w-full h-full"></div>
                                    
                                    <button
                                        onClick={toggleMapExpansion}
                                        className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
                                        title={mapExpanded ? "Collapse map" : "Expand map"}
                                    >
                                        <IoExpandOutline className="w-5 h-5 text-gray-700" />
                                    </button>
                                    
                                    <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-10">
                                        <h3 className="text-sm font-bold text-gray-800 mb-2">Your Trip Destinations</h3>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                                            <span>Click markers to view trip details</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer relative"
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
                                    <div className="flex items-center justify-between">
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
                                        
                                        {/* Delete button */}
                                        {confirmDelete === trip.id ? (
                                            <div 
                                                className="flex items-center gap-2 " 
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={(e) => confirmDeleteTrip(e, trip.id)}
                                                    className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
                                                    disabled={deleting[trip.id]}
                                                >
                                                    {deleting[trip.id] ? (
                                                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                                    ) : (
                                                        "Delete"
                                                    )}
                                                </button>
                                                <button
                                                    onClick={cancelDelete}
                                                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => openDeleteConfirmation(e, trip.id)}
                                                className="bg-white text-gray-600 font-medium hover:text-red-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                                                title="Delete trip"
                                            >
                                                <IoTrashOutline className="w-5 h-5" />
                                            </button>
                                        )}
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