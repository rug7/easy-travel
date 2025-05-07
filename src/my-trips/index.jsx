import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoTrashOutline, IoMapOutline, IoCloseOutline, IoExpandOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
// Import fallback image
import fallbackImage from '/moderate1.jpg';
// Import the destinations data
import destinationsData from '@/context/destinations.json';
// Import accessibility context
import { useAccessibility } from '@/context/AccessibilityContext';
import { useLanguage } from "@/context/LanguageContext";
import { translateTripDetails } from '@/utils/translateTripData';



function MyTrips() {
    // Get color mode from accessibility context
    const { colorMode } = useAccessibility();
    const { translate, language } = useLanguage();
const isRTL = language === "he";
    
    // Get the current user from localStorage
    const user = (() => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error("Error parsing user data:", e);
            return null;
        }
    })();
    
    // Existing state
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tripImages, setTripImages] = useState({});
    const [deleting, setDeleting] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Map related state
    const [showMap, setShowMap] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [locationHistory, setLocationHistory] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);


    // Refs
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();

    

    // Function to get accessible colors based on color mode
    const getAccessibleColor = (colorType) => {
        // Map standard color names to your colorMode-specific colors
        const colorMap = {
            default: {
                primary: '#3b82f6', // blue-500
                secondary: '#8b5cf6', // purple-500
                success: '#10b981', // green-500
                danger: '#ef4444', // red-500
                warning: '#f59e0b', // amber-500
                info: '#3b82f6', // blue-500
            },
            protanopia: {
                primary: '#2563eb', // More bluish
                secondary: '#7c3aed', // More visible purple
                success: '#059669', // Adjusted green
                danger: '#9ca3af', // Gray instead of red
                warning: '#d97706', // Darker amber
                info: '#0284c7', // Darker blue
            },
            deuteranopia: {
                primary: '#1d4ed8', // Deeper blue
                secondary: '#6d28d9', // Deeper purple
                success: '#0f766e', // Teal instead of green
                danger: '#b91c1c', // More visible red
                warning: '#b45309', // Darker amber
                info: '#1e40af', // Deeper blue
            },
            tritanopia: {
                primary: '#4f46e5', // Indigo
                secondary: '#7e22ce', // Darker purple
                success: '#15803d', // Darker green
                danger: '#dc2626', // Bright red
                warning: '#ca8a04', // Darker yellow
                info: '#4338ca', // Indigo
            },
            monochromacy: {
                primary: '#4b5563', // Gray-600
                secondary: '#6b7280', // Gray-500
                success: '#374151', // Gray-700
                danger: '#1f2937', // Gray-800
                warning: '#6b7280', // Gray-500
                info: '#4b5563', // Gray-600
            },
            highContrast: {
                primary: '#1d4ed8', // Deep blue
                secondary: '#6d28d9', // Deep purple
                success: '#047857', // Deep green
                danger: '#b91c1c', // Deep red
                warning: '#b45309', // Deep amber
                info: '#1e40af', // Deep blue
            }
        };
      
        // Use colorMode-specific colors, falling back to default
        return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
    };
    

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) return 'Invalid date';

            // Get day, month, and year
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Error';
        }
    };

    // Replace fetchTripImage with getDestinationImage
    const getDestinationImage = (locationQuery) => {
        if (!locationQuery) {
            return fallbackImage;
        }

        locationQuery = locationQuery.toLowerCase();

        // First try to find an exact match
        let matchedCountry = destinationsData.countries.find(country =>
            country.name.toLowerCase() === locationQuery
        );

        // If no exact match, check country aliases
        if (!matchedCountry) {
            matchedCountry = destinationsData.countries.find(country =>
                country.aliases.some(alias => locationQuery.includes(alias.toLowerCase()))
            );
        }

        // If still no match, look for partial matches in country names
        if (!matchedCountry) {
            matchedCountry = destinationsData.countries.find(country =>
                locationQuery.includes(country.name.toLowerCase()) ||
                country.name.toLowerCase().includes(locationQuery)
            );
        }

        // If still no match, look for partial matches in aliases
        if (!matchedCountry) {
            matchedCountry = destinationsData.countries.find(country =>
                country.aliases.some(alias =>
                    locationQuery.includes(alias.toLowerCase()) ||
                    alias.toLowerCase().includes(locationQuery)
                )
            );
        }

        if (matchedCountry) {
            // console.log(`Found match for "${locationQuery}": ${matchedCountry.name}`);
            return matchedCountry.imageUrl;
        } else {
            // console.log(`No match found for "${locationQuery}"`);
            return fallbackImage;
        }
    };

    useEffect(() => {
        if (showMap) {
            if (window.google && window.google.maps) {
                if (!mapInstanceRef.current) {
                    createMap();
                } else {
                    window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
                    
                    // Clear and recreate markers when color mode changes
                    if (markersRef.current.length > 0) {
                        markersRef.current.forEach(marker => {
                            if (marker) marker.setMap(null);
                        });
                        markersRef.current = [];
                    }
                    addMarkersToMap();
                }
            } else if (!mapInitialized) {
                loadGoogleMapsScript();
            }
        }
    }, [showMap, mapExpanded, colorMode]); // Add colorMode as dependency

    useEffect(() => {
        const initializeData = async () => {
            if (user?.id && !dataLoaded && language) {
                try {
                    // console.log("Initializing data with user:", user.id);
                    await Promise.all([fetchTrips(), fetchLocationHistory()]);
                    setDataLoaded(true);
                    
                    if (!window.google) {
                        loadGoogleMapsScript();
                    }
                } catch (error) {
                    console.error("Error initializing data:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!user) {
                setLoading(false);
                // Navigate home if needed
                navigate('/');
                // toast.error('Please log in to view your trips');
            }
        };
    
        initializeData();
    
        // Clean up function
        return () => {
            if (markersRef.current.length > 0) {
                markersRef.current.forEach(marker => {
                    if (marker) marker.setMap(null);
                });
                markersRef.current = [];
            }
        };
    }, [user, dataLoaded,language]); 
    useEffect(() => {
        if (trips.length > 0) {
            // Update the trips with the new translations
            const updatedTrips = trips.map(trip => translateTripDetails(trip, language));
            setTrips(updatedTrips);
        }
    }, [language]);

    const fetchLocationHistory = async () => {
        // Don't get user again here - use the one from component state
        if (!user?.id) {
            console.error("No user ID found - cannot fetch location history");
            return;
        }
        
        try {
            // console.log("Filtering location history with userId:", user.id);
            const historyQuery = query(
                collection(db, 'userLocationHistory'),
                where('userId', '==', user.id)
            );
            const historySnapshot = await getDocs(historyQuery);
            
            // console.log("Query returned docs:", historySnapshot.docs.length);
            
            const historyData = historySnapshot.docs.map(doc => ({
                id: doc.id,
                destination: doc.data().destination,
                visitedAt: doc.data().visitedAt,
            }));
            setLocationHistory(historyData);
        } catch (error) {
            console.error('Error fetching location history:', error);
        }
    };

    const fetchTrips = async () => {
        if (!user?.email) return;
        
        try {
            // Create a query that filters trips by the user's email
            const tripsQuery = query(
                collection(db, 'AITrips'),
                where('userEmail', '==', user.email)
            );
            
            const querySnapshot = await getDocs(tripsQuery);
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

            // Generate images for each trip using destinations.json
            const images = {};
            for (const trip of tripsData) {
                const destination = trip.tripData?.trip?.destination;
                if (destination) {
                    const imageUrl = getDestinationImage(destination);
                    images[trip.id] = imageUrl;
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
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.TOP_RIGHT
                },
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP
                },
                streetViewControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                scaleControl: true,
                styles: [
                    {
                        "elementType": "geometry",
                        "stylers": [{ "color": "#1d2c4d" }]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#8ec3b9" }]
                    },
                    {
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "color": "#1a3646" }]
                    },
                    {
                        "featureType": "administrative.country",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#4b6878" }]
                    },
                    {
                        "featureType": "administrative.land_parcel",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "administrative.province",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#4b6878" }]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#334e87" }]
                    },
                    {
                        "featureType": "landscape.natural",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#023e58" }]
                    },
                    {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "road",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "transit",
                        "stylers": [{ "visibility": "off" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#0e1626" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#4e6d70" }]
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

        // Clear existing markers
        if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => {
                if (marker) marker.setMap(null);
            });
            markersRef.current = [];
        }

        // Get marker colors based on color mode
        const markerFillColor = getAccessibleColor('danger');
        const markerStrokeColor = colorMode === 'monochromacy' ? '#e5e7eb' : '#FFFFFF';
        const historyMarkerColor = getAccessibleColor('danger');

        // Add trip markers
        destinations.forEach((destination, index) => {
            geocoder.geocode({ address: destination.name }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const position = results[0].geometry.location;

                                        // Create trip marker (pin style)
                                        const marker = new window.google.maps.Marker({
                                            position,
                                            map,
                                            title: destination.name,
                                            animation: window.google.maps.Animation.DROP,
                                            icon: {
                                                path: 'M12 0C7.802 0 4 3.403 4 7.602C4 11.8 12 24 12 24S20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z',
                                                fillColor: markerFillColor,
                                                fillOpacity: 1,
                                                strokeWeight: 1.5,
                                                strokeColor: markerStrokeColor,
                                                scale: 1.5,
                                                anchor: new google.maps.Point(12, 24),
                                            }
                                        });
                    
                                        markersRef.current.push(marker);
                    
                                        // Create info window with accessible colors
                                        const infoWindow = new window.google.maps.InfoWindow({
                                            content: `
                                                <div style="padding: 6px; max-width: 120px; text-align: center; color: #333; font-family: system-ui, sans-serif;">
                                                    <h3 style="margin: 0 0 3px; font-size: 12px; font-weight: bold; color: #000000;">
                                                        ${destination.name}
                                                    </h3>
                                                    <p style="margin: 2px 0 4px; color: black; font-size: 11px; font-weight: 400">
                                                        ${translate("dayCount", { count: destination.days.toString().replace(' days', '') })}
                                                    </p>
                                                    <button 
                                                        style="background: ${getAccessibleColor('danger')}; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 11px; width: 100%;"
                                                        onclick="window.viewTrip('${destination.id}')"
                                                    >
                                                        ${translate("viewTrip")}
                                                    </button>
                                                </div>
                                            `,
                                            pixelOffset: new google.maps.Point(0, -5),
                                            disableAutoPan: true  // Add this option

                                        });
                                        
                                        
                    
                                        marker.addListener('click', () => {
                                            if (window.currentInfoWindow) {
                                                window.currentInfoWindow.close();
                                            }
                                            infoWindow.open(map, marker);
                                            window.currentInfoWindow = infoWindow;
                                        });
                    
                                        bounds.extend(position);
                                    }
                                });
                            });
                    
                            // Add location history markers with accessible colors
                            locationHistory.forEach(location => {
                                geocoder.geocode({ address: location.destination }, (results, status) => {
                                    if (status === 'OK' && results[0]) {
                                        const position = results[0].geometry.location;
                    
                                        // Create history marker (circle style) with accessible colors
                                        const historyMarker = new window.google.maps.Marker({
                                            position,
                                            map,
                                            title: location.destination,
                                            icon: {
                                                path: window.google.maps.SymbolPath.CIRCLE,
                                                fillColor: historyMarkerColor,
                                                fillOpacity: 0.6,
                                                strokeWeight: 2,
                                                strokeColor: historyMarkerColor,
                                                scale: 8
                                            }
                                        });
                    
                                        markersRef.current.push(historyMarker);
                                        bounds.extend(position);
                    
                                        // Add info window for history locations with accessible colors
                                        const historyInfoWindow = new window.google.maps.InfoWindow({
                                            content: `
                                                <div style="padding: 6px; text-align: center; font-family: system-ui, sans-serif;">
                                                    <p style="margin: 0; font-weight: 500; font-size: 12px;">${location.destination}</p>
                                                    <p style="margin: 3px 0 0; font-size: 11px; color: #000000;">
                                                        ${translate("visitedOn")} ${formatDate(location.visitedAt)}
                                                    </p>
                                                </div>
                                            `,
                                            pixelOffset: new google.maps.Point(0, -5),
                                            disableAutoPan: true  // Add this option

                                        });
                                        
                    
                                        historyMarker.addListener('click', () => {
                                            if (window.currentInfoWindow) {
                                                window.currentInfoWindow.close();
                                            }
                                            historyInfoWindow.open(map, historyMarker);
                                            window.currentInfoWindow = historyInfoWindow;
                                        });
                                    }
                                });
                            });
                    
                            // Fit bounds and adjust zoom
                            setTimeout(() => {
                                if (markersRef.current.length > 0) {
                                    map.fitBounds(bounds);
                                    const listener = window.google.maps.event.addListener(map, 'idle', () => {
                                        if (map.getZoom() > 5) {
                                            map.setZoom(5);
                                        }
                                        window.google.maps.event.removeListener(listener);
                                    });
                                }
                            }, 1000);
                        };
                    
                        const toggleMap = () => {
                            if (showMap) {
                                // Clear map instance when hiding
                                if (mapInstanceRef.current) {
                                    mapInstanceRef.current = null;
                                }
                                if (markersRef.current.length > 0) {
                                    markersRef.current.forEach(marker => {
                                        if (marker) marker.setMap(null);
                                    });
                                    markersRef.current = [];
                                }
                            }
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
                        if (!user) {
                            return (
                                <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-[100px] flex flex-col items-center justify-center"style={{ direction: isRTL ? "rtl" : "ltr" }}>
                                    <div className="text-white text-center">
                                    <h2 className="text-3xl font-bold text-white mb-4">{translate("pleaseLogIn")}</h2>
                                    <p className="text-gray-300 mb-8">{translate("needToBeLoggedIn")}</p>
                                    <button
                                            onClick={() => navigate('/')}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            {translate("goToHome")}
                                        </button>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800"style={{ direction: isRTL ? "rtl" : "ltr" }}>
                                <div className="max-w-7xl mx-auto px-4 pt-[140px] pb-12">
                                    <div className="flex justify-between items-center mb-8">
                                        <h1 className="text-3xl font-bold text-white">{translate("myTrips")}</h1>
                    
                                        <button
                                            onClick={toggleMap}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors ${
                                                colorMode === 'default' ? 
                                                    'bg-blue-600 hover:bg-blue-700' : 
                                                    ''
                                            }`}
                                            style={
                                                colorMode !== 'default' ? 
                                                    {
                                                        backgroundColor: getAccessibleColor('primary'),
                                                        color: 'white'
                                                    } : 
                                                    {}
                                            }
                                        >
                                            {showMap ? <IoCloseOutline className="w-5 h-5" /> : <IoMapOutline className="w-5 h-5" />}
                                            {showMap ? translate("hideMap") : translate("showMap")}                                        </button>
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
                                                            <div 
                                                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
                                                                style={{ borderColor: getAccessibleColor('primary') }}
                                                            ></div>
                                                        </div>
                                                    )}
                    
                                                    {mapError && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
                                                            <div className="text-white text-center p-4">
                                                                <p 
                                                                    className="mb-2" 
                                                                    style={{ color: getAccessibleColor('danger') }}
                                                                >
                                                                    {mapError}
                                                                </p>
                                                                <button
                                                                    onClick={loadGoogleMapsScript}
                                                                    className="px-4 py-2 rounded text-white"
                                                                    style={{ backgroundColor: getAccessibleColor('primary') }}
                                                                >
                                                                    {translate("retry")}
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
                    
                                                    <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-xl z-10 min-w-[200px]">
                                                    <h3 className="text-sm font-bold text-gray-800 mb-2">{translate("mapLegend")}</h3>
                    
                                                        {/* Planned Trips */}
                                                        <div className="mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <svg 
                                                                    className="w-5 h-5" 
                                                                    viewBox="0 0 24 24" 
                                                                    fill="currentColor"
                                                                    style={{ color: getAccessibleColor('danger') }}
                                                                >
                                                                    <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 12 24 12 24S20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z" />
                                                                </svg>
                                                                <span className="text-xs font-medium text-gray-700">{translate("plannedTrips")} ({destinations.length})</span>
                                                                </div>
                                                        </div>
                    
                                                        {/* Location History */}
                                                        <div className="mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-4 h-4 rounded-full border-2" 
                                                                    style={{ 
                                                                        backgroundColor: `${getAccessibleColor('danger')}80`,
                                                                        borderColor: getAccessibleColor('danger')
                                                                    }}
                                                                ></div>
<span className="text-xs font-medium text-black">{translate("visitedPlaces")} ({locationHistory.length})</span>
</div>
                                                        </div>
                    
                                                        {/* Stats */}
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            <div className="flex justify-between text-xs text-gray-600">
                                                                <div>
                                                                <span className="font-medium">{translate("total")}: </span>
                                                                <span>{destinations.length + locationHistory.length}</span>
                                                                </div>
                                                                <div>
                                                                <span className="font-medium">{translate("visited")}: </span>
                                                                <span>{locationHistory.length}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                    
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div 
                                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
                                                style={{ borderColor: getAccessibleColor('primary') }}
                                            ></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {trips.map((trip) => {
                                                    const translatedTrip = translateTripDetails(trip, language);
                                                    return(
                                                <div
                                                    key={trip.id}
                                                    onClick={() => navigate(`/view-trip/${trip.id}`)}
                                                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer relative"
                                                >
                                                    <div className="relative h-48">
                                                        <img
                                                            src={tripImages[trip.id] || fallbackImage}
                                                            alt={trip.tripData?.trip?.destination}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = fallbackImage;
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
    <h2 className="text-white text-xl font-bold">
    {translatedTrip.tripData?.trip?.destination || translate("unnamedTrip")}    </h2>
    <p className="text-white/90">
    {translatedTrip.tripData?.trip?.duration || 
                     translate("dayCount", { count: translatedTrip.userSelection?.numDays })}
</p>
</div>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center">
                                                                    <span className="mr-1">📅</span>
                                                                    {formatDate(trip.userSelection?.startDate)}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className="mr-1">👥</span>
                                                                    {translatedTrip.userSelection?.travelers}
                                                                </div>
                                                            </div>
                    
                                                            {/* Delete button */}
                                                            {confirmDelete === trip.id ? (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="flex items-center gap-1.5"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <button
                                                                        onClick={(e) => confirmDeleteTrip(e, trip.id)}
                                                                        className={`text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors duration-200 ${
                                                                            colorMode === 'default' ? 
                                                                                'bg-red-100 text-red-600 hover:bg-red-200' : 
                                                                                ''
                                                                        }`}
                                                                        style={
                                                                            colorMode !== 'default' ? 
                                                                            {
                                                                                backgroundColor: `${getAccessibleColor('danger')}20`,
                                                                                color: getAccessibleColor('danger'),
                                                                            } : 
                                                                            {}
                                                                    }
                                                                    disabled={deleting[trip.id]}
                                                                >
                                                                    {deleting[trip.id] ? (
                                                                        <div 
                                                                            className="w-3 h-3 rounded-full border-1.5 border-t-transparent animate-spin" 
                                                                            style={{ 
                                                                                borderColor: colorMode !== 'default' ? 
                                                                                    getAccessibleColor('danger') : 
                                                                                    '#dc2626' 
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        translate("delete")
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={cancelDelete}
                                                                    className={`text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors duration-200 ${
                                                                        colorMode === 'default' ? 
                                                                            'bg-gray-100 text-gray-600 hover:bg-gray-200' : 
                                                                            ''
                                                                    }`}
                                                                    style={
                                                                        colorMode !== 'default' ? 
                                                                            {
                                                                                backgroundColor: '#f3f4f6',
                                                                                color: '#4b5563'
                                                                            } : 
                                                                            {}
                                                                    }
                                                                >
                                                                    {translate("cancel")}
                                                                </button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.button
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                onClick={(e) => openDeleteConfirmation(e, trip.id)}
                                                                className={`text-bold p-2.5 rounded-full bg-white transition-all duration-300 hover:scale-110 transform ${
                                                                    colorMode === 'default' ? 
                                                                        'text-gray-800 hover:text-red-800' : 
                                                                        ''
                                                                }`}
                                                                style={
                                                                    colorMode !== 'default' ? 
                                                                        {
                                                                            color: getAccessibleColor('danger')
                                                                        } : 
                                                                        {}
                                                                }
                                                                title={translate("deleteTrip")}
                                                            >
                                                                <IoTrashOutline className="w-5 h-5" />
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );})}
                                    </div>
                                )}
                
                                {!loading && trips.length === 0 && (
                                    <div className="text-center py-12 bg-gray-700/50 rounded-xl">
<p className="text-gray-300 text-lg mb-4">{translate("noTripsFound")}</p>
<button
                                            onClick={() => navigate('/create-trip')}
                                            className={`px-6 py-2 rounded-full text-white transition-colors ${
                                                colorMode === 'default' ? 
                                                    'bg-blue-600 hover:bg-blue-700' : 
                                                    ''
                                            }`}
                                            style={
                                                colorMode !== 'default' ? 
                                                    {
                                                        backgroundColor: getAccessibleColor('primary'),
                                                        color: 'white'
                                                    } : 
                                                    {}
                                            }
                                        >
                                            {translate("createYourFirstTrip")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                    
                }
                
                export default MyTrips;