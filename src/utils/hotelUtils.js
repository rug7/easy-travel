
import { chatSession } from "@/service/AIModal";
import { safeJSONParse } from "./formatUtils";

export const generateHotels = async (destination, budget, preferences, numDays) => {
    console.group('🏨 Hotel Generation');
    console.time('Hotel Generation Duration');
    const hotelPrompt = `Generate hotel recommendations for a ${numDays}-day stay in ${destination}.
    Budget Level: ${budget}
    Preferences: ${JSON.stringify(preferences)}
  
    CRITICAL: Return ONLY valid JSON with EXACTLY 3-5 hotels matching these criteria:
    1. Match the ${budget} budget level
    2. Located near main attractions
    3. Currently operational properties
    4. Include REAL names, addresses, and prices
    5. Include ACTUAL booking links
    6. Have ACCURATE ratings and amenities
  
    Response MUST be in this EXACT format:
    {
      "hotels": [
        {
          "name": "Real Hotel Name",
          "address": "Complete Street Address",
          "priceRange": "Price range in USD",
          "rating": 4.5,
          "description": "Detailed description",
          "amenities": ["WiFi", "Pool", "Restaurant"],
          "coordinates": {
            "latitude": 35.6895,
            "longitude": 139.6917
          },
          "imageUrl": "https://...",
          "bookingLinks": {
            "booking": "https://www.booking.com/...",
            "tripadvisor": "https://www.tripadvisor.com/...",
            "googleMaps": "https://www.google.com/maps/..."
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
          return validateHotels(data.hotels, budget);
        }
  
        console.log(`⚠️ Invalid hotel data received, retrying...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      } catch (error) {
        console.error(`Error generating hotels (attempt ${retryCount + 1}):`, error);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  
    console.warn('❌ All hotel generation attempts failed, using default hotels');
    return generateDefaultHotels(budget);
  };
  
  // Helper function to generate default hotels
  export const generateDefaultHotels = (budget) => {
    const priceRanges = {
      'Luxury': '$300+ per night',
      'Moderate': '$150-300 per night',
      'Budget': 'Under $150 per night'
    };
  
    return [
      {
        name: `${budget} Hotel 1`,
        address: "City Center Location",
        priceRange: priceRanges[budget] || priceRanges['Moderate'],
        rating: 4,
        description: `Quality ${budget.toLowerCase()} accommodation in the city center`,
        amenities: ["WiFi", "Air Conditioning", "Restaurant"],
        coordinates: { latitude: 0, longitude: 0 },
        imageUrl: "",
        bookingLinks: {
          booking: "",
          tripadvisor: "",
          googleMaps: ""
        }
      },
      // Add more default hotels if needed
    ];
  };

  export const validateHotels = (hotels, budget) => {
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return generateDefaultHotels(budget);
    }
  
    return hotels.map(hotel => ({
      name: hotel.name || "Hotel name not available",
      address: hotel.address || "Address not available",
      priceRange: hotel.priceRange || getPriceRangeForBudget(budget),
      rating: hotel.rating || 0,
      description: hotel.description || "Description not available",
      amenities: hotel.amenities || ["WiFi"],
      coordinates: {
        latitude: Number(hotel.coordinates?.latitude) || 0,
        longitude: Number(hotel.coordinates?.longitude) || 0
      },
      imageUrl: hotel.imageUrl || "",
      bookingLinks: {
        booking: `https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name)}`,
        tripadvisor: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(hotel.name)}`,
        googleMaps: `https://www.google.com/maps/search/${encodeURIComponent(hotel.name)}`
      }
    }));
  };