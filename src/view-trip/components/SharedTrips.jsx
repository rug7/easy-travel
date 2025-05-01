// === 1. SharedTrips.jsx ===
import React, { useEffect, useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

function SharedTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.email) fetchSharedTrips();
  }, [user]);

  const fetchSharedTrips = async () => {
    try {
      const q = query(collection(db, 'sharedTrips'), where('sharedWith', '==', user.email));
      const querySnapshot = await getDocs(q);

      const tripIds = querySnapshot.docs.map(doc => doc.data().tripId);
      const tripPromises = tripIds.map(id => getDoc(doc(db, 'AITrips', id)));

      const tripDocs = await Promise.all(tripPromises);
      const fullTrips = tripDocs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setTrips(fullTrips);
    } catch (err) {
      toast.error('Failed to load shared trips.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-10">Loading shared trips...</div>;

  return (
    <div className="pt-[72px] p-10 text-white bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Trips Shared With You</h1>
      {trips.length === 0 ? (
        <p>No shared trips yet.</p>
      ) : (
        <ul className="space-y-4">
          {trips.map(trip => (
            <li key={trip.id} className="bg-white text-black rounded-lg p-4 shadow">
              <h2 className="text-xl font-bold">{trip.tripData?.trip?.destination || 'Unknown Destination'}</h2>
              <p className="text-sm">From: {trip.userSelection?.startDate} → To: {trip.userSelection?.endDate}</p>
              <a
                className="mt-2 inline-block text-blue-600 underline"
                href={`/view-trip/${trip.id}`}
              >
                View Trip
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SharedTrips;
