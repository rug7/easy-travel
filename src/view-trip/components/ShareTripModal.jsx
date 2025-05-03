import React, { useState } from 'react';
import { db } from '@/service/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { IoMail, IoCopy, IoPaperPlane } from "react-icons/io5";
import { useAccessibility } from "@/context/AccessibilityContext";
import emailjs from '@emailjs/browser';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";



function ShareTripModal({ isOpen, onClose, tripId, tripDestination }) {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const tripLink = `${window.location.origin}/view-trip/${tripId}`;
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const { colorMode } = useAccessibility();
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

  const exportPDFandUpload = async (trip) => {
    if (!trip?.tripData?.itinerary) return;
        
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const destination = trip.tripData.trip?.destination || 'N/A';
    
    // Section: Trip Summary Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.setFillColor(230, 240, 255);
    doc.text(`${destination}'s Trip Summary`, pageWidth / 2, 20, { align: 'center' });
    
    let yOffset = 30;
    
    // Section: Hotel Table
    const hotels = trip.tripData.hotels || [];
    if (hotels.length > 0) {
        // Title with background
        doc.setFillColor(230, 240, 255);
        doc.rect(14, yOffset, pageWidth - 28, 10, 'F');
        doc.setTextColor(20, 60, 120);
        doc.setFontSize(14);
        doc.text('Hotel Recommendations', pageWidth / 2, yOffset + 7, { align: 'center' });
        
        yOffset += 14;
        
        const hotelRows = hotels.map(hotel => [
            hotel.name || '',
            hotel.address || '',
            hotel.priceRange || hotel.price || '',
            `${hotel.rating || 'N/A'} Stars`
        ]);
        
        autoTable(doc, {
            startY: yOffset,
            head: [['Name', 'Address', 'Price', 'Rating']],
            body: hotelRows,
            styles: { fontSize: 9, cellPadding: 3 },
            theme: 'striped',
            headStyles: { fillColor: [60, 130, 200] },
            margin: { left: 14, right: 14 },
            didDrawPage: data => yOffset = data.cursor.y + 10
        });
    }
    
    // Section: Daily Activities Header (before Day 1)
    doc.setFillColor(230, 255, 230);
    doc.rect(14, yOffset, pageWidth - 28, 10, 'F');
    doc.setTextColor(20, 100, 20);
    doc.setFontSize(14);
    doc.text('Daily Activities', pageWidth / 2, yOffset + 7, { align: 'center' });
    yOffset += 14;
    
    // Section: Activities per Day
    const days = Object.keys(trip.tripData.itinerary).sort((a, b) => 
        parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''))
    );
    
    days.forEach((dayKey, i) => {
        const day = trip.tripData.itinerary[dayKey];
        if (!day?.length) return;
        
        doc.setFontSize(13);
        doc.setTextColor(33);
        doc.text(`Day ${i + 1}`, 14, yOffset);
        
        const rows = day.map(activity => [
            activity.bestTime || '',
            activity.activity || '',
            activity.description || '',
            activity.duration || '',
            activity.travelTime || '',
            activity.price || ''
        ]);
        
        autoTable(doc, {
            startY: yOffset + 4,
            head: [['Time', 'Activity', 'Description', 'Duration', 'Travel', 'Price']],
            body: rows,
            styles: { fontSize: 9, cellPadding: 3 },
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            margin: { left: 14, right: 14 },
            didDrawPage: data => yOffset = data.cursor.y + 10
        });
    });
    
    doc.save('trip-details.pdf');
  
    const pdfBlob = doc.output("blob");
    const storage = getStorage();
    const storageRef = ref(storage, `trip_pdfs/${tripId}.pdf`);
  
    await uploadBytes(storageRef, pdfBlob);
    const downloadURL = await getDownloadURL(storageRef);
  
    return downloadURL;
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
          body { font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6; max-width: 800px; margin: auto; }
          .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
          .section { margin-top: 30px; }
          .section-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
          .table th { background-color: #f3f4f6; }
          .highlight-list li { background-color: #fef3c7; margin: 5px 0; padding: 8px; border-radius: 6px; }
          .footer { margin-top: 40px; font-size: 14px; text-align: center; color: #6b7280; }
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
  
  // Function to fetch trip data from Firebase
  const fetchTripData = async () => {
    try {
      const tripDoc = await getDoc(doc(db, 'AITrips', tripId));
      if (tripDoc.exists()) {
        const data = tripDoc.data();
        return {
          destination: data.tripData?.trip?.destination || tripDestination,
          duration: data.tripData?.trip?.duration,
          travelers: data.userSelection?.travelers,
          budget: data.userSelection?.budget,
          highlights: data.tripData?.trip?.highlights || []
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching trip data:", error);
      return null;
    }
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
          from_email: 'noreply@easytravel.com',
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
      toast.error('Please enter a valid email address');
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

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
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
  
      // Log to sharedTrips in Firestore
    //   await handleShareViaEmail();
  
      toast.success('Email sent successfully!');
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
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
            
            <div className="mt-5 space-y-3">
              <button 
                type="button" 
                onClick={handleSendEmail} 
                disabled={isSendingEmail || !email}
                className="w-full px-4 py-3 rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm"
                style={{
                  backgroundColor: getAccessibleColor('primary'),
                  color: 'white'
                }}
              >
                {isSendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Email...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <IoPaperPlane className="text-lg" />
                    Send Email with Trip Details
                  </span>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={handleShareViaEmail} 
                disabled={isSharing || !email}
                className="w-full px-4 py-3 rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm border"
                style={{
                  borderColor: getAccessibleColor('border'),
                  color: getAccessibleColor('textMedium')
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
                ) : "Just Share Link"}
              </button>
              
              <p className="text-sm text-center" style={{ color: getAccessibleColor('textLight') }}>
                Send email with full trip details or just share the link
              </p>
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