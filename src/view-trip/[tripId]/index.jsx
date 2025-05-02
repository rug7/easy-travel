import React, { useEffect, useState ,useRef } from "react";
import { db } from '@/service/firebaseConfig';
import { doc, getDoc,setDoc } from "firebase/firestore";
import { useParams,useNavigate } from "react-router-dom";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Flights from "../components/Flights";
import Activities from "../components/Activities";
import WeatherForecast from "../components/WeatherForecast";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ChevronDown } from 'lucide-react'; // Import the chevron icon (or use any other icon library)

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import { shareTripWithUser } from "@/utils/ShareTrip";
// import { useUser } from '@/context/UserContext'; // your logic to get logged-in user



function Viewtrip() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const viewRef = useRef(null); // Add this line
      const { colorMode } = useAccessibility();
      const [shareEmail, setShareEmail] = useState('');
      const user = JSON.parse(localStorage.getItem('user'));
      useEffect(() => {
        // Check if user is logged in
        if (!user) {
          navigate('/');
        }
      }, [user, navigate]);
    

    const [visibleSections, setVisibleSections] = useState({
        info: false,
        weather: false,
        flights: false,
        hotels: false,
        activities: false
    });

    const [expandedSections, setExpandedSections] = useState({
        info: true,
        flights: true,
        hotels: true,
        activities: true,
        weather: true
    });

    const SectionHeader = ({ title, isExpanded, onToggle }) => (
        <div 
            onClick={onToggle}
            className="flex items-center gap-2 mb-6 cursor-pointer group"
        >
            <ChevronDown 
                className={`w-5 h-5 text-white transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-0' : 'transform -rotate-90'
                }`}
            />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
    );

    useEffect(() => {
        if (tripId) {
            GetTripData();
        }
    }, [tripId]);

    useEffect(() => {
        if (!trip) return;
        
        setVisibleSections(prev => ({ ...prev, info: true }));
        setTimeout(() => setVisibleSections(prev => ({ ...prev, weather: true })), 400);
        setTimeout(() => setVisibleSections(prev => ({ ...prev, flights: true })), 800);
        setTimeout(() => setVisibleSections(prev => ({ ...prev, hotels: true })), 1600);
        setTimeout(() => setVisibleSections(prev => ({ ...prev, activities: true })), 2400);
    }, [trip]);

    const GetTripData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'AITrips', tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTrip(docSnap.data());
            } else {
                toast.error('No trip Found!');
            }
        } catch (error) {
            console.error("Error fetching trip:", error);
            toast.error('Error loading trip data');
        } finally {
            setLoading(false);
        }
    };
    const GetUserProfile = (tokenInfo) => {
        axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,{
          headers:{
            Authorization:`Bearer ${tokenInfo?.access_token}`,
            Accept: 'Application/json'
          }
        }).then((resp)=>{
          console.log(resp);
          localStorage.setItem('user',JSON.stringify(resp.data));
          setOpenDialog(false);
          generateTrip();
        })
      }

      // const handleShareTrip = async () => {
      //   const email = prompt("Enter the email to share this trip with:");
      //   if (!email) return;
      
      //   try {
      //     await setDoc(doc(db, 'sharedTrips', `${tripId}_${email}`), {
      //       sharedWith: email,
      //       tripId
      //     });
      
      //     toast.success(`Trip shared with ${email}`);
      //   } catch (error) {
      //     console.error("Error sharing trip:", error);
      //     toast.error("Failed to share trip.");
      //   }
      // };
    
    const getAccessibleColor = (colorType) => {
        // Map standard color names to your colorMode-specific colors
        const colorMap = {
          default: {
            primary: '#3b82f6', // blue-500
            secondary: '#8b5cf6', // purple-500
            success: '#10b981', // green-500
            danger: '#ef4444', // red-500
            warning: '#f59e0b', // amber-500
            info: '#3b82f6', // blue-500
            iconColor: '#ffffff', // White for normal mode
          },
          protanopia: {
            primary: '#2563eb', // More bluish
            secondary: '#7c3aed', // More visible purple
            success: '#059669', // Adjusted green
            danger: '#9ca3af', // Gray instead of red
            warning: '#d97706', // Darker amber
            info: '#0284c7', // Darker blue
            iconColor: '#3b82f6', // Use accessible colors for color-blind modes
          },
          deuteranopia: {
            primary: '#1d4ed8', // Deeper blue
            secondary: '#6d28d9', // Deeper purple
            success: '#0f766e', // Teal instead of green
            danger: '#b91c1c', // More visible red
            warning: '#b45309', // Darker amber
            info: '#1e40af', // Deeper blue
            iconColor: '#1d4ed8',
          },
          tritanopia: {
            primary: '#4f46e5', // Indigo
            secondary: '#7e22ce', // Darker purple
            success: '#15803d', // Darker green
            danger: '#dc2626', // Bright red
            warning: '#ca8a04', // Darker yellow
            info: '#4338ca', // Indigo
            iconColor: '#4f46e5',
    
          },
          monochromacy: {
            primary: '#4b5563', // Gray-600
            secondary: '#6b7280', // Gray-500
            success: '#374151', // Gray-700
            danger: '#1f2937', // Gray-800
            warning: '#6b7280', // Gray-500
            info: '#4b5563', // Gray-600
            iconColor: '#4f46e5',
    
          },
          highContrast: {
            primary: '#1d4ed8', // Deep blue
            secondary: '#6d28d9', // Deep purple
            success: '#047857', // Deep green
            danger: '#b91c1c', // Deep red
            warning: '#b45309', // Deep amber
            info: '#1e40af', // Deep blue
            iconColor: '#4b5563',
    
          }
        };
      
        // Use CSS variables if they exist, otherwise fall back to the hardcoded colors
        return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
      };

    const generatePrintableActivitiesHTML = () => {
        if (!trip?.tripData?.itinerary) return '<p>No itinerary data available.</p>';
      
        const days = Object.keys(trip.tripData.itinerary).sort((a, b) => {
          const dayA = parseInt(a.replace('day', ''));
          const dayB = parseInt(b.replace('day', ''));
          return dayA - dayB;
        });
      
        let html = `
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                background-color: white;
                color: #000;
                font-family: Arial, sans-serif;
                font-size: 12px;
                padding: 30px;
              }
              h1 {
                text-align: center;
                font-size: 24px;
                margin-bottom: 30px;
                color: #222;
              }
              h2 {
                margin-top: 30px;
                font-size: 18px;
                color: #333;
                border-bottom: 2px solid #eee;
                padding-bottom: 6px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                margin-bottom: 25px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                vertical-align: top;
              }
              th {
                background-color: #f7f7f7;
                font-weight: bold;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <h1>Trip Activities</h1>
        `;
      
        days.forEach(day => {
          const activities = trip.tripData.itinerary[day];
          if (!activities?.length) return;
      
          html += `
            <h2>${day.replace('day', 'Day ')}</h2>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Activity</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Travel</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
          `;
      
          activities.forEach(activity => {
            html += `
              <tr>
                <td>${activity.bestTime || ''}</td>
                <td>${activity.activity || ''}</td>
                <td>${activity.description || ''}</td>
                <td>${activity.duration || ''}</td>
                <td>${activity.travelTime || ''}</td>
                <td>${activity.price || ''}</td>
              </tr>
            `;
          });
      
          html += `
              </tbody>
            </table>
          `;
        });
      
        html += `
          </body>
          </html>
        `;
        return html;
      };
      
      
      
      
    const handlePrint = () => {
        window.print();
      };
      
    //   const handleExportPDF = async () => {
    //     if (!viewRef.current) return;
      
    //     const canvas = await html2canvas(viewRef.current, {
    //       scale: 2,
    //       useCORS: true,
    //       backgroundColor: 'white'
    //     });
      
    //     const imgData = canvas.toDataURL('image/jpeg', 1.0);
    //     const pdf = new jsPDF('p', 'mm', 'a4');
    //     const imgProps = pdf.getImageProperties(imgData);
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
    //     pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    //     pdf.save('view-trip.pdf');
    //   };
  
  
    const handleExportPDF = () => {
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
    
        // // Section: Destination
        // const destination = trip.tripData.trip?.destination || 'N/A';
        // doc.setTextColor(20, 60, 120);
        //     doc.setFontSize(14);
        //     doc.text(`Destination: ${destination}`, pageWidth / 2, yOffset + 7, { align: 'center' });
        
        // yOffset += 10;
    
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
    };
    
      
      

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Trip not found</div>
            </div>
        );
    }

    return (
        
        <div className='pt-[72px] p-10 md:px-20 lg:px-44 xl:px-56 bg-gradient-to-b from-gray-900 to-gray-800' ref={viewRef}>
                <div className="flex gap-2 mt-4 items-center">

        {visibleSections.info && (
            <div className="animate-fadeIn mb-8 mt-8">
                <SectionHeader 
                    title="Trip Information"
                    isExpanded={expandedSections.info}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        info: !prev.info
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.info ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.info && (
                        <div className="content-enter">
                            <InfoSection trip={{...trip, id: tripId}} />
                        </div>
                    )}
                </div>
                
      </div>
      
        )}
        {/* <input
        type="email"
        placeholder="Enter recipient's email"
        value={shareEmail}
        onChange={(e) => setShareEmail(e.target.value)}
        className="px-4 py-2 rounded border bg-white text-black"
      />
      <button
  onClick={handleShareTrip}
  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
>
  <span>Share</span>
</button> */}
      </div>
        
             {visibleSections.flights && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Flight Options"
                    isExpanded={expandedSections.flights}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        flights: !prev.flights
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.flights ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.flights && (
                        <div className="content-enter">
                            <Flights trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {visibleSections.hotels && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Hotel Recommendations"
                    isExpanded={expandedSections.hotels}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        hotels: !prev.hotels
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.hotels ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.hotels && (
                        <div className="content-enter">
                            <Hotels trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {visibleSections.activities && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Daily Activities"
                    isExpanded={expandedSections.activities}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        activities: !prev.activities
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.activities ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.activities && (
                        <div className="content-enter">
                            <Activities trip={trip} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {visibleSections.weather && (
            <div className="animate-fadeIn mb-8">
                <SectionHeader 
                    title="Weather Forecast"
                    isExpanded={expandedSections.weather}
                    onToggle={() => setExpandedSections(prev => ({
                        ...prev,
                        weather: !prev.weather
                    }))}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedSections.weather ? 'max-h-[2000px]' : 'max-h-0'
                }`}>
                    {expandedSections.weather && (
                        <div className="content-enter">
                            <WeatherForecast 
                                destination={trip.tripData?.trip?.destination} 
                                startDate={trip.userSelection?.startDate}
                                endDate={trip.userSelection?.endDate}
                            />
                        </div>
                    )}
                </div>
            </div>
        )}
       <div className="flex justify-end items-center gap-4 mt-6 px-10 print:hidden">
  {/* <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">🖨 Print</button> */}
  <button 
    onClick={handlePrint}
    style={{ color: getAccessibleColor('iconColor') }}
    className="hover:opacity-80 transition-all hover:scale-105"
    title="Print Dashboard"
>
    <span className="sr-only">Print Dashboard</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
    </svg>
</button>
<button 
    onClick={handleExportPDF}
    style={{ color: getAccessibleColor('iconColor') }}
    className="hover:opacity-80 transition-all hover:scale-105"
    title="Export as PDF"
>
  <span className="sr-only">Export Data</span>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
</button>
  {/* <button onClick={handleExportPDF} className="bg-green-600 text-white px-4 py-2 rounded">📄 Export PDF</button> */}
</div>


    </div>
);
}

export default Viewtrip;