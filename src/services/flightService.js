
import { toast } from "sonner";
import axios from "axios";

export const fetchFlights = async (origin, destination, departureDate, returnDate, tripType, seatClass) => {
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
  
        return {
          data: response.data.data,
          cabinClass: cabin // Return the successful cabin class
        };
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
  
    // Get the order based on selected seat class
    const classOrder = cabinClassOrder[seatClass] || ['ECONOMY', 'BUSINESS', 'FIRST'];
  
    // Try each cabin class until flights are found
    for (const cabin of classOrder) {
      console.log(`Trying to find flights in ${cabin} class...`);
      const result = await tryFlightSearch(cabin);
      
      if (result && result.data && result.data.length > 0) {
        console.log(`Found flights in ${cabin} class`);
        // If flights found in a different class, show a toast notification
        if (cabin !== seatClass) {
          toast.info(`No flights found in ${seatClass} class. Showing available ${cabin} class flights instead.`);
        }
        return result.data;
      }
    }
  
    // If no flights found in any class
    throw new Error('No flights found in any class');
  };