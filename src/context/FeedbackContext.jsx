// src/context/FeedbackContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
    const [tripForFeedback, setTripForFeedback] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

const checkForFeedback = async (userEmail) => {
  console.log("🔍 Starting feedback check for:", userEmail);
  if (!userEmail) {
    console.log("❌ No user email provided");
    return;
  }

  try {
    const tripsRef = collection(db, 'AITrips');
    const now = new Date();
    console.log("📅 Current date:", now.toISOString());
    
    // Get all trips for this user
    const q = query(tripsRef, where('userEmail', '==', userEmail));
    const snapshot = await getDocs(q);
    const allTrips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("🧳 All trips found:", allTrips);
    
    // Filter completed trips (end date <= now)
    const completedTrips = allTrips.filter(trip => {
      if (!trip.userSelection?.endDate) {
        console.log(`⚠️ Trip ${trip.id} has no end date`);
        return false;
      }
      
      const endDate = new Date(trip.userSelection.endDate);
      const isCompleted = endDate <= now;
      console.log(`🗓️ Trip ${trip.id} ends on ${endDate.toISOString()}, completed: ${isCompleted}`);
      return isCompleted;
    });
    console.log("✅ Completed trips:", completedTrips);
    
    // Check which trips already have feedback
    const feedbackRef = collection(db, 'feedback');
    const feedbackQ = query(feedbackRef, where('userEmail', '==', userEmail));
    const feedbackSnapshot = await getDocs(feedbackQ);
    const feedbackTrips = new Set(
      feedbackSnapshot.docs.map(doc => doc.data().tripId)
    );
    console.log("💬 Trips with existing feedback:", Array.from(feedbackTrips));
    
    // Find first trip needing feedback
    const tripNeedingFeedback = completedTrips.find(
      trip => !feedbackTrips.has(trip.id)
    );
    console.log("🎯 Trip needing feedback:", tripNeedingFeedback);
    
    if (tripNeedingFeedback) {
      console.log("✅ Setting trip for feedback:", tripNeedingFeedback);
      setTripForFeedback(tripNeedingFeedback);
      setShowFeedbackModal(true);
      console.log("🎉 Modal should be visible now");
    } else {
      console.log("❌ No trips need feedback");
    }
  } catch (error) {
    console.error("🔥 Error checking for feedback:", error);
  }
};
      
      // Modify the check interval to run once per day instead of every hour
      useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.email) {
          checkForFeedback(user.email);
          
          // Check once per day
          const interval = setInterval(() => {
            checkForFeedback(user.email);
          }, 86400000); // 24 hours in milliseconds
          
          return () => clearInterval(interval);
        }
      }, []);
  
   return (
      <FeedbackContext.Provider 
        value={{ 
          tripForFeedback,
          setTripForFeedback, // Make sure this is exposed
          showFeedbackModal,
          setShowFeedbackModal, // Make sure this is exposed
          checkForFeedback 
        }}
      >
        {children}
      </FeedbackContext.Provider>
    );
  }

export const useFeedback = () => useContext(FeedbackContext);