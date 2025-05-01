import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

export const shareTripWithUser = async (tripId, senderEmail, recipientEmail) => {
  if (!tripId || !senderEmail || !recipientEmail) return;
  const shareId = `${recipientEmail}_${tripId}`;

  try {
    await setDoc(doc(db, 'SharedTrips', shareId), {
      tripId,
      sharedBy: senderEmail,
      sharedTo: recipientEmail,
      sharedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error sharing trip:', error);
    throw error;
  }
};