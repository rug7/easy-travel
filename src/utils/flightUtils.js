import { formatDuration, formatPrice } from './formatUtils';
import { generateBookingLinks } from './bookingUtils';
import { formatFlightSegment } from './formatUtils';



 export const processFlightOffers = (flightData, isRoundTrip = true) => {
    // Early return if no flight data
    if (!flightData || !flightData.length) {
      console.log('No flight data available to process');
      return {
        cheapest: null,
        best: null,
        quickest: null
      };
    }
  
    // Log initial data for debugging
    console.log(`Processing ${flightData.length} flights, isRoundTrip: ${isRoundTrip}`);
  
    // Filter valid flights based on round-trip or one-way
    const validFlights = flightData.filter(offer => {
      const hasValidOutbound = offer.itineraries && offer.itineraries[0];
      const hasValidReturn = isRoundTrip ? offer.itineraries && offer.itineraries[1] : true;
      const hasValidPrice = offer.price && !isNaN(parseFloat(offer.price.total));
      return hasValidOutbound && hasValidReturn && hasValidPrice;
    });
  
    console.log(`Found ${validFlights.length} valid flights`);
  
    if (validFlights.length === 0) {
      return {
        cheapest: null,
        best: null,
        quickest: null
      };
    }
  
  
    // Sort by duration
    const byDuration = [...validFlights].sort((a, b) => {
      const getTotalDuration = (offer) => {
        return offer.itineraries.reduce((total, itinerary) => {
          const duration = itinerary.duration;
          const hours = parseInt(duration.match(/(\d+)H/)?.[1] || '0');
          const minutes = parseInt(duration.match(/(\d+)M/)?.[1] || '0');
          return total + (hours * 60) + minutes;
        }, 0);
      };
      return getTotalDuration(a) - getTotalDuration(b);
    });
  
    // Calculate best option (balance of price and duration)
    const byScore = [...validFlights].sort((a, b) => {
      const getScore = (offer) => {
        const price = parseFloat(offer.price.total);
        const duration = offer.itineraries.reduce((total, itinerary) => {
          const hours = parseInt(itinerary.duration.match(/(\d+)H/)?.[1] || '0');
          const minutes = parseInt(itinerary.duration.match(/(\d+)M/)?.[1] || '0');
          return total + (hours * 60) + minutes;
        }, 0);
        return (price / 1000) + (duration / 60);
      };
      return getScore(a) - getScore(b);
    });
  
    // Modify your formatFlight function in flightUtils.js
const formatFlight = (offer, category = 'cheapest') => {
  if (!offer) return null;

  try {
    // Check if there are itineraries
    if (!offer.itineraries || offer.itineraries.length === 0) {
      console.warn('Missing itineraries in flight offer:', offer);
      return null;
    }

    const outbound = offer.itineraries[0];
    const return_ = isRoundTrip && offer.itineraries.length > 1 ? offer.itineraries[1] : null;
    
    // Check for valid price structure
    if (!offer.price || !offer.price.total || isNaN(parseFloat(offer.price.total))) {
      console.warn('Invalid price in flight offer:', offer.price);
      return null;
    }

    // Get cabin class - more defensive coding
    let cabin = 'ECONOMY';
    try {
      if (offer.travelerPricings && 
          offer.travelerPricings[0] && 
          offer.travelerPricings[0].fareDetailsBySegment && 
          offer.travelerPricings[0].fareDetailsBySegment[0]) {
        cabin = offer.travelerPricings[0].fareDetailsBySegment[0].cabin || 'ECONOMY';
      }
    } catch (e) {
      console.warn('Error getting cabin class:', e);
    }

    // Get total price and price per person with proper handling
    const totalPrice = parseFloat(offer.price.total);
    const travelerCount = Array.isArray(offer.travelerPricings) ? offer.travelerPricings.length : 1;
    const pricePerPerson = totalPrice / travelerCount;

    // Format the outbound segment with error checking
    let outboundSegment;
    try {
      outboundSegment = formatFlightSegment(outbound.segments);
    } catch (err) {
      console.error('Error formatting outbound segment:', err);
      outboundSegment = { 
        departure: { airport: 'N/A' }, 
        arrival: { airport: 'N/A' } 
      };
    }

    // Format the return segment with error checking
    let returnSegment = null;
    if (return_) {
      try {
        returnSegment = formatFlightSegment(return_.segments);
      } catch (err) {
        console.error('Error formatting return segment:', err);
      }
    }

    // Get airline code with fallback
    const airlineCode = offer.validatingAirlineCodes && 
                         offer.validatingAirlineCodes.length > 0 ? 
                         offer.validatingAirlineCodes[0] : 'Unknown';

    // Get more detailed duration calculation
    let totalDurationMinutes = 0;
    try {
      totalDurationMinutes = outbound.segments.reduce((total, segment) => {
        const durationMatch = segment.duration.match(/PT(\d+)H(\d+)M/);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1]) || 0;
          const minutes = parseInt(durationMatch[2]) || 0;
          return total + (hours * 60) + minutes;
        }
        return total;
      }, 0);
      
      if (return_) {
        totalDurationMinutes += return_.segments.reduce((total, segment) => {
          const durationMatch = segment.duration.match(/PT(\d+)H(\d+)M/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1]) || 0;
            const minutes = parseInt(durationMatch[2]) || 0;
            return total + (hours * 60) + minutes;
          }
          return total;
        }, 0);
      }
    } catch (err) {
      console.warn('Error calculating duration:', err);
    }

    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;
    const formattedDuration = `${hours}h ${minutes}m`;

    // Get the number of stops
    const totalStops = (outbound.segments ? outbound.segments.length - 1 : 0) + 
                      (return_ && return_.segments ? return_.segments.length - 1 : 0);

    // Debug the price data
    console.log(`Flight details - Airline: ${airlineCode}, Price: ${totalPrice}, Per Person: ${pricePerPerson}, Category: ${category}`);

    return {
      airline: airlineCode,
      price: formatPrice(totalPrice),
      pricePerPerson: formatPrice(pricePerPerson),
      rawPrice: totalPrice,
      class: cabin,
      outbound: outboundSegment ? {
        ...outboundSegment,
        bookingLinks: generateBookingLinks(
          outboundSegment.departure.airport,
          outboundSegment.arrival.airport,
          outbound.segments[0].departure.at,
          return_?.segments[0]?.departure.at,
          cabin,
          isRoundTrip ? 'roundTrip' : 'oneWay',
          category
        )
      } : null,
      return: returnSegment ? {
        ...returnSegment,
        bookingLinks: generateBookingLinks(
          returnSegment.departure.airport,
          returnSegment.arrival.airport,
          return_.segments[0].departure.at,
          null,
          cabin,
          'oneWay',
          category
        )
      } : null,
      totalDuration: formattedDuration,
      totalStops: totalStops
    };
  } catch (error) {
    console.error('Error formatting flight:', error);
    console.error('Problematic offer:', offer);
    return null;
  }
};
  
   // Sort by actual numeric prices
    const byPrice = [...validFlights].sort((a, b) => 
      parseFloat(a.price.total) - parseFloat(b.price.total)
    );
  
    // Format and return results
    const results = {
      cheapest: formatFlight(byPrice[0], 'cheapest'),
      best: formatFlight(byScore[0], 'best'),
      quickest: formatFlight(byDuration[0], 'quickest'),
      all: validFlights.map(offer => formatFlight(offer, 'cheapest')) // Default to cheapest for all flights
    };
  
    // Log the actual prices for verification
    console.log('Price comparison:', {
      cheapest: results.cheapest?.rawPrice,
      best: results.best?.rawPrice,
      quickest: results.quickest?.rawPrice
    });
  
    return results;
  };
  