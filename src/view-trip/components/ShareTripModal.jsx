import React, { useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { IoMail, IoCopy } from "react-icons/io5";

function ShareTripModal({ isOpen, onClose, tripId, tripDestination }) {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const tripLink = `\${window.location.origin}/view-trip/\${tripId}`;
  const user = JSON.parse(localStorage.getItem('user')) || {};

  if (!isOpen) return null;

  const handleShareViaEmail = async () => {
    const normalizedSenderEmail = user.email.trim().toLowerCase();
const normalizedRecipientEmail = email.trim().toLowerCase();
const docId = `${tripId}_${normalizedSenderEmail.replace(/[^a-z0-9]/g, '_')}_${normalizedRecipientEmail.replace(/[^a-z0-9]/g, '_')}`;

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSharing(true);
    try {
      // Create a document ID that combines tripId, sender email, and recipient email
      await setDoc(doc(db, 'sharedTrips', docId), {
        sharedWith: normalizedRecipientEmail, // Store normalized email
        tripId,
        sharedBy: normalizedSenderEmail, // Store normalized email
        sharedByName: user.name || user.given_name || 'A user',
        sharedAt: new Date().toISOString(),
        destination: tripDestination || 'Trip',
        read: false
      });

      toast.success(`Trip shared with ${email}`);
      setEmail('');
      onClose();
    } catch (error) {
      console.error("Error sharing trip:", error);
      toast.error("Failed to share trip. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tripLink)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link. Please try manually.");
      });
  };

  // Custom modal styling without UI component libraries
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share Trip</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Custom tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 \${activeTab === 'email' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
            onClick={() => setActiveTab('email')}
          >
            <div className="flex items-center gap-2">
              <IoMail /> Email
            </div>
          </button>
          <button
            className={`py-2 px-4 \${activeTab === 'link' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
            onClick={() => setActiveTab('link')}
          >
            <div className="flex items-center gap-2">
              <IoCopy /> Copy Link
            </div>
          </button>
        </div>

        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Recipient's Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mt-6">
              <button 
                type="button" 
                onClick={handleShareViaEmail} 
                disabled={isSharing || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isSharing ? "Sharing..." : "Share Trip"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="link" className="text-sm font-medium">
                Trip Link
              </label>
              <div className="flex items-center gap-2">
                <input 
                  id="link" 
                  value={tripLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button 
                  type="button" 
                  onClick={handleCopyLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  <IoCopy className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Anyone with this link can view your trip.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareTripModal;