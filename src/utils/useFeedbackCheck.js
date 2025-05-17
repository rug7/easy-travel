// utils/useFeedbackCheck.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

export function useFeedbackCheck(userEmail) {
  const [tripForFeedback, setTripForFeedback] = useState(null);

  useEffect(() => {
    const checkForFeedback = async () => {
      if (!userEmail) return;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const tripsRef = collection(db, 'AITrips');
      const q = query(
        tripsRef,
        where('userEmail', '==', userEmail),
        where('userSelection.endDate', '<=', yesterday.toISOString())
      );

      const snapshot = await getDocs(q);
      const completedTrips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Check which trips don't have feedback
      const feedbackRef = collection(db, 'feedback');
      const feedbackQ = query(
        feedbackRef,
        where('userEmail', '==', userEmail)
      );
      const feedbackSnapshot = await getDocs(feedbackQ);
      const feedbackTrips = new Set(
        feedbackSnapshot.docs.map(doc => doc.data().tripId)
      );

      const tripNeedingFeedback = completedTrips.find(
        trip => !feedbackTrips.has(trip.id)
      );

      if (tripNeedingFeedback) {
        setTripForFeedback(tripNeedingFeedback);
      }
    };

    checkForFeedback();
  }, [userEmail]);

  return tripForFeedback;
}