
import { toast } from "sonner";
import axios from "axios";

// First, create a function for generating default flights
const generateDefaultFlights = (origin, destination, departureDate, returnDate, seatClass) => {
  const defaultPrice = {
    'ECONOMY': 500,
    'BUSINESS': 1500,
    'FIRST': 3000
  };

  const baseFlightOffer = {
    type: 'flight-offer',
    id: '1',
    source: 'default',
    itineraries: [
      {
        duration: 'PT8H30M',
        segments: [
          {
            departure: {
              iataCode: origin,
              terminal: '3',
              at: `${departureDate}T10:00:00`
            },
            arrival: {
              iataCode: destination,
              terminal: '1',
              at: `${departureDate}T18:30:00`
            },
            carrierCode: 'LH',
            number: '123',
            aircraft: {
              code: '320'
            },
            operating: {
              carrierCode: 'LH'
            },
            duration: 'PT8H30M'
          }
        ]
      }
    ],
    price: {
      currency: 'USD',
      total: defaultPrice[seatClass].toString(),
      base: (defaultPrice[seatClass] * 0.8).toString(),
      fees: [
        {
          amount: '50.00',
          type: 'SUPPLIER'
        },
        {
          amount: '30.00',
          type: 'TICKETING'
        }
      ]
    },
    travelerPricings: [
      {
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: defaultPrice[seatClass].toString()
        },
        fareDetailsBySegment: [
          {
            segmentId: '1',
            cabin: seatClass,
            fareBasis: 'STANDARD'
          }
        ]
      }
    ]
  };

  // For round trip, add return flight
  if (returnDate) {
    baseFlightOffer.itineraries.push({
      duration: 'PT8H30M',
      segments: [
        {
          departure: {
            iataCode: destination,
            terminal: '1',
            at: `${returnDate}T10:00:00`
          },
          arrival: {
            iataCode: origin,
            terminal: '3',
            at: `${returnDate}T18:30:00`
          },
          carrierCode: 'LH',
          number: '124',
          aircraft: {
            code: '320'
          },
          operating: {
            carrierCode: 'LH'
          },
          duration: 'PT8H30M'
        }
      ]
    });
  }

  // Generate multiple flight options with different prices and times
  return [
    baseFlightOffer,
    {
      ...baseFlightOffer,
      id: '2',
      price: {
        ...baseFlightOffer.price,
        total: (defaultPrice[seatClass] * 1.2).toString(),
        base: (defaultPrice[seatClass] * 1).toString()
      },
      itineraries: baseFlightOffer.itineraries.map(itinerary => ({
        ...itinerary,
        segments: itinerary.segments.map(segment => ({
          ...segment,
          departure: { ...segment.departure, at: segment.departure.at.replace('10:00:00', '14:00:00') },
          arrival: { ...segment.arrival, at: segment.arrival.at.replace('18:30:00', '22:30:00') }
        }))
      }))
    },
    {
      ...baseFlightOffer,
      id: '3',
      price: {
        ...baseFlightOffer.price,
        total: (defaultPrice[seatClass] * 0.9).toString(),
        base: (defaultPrice[seatClass] * 0.7).toString()
      },
      itineraries: baseFlightOffer.itineraries.map(itinerary => ({
        ...itinerary,
        segments: itinerary.segments.map(segment => ({
          ...segment,
          departure: { ...segment.departure, at: segment.departure.at.replace('10:00:00', '06:00:00') },
          arrival: { ...segment.arrival, at: segment.arrival.at.replace('18:30:00', '14:30:00') }
        }))
      }))
    }
  ];
};

// Modify the fetchFlights function
export const fetchFlights = async (origin, destination, departureDate, returnDate, tripType, seatClass) => {
  try {
    const tryFlightSearch = async (cabin) => {
      try {
        const tokenResponse = await axios.post(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: import.meta.env.VITE_AMADEUS_CLIENT_ID,
            client_secret: import.meta.env.VITE_AMADEUS_CLIENT_SECRET
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        const accessToken = tokenResponse.data.access_token;

        const searchParams = {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departureDate,
          adults: 1,
          currencyCode: 'USD',
          max: 50,
          travelClass: cabin
        };

        if (tripType === 'roundTrip' && returnDate) {
          searchParams.returnDate = returnDate;
        }

        const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: searchParams
        });

        return response.data.data;
      } catch (error) {
        console.log(`No flights found for ${cabin} class`);
        return null;
      }
    };

    // Try each cabin class in order of preference
    const cabinClassOrder = {
      'FIRST': ['FIRST', 'BUSINESS', 'ECONOMY'],
      'BUSINESS': ['BUSINESS', 'FIRST', 'ECONOMY'],
      'ECONOMY': ['ECONOMY', 'BUSINESS', 'FIRST']
    };

    const classOrder = cabinClassOrder[seatClass] || ['ECONOMY', 'BUSINESS', 'FIRST'];

    for (const cabin of classOrder) {
      const flights = await tryFlightSearch(cabin);
      if (flights && flights.length > 0) {
        if (cabin !== seatClass) {
          toast.info(`No flights found in ${seatClass} class. Showing available ${cabin} class flights instead.`);
        }
        return flights;
      }
    }

    // If no flights found, return default flights
    console.log('No actual flights found, using default flights');
    toast.info('Using estimated flight times and prices');
    return generateDefaultFlights(origin, destination, departureDate, returnDate, seatClass);

  } catch (error) {
    console.error('Error in flight search:', error);
    // Return default flights in case of any error
    console.log('Error occurred, using default flights');
    toast.info('Using estimated flight times and prices');
    return generateDefaultFlights(origin, destination, departureDate, returnDate, seatClass);
  }
};