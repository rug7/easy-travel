import React, { useEffect, useState } from 'react';
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


function SharedTrips() {
  const [trips, setTrips] = useState([]);
  const [tripImages, setTripImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [adding, setAdding] = useState(null);
  const [addedTrips, setAddedTrips] = useState(new Set()); // Track which trips have been added
  const { translate, language } = useLanguage();
  const isRTL = language === "he";
  // Get current user with safe parsing
  const user = (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  })();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchSharedTrips();
      checkExistingTrips(); // Check which trips user already has
    } else {
      // If not logged in, redirect to home
      navigate('/');
    }
  }, [user, navigate]);

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
      // Create a query that specifically filters by the current user's email
      const normalizedEmail = user.email.trim().toLowerCase();
      const q = query(
        collection(db, 'sharedTrips'), 
        where('sharedWith', '==', normalizedEmail)
      );
      
      const querySnapshot = await getDocs(q);

      const tripsData = [];
      const images = {};

      for (const sharedDoc of querySnapshot.docs) {
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
          tripsData.push({
            id: tripSnap.id,
            sharedId: sharedDoc.id, // Store the shared trip document ID for deletion
            sharedBy: sharedByName || sharedBy || 'Unknown user', // Use name if available
            sharedByEmail: sharedBy,
            read: read,
            sharedAt: sharedData.sharedAt,
            ...tripData
          });

          const destination = tripData.tripData?.trip?.destination;
          images[tripId] = getDestinationImage(destination);
        }
      }

      setTrips(tripsData);
      setTripImages(images);
    } catch (err) {
      toast.error('Failed to load shared trips.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDestinationImage = (destination) => {
    if (!destination) return fallbackImage;
    destination = destination.toLowerCase();

    const matched = destinationsData.countries.find(c =>
      c.name.toLowerCase() === destination ||
      c.aliases.some(alias => destination.includes(alias.toLowerCase()))
    );

    return matched?.imageUrl || fallbackImage;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
      <div className="pt-[72px] p-10 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex justify-center items-center">
        <div className="text-white text-center">
          <h1 className="text-3xl font-bold mb-4">{translate("pleaseLogIn")}</h1>
          <p className="mb-6">{translate("needToBeLoggedIn")}</p>
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

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">{translate("loadingSharedTrips")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] p-10 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen mt-8" style={{ direction: isRTL ? "rtl" : "ltr" }}>
    <h1 className="text-3xl font-bold text-white mb-8">{translate("sharedTrips")}</h1>
    {trips.length === 0 ? (
      <p className="text-white">{translate("noSharedTrips")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative
                ${!trip.read ? 'ring-2 ring-blue-500' : ''}`}
            >
              {!trip.read && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-white text-xl font-bold">
                  {trip.tripData?.trip?.destination || translate("unnamedTrip")}
                  </h2>
                  <p className="text-white/90 text-sm">
                    {trip.tripData?.trip?.duration || `${trip.userSelection?.numDays} days`}
                  </p>
                </div>
              </div>
              
              <div className="p-4 cursor-pointer" onClick={() => handleCardClick(trip.id)}>
                <p className="text-sm text-gray-700 mb-1">
                {translate("from")}: {trip.userSelection?.startDate?.slice(0, 10)} → {translate("to")}: {trip.userSelection?.endDate?.slice(0, 10)}
                </p>
                <p className="text-xs text-gray-600 italic">
                {translate("sharedBy")}: <span className="font-medium">{trip.sharedBy}</span>
                <span className="text-gray-400 ml-1">({trip.sharedByEmail})</span>
                </p>
                {trip.sharedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {translate("received")} {formatDate(trip.sharedAt)}
                  </p>
                )}
              </div>
              
       {/* Action buttons */}
       <div className="absolute top-3 left-3 z-10 flex gap-2">
       {/* Delete button */}
       <button
                  data-tooltip-id={`delete-tooltip-${trip.id}`}
                  data-tooltip-content={translate("removeFromShared")}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none"
                  onClick={(e) => handleDelete(e, trip.sharedId)}
                  disabled={deleting === trip.sharedId}
                  aria-label={translate("removeFromShared")}
                >
                  {deleting === trip.sharedId ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IoTrash className="w-4 h-4" />
                  )}
                </button>
                
                {/* Add to My Trips button */}
                <button
                  data-tooltip-id={`add-tooltip-${trip.id}`}
                  data-tooltip-content={addedTrips.has(trip.id) ? translate("alreadyInYourTrips") : translate("addToYourTrips")}
                  className={`${
                    addedTrips.has(trip.id) 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white p-2 rounded-full shadow-md transition-all transform ${
                    !addedTrips.has(trip.id) ? 'hover:scale-105' : ''
                  } focus:outline-none`}
                  onClick={(e) => !addedTrips.has(trip.id) && handleAddToMyTrips(e, trip)}
                  disabled={adding === trip.id || addedTrips.has(trip.id)}
                >
                  {adding === trip.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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