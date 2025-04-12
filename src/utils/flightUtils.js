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
  
    const formatFlight = (offer, category = 'cheapest') => {
      if (!offer) return null;
    
      try {
        const outbound = offer.itineraries[0];
        const return_ = isRoundTrip ? offer.itineraries[1] : null;
        const cabin = offer.travelerPricings[0].fareDetailsBySegment[0].cabin;
        // Get total price from the offer
        const totalPrice = parseFloat(offer.price.total);
        // Get price per person
        const pricePerPerson = totalPrice / offer.travelerPricings.length;
    
    
        const outboundSegment = formatFlightSegment(outbound.segments);
        const returnSegment = return_ ? formatFlightSegment(return_.segments) : null;
    
        return {
          airline: offer.validatingAirlineCodes[0],
          price: formatPrice(totalPrice),
          pricePerPerson: formatPrice(pricePerPerson),
          rawPrice: totalPrice, // Add raw price for sorting
          class: cabin,
          outbound: {
            ...outboundSegment,
            bookingLinks: generateBookingLinks(
              outboundSegment.departure.airport,
              outboundSegment.arrival.airport,
              outbound.segments[0].departure.at,
              return_?.segments[0].departure.at,
              cabin,
              isRoundTrip ? 'roundTrip' : 'oneWay',
              category // Pass the category directly
            )
          },
          return: returnSegment ? {
            ...returnSegment,
            bookingLinks: generateBookingLinks(
              returnSegment.departure.airport,
              returnSegment.arrival.airport,
              return_.segments[0].departure.at,
              null,
              cabin,
              'oneWay',
              category // Pass the category directly
            )
          } : null,
          totalDuration: formatDuration(
            outbound.duration + (return_ ? return_.duration : '')
          ),
          totalStops: outbound.segments.length - 1 + (return_ ? return_.segments.length - 1 : 0)
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
  