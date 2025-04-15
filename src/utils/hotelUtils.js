import { chatSession } from "@/service/AIModal";
import { safeJSONParse } from "./formatUtils";

const getCountryCodeFromAI = async (country) => {
  try {
      const prompt = `Given this country name: "${country}", return ONLY the 2-letter country code (ISO 3166-1 alpha-2) in lowercase that Booking.com uses in their URLs.
      For example:
      - "Spain" -> "es"
      - "United States" -> "us"
      - "New Zealand" -> "nz"
      - "United Kingdom" -> "gb"
      
      Return ONLY the two letters, nothing else.`;

      const result = await chatSession.sendMessage([{ text: prompt }]);
      const response = await result.response.text();
      
      // Clean the response to get just the 2 letters
      const countryCode = response.trim().toLowerCase().slice(0, 2);
      
      // Validate the country code format
      if (/^[a-z]{2}$/.test(countryCode)) {
          return countryCode;
      }
      return 'com'; // Default fallback
  } catch (error) {
      console.error('Error getting country code:', error);
      return 'com'; // Default fallback
  }
};


export const generateHotels = async (destination, budget, preferences, numDays, dates) => {
    console.group('🏨 Hotel Generation');
    console.time('Hotel Generation Duration');
    
    const getBudgetRange = (budget) => {
        switch(budget.toLowerCase()) {
            case 'luxury': return '$300+ per night';
            case 'moderate': return '$150-300 per night';
            case 'budget': return 'Under $150 per night';
            default: return '$150-300 per night';
        }
    };

    const checkInDate = dates?.startDate ? new Date(dates.startDate).toISOString().split('T')[0] : '';
    const checkOutDate = dates?.endDate ? new Date(dates.endDate).toISOString().split('T')[0] : '';

    const hotelPrompt = `Generate REAL, currently operating hotels in ${destination} with these requirements:
Budget Level: ${budget} (${getBudgetRange(budget)})
Stay Duration: ${numDays} days
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Preferences: ${JSON.stringify(preferences)}

CRITICAL REQUIREMENTS:
1. ONLY use real, existing hotels that are currently operating
2. Include EXACT hotel names and addresses with country code (e.g., "Spain", "Italy")
3. Provide REAL coordinates (latitude/longitude)
4. Include ACTUAL hotel descriptions
5. List REAL amenities
6. Use REAL price ranges based on current rates
7. Hotels MUST be in ${destination} and match ${budget} budget level
8. MUST include ALL booking links:
   - The hotel's official website URL (full URL starting with https://)
   - The hotel's Booking.com identifier (e.g., "arts-barcelona" for Hotel Arts)
   - The hotel's TripAdvisor URL
   - The hotel's direct booking URL

Response MUST be valid JSON exactly like this:
{
  "hotels": [
    {
      "name": "EXACT Hotel Name",
      "address": "EXACT Street Address, City, Country",
      "priceRange": "Exact price range in USD",
      "rating": Actual hotel rating (1-5),
      "description": "Detailed real description",
      "amenities": ["List", "of", "real", "amenities"],
      "coordinates": {
        "latitude": EXACT_LATITUDE,
        "longitude": EXACT_LONGITUDE
      },
      "officialWebsite": "https://www.hotel-website.com",
      "bookingId": "hotel-booking-identifier",
      "bookingLinks": {
        "official": "https://www.hotel-website.com",
        "booking": "https://www.booking.com/hotel/country-code/hotel-name.html",
        "tripadvisor": "https://www.tripadvisor.com/Hotel_Review-...",
        "directBooking": "https://reservations.hotel-name.com"
      }
    }
  ]
}`;

    let retryCount = 0;
    const maxRetries = 4;

    while (retryCount < maxRetries) {
        try {
            console.log(`Attempting to generate hotels (attempt ${retryCount + 1})`);
            const result = await chatSession.sendMessage([{ text: hotelPrompt }]);
            const response = await result.response.text();
            const data = safeJSONParse(response);

            if (data?.hotels && Array.isArray(data.hotels) && data.hotels.length > 0) {
                console.log('Generated Hotels:', data.hotels);
                console.timeEnd('Hotel Generation Duration');
                console.groupEnd();
                return validateHotels(data.hotels, budget, destination, dates);
            }

            console.log(`⚠️ Invalid hotel data received, retrying...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error generating hotels (attempt ${retryCount + 1}):`, error);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.warn('❌ All hotel generation attempts failed, using default hotels');
    return generateDefaultHotels(budget, destination, dates);
};

const constructBookingLinks = async (hotelName, hotelData, dates) => {
  // Get country code from address (e.g., "New Zealand" -> "nz")
  

  // Format dates for Booking.com (YYYY-MM-DD)
  const formatDateForBooking = (date) => {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
  };

  const country = hotelData.address?.split(',').pop()?.trim() || '';
    // Get country code using AI
    const countryCode = await getCountryCodeFromAI(country);

  const checkIn = formatDateForBooking(dates?.startDate);
  const checkOut = formatDateForBooking(dates?.endDate);
  const bookingId = hotelData.bookingId;

  // Get city from address
  const city = hotelData.address?.split(',')[1]?.trim() || '';
  const encodedHotel = encodeURIComponent(hotelName);
  const encodedCity = encodeURIComponent(city);

  // Construct Booking.com URL
  const bookingUrl = bookingId 
      ? `https://www.booking.com/hotel/${countryCode}/${bookingId}.html${
          checkIn && checkOut ? `?checkin=${checkIn};checkout=${checkOut}` : ''
        }`
      : `https://www.booking.com/searchresults.html?ss=${encodedHotel}+${encodedCity}${
          checkIn && checkOut ? `&checkin=${checkIn}&checkout=${checkOut}` : ''
        }`;

  // Hotels.com URL
  const hotelsComUrl = `https://hotels.com/search.do?destination=${encodedCity}&q=${encodedHotel}${
      checkIn ? `&checkin=${checkIn}` : ''
  }${checkOut ? `&checkout=${checkOut}` : ''}`;

  // Agoda URL
  const agodaUrl = `https://www.agoda.com/search?city=${encodedCity}&q=${encodedHotel}${
      checkIn ? `&checkin=${checkIn}` : ''
  }${checkOut ? `&checkout=${checkOut}` : ''}`;

  // Google Maps and Images URLs
  const googleMapsUrl = `https://www.google.com/maps/search/${encodedHotel}+${encodedCity}`;
  const googleImagesUrl = `https://www.google.com/search?q=${encodedHotel}+${encodedCity}+hotel&tbm=isch`;

  return {
      booking: bookingUrl,
      hotelscom:`https://hotels.com/search.do?destination=${encodedCity}&q=${encodedHotel}${
            checkIn ? `&checkin=${checkIn}` : ''
        }${checkOut ? `&checkout=${checkOut}` : ''}`,
        agoda: `https://www.agoda.com/search?city=${encodedCity}&q=${encodedHotel}${
            checkIn ? `&checkin=${checkIn}` : ''
        }${checkOut ? `&checkout=${checkOut}` : ''}`,
        googleMaps: `https://www.google.com/maps/search/${encodedHotel}+${encodedCity}`,
        googleImages: `https://www.google.com/search?q=${encodedHotel}+${encodedCity}+hotel&tbm=isch`
  };
};

export const validateHotels = async (hotels, budget, destination, dates) => {
  if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
    return generateDefaultHotels(budget, destination, dates);
  }

  // Use Promise.all to handle multiple async operations
  const validatedHotels = await Promise.all(hotels.map(async hotel => {
    const hotelName = hotel.name || `Hotel in ${destination}`;
    
    const hotelData = {
      name: hotelName,
      address: hotel.address,
      bookingId: hotel.bookingId,
      coordinates: hotel.coordinates,
      // Include original booking links if they exist
      originalBookingLinks: hotel.bookingLinks || {}
    };

    // Generate additional booking links
    const generatedBookingLinks = await constructBookingLinks(hotelName, hotelData, dates);

    // Merge original and generated booking links, preferring original if they exist
    const bookingLinks = {
      ...generatedBookingLinks,
      official: hotel.bookingLinks?.official || hotel.officialWebsite || generatedBookingLinks.official,
      booking: hotel.bookingLinks?.booking || generatedBookingLinks.booking,
      tripadvisor: hotel.bookingLinks?.tripadvisor || generatedBookingLinks.tripadvisor,
      directBooking: hotel.bookingLinks?.directBooking || hotel.officialWebsite || ''
    };

    return {
      name: hotelName,
      address: hotel.address || `${destination} City Center`,
      priceRange: hotel.priceRange || getPriceRangeForBudget(budget),
      rating: Number(hotel.rating) || 4,
      description: hotel.description || `Quality accommodation in ${destination}`,
      amenities: Array.isArray(hotel.amenities) && hotel.amenities.length > 0 
        ? hotel.amenities 
        : ["WiFi", "Air Conditioning", "Restaurant"],
      coordinates: {
        latitude: Number(hotel.coordinates?.latitude) || 0,
        longitude: Number(hotel.coordinates?.longitude) || 0
      },
      bookingId: hotel.bookingId,
      imageSearch: `https://www.google.com/search?q=${encodeURIComponent(hotelName)}+hotel&tbm=isch`,
      officialWebsite: hotel.officialWebsite || '',
      bookingLinks
    };
  }));

  return validatedHotels;
};

export const generateDefaultHotels = async (budget, destination, dates) => {
    const priceRanges = {
        'Luxury': '$300+ per night',
        'Moderate': '$150-300 per night',
        'Budget': 'Under $150 per night'
    };

    const defaultHotel = {
        name: `${budget} Hotel in ${destination}`,
        address: `Central ${destination}, Spain`,
        priceRange: priceRanges[budget] || priceRanges['Moderate'],
        rating: 4,
        description: `Quality ${budget.toLowerCase()} accommodation in ${destination}`,
        amenities: ["WiFi", "Air Conditioning", "Restaurant", "24/7 Reception"],
        coordinates: { latitude: 0, longitude: 0 },
        bookingId: `${budget.toLowerCase()}-hotel-${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    };
    const hotelWithLinks = {
      ...defaultHotel,
      imageSearch: `https://www.google.com/search?q=${encodeURIComponent(defaultHotel.name)}&tbm=isch`,
      bookingLinks: await constructBookingLinks(defaultHotel.name, defaultHotel, dates)
  };
    return [hotelWithLinks];
};

const getPriceRangeForBudget = (budget) => {
    const ranges = {
        'Luxury': '$300+ per night',
        'Moderate': '$150-300 per night',
        'Budget': 'Under $150 per night'
    };
    return ranges[budget] || ranges['Moderate'];
};