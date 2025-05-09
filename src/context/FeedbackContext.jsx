// src/context/FeedbackContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
    const [tripForFeedback, setTripForFeedback] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
    // const checkForFeedback = async (userEmail) => {
    //     if (!userEmail) {
    //       console.log('No user email provided');
    //       return;
    //     }
      
    //     try {
    //       const tripsRef = collection(db, 'AITrips');
    //       // Use a mock current date for testing
    //       const now = new Date('2025-05-12'); // Set this to one day after your trip's end date
    //       console.log('Mocked current time:', now.toISOString());
          
    //       // Get all trips for this user
    //       const q = query(
    //         tripsRef,
    //         where('userEmail', '==', userEmail)
    //       );
      
    //       const snapshot = await getDocs(q);
    //       const allTrips = snapshot.docs.map(doc => ({
    //         id: doc.id,
    //         ...doc.data()
    //       }));
          
    //       console.log('All trips found:', allTrips);
      
    //       // Filter trips that "ended yesterday"
    //       const tripsEndedYesterday = allTrips.filter(trip => {
    //         if (!trip.userSelection?.endDate) {
    //           console.log('Trip has no end date:', trip.id);
    //           return false;
    //         }
            
    //         const endDate = new Date(trip.userSelection.endDate);
    //         console.log('Trip end date:', endDate.toISOString());
            
    //         // For testing: Consider any trip that ends before our mock "now" date
    //         return endDate < now;
    //       });
          
    //       console.log('Trips eligible for feedback:', tripsEndedYesterday);
      
    //       // Check which trips don't have feedback yet
    //       const feedbackRef = collection(db, 'feedback');
    //       const feedbackQ = query(
    //         feedbackRef,
    //         where('userEmail', '==', userEmail)
    //       );
    //       const feedbackSnapshot = await getDocs(feedbackQ);
    //       const feedbackTrips = new Set(
    //         feedbackSnapshot.docs.map(doc => doc.data().tripId)
    //       );
          
    //       console.log('Trips with existing feedback:', Array.from(feedbackTrips));
      
    //       // Find first trip that needs feedback
    //       const tripNeedingFeedback = tripsEndedYesterday.find(
    //         trip => !feedbackTrips.has(trip.id)
    //       );
      
    //       if (tripNeedingFeedback) {
    //         console.log('Found trip needing feedback:', tripNeedingFeedback);
    //         setTripForFeedback(tripNeedingFeedback);
    //         setShowFeedbackModal(true);
    //       } else {
    //         console.log('No trips need feedback at this time');
    //       }
    //     } catch (error) {
    //       console.error('Error checking for feedback:', error);
    //     }
    //   };
  
    // // Add effect to check for feedback periodically
    // useEffect(() => {
    //   const user = JSON.parse(localStorage.getItem('user'));
    //   if (user?.email) {
    //     console.log('Checking feedback for user:', user.email);
    //     checkForFeedback(user.email);
        
    //     // Check every hour
    //     const interval = setInterval(() => {
    //       console.log('Performing periodic feedback check');
    //       checkForFeedback(user.email);
    //     }, 3600000); // 1 hour in milliseconds
        
    //     return () => {
    //       console.log('Cleaning up feedback interval');
    //       clearInterval(interval);
    //     };
    //   } else {
    //     console.log('No user logged in');
    //   }
    // }, []);

    const checkForFeedback = async (userEmail) => {
        if (!userEmail) return;
      
        try {
          const tripsRef = collection(db, 'AITrips');
          const now = new Date(); // Use current date
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
          
          const q = query(
            tripsRef,
            where('userEmail', '==', userEmail)
          );
      
          const snapshot = await getDocs(q);
          const allTrips = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
      
          // Filter trips that ended yesterday
          const tripsEndedYesterday = allTrips.filter(trip => {
            if (!trip.userSelection?.endDate) return false;
            
            const endDate = new Date(trip.userSelection.endDate);
            // Check if trip ended yesterday
            return endDate.toDateString() === yesterday.toDateString();
          });
      
          // Check for existing feedback
          const feedbackRef = collection(db, 'feedback');
          const feedbackQ = query(
            feedbackRef,
            where('userEmail', '==', userEmail)
          );
          const feedbackSnapshot = await getDocs(feedbackQ);
          const feedbackTrips = new Set(
            feedbackSnapshot.docs.map(doc => doc.data().tripId)
          );
      
          // Find first trip needing feedback
          const tripNeedingFeedback = tripsEndedYesterday.find(
            trip => !feedbackTrips.has(trip.id)
          );
      
          if (tripNeedingFeedback) {
            setTripForFeedback(tripNeedingFeedback);
            setShowFeedbackModal(true);
          }
        } catch (error) {
          console.error('Error checking for feedback:', error);
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