import React, { useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { IoMail, IoCopy, IoPaperPlane } from "react-icons/io5";
import { useAccessibility } from "@/context/AccessibilityContext";
import emailjs from '@emailjs/browser';

import { useLanguage } from "@/context/LanguageContext";


function ShareTripModal({ isOpen, onClose, tripId, tripDestination }) {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const tripLink = `${window.location.origin}/view-trip/${tripId}`;
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const { colorMode } = useAccessibility();
  const { translate, language } = useLanguage();
  const isRTL = language === "he";
  emailjs.init("fcmpY_Xi4f7Byoq62");
 


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


  // Function to generate HTML email template
  const generateEmailTemplate = (tripData) => {
    const { destination, duration, travelers, budget, highlights } = tripData;
    const hotels = tripData.hotels || [];
    const itinerary = tripData.itinerary || {};
    const tripDays = Object.keys(itinerary).sort((a, b) => 
      parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''))
    );
  
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #333; 
            padding: 20px; 
            line-height: 1.8;  /* Increased from 1.6 */
            max-width: 800px; 
            margin: auto; 
            font-size: 16px;  /* Added base font size */
          }
          .header { 
            background-color: #3b82f6; 
            color: white; 
            padding: 30px;  /* Increased from 20px */
            border-radius: 10px 10px 0 0; 
            text-align: center; 
          }
          .header h1 {
            font-size: 32px;  /* Increased header size */
            margin: 0 0 10px 0;
          }
          .header p {
            font-size: 18px;  /* Increased subtitle size */
            margin: 0;
          }
          .section { 
            margin-top: 40px;  /* Increased from 30px */
          }
          .section-title { 
            font-size: 24px;  /* Increased from 20px */
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 15px;  /* Increased from 10px */
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;  /* Increased from 10px */
          }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 12px;  /* Increased from 8px */
            text-align: left; 
            font-size: 16px;  /* Increased from 14px */
          }
          .table th { 
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .highlight-list li { 
            background-color: #fef3c7; 
            margin: 8px 0;  /* Increased from 5px */
            padding: 12px;  /* Increased from 8px */
            border-radius: 6px;
            font-size: 16px;  /* Added font size */
          }
          .footer { 
            margin-top: 50px;  /* Increased from 40px */
            font-size: 16px;  /* Increased from 14px */
            text-align: center; 
            color: #6b7280; 
          }
          ul li {
            font-size: 16px;  /* Added font size for list items */
            margin-bottom: 8px;  /* Added spacing between items */
          }
          h3 {
            font-size: 20px;  /* Added size for day headers */
            color: #1f2937;
            margin: 25px 0 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌍 Trip to ${destination || 'Amazing Destination'}</h1>
          <p>Your friend ${tripData.sharedBy || 'Someone'} has shared this trip with you!</p>
        </div>
  
        <div class="section">
          <div class="section-title">Trip Summary</div>
          <ul>
            <li><strong>Duration:</strong> ${duration || 'Multiple days'}</li>
            <li><strong>Travelers:</strong> ${travelers || 'TBD'}</li>
            <li><strong>Budget:</strong> ${budget || 'TBD'}</li>
          </ul>
        </div>
  
        <div class="section">
          <div class="section-title">Trip Highlights</div>
          <ul class="highlight-list">
            ${(highlights && highlights.length > 0)
              ? highlights.map(h => `<li>${h}</li>`).join('')
              : '<li>Exciting activities planned</li><li>Comfortable accommodations</li><li>Local cuisine experiences</li>'
            }
          </ul>
        </div>
  
        ${hotels.length > 0 ? `
          <div class="section">
            <div class="section-title">Hotel Recommendations</div>
            <table class="table">
              <thead>
                <tr><th>Name</th><th>Address</th><th>Price</th><th>Rating</th></tr>
              </thead>
              <tbody>
                ${hotels.map(hotel => `
                  <tr>
                    <td>${hotel.name || ''}</td>
                    <td>${hotel.address || ''}</td>
                    <td>${hotel.priceRange || hotel.price || 'N/A'}</td>
                    <td>${hotel.rating ? hotel.rating + ' ⭐' : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
  
        <div class="section">
          <div class="section-title">Daily Itinerary</div>
          ${tripDays.map((dayKey, idx) => {
            const activities = itinerary[dayKey] || [];
            if (!activities.length) return '';
  
            return `
              <h3>Day ${idx + 1}</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Time</th><th>Activity</th><th>Description</th><th>Duration</th><th>Travel Time</th><th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${activities.map(act => `
                    <tr>
                      <td>${act.bestTime || ''}</td>
                      <td>${act.activity || ''}</td>
                      <td>${act.description || ''}</td>
                      <td>${act.duration || ''}</td>
                      <td>${act.travelTime || ''}</td>
                      <td>${act.price || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          }).join('')}
        </div>
  
        <div class="footer">
          <p>Shared via Easy Travel Planner</p>
          <p>&copy; ${new Date().getFullYear()} Easy Travel</p>
        </div>
      </body>
      </html>
    `;
  };
  


  // Function to send email (you'll need to implement this with your preferred email service)
  const sendEmail = async (recipientEmail, subject, htmlContent) => {
    try {
      const response = await emailjs.send(
        'service_7vgs0br', // Your service ID
        'template_gm9lv89', // Your template ID from the EmailJS dashboard
        {
          to_email: recipientEmail,
          subject: subject,
          message_html: htmlContent,
          from_name: 'Easy Travel',
          from_email: user.email,
          reply_to: user.email || 'majdabdo43@gmail.com'
        }
      );
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const handleShareViaEmail = async () => {
    const normalizedSenderEmail = user.email.trim().toLowerCase();
    const normalizedRecipientEmail = email.trim().toLowerCase();
    const docId = `${tripId}_${normalizedSenderEmail.replace(/[^a-z0-9]/g, '_')}_${normalizedRecipientEmail.replace(/[^a-z0-9]/g, '_')}`;

    if (!email || !email.includes('@')) {
      toast.error(translate("shareModal.invalidEmail"));
      return;
    }

    setIsSharing(true);
    try {
      // Save to Firebase
      await setDoc(doc(db, 'sharedTrips', docId), {
        sharedWith: normalizedRecipientEmail,
        tripId,
        sharedBy: normalizedSenderEmail,
        sharedByName: user.name || user.given_name || 'A user',
        sharedAt: new Date().toISOString(),
        destination: tripDestination || 'Trip',
        read: false
      });

      toast.success(translate("shareModal.shareSuccess").replace("{0}", email));
      setEmail('');
      onClose();
    } catch (error) {
      console.error("Error sharing trip:", error);
      toast.error(translate("shareModal.shareError"));
    } finally {
      setIsSharing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error(translate("shareModal.invalidEmail"));
      return;
    }
  
    setIsSendingEmail(true);
    try {
      // Get full trip document from Firebase
      const tripDoc = await getDoc(doc(db, 'AITrips', tripId));
      if (!tripDoc.exists()) {
        throw new Error('Trip not found');
      }
  
      const fullTrip = tripDoc.data();
  
      // Build the input for the email template
      const tripData = {
        destination: fullTrip.tripData?.trip?.destination || tripDestination,
        duration: fullTrip.tripData?.trip?.duration,
        travelers: fullTrip.userSelection?.travelers,
        budget: fullTrip.userSelection?.budget,
        highlights: fullTrip.tripData?.trip?.highlights || [],
        itinerary: fullTrip.tripData?.itinerary || {},
        hotels: fullTrip.tripData?.hotels || [],
        sharedBy: user.name || user.given_name || 'Someone',
      };
  
      const emailHtml = generateEmailTemplate(tripData);
  
      // Send email
      await sendEmail(
        email,
        `${tripData.sharedBy} shared a trip to ${tripData.destination} with you!`,
        emailHtml
      );
  
      toast.success(translate("shareModal.emailSuccess"));
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(translate("shareModal.emailError"));
    } finally {
      setIsSendingEmail(false);
    }
  };
  

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tripLink)
      .then(() => {
        toast.success(translate("shareModal.copyLinkSuccess"));
      })
      .catch(() => {
        toast.error(translate("shareModal.copyLinkError"));
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 text-sm sm:text-base overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg my-auto"> {/* Changed here */}
        <div className="flex justify-between items-center mb-5 border-b pb-4" style={{ borderColor: getAccessibleColor('border') , direction: isRTL ? "rtl" : "ltr" }}>
          <h2 className="text-2xl font-semibold" style={{ color: getAccessibleColor('textDark') }}>{translate("shareModal.shareTrip")}</h2>
          <button 
            onClick={onClose}
            style={{ 
              backgroundColor: getAccessibleColor('secondaryBg'),
              color: getAccessibleColor('textMedium')
            }}
            className="p-2 rounded-full hover:opacity-80 transition-all focus:outline-none "
            aria-label={translate("shareModal.closeButton")}
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
            <div className="flex items-center justify-center gap-2"style={{ direction: isRTL ? "rtl" : "ltr" }}>
              <IoMail className="text-lg" />{translate("shareModal.emailTab")}
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
            <div className="flex items-center justify-center gap-2 "style={{ direction: isRTL ? "rtl" : "ltr" }}>
              <IoCopy className="text-lg " />{translate("shareModal.linkTab")}
            </div>
          </button>
        </div>
  
        {/* Tab Content */}
      <div className="space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto">
        {activeTab === 'email' && (
          <>
            <div className="space-y-2"style={{ direction: isRTL ? "rtl" : "ltr" }}>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              {translate("shareModal.recipientEmail")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translate("shareModal.emailPlaceholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3"style={{ direction: isRTL ? "rtl" : "ltr" }}>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail || !email}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all shadow-md text-white 
                  bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
</svg>

{translate("shareModal.sending")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <IoPaperPlane className="text-lg" />
                    {translate("shareModal.sendEmailButton")}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareViaEmail}
                disabled={isSharing || !email}
                className="w-full px-4 py-3 rounded-xl font-semibold border text-gray-600 bg-white hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                {isSharing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
</svg>

{translate("shareModal.sharing")}
                  </span>
                ) : (
                  translate("shareModal.shareAppButton")
                )}
              </button>
            </div>
          </>
        )}

        {activeTab === 'link' && (
          <div className="space-y-2"style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <label htmlFor="link" className="text-sm font-semibold text-gray-700">
            {translate("shareModal.tripLink")}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="link"
                value={tripLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
              >
                <IoCopy className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
  
          <div className="p-4 rounded-lg"style={{ direction: isRTL ? "rtl" : "ltr" , backgroundColor: getAccessibleColor('primaryBg') }}>
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" style={{ color: getAccessibleColor('primary') }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm" style={{ direction: isRTL ? "rtl" : "ltr" , color: getAccessibleColor('textMedium') }}>
              {activeTab === 'email' ? (
  <>
    <p><strong>{translate("shareModal.emailInfoTitle")}</strong> {translate("shareModal.emailInfoDesc")}</p>
    <p className="mt-2"><strong>{translate("shareModal.shareAppInfoTitle")}</strong> {translate("shareModal.shareAppInfoDesc")}</p>
  </>
) : (
  <>
    <p><strong>{translate("shareModal.linkInfoTitle")}</strong> {translate("shareModal.linkInfoDesc")}</p>
    <p className="mt-2">{translate("shareModal.linkInfoExtra")}</p>
  </>
)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareTripModal;