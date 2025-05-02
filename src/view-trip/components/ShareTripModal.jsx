import React, { useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { IoMail, IoCopy } from "react-icons/io5";
import { useAccessibility } from "@/context/AccessibilityContext";

function ShareTripModal({ isOpen, onClose, tripId, tripDestination }) {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const tripLink = `${window.location.origin}/view-trip/${tripId}`;
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const { colorMode } = useAccessibility();

  if (!isOpen) return null;

  const getAccessibleColor = (colorType) => {
    const colorMap = {
      default: {
        primary: '#3b82f6', // blue-500
        primaryHover: '#2563eb', // blue-600
        primaryBg: 'rgba(59, 130, 246, 0.1)',
        secondary: '#9ca3af', // gray-400
        secondaryBg: 'rgba(156, 163, 175, 0.1)',
        textDark: '#1f2937', // gray-800
        textMedium: '#4b5563', // gray-600
        textLight: '#9ca3af', // gray-400
        border: '#e5e7eb', // gray-200
      },
      protanopia: {
        primary: '#2563eb', // More bluish
        primaryHover: '#1d4ed8', 
        primaryBg: 'rgba(37, 99, 235, 0.1)',
        secondary: '#6b7280', // gray-500
        secondaryBg: 'rgba(107, 114, 128, 0.1)',
        textDark: '#1f2937',
        textMedium: '#4b5563',
        textLight: '#9ca3af',
        border: '#e5e7eb',
      },
      deuteranopia: {
        primary: '#1d4ed8', // Deeper blue
        primaryHover: '#1e40af',
        primaryBg: 'rgba(29, 78, 216, 0.1)',
        secondary: '#4b5563', // gray-600
        secondaryBg: 'rgba(75, 85, 99, 0.1)',
        textDark: '#1f2937',
        textMedium: '#4b5563',
        textLight: '#9ca3af',
        border: '#e5e7eb',
      },
      tritanopia: {
        primary: '#4f46e5', // Indigo
        primaryHover: '#4338ca',
        primaryBg: 'rgba(79, 70, 229, 0.1)',
        secondary: '#6b7280', // gray-500
        secondaryBg: 'rgba(107, 114, 128, 0.1)',
        textDark: '#1f2937',
        textMedium: '#4b5563',
        textLight: '#9ca3af',
        border: '#e5e7eb',
      },
      monochromacy: {
        primary: '#4b5563', // Gray-600
        primaryHover: '#374151', // Gray-700
        primaryBg: 'rgba(75, 85, 99, 0.1)',
        secondary: '#6b7280', // Gray-500
        secondaryBg: 'rgba(107, 114, 128, 0.1)',
        textDark: '#1f2937',
        textMedium: '#4b5563',
        textLight: '#9ca3af',
        border: '#e5e7eb',
      },
      highContrast: {
        primary: '#1d4ed8', // Deep blue
        primaryHover: '#1e40af',
        primaryBg: 'rgba(29, 78, 216, 0.1)',
        secondary: '#111827', // Gray-900
        secondaryBg: 'rgba(17, 24, 39, 0.1)',
        textDark: '#000000',
        textMedium: '#1f2937',
        textLight: '#4b5563',
        border: '#9ca3af',
      }
    };
    
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

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
      await setDoc(doc(db, 'sharedTrips', docId), {
        sharedWith: normalizedRecipientEmail,
        tripId,
        sharedBy: normalizedSenderEmail,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-5 border-b pb-4" style={{ borderColor: getAccessibleColor('border') }}>
          <h2 className="text-2xl font-semibold" style={{ color: getAccessibleColor('textDark') }}>Share Trip</h2>
          <button 
            onClick={onClose}
            style={{ 
              backgroundColor: getAccessibleColor('secondaryBg'),
              color: getAccessibleColor('textMedium')
            }}
            className="p-2 rounded-full hover:opacity-80 transition-all focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex mb-6 space-x-2">
          <button
            style={{
              backgroundColor: activeTab === 'email' ? getAccessibleColor('primary') : getAccessibleColor('secondaryBg'),
              color: activeTab === 'email' ? 'white' : getAccessibleColor('textMedium')
            }}
            className="flex-1 py-3 font-medium transition-colors rounded-xl hover:opacity-90"
            onClick={() => setActiveTab('email')}
          >
            <div className="flex items-center justify-center gap-2">
              <IoMail className="text-lg" /> Email
            </div>
          </button>
          <button
            style={{
              backgroundColor: activeTab === 'link' ? getAccessibleColor('primary') : getAccessibleColor('secondaryBg'),
              color: activeTab === 'link' ? 'white' : getAccessibleColor('textMedium')
            }}
            className="flex-1 py-3 font-medium transition-colors rounded-xl hover:opacity-90"
            onClick={() => setActiveTab('link')}
          >
            <div className="flex items-center justify-center gap-2">
              <IoCopy className="text-lg" /> Copy Link
            </div>
          </button>
        </div>

        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 ">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: getAccessibleColor('textDark') }}>
                Recipient's Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                style={{ 
                  borderColor: getAccessibleColor('border'),
                  color: getAccessibleColor('textDark')
                }}
              />
            </div>
            
            <div className="mt-5">
              <button 
                type="button" 
                onClick={handleShareViaEmail} 
                disabled={isSharing || !email}
                className="w-full px-4 py-3 rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm"
                style={{
                  backgroundColor: getAccessibleColor('primary'),
                  color: 'white'
                }}
              >
                {isSharing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sharing...
                  </span>
                ) : "Share Trip"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="link" className="text-sm font-medium" style={{ color: getAccessibleColor('textDark') }}>
                Trip Link
              </label>
              <div className="flex items-center gap-2">
                <input 
                  id="link" 
                  value={tripLink}
                  readOnly
                  className="flex-1 px-4 py-3 border rounded-lg bg-gray-50"
                  style={{ 
                    borderColor: getAccessibleColor('border'),
                    color: getAccessibleColor('textMedium')
                  }}
                />
                <button 
                  type="button" 
                  onClick={handleCopyLink}
                  className="px-4 py-3 rounded-lg transition-colors shadow-sm"
                  style={{
                    backgroundColor: getAccessibleColor('primary'),
                    color: 'white'
                  }}
                  aria-label="Copy link"
                >
                  <IoCopy className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <p className="text-sm mt-3" style={{ color: getAccessibleColor('textLight') }}>
              Anyone with this link can view your trip.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareTripModal;