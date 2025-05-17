import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import fallbackImage from '/moderate1.jpg';
import destinationsData from '@/context/destinations.json';
import { toast } from 'sonner';
import { IoTrash, IoAdd, IoCheckmark } from "react-icons/io5";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext"; // Import accessibility context

// Helper for string normalization
const normalizeString = (str) => (str || '').toLowerCase().trim();

// Process destinations data once at module level for better performance
const processedDestinations = (() => {
  console.log("Preprocessing destinations data...");
  const nameMap = new Map();
  const aliasMap = new Map();
  const nameSubstringMap = new Map();
  const aliasSubstringMap = new Map();
  
  destinationsData.countries.forEach(country => {
    const normalizedName = normalizeString(country.name);
    
    // Exact name mapping
    nameMap.set(normalizedName, country);
    
    // Name substring mapping (for key words in country names)
    const nameParts = normalizedName.split(/\s+/);
    nameParts.forEach(part => {
      if (part.length > 2) { // Ignore very short words
        if (!nameSubstringMap.has(part)) {
          nameSubstringMap.set(part, []);
        }
        nameSubstringMap.get(part).push(country);
      }
    });
    
    // Process aliases
    country.aliases.forEach(alias => {
      const normalizedAlias = normalizeString(alias);
      
      // Exact alias mapping
      aliasMap.set(normalizedAlias, country);
      
      // Alias substring mapping
      const aliasParts = normalizedAlias.split(/\s+/);
      aliasParts.forEach(part => {
        if (part.length > 2) { // Ignore very short words
          if (!aliasSubstringMap.has(part)) {
            aliasSubstringMap.set(part, []);
          }
          aliasSubstringMap.get(part).push(country);
        }
      });
    });
  });
  
  return { 
    nameMap, 
    aliasMap, 
    nameSubstringMap, 
    aliasSubstringMap,
    allCountries: destinationsData.countries
  };
})();

function SharedTrips() {
  const [trips, setTrips] = useState([]);
  const [tripImages, setTripImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [adding, setAdding] = useState(null);
  const [addedTrips, setAddedTrips] = useState(new Set()); // Track which trips have been added
  const { translate, language } = useLanguage();
  const isRTL = language === "he";
  const { colorMode } = useAccessibility(); // Get color mode from accessibility context
  
  // Function to get accessible colors - only applied when NOT in default mode
  const getAccessibleColor = (colorType) => {
    // Return standard colors if in default mode
    if (colorMode === 'default' || !colorMode) {
      return null;
    }
    
    // Define accessible color palettes for different vision modes
    const colorMap = {
      protanopia: {
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
        text: '#ffffff',
        cardBg: '#ffffff',
        cardText: '#0f172a',
        lightText: '#64748b',
        deleteButton: '#475569', // More distinguishable for protanopia
        addButton: '#93c5fd',
        addButtonDisabled: '#cbd5e1',
        newTag: '#2563eb',
        gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.3), transparent)',
      },
      deuteranopia: {
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
        text: '#ffffff',
        cardBg: '#ffffff',
        cardText: '#0f172a',
        lightText: '#64748b',
        deleteButton: '#475569',
        addButton: '#bfdbfe',
        addButtonDisabled: '#cbd5e1',
        newTag: '#1d4ed8',
        gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.3), transparent)',
      },
      tritanopia: {
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
        text: '#ffffff',
        cardBg: '#ffffff',
        cardText: '#0f172a',
        lightText: '#64748b',
        deleteButton: '#334155',
        addButton: '#a5b4fc',
        addButtonDisabled: '#cbd5e1',
        newTag: '#4f46e5',
        gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.3), transparent)',
      },
      monochromacy: {
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
        text: '#ffffff',
        cardBg: '#ffffff',
        cardText: '#000000',
        lightText: '#4b5563',
        deleteButton: '#1f2937',
        addButton: '#6b7280',
        addButtonDisabled: '#9ca3af',
        newTag: '#4b5563',
        gradient: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3), transparent)',
      },
      highContrast: {
        background: '#000000',
        text: '#ffffff',
        cardBg: '#ffffff',
        cardText: '#000000',
        lightText: '#000000',
        deleteButton: '#ff0000',
        addButton: '#00ff00',
        addButtonDisabled: '#444444',
        newTag: '#0000ff',
        gradient: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4), transparent)',
      }
    };
    
    return colorMap[colorMode]?.[colorType];
  };
  
  // Get current user with safe parsing
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  }, []);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchSharedTrips();
      checkExistingTrips(); // Check which trips user already has
    } else {
      // If not logged in, redirect to home
      navigate('/');
    }
  }, [user, navigate, language]);
  
  useEffect(() => {
    if (trips.length > 0) {
      // Force a re-render of the trips when language changes
      setTrips([...trips]);
    }
  }, [language]);

  // Optimized getDestinationImage function using preprocessed data
  const getDestinationImage = (locationQuery) => {
    if (!locationQuery) {
      return fallbackImage;
    }

    const normalizedQuery = normalizeString(locationQuery);
    let matchedCountry = null;

    // Strategy 1: Try exact name match (fastest)
    matchedCountry = processedDestinations.nameMap.get(normalizedQuery);
    if (matchedCountry) {
      return matchedCountry.imageUrl;
    }

    // Strategy 2: Try exact alias match (fast)
    matchedCountry = processedDestinations.aliasMap.get(normalizedQuery);
    if (matchedCountry) {
      return matchedCountry.imageUrl;
    }

    // Strategy 3: Try substring matches based on query parts
    const queryParts = normalizedQuery.split(/[\s,.-]+/); // Split on spaces, commas, etc.
    let bestMatchScore = 0;
    let bestMatch = null;

    for (const part of queryParts) {
      if (part.length > 2) { // Ignore short parts
        // Check if part matches countries in nameSubstringMap
        if (processedDestinations.nameSubstringMap.has(part)) {
          const candidates = processedDestinations.nameSubstringMap.get(part);
          for (const country of candidates) {
            // Give more weight to name matches
            const score = 3; 
            if (score > bestMatchScore) {
              bestMatchScore = score;
              bestMatch = country;
            }
          }
        }

        // Check if part matches countries in aliasSubstringMap
        if (processedDestinations.aliasSubstringMap.has(part)) {
          const candidates = processedDestinations.aliasSubstringMap.get(part);
          for (const country of candidates) {
            // Give less weight to alias matches
            const score = 2;
            if (score > bestMatchScore) {
              bestMatchScore = score;
              bestMatch = country;
            }
          }
        }
      }
    }

    if (bestMatch) {
      return bestMatch.imageUrl;
    }

    // Strategy 4: Try broader inclusion matches
    // Check if the query contains a country name or vice versa
    for (const [countryName, country] of processedDestinations.nameMap.entries()) {
      if (normalizedQuery.includes(countryName) || countryName.includes(normalizedQuery)) {
        return country.imageUrl;
      }
    }

    // Check if the query contains an alias or vice versa
    for (const [alias, country] of processedDestinations.aliasMap.entries()) {
      if (normalizedQuery.includes(alias) || alias.includes(normalizedQuery)) {
        return country.imageUrl;
      }
    }

    // If no match found, return fallback image
    return fallbackImage;
  };

  const checkExistingTrips = async () => {
    try {
      // Query user's existing trips to see if any were copied from shared trips
      const q = query(
        collection(db, 'AITrips'),
        where('userEmail', '==', user.email)
      );
      
      const querySnapshot = await getDocs(q);
      const existingCopiedTrips = new Set();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.copiedFrom?.originalTripId) {
          existingCopiedTrips.add(data.copiedFrom.originalTripId);
        }
      });
      
      setAddedTrips(existingCopiedTrips);
    } catch (error) {
      console.error('Error checking existing trips:', error);
    }
  };
  
  const Tooltip = ({ children, text }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        {showTooltip && (
          <div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap shadow-lg"
            style={{ zIndex: 9999 }}
          >
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  const fetchSharedTrips = async () => {
    try {
      setLoading(true);
            
      // Create a query that specifically filters by the current user's email
      const normalizedEmail = user.email.trim().toLowerCase();
      const q = query(
        collection(db, 'sharedTrips'), 
        where('sharedWith', '==', normalizedEmail)
      );
      
      const querySnapshot = await getDocs(q);

      const tripsData = [];
      const images = {};

      // Use map with Promise.all to fetch all trips in parallel
      const tripsPromises = querySnapshot.docs.map(async (sharedDoc) => {
        const sharedData = sharedDoc.data();
        const { tripId, sharedBy, sharedByName, read } = sharedData;
        
        // Mark as read when viewed
        if (!read) {
          await updateDoc(doc(db, 'sharedTrips', sharedDoc.id), {
            read: true
          });
        }
        
        const tripSnap = await getDoc(doc(db, 'AITrips', tripId));
        if (tripSnap.exists()) {
          const tripData = tripSnap.data();
          const tripWithMeta = {
            id: tripSnap.id,
            sharedId: sharedDoc.id, // Store the shared trip document ID for deletion
            sharedBy: sharedByName || sharedBy || 'Unknown user', // Use name if available
            sharedByEmail: sharedBy,
            read: read,
            sharedAt: sharedData.sharedAt,
            ...tripData
          };
          
          // Get destination image
          const destination = tripData.tripData?.trip?.destination;
          images[tripId] = getDestinationImage(destination);
          
          return tripWithMeta;
        }
        return null;
      });
      
      // Wait for all trips to be fetched
      const resolvedTrips = await Promise.all(tripsPromises);
      
      // Filter out null values (in case some trips don't exist)
      const validTrips = resolvedTrips.filter(trip => trip !== null);
      
      setTrips(validTrips);
      setTripImages(images);
    } catch (err) {
      toast.error('Failed to load shared trips.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async (e, sharedId) => {
    e.stopPropagation(); // Prevent navigating to trip details
    
    if (deleting) return; // Prevent multiple delete requests
    
    try {
      setDeleting(sharedId);
      await deleteDoc(doc(db, 'sharedTrips', sharedId));
      
      // Update local state
      setTrips(trips.filter(trip => trip.sharedId !== sharedId));
      toast.success('Trip removed from shared trips');
    } catch (error) {
      console.error('Error deleting shared trip:', error);
      toast.error('Failed to remove trip');
    } finally {
      setDeleting(null);
    }
  };

  const handleAddToMyTrips = async (e, trip) => {
    e.stopPropagation(); // Prevent navigating to trip details
    
    if (adding || addedTrips.has(trip.id)) return; // Prevent multiple add requests or re-adding
    
    try {
      setAdding(trip.id);
      
      // Create a new document ID for the user's copy of the trip
      const newTripId = Date.now().toString();
      
      // Create a copy of the trip data
      const tripCopy = {
        userSelection: trip.userSelection,
        tripData: trip.tripData,
        userEmail: user.email,
        id: newTripId,
        createdAt: new Date().toISOString(),
        // Add a reference to the original trip if needed
        copiedFrom: {
          originalTripId: trip.id,
          sharedBy: trip.sharedBy,
          sharedByEmail: trip.sharedByEmail,
          copiedAt: new Date().toISOString()
        }
      };
      
      // Save the trip to the user's collection
      await setDoc(doc(db, 'AITrips', newTripId), tripCopy);
      
      // Update the addedTrips set
      setAddedTrips(prev => new Set([...prev, trip.id]));
      
      toast.success('Trip added to your trips successfully!');
      
    } catch (error) {
      console.error('Error adding trip to my trips:', error);
      toast.error('Failed to add trip to your collection');
    } finally {
      setAdding(null);
    }
  };

  const handleCardClick = (tripId) => {
    navigate(`/view-trip/${tripId}`);
  };

  // If not logged in, show a message
  if (!user) {
    return (
      <div className="pt-[72px] p-10 min-h-screen flex justify-center items-center"
           style={{ 
             background: getAccessibleColor('background') || 'linear-gradient(to bottom, #111827, #1f2937)'
           }}>
        <div style={{ color: getAccessibleColor('text') || 'white' }} className="text-center">
          <h1 className="text-3xl font-bold mb-4">{translate("pleaseLogIn")}</h1>
          <p className="mb-6">{translate("needToBeLoggedIn")}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            style={{ 
              backgroundColor: getAccessibleColor('newTag') || '#3b82f6',
              color: 'white'
            }}
          >
            {translate("goToHome")}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin"
               style={{
                 borderColor: getAccessibleColor('text') || '#3b82f6',
                 borderTopColor: 'transparent' 
               }}></div>
          <p style={{ color: getAccessibleColor('text') || 'white' }} className="text-lg font-medium">
            {translate("loadingSharedTrips")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] p-10 min-h-screen mt-8" 
         style={{ 
           direction: isRTL ? "rtl" : "ltr",
           background: getAccessibleColor('background') || 'linear-gradient(to bottom, #111827, #1f2937)'
         }}>
      <h1 className="text-3xl font-bold mb-8"
          style={{ color: getAccessibleColor('text') || 'white' }}>
        {translate("sharedTrips")}
      </h1>
      
      {trips.length === 0 ? (
        <p style={{ color: getAccessibleColor('text') || 'white' }}>{translate("noSharedTrips")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative 
                ${!trip.read && !getAccessibleColor('cardBg') ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                backgroundColor: getAccessibleColor('cardBg') || 'white',
                border: !trip.read && getAccessibleColor('cardBg') ? `2px solid ${getAccessibleColor('newTag')}` : undefined
              }}
            >
              {!trip.read && (
                <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full z-10"
                     style={{ 
                       backgroundColor: getAccessibleColor('newTag') || '#3b82f6',
                       color: 'white'
                     }}>
                  {translate("new")}
                </div>
              )}

              <div 
                className="relative h-48 cursor-pointer"
                onClick={() => handleCardClick(trip.id)}
              >
                <img
                  src={tripImages[trip.id] || fallbackImage}
                  alt={trip.tripData?.trip?.destination}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0" 
                     style={{ background: getAccessibleColor('gradient') || 'linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3), transparent)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-xl font-bold text-white">
                    {trip.tripData?.trip?.destination || translate("unnamedTrip")}
                  </h2>
                  <p className="text-white/90 text-sm">
                    {`${trip.userSelection?.numDays} ${translate("days")}`}
                  </p>
                </div>
              </div>
              
              <div className="p-4 cursor-pointer" onClick={() => handleCardClick(trip.id)}>
                <p className="text-sm mb-1" 
                   style={{ 
                     direction: isRTL ? "rtl" : "ltr",
                     color: getAccessibleColor('cardText') || '#374151'
                   }}>
                  {translate("from")}: {formatDate(trip.userSelection?.startDate)} 
                  <span className="mx-2">{isRTL ? '←' : '→'}</span> 
                  {translate("to")}: {formatDate(trip.userSelection?.endDate)}
                </p>
                <p className="text-xs italic" 
                   style={{ 
                     direction: isRTL ? "rtl" : "ltr",
                     color: getAccessibleColor('lightText') || '#4b5563'
                   }}>
                  {translate("sharedBy")}: <span className="font-medium">{trip.sharedBy}</span>
                  <span style={{ color: getAccessibleColor('lightText') || '#6b7280' }} className="ml-1">({trip.sharedByEmail})</span>
                </p>
                {trip.sharedAt && (
                  <p className="text-xs mt-1" 
                     style={{ 
                       direction: isRTL ? "rtl" : "ltr",
                       color: getAccessibleColor('lightText') || '#6b7280'
                     }}>
                    {translate("received")} {formatDate(trip.sharedAt)}
                  </p>
                )}
              </div>
              
              {/* Action buttons - keep original functionality with ReactTooltip */}
              <div className="absolute top-3 left-3 z-10 flex gap-2">
                {/* Delete button */}
                <button
                  data-tooltip-id={`delete-tooltip-${trip.id}`}
                  data-tooltip-content={translate("removeFromShared")}
                  className="p-2 rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none"
                  style={{
                    backgroundColor: getAccessibleColor('deleteButton') || '#ef4444',
                    color: 'white',
                  }}
                  onClick={(e) => handleDelete(e, trip.sharedId)}
                  disabled={deleting === trip.sharedId}
                  aria-label={translate("removeFromShared")}
                >
                  {deleting === trip.sharedId ? (
                    <div className="w-4 h-4 border-2 rounded-full animate-spin"
                         style={{
                           borderColor: 'white',
                           borderTopColor: 'transparent'
                         }}></div>
                  ) : (
                    <IoTrash className="w-4 h-4" />
                  )}
                </button>
                
                {/* Add to My Trips button */}
                <button
                  data-tooltip-id={`add-tooltip-${trip.id}`}
                  data-tooltip-content={addedTrips.has(trip.id) ? translate("alreadyInYourTrips") : translate("addToYourTrips")}
                  className="p-2 rounded-full shadow-md transition-all transform focus:outline-none"
                  style={{
                    backgroundColor: addedTrips.has(trip.id) 
                      ? (getAccessibleColor('addButtonDisabled') || '#9ca3af')
                      : (getAccessibleColor('addButton') || '#10b981'),
                    color: 'white',
                    cursor: addedTrips.has(trip.id) ? 'not-allowed' : 'pointer',
                    transform: !addedTrips.has(trip.id) ? undefined : 'scale(1)'
                  }}
                  onClick={(e) => !addedTrips.has(trip.id) && handleAddToMyTrips(e, trip)}
                  disabled={adding === trip.id || addedTrips.has(trip.id)}
                >
                  {adding === trip.id ? (
                    <div className="w-4 h-4 border-2 rounded-full animate-spin"
                         style={{
                           borderColor: 'white',
                           borderTopColor: 'transparent'
                         }}></div>
                  ) : addedTrips.has(trip.id) ? (
                    <IoCheckmark className="w-4 h-4" />
                  ) : (
                    <IoAdd className="w-4 h-4" />
                  )}
                </button>
                
                <ReactTooltip id={`delete-tooltip-${trip.id}`} />
                <ReactTooltip id={`add-tooltip-${trip.id}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SharedTrips;