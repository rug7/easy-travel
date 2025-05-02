import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { sendEmail } from './emailService'; // You'll need to implement this

export const generateTripPDF = async (tripId, emailAddress) => {
  // Fetch trip data
  const tripDoc = await getDoc(doc(db, 'AITrips', tripId));
  if (!tripDoc.exists()) {
    throw new Error('Trip not found');
  }
  
  const trip = tripDoc.data();
  const destination = trip.tripData.trip?.destination || 'Your Trip';
  
  // Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(`${destination} Trip Summary`, pageWidth / 2, 20, { align: 'center' });
  
  let yOffset = 30;
  
  // Add trip details, hotels, flights sections
  // This code can be adapted from the handleExportPDF function in your ViewTrip component
  
  // For example, adding hotel information
  const hotels = trip.tripData.hotels || [];
  if (hotels.length > 0) {
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
  
  // Similarly add activities and other relevant sections
  
  // Save PDF and send via email
  const pdfData = doc.output('arraybuffer');
  
  // Send email with PDF attachment
  await sendEmail({
    to: emailAddress,
    subject: `Your Trip Plan: ${destination}`,
    text: `Please find attached your trip plan for ${destination}.`,
    attachments: [
      {
        filename: `${destination.replace(/\s+/g, '-')}-trip-plan.pdf`,
        content: Buffer.from(pdfData)
      }
    ]
  });
  
  return true;
};