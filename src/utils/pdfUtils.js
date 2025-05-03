import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateTripPDF = (tripData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const destination = tripData.tripData?.trip?.destination || 'N/A';

  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(`${destination}'s Trip Summary`, pageWidth / 2, 20, { align: 'center' });

  let yOffset = 30;

  // Hotels Section
  const hotels = tripData.tripData?.hotels || [];
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

  // Daily Activities Section
  const itinerary = tripData.tripData?.itinerary || {};
  if (Object.keys(itinerary).length > 0) {
    doc.setFillColor(230, 255, 230);
    doc.rect(14, yOffset, pageWidth - 28, 10, 'F');
    doc.setTextColor(20, 100, 20);
    doc.setFontSize(14);
    doc.text('Daily Activities', pageWidth / 2, yOffset + 7, { align: 'center' });

    yOffset += 14;

    const days = Object.keys(itinerary).sort((a, b) => parseInt(a.replace('day', '')) - parseInt(b.replace('day', '')));

    days.forEach((dayKey, i) => {
      const day = itinerary[dayKey];
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
  }

  return doc;
};
