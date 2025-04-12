import React, { useState, useEffect } from "react";
import DestinationInput from "@/components/custom/DestinationInput";
import DaysInput from "@/components/custom/DaysInput";
import SelectableOptions from "@/components/custom/SelectableOptions";
import BudgetOptions from "@/components/custom/BudgetOptions";
import PeopleInput from "@/components/custom/PeopleInput";
import { useLanguage } from "@/context/LanguageContext";
import { AI_PROMPT, getTranslatedOptions } from "@/constants/options";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModal";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";
// import { getAirportCode, isValidAirportCode } from './airportCodes';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const formatDuration = (isoDuration) => {
  // Remove 'PT' and split into hours and minutes
  const duration = isoDuration.replace('PT', '');
  const hours = duration.match(/(\d+)H/)?.[1] || '0';
  const minutes = duration.match(/(\d+)M/)?.[1] || '0';
  return `${hours}h ${minutes}m`;
};

// Add this helper function to format price
const formatPrice = (price) => {
  if (!price) return "$0.00";
  // Convert to number and round to 2 decimal places
  const numPrice = parseFloat(price);
  // Format with commas for thousands and fixed 2 decimal places
  return `$${numPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const processFlightOffers = (flightData, isRoundTrip = true) => {
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


const getAirportCodeFromAI = async (destination) => {
  // Internal helper function for parsing JSON
  const parseAIResponse = (str) => {
    try {
      // First try direct parsing
      return JSON.parse(str);
    } catch (e) {
      // If direct parsing fails, try cleaning the string
      try {
        const cleanStr = str
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
          .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
          .replace(/\s+/g, ' ')
          .replace(/[\n\r\t]/g, '')
          .trim();

        // Try to find and parse JSON object
        const match = cleanStr.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (err) {
        console.error('Failed to parse AI response:', err);
      }
    }
    return null;
  };

  try {
    const prompt = `For the destination "${destination}", provide the main airport code(s) in IATA format.
    IMPORTANT: Respond ONLY with a valid JSON object containing the airport information.
    
    Example response format for Krakow, Poland:
    {
      "city": "Krakow",
      "region": null,
      "country": "Poland",
      "airports": [
        {
          "code": "KRK",
          "name": "John Paul II International Airport Kraków-Balice",
          "main": true,
          "city": "Krakow"
        }
      ],
      "recommended": "KRK"
    }

    For regions or areas, provide the nearest major airport.
    Ensure the IATA code is correct and the airport is currently operational.`;

    const result = await chatSession.sendMessage([{ text: prompt }]);
    const response = await result.response.text();
    const data = parseAIResponse(response);

    if (!data) {
      console.error('Failed to parse AI response for airport code');
      return null;
    }

    if (!data.airports || !data.airports.length) {
      console.error('No airports found in AI response');
      return null;
    }

    // Use the recommended airport code if provided, otherwise use the first main airport or the first airport
    const airportCode = data.recommended || 
                       data.airports.find(airport => airport.main)?.code || 
                       data.airports[0].code;

    console.log('Successfully found airport code:', {
      code: airportCode,
      city: data.city,
      country: data.country
    });

    return {
      code: airportCode,
      city: data.city,
      region: data.region,
      country: data.country,
      allAirports: data.airports
    };
  } catch (error) {
    console.error('Error in getAirportCodeFromAI:', error);
    return null;
  }
};

// Validate airport code
export const isValidAirportCode = (code) => {
  return typeof code === 'string' && code.length === 3 && /^[A-Z]{3}$/.test(code);
};
const validateHotels = (hotels, budget) => {
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

const formatFlightSegment = (segments) => {
  if (!segments || !Array.isArray(segments)) {
    console.error('Invalid segments:', segments);
    return null;
  }

  try {
    return {
      departure: {
        airport: segments[0].departure.iataCode,
        time: segments[0].departure.at.split('T')[1],
        date: segments[0].departure.at.split('T')[0]
      },
      arrival: {
        airport: segments[segments.length - 1].arrival.iataCode,
        time: segments[segments.length - 1].arrival.at.split('T')[1],
        date: segments[segments.length - 1].arrival.at.split('T')[0]
      },
      duration: segments.reduce((total, seg) => total + (seg.duration || ''), ''),
      stops: segments.length - 1,
      stopLocations: segments.slice(0, -1).map(seg => ({
        airport: seg.arrival.iataCode,
        duration: seg.duration || ''
      }))
    };
  } catch (error) {
    console.error('Error in formatFlightSegment:', error);
    return null;
  }
};


const formatDate = (date) => {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Format as YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};
const safeJSONParse = (str) => {
  try {
    // First try direct parsing
    try {
      return JSON.parse(str);
    } catch (e) {
      // If direct parsing fails, try cleaning
      let cleanStr = str
        .replace(/```json/g, '')
        .replace(/```/g, '')
        // Remove all non-printable characters
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Remove all unicode quotes
        .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
        // Replace multiple spaces with single space
        .replace(/\s+/g, ' ')
        // Remove line breaks and tabs
        .replace(/[\n\r\t]/g, '')
        .trim();

      // Try to find the JSON object
      const matches = cleanStr.match(/\{(?:[^{}]|{[^{}]*})*\}/g);
      if (matches) {
        // Try each matched object
        for (const match of matches) {
          try {
            const parsed = JSON.parse(match);
            if (parsed && typeof parsed === 'object') {
              return parsed;
            }
          } catch (err) {
            continue;
          }
        }
      }

      // Try to find a JSON array
      const arrayMatch = cleanStr.match(/\[(?:[^$$$$]|$$.*?$$)*\]/g);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (err) {
          console.error('Array parsing failed:', err);
        }
      }

      // If all else fails, try to extract anything that looks like JSON
      const jsonLike = cleanStr.match(/{[\s\S]*}/);
      if (jsonLike) {
        try {
          // Additional cleaning for common issues
          const finalAttempt = jsonLike[0]
            .replace(/,\s*}/g, '}') // Remove trailing commas
            .replace(/,\s*]/g, ']')
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Ensure property names are quoted
            .replace(/:\s*'([^']*)'/g, ':"$1"') // Replace single quotes with double quotes
            .replace(/\\/g, '\\\\'); // Escape backslashes

          return JSON.parse(finalAttempt);
        } catch (err) {
          console.error('Final parsing attempt failed:', err);
        }
      }
    }
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.log("Problematic string:", str);
  }
  return null;
};

const fetchFlights = async (origin, destination, departureDate, returnDate, tripType, seatClass) => {
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

const generateDayItineraries = (numDays) => {
  const activityTemplate = {
    activity: "Activity",
    duration: "2-3 hours",
    bestTime: "",
    price: "",
    description: "",
    travelTime: "",
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    imageUrl: "",
    bookingLinks: {
      official: "",
      tripadvisor: "",
      googleMaps: ""
    }
  };

  return `"itinerary": {
    ${Array.from({ length: numDays }, (_, i) => `"day${i + 1}": []`).join(',')}
  }`;
};
const validateItinerary = async (jsonResponse, numDays, destination, getBudgetText, getPeopleText, selectedBudgets, selectedPeople, generateActivitiesForDay,setGenerationProgress,preferences  ) => {
  console.log('Starting itinerary validation...');

  // Initialize itinerary if it doesn't exist or is empty
  if (!jsonResponse.itinerary || Object.keys(jsonResponse.itinerary).length === 0) {
    jsonResponse.itinerary = {};
    for (let i = 1; i <= numDays; i++) {
      jsonResponse.itinerary[`day${i}`] = [];
    }
  }

  // Process each day sequentially
  for (let i = 1; i <= numDays; i++) {
    const dayKey = `day${i}`;
    console.log(`Processing ${dayKey}...`);

    try {
      // Generate new activities for this day
      
      console.log(`Generating activities for ${dayKey} with preferences:`, preferences);
      const activities = await generateActivitiesForDay(
        i,
        destination.value.description,
        getBudgetText(selectedBudgets[0]),
        getPeopleText(selectedPeople[0]),
        preferences
      );

      // Update the itinerary immediately for this day
      jsonResponse.itinerary[dayKey] = activities;

      // // Log the activities right after they're generated
      // console.group(`✅ Day ${i} Activities Generated:`);
      // activities.forEach((activity, index) => {
      //   const timeIcon = index === 0 ? '🌅' : index === 1 ? '☀️' : '🌙';
      //   console.group(`${timeIcon} Activity ${index + 1}:`);
      //   console.log(`📍 Name: ${activity.activity}`);
      //   console.log(`⏰ Time: ${activity.bestTime}`);
      //   console.log(`⌛ Duration: ${activity.duration}`);
      //   console.log(`💰 Price: ${activity.price}`);
      //   console.log(`📝 Description: ${activity.description}`);
      //   console.groupEnd();
      // });
      // console.groupEnd();

      // Validate each activity's required fields
      jsonResponse.itinerary[dayKey] = activities.map((activity, index) => {
        const timeOfDay = index === 0 ? 'Morning' : index === 1 ? 'Afternoon' : 'Evening';
        return {
          activity: activity.activity || `${timeOfDay} Activity`,
          duration: activity.duration || "2-3 hours",
          bestTime: activity.bestTime || (
            index === 0 ? "9:00 AM - 12:00 PM" :
            index === 1 ? "2:00 PM - 5:00 PM" :
            "7:00 PM - 10:00 PM"
          ),
          price: activity.price || "",
          description: activity.description || `${timeOfDay} exploration time`,
          travelTime: activity.travelTime || "",
          coordinates: {
            latitude: Number(activity.coordinates?.latitude) || 0,
            longitude: Number(activity.coordinates?.longitude) || 0
          },
          imageUrl: activity.imageUrl || "",
          bookingLinks: {
            official: activity.bookingLinks?.official || "",
            tripadvisor: activity.bookingLinks?.tripadvisor || "",
            googleMaps: activity.bookingLinks?.googleMaps || ""
          }
        };
      });

    } catch (error) {
      console.error(`Error generating activities for ${dayKey}:`, error);
      // Use default activities as fallback
      jsonResponse.itinerary[dayKey] = [
        {
          activity: "Morning Exploration",
          duration: "2-3 hours",
          bestTime: "9:00 AM - 12:00 PM",
          price: "",
          description: `Morning exploration in ${destination.value.description}`,
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        },
        {
          activity: "Afternoon Activity",
          duration: "2-3 hours",
          bestTime: "2:00 PM - 5:00 PM",
          price: "",
          description: `Afternoon activity in ${destination.value.description}`,
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        },
        {
          activity: "Evening Experience",
          duration: "2-3 hours",
          bestTime: "7:00 PM - 10:00 PM",
          price: "",
          description: `Evening experience in ${destination.value.description}`,
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        }
      ];

      // Log the fallback activities
      console.group(`⚠️ Day ${i} Fallback Activities:`);
      jsonResponse.itinerary[dayKey].forEach((activity, index) => {
        const timeIcon = index === 0 ? '🌅' : index === 1 ? '☀️' : '🌙';
        console.group(`${timeIcon} Activity ${index + 1}:`);
        console.log(`📍 Name: ${activity.activity}`);
        console.log(`⏰ Time: ${activity.bestTime}`);
        console.log(`⌛ Duration: ${activity.duration}`);
        console.log(`💰 Price: ${activity.price}`);
        console.log(`📝 Description: ${activity.description}`);
        console.groupEnd();
      });
      console.groupEnd();
    }

    // Update progress
    setGenerationProgress(prev => ({
      currentDay: i,
      totalDays: numDays
    }));
  }

  console.log('✅ Itinerary validation complete');
  return jsonResponse;
};

const generateBookingLinks = (dep, arr, depDate, retDate = null, cabin, tripType, sortType = 'price') => {
  const formatDateForUrl = (date) => date.split('T')[0];
  const formattedDepDate = formatDateForUrl(depDate);
  const formattedRetDate = retDate ? formatDateForUrl(retDate) : null;
  const isRoundTrip = tripType === 'roundTrip';

  // Helper function to get Momondo sort parameter
  const getMomondoSort = (sortType) => {
    switch (sortType) {
      case 'cheapest':
        return 'price_a';
      case 'best':
        return 'bestflight_a';
      case 'quickest':
        return 'duration_a';
      default:
        return 'price_a';
    }
  };

  // Helper function to get cabin class URL segment
  const getCabinClass = (cabin) => {
    const cabinUpper = cabin.toUpperCase();
    switch (cabinUpper) {
      case 'ECONOMY':
        return 'economy';
      case 'BUSINESS':
        return 'business';
      case 'FIRST':
        return 'first';
      default:
        return 'economy';
    }
  };

  const cabinClass = getCabinClass(cabin);
  const sortParam = getMomondoSort(sortType);

  // Construct URLs
  const momondoUrl = isRoundTrip
    ? `https://www.momondo.com/flight-search/${dep}-${arr}/${formattedDepDate}/${formattedRetDate}/${cabinClass}?ucs=bdg6to&sort=${sortParam}`
    : `https://www.momondo.com/flight-search/${dep}-${arr}/${formattedDepDate}/${cabinClass}?ucs=bdg6to&sort=${sortParam}`;

  const kayakUrl = isRoundTrip
    ? `https://www.kayak.com/flights/${dep}-${arr}/${formattedDepDate}/${formattedRetDate}/${cabinClass}?sort=${sortParam}`
    : `https://www.kayak.com/flights/${dep}-${arr}/${formattedDepDate}/${cabinClass}?sort=${sortParam}`;

  const googleUrl = isRoundTrip
    ? `https://www.google.com/travel/flights?q=Flights%20to%20${arr}%20from%20${dep}%20on%20${formattedDepDate}%20through%20${formattedRetDate}%20${cabinClass}`
    : `https://www.google.com/travel/flights?q=Flights%20to%20${arr}%20from%20${dep}%20on%20${formattedDepDate}%20${cabinClass}`;

  return {
    momondo: momondoUrl,
    kayak: kayakUrl,
    google: googleUrl
  };
};

const generateActivitiesForDay = async (dayNumber, destination, budget, travelers,preferences) => {
  console.group(`🔄 Generating Day ${dayNumber} Activities`);
  console.time(`Day ${dayNumber} Generation`);

  try {
    // Check if preferences exist and provide defaults if not
    const weatherPref = preferences?.weather || '';
    const activitiesPref = preferences?.activities || '';
    const sightseeingPref = preferences?.sightseeing || '';

    const activityPrompt = `Create activities for day ${dayNumber} in ${destination}.
    Trip Details:
    - Travelers: ${travelers}
    - Budget: ${budget}
    - Weather Preference: ${weatherPref}
    - Activity Types: ${activitiesPref}
    - Sightseeing Interests: ${sightseeingPref}
    
    IMPORTANT: Activities MUST match the preferences above.
    For example, if preferences include beaches and warm weather, include beach activities, water sports, etc.
    If preferences include adventure, include activities like hiking, climbing, water sports, etc.
    
    Return 3-4 activities that specifically match these preferences.
    Each activity must be realistic and available in ${destination}.
    Include actual prices, locations, and booking links.

    The response must exactly match this structure:
    [
      {
        "activity": "Morning Activity",
        "duration": "2-3 hours",
        "bestTime": "9:00 AM - 12:00 PM",
        "price": "",
        "description": "",
        "travelTime": "",
        "coordinates": {
          "latitude": 0,
          "longitude": 0
        },
        "imageUrl": "",
        "bookingLinks": {
          "official": "",
          "tripadvisor": "",
          "googleMaps": ""
        }
      },
      {
        "activity": "Afternoon Activity",
        "duration": "2-3 hours",
        "bestTime": "2:00 PM - 5:00 PM",
        "price": "",
        "description": "",
        "travelTime": "",
        "coordinates": {
          "latitude": 0,
          "longitude": 0
        },
        "imageUrl": "",
        "bookingLinks": {
          "official": "",
          "tripadvisor": "",
          "googleMaps": ""
        }
      },
      {
        "activity": "Evening Activity",
        "duration": "2-3 hours",
        "bestTime": "7:00 PM - 10:00 PM",
        "price": "",
        "description": "",
        "travelTime": "",
        "coordinates": {
          "latitude": 0,
          "longitude": 0
        },
        "imageUrl": "",
        "bookingLinks": {
          "official": "",
          "tripadvisor": "",
          "googleMaps": ""
        }
      }
    ]`;

    const result = await chatSession.sendMessage([{ text: activityPrompt }]);
    const response = await result.response.text();

    // Clean and parse the response
    const cleanResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

      let activities = JSON.parse(cleanResponse);
      console.log(`✅ Day ${dayNumber} activities parsed successfully:`, activities);


      // Log activities as soon as they're generated
      console.group(`✅ Day ${dayNumber} Activities:`);
      activities.forEach((activity, index) => {
        const timeIcon = index === 0 ? '🌅' : index === 1 ? '☀️' : '🌙';
        console.group(`${timeIcon} Activity ${index + 1}:`);
        console.log(`📍 Name: ${activity.activity}`);
        console.log(`⏰ Time: ${activity.bestTime}`);
        console.log(`⌛ Duration: ${activity.duration}`);
        console.log(`💰 Price: ${activity.price}`);
        console.log(`📝 Description: ${activity.description}`);
        console.groupEnd();
      });
      console.groupEnd();
      

    // Validate the activities array
    if (!Array.isArray(activities)) {
      throw new Error('Response is not an array');
    }

    // Ensure we have exactly 3 activities
    if (activities.length === 0) {
      console.warn(`No activities for day ${dayNumber}, adding default activity`);
      activities = [{
        activity: "Day Exploration",
        duration: "2-3 hours",
        bestTime: "9:00 AM - 12:00 PM",
        price: "",
        description: "Flexible time for exploration",
        travelTime: "",
        coordinates: { latitude: 0, longitude: 0 },
        imageUrl: "",
        bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
      }];
    } else if (activities.length > 4) {
      console.warn(`Too many activities for day ${dayNumber}, trimming to 4`);
      activities = activities.slice(0, 4);
    }

    // Validate each activity
    activities = activities.map((activity, index) => {
      let timeSlot, defaultTime;
      if (activities.length === 1) {
        timeSlot = "Full Day";
        defaultTime = "9:00 AM - 5:00 PM";
      } else if (activities.length === 2) {
        timeSlot = index === 0 ? "Morning" : "Evening";
        defaultTime = index === 0 ? "9:00 AM - 2:00 PM" : "3:00 PM - 8:00 PM";
      } else {
        timeSlot = index === 0 ? "Morning" : 
                   index === 1 ? "Afternoon" : 
                   "Evening";
        defaultTime = index === 0 ? "9:00 AM - 12:00 PM" : 
                     index === 1 ? "2:00 PM - 5:00 PM" : 
                     "7:00 PM - 10:00 PM";
      }

      // Ensure all required fields exist with valid values
      const validatedActivity = {
        activity: activity.activity || `${timeSlot} Activity`,
        duration: activity.duration || "2-3 hours",
        bestTime: activity.bestTime || defaultTime,
        price: activity.price || "",
        description: activity.description || `${timeSlot} exploration time`,
        travelTime: activity.travelTime || "",
        coordinates: {
          latitude: Number(activity.coordinates?.latitude) || 0,
          longitude: Number(activity.coordinates?.longitude) || 0
        },
        imageUrl: activity.imageUrl || "",
        bookingLinks: {
          official: activity.bookingLinks?.official || "",
          tripadvisor: activity.bookingLinks?.tripadvisor || "",
          googleMaps: activity.bookingLinks?.googleMaps || ""
        }
      };

      // Validate URL formats if provided
      if (validatedActivity.imageUrl && !validatedActivity.imageUrl.startsWith('http')) {
        validatedActivity.imageUrl = "";
      }
      
      Object.keys(validatedActivity.bookingLinks).forEach(key => {
        if (validatedActivity.bookingLinks[key] && !validatedActivity.bookingLinks[key].startsWith('http')) {
          validatedActivity.bookingLinks[key] = "";
        }
      });

      return validatedActivity;
    });

    console.timeEnd(`Day ${dayNumber} Generation`);
    console.groupEnd();
    return activities;

  } catch (error) {
    console.error(`Error generating activities for day ${dayNumber}:`, error);
    console.timeEnd(`Day ${dayNumber} Generation`);
    console.groupEnd();
    
    // Return default activities if something goes wrong
    return [
      {
        activity: "Morning Exploration",
        duration: "2-3 hours",
        bestTime: "9:00 AM - 12:00 PM",
        price: "",
        description: "Free time for morning exploration",
        travelTime: "",
        coordinates: { latitude: 0, longitude: 0 },
        imageUrl: "",
        bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
      },
      {
        activity: "Afternoon Leisure",
        duration: "2-3 hours",
        bestTime: "2:00 PM - 5:00 PM",
        price: "",
        description: "Free time for afternoon activities",
        travelTime: "",
        coordinates: { latitude: 0, longitude: 0 },
        imageUrl: "",
        bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
      },
      {
        activity: "Evening Free Time",
        duration: "2-3 hours",
        bestTime: "7:00 PM - 10:00 PM",
        price: "",
        description: "Free time for evening activities",
        travelTime: "",
        coordinates: { latitude: 0, longitude: 0 },
        imageUrl: "",
        bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
      }
    ];
  }
};

const validateResponse = (response) => {
  // Remove any non-JSON content
  const jsonStart = response.indexOf('{');
  const jsonEnd = response.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return null;
  
  const jsonString = response.substring(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Validation failed:", error);
    return null;
  }
};

const TripTypeSelector = ({ selected, onSelect, options }) => {
  return (
    <div className="flex gap-4 justify-center">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`
            px-6 py-3 rounded-full flex items-center gap-2
            transition-all duration-300 transform hover:scale-105
            ${selected === option.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'
            }
          `}
        >
          <span>{option.icon}</span>
          <span>{option.title}</span>
        </button>
      ))}
    </div>
  );
};

const SeatClassSelector = ({ selected, onSelect, options }) => {
  return (
    <div className="flex gap-4 justify-center">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`
            px-6 py-3 rounded-full flex items-center gap-2
            transition-all duration-300 transform hover:scale-105
            ${selected === option.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'
            }
          `}
        >
          <span>{option.icon}</span>
          <span>{option.title}</span>
        </button>
      ))}
    </div>
  );
};

const generateHotels = async (destination, budget, preferences, numDays) => {
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
const generateDefaultHotels = (budget) => {
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



function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [useDates, setUseDates] = useState(false);
  const [numDays, setNumDays] = useState("");
  const { translate, language } = useLanguage();
  const isRTL = language === "he";

  const [selectedWeather, setSelectedWeather] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedSightseeing, setSelectedSightseeing] = useState([]);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);

  const [openDialog,setOpenDialog]=useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    currentDay: 0,
    totalDays: 0
  });

  const [tripData, setTripData] = useState({
    destination: null,
    numberOfDays: "",
    dateRange: {
      start: null,
      end: null,
    },
    budget: "",
    travelGroup: "",
    preferences: {
      weather: [],
      activities: [],
      sightseeing: [],
    },
    flights: {
      roundTrip: {
        cheapest: null,
        best: null,
        quickest: null
      },
      oneWay: {
        cheapest: null,
        best: null,
        quickest: null
      }
    }
  });
  const [showWeatherOptions, setShowWeatherOptions] = useState(false);

  const [isAISelected, setIsAISelected] = useState(false);

  const [tripType, setTripType] = useState('roundTrip'); // 'roundTrip' or 'oneWay'
  const [seatClass, setSeatClass] = useState('ECONOMY'); // 'ECONOMY', 'BUSINESS', or 'FIRST'

  // Add options for the new selectors
  const tripTypeOptions = [
    { id: 'roundTrip', title: translate("roundTrip"), icon: '🔄' },
    { id: 'oneWay', title: translate("oneWay"), icon: '➡️' }
  ];

  const seatClassOptions = [
    { id: 'ECONOMY', title: translate("economy"), icon: '💺' },
    { id: 'BUSINESS', title: translate("business"), icon: '🛋️' },
    { id: 'FIRST', title: translate("first"), icon: '👑' }
  ];
  


  const {
    SelectTravelsList,
    SelectBudgetOptions,
    WeatherOptions,
    ActivityOptions,
    SightseeingOptions,
  } = getTranslatedOptions(translate);

  useEffect(() => {
    console.log("Current Form Data:", {
      destination: place,
      days: numDays,
      budget: selectedBudgets,
      people: selectedPeople,
      weather: selectedWeather,
      activities: selectedActivities,
      sightseeing: selectedSightseeing
    });
  }, [place, numDays, selectedBudgets, selectedPeople, selectedWeather, selectedActivities, selectedSightseeing]);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Get user profile after successful login
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${codeResponse.access_token}`,
            Accept: 'application/json'
          }
        });
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userInfo.data));
        setOpenDialog(false);
        
        // If there was a pending trip generation, execute it
        if (place) {
          generateTrip(place);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to get user information');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Google login failed');
    }
  });

  


  const generateTrip = async (destination) => {

    if (!place && !isAISelected) {
      toast.error(translate("pleaseSelectDestination"));
      return;
    }

    const user= localStorage.getItem('user');
    if(!user){
      setOpenDialog(true);
      return;
    }
    if (isAISelected && selectedWeather.length === 0) {
      toast.error(translate("pleaseSelectWeatherPreference"));
      return;
    }

    if (!numDays || selectedBudgets.length === 0 || selectedPeople.length === 0) {
      toast.error(translate("pleaseCompleteAllFields"));
      return;
    }
  
    const getBudgetText = (budgetId) => {
      const budget = SelectBudgetOptions.find(b => b.id === parseInt(budgetId));
      return budget?.title || 'Moderate';
    };
  
    const getPeopleText = (peopleId) => {
      const people = SelectTravelsList.find(p => p.id === parseInt(peopleId));
      return people?.title || 'Family';
    };
  
    const getWeatherPreferences = () => {
      return selectedWeather.map(id => 
        WeatherOptions.find(w => w.id === id)?.title
      ).join(", ");
    };
  
    const getActivityPreferences = () => {
      return selectedActivities.map(id => 
        ActivityOptions.find(a => a.id === id)?.title
      ).join(", ");
    };
  
    const getSightseeingPreferences = () => {
      return selectedSightseeing.map(id => 
        SightseeingOptions.find(s => s.id === id)?.title
      ).join(", ");
    };

  
    try {
      let finalDestination = destination;
  
      // If no destination is selected but preferences are set, get an AI suggestion
      if (isAISelected) {
        const suggestionPrompt = `As a travel expert, suggest a perfect destination based on the following preferences:
        Trip Duration: ${numDays} days
        Travel Group: ${getPeopleText(selectedPeople[0])}
        Budget Level: ${getBudgetText(selectedBudgets[0])}
        
        Preferences:
        - Weather: ${getWeatherPreferences()}
        - Desired Activities: ${getActivityPreferences()}
        - Preferred Sightseeing: ${getSightseeingPreferences()}
  
        Respond ONLY with a JSON object in this exact format:
        {
          "destination": "Name of the city",
          "country": "Country name",
          "reasoning": "Brief explanation why this matches the preferences"
        }`;
  
      const suggestionResult = await chatSession.sendMessage([{ text: suggestionPrompt }]);
      const suggestionResponse = await suggestionResult.response.text();
      const suggestionData = safeJSONParse(suggestionResponse);
  
      if (!suggestionData) {
        throw new Error('Failed to parse destination suggestion');
      }
  
      finalDestination = {
        value: {
          description: `${suggestionData.destination}, ${suggestionData.country}`,
          reasoning: suggestionData.reasoning
        }
      };
  
      toast.success(`Suggested destination: ${suggestionData.destination}, ${suggestionData.country}`);
    } else if (!destination) {
      toast.error(translate("pleaseSelectDestination"));
      return;
    } else {
      finalDestination = {
        value: {
          description: destination.value.description,
        }
      };
    }
  
    // Ensure finalDestination is properly formatted before continuing
    if (!finalDestination?.value?.description) {
      throw new Error('Invalid destination format');
    }

    const preferences = {
      weather: getWeatherPreferences(),
      activities: getActivityPreferences(),
      sightseeing: getSightseeingPreferences()
    };
    
    // Get budget and travelers
    const budget = getBudgetText(selectedBudgets[0]);
    const travelers = getPeopleText(selectedPeople[0]);

    
  
      // Generate the trip itinerary
      const basePrompt = `Create a detailed travel itinerary for ${finalDestination.value.description} for ${numDays} days.
Trip Details:
- Travelers: ${travelers}
- Budget: ${budget}
- Weather Preference: ${preferences.weather}
- Desired Activities: ${preferences.activities}
- Sightseeing Interests: ${preferences.sightseeing}

The activities MUST:
- Match ALL specified preferences
- Be available during the selected season
- Include accurate pricing and timing
- Have valid booking links
- Be geographically accurate for ${finalDestination.value.description}

    CRITICAL INSTRUCTIONS:
    1. Response MUST be ONLY valid JSON
    2. NO markdown, NO text outside JSON
    3. NO explanations or comments
    4. Property names MUST be in double quotes
    5. String values MUST be in double quotes
    6. NO trailing commas
    7. NO single quotes
    
  {
    "trip": {
      "destination": "${finalDestination.value.description}",
      "duration": "${numDays} days",
      "travelers": "${travelers}",
      "budget": "${budget}",
      "currency": "USD"
    },
     ${generateDayItineraries(parseInt(numDays))}
  }`;
  
  const guidelines = `
  
  Guidelines:
  - Each day's activities should follow this structure:
  {
    "activity": "Name of activity",
    "duration": "2-3 hours",
    "bestTime": "Time slot (e.g., 9:00 AM - 12:00 PM)",
    "price": "Price in USD",
    "description": "Detailed description",
    "travelTime": "Travel time from previous location",
    "coordinates": {"latitude": 0, "longitude": 0},
    "imageUrl": "URL to activity image",
    "bookingLinks": {
      "official": "Official website URL",
      "tripadvisor": "TripAdvisor URL",
      "googleMaps": "Google Maps URL"
    }
  }
  - Each day MUST have at least 1 activity (preferably 3) with complete details including activity name, duration, best time, price, description, travel time, coordinates, image URL, and booking links.
  - Activities should be properly spaced throughout the day.
  - All activities must have real, accessible URLs for images and booking.
  - Include specific pricing and timing for each activity.
  - Consider travel time between locations.
  - Ensure activities match the selected budget level.
  - Activities should be varied and not repetitive across days.
  
  Remember to provide a complete itinerary for all ${numDays} days with at least 1 activity per day and at least 3 hotel suggestions.`;
  
  const fullPrompt = basePrompt + guidelines;

setIsGenerating(true);
console.log('Starting trip generation...');
console.log('Generating hotels...');

const hotels = await generateHotels(
  finalDestination.value.description,
  getBudgetText(selectedBudgets[0]),
  preferences,
  parseInt(numDays)
);

// Initialize base structure with your original prompt structure
let jsonResponse = {
  trip: {
    destination: finalDestination.value.description,
    duration: `${numDays} days`,
    travelers: getPeopleText(selectedPeople[0]),
    budget: getBudgetText(selectedBudgets[0]),
    currency: "USD"
  },
  flights: {
    outbound: [],
    return: []
  },
  hotels: hotels,
  itinerary: {}
};


try {

  const destinationInput = finalDestination.value.description;
  console.log('Searching flights for:', destinationInput);
  
  // Get airport code from AI
  const airportInfo = await getAirportCodeFromAI(destinationInput);
  
  if (!airportInfo || !airportInfo.code) {
    console.warn(`No airport code found for ${destinationInput}, skipping flight search`);
    jsonResponse.flights = {
      outbound: [],
      return: []
    };
    return;
  }

  console.log('Airport Information:', {
    code: airportInfo.code,
    city: airportInfo.city,
    country: airportInfo.country
  });

  let flightData = null;
  try {
    // Use the selected dates if available, otherwise calculate from tomorrow
    let departureDate, returnDate;
      
    if (useDates && startDate && endDate) {
      // Use selected dates if date picker is active
      departureDate = new Date(startDate);
      returnDate = new Date(endDate);
    } else {
      // Calculate dates based on numDays if using number input
      departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + 1); // Start from tomorrow
      
      returnDate = new Date(departureDate);
      returnDate.setDate(returnDate.getDate() + parseInt(numDays) - 1); // -1 because we count the start day
    }

    // Ensure dates are properly formatted
    const formattedDepartureDate = formatDate(departureDate);
    const formattedReturnDate = formatDate(returnDate);

    console.log('Flight Search Dates:', {
      departure: formattedDepartureDate,
      return: formattedReturnDate
    });

    flightData = await fetchFlights(
      'TLV',
      airportInfo.code,
      formattedDepartureDate,
      formattedReturnDate,
      tripType,
      seatClass
    );
  } catch (flightError) {
    console.warn('Flight search failed:', flightError);
    // Continue with empty flights array rather than throwing
    jsonResponse.flights = {
      outbound: [],
      return: []
    };
    return;
  }

  if (flightData && flightData.length > 0) {
    console.log(`Found ${flightData.length} total flights`);
    const processedFlights = processFlightOffers(
      flightData,
      tripType === 'roundTrip'
    );

    jsonResponse.flights = {
      type: tripType,
      class: seatClass,
      options: processedFlights
    };

    console.log('✅✅ Processed flights:', jsonResponse.flights);
  } else {
    console.log('No flights found in any class');
    jsonResponse.flights = {
      type: tripType,
      class: seatClass,
      options: {
        cheapest: null,
        best: null,
        quickest: null,
        all: []
      }
    };
  }

} catch (flightError) {
  console.warn('Flight search failed:', flightError);
  jsonResponse.flights = {
    type: tripType,
    class: seatClass,
    options: {
      cheapest: null,
      best: null,
      quickest: null,
      all: []
    }
  };
}

// Initialize empty itinerary structure
for (let i = 1; i <= parseInt(numDays); i++) {
  jsonResponse.itinerary[`day${i}`] = [];
}
    console.log(fullPrompt);
  // First, get hotels using the original prompt structure
  const result = await chatSession.sendMessage([{ text: fullPrompt }]);
  const response = await result.response.text();
  const initialResponse = safeJSONParse(response);

  if (initialResponse?.hotels) {
    jsonResponse.hotels = validateHotels(initialResponse.hotels, getBudgetText(selectedBudgets[0]));

  }

  // Now generate activities day by day
  console.log('Generating daily activities...');
  setGenerationProgress({ currentDay: 0, totalDays: parseInt(numDays) });


      console.log('Initial response:', jsonResponse); // Add this to see what we're getting

      if (!jsonResponse) {
        // If parsing failed, try to clean and retry
        console.log("Initial parsing failed, attempting to clean response");
          jsonResponse = validateResponse(response);
          console.log('Cleaned response:', jsonResponse); // Add this to see cleaned response
        }

        
        // Initialize structure if missing
    if (!jsonResponse || !jsonResponse.trip || !jsonResponse.hotels || !jsonResponse.itinerary) {
      console.log('Creating base structure');
      jsonResponse = {
        trip: {
          destination: finalDestination.value.description,
          duration: `${numDays} days`,
          travelers: getPeopleText(selectedPeople[0]),
          budget: getBudgetText(selectedBudgets[0]),
          currency: "USD"
        },
        hotels: [],
        itinerary: {}
      };
    }
      

      if (!jsonResponse.itinerary) {
        jsonResponse.itinerary = {};
      }
      
      // Validate the response
      jsonResponse = await validateItinerary(
        jsonResponse, 
        numDays,
        finalDestination,
        getBudgetText,
        getPeopleText,
        selectedBudgets,
        selectedPeople,
        generateActivitiesForDay,
        setGenerationProgress,
        preferences 
      );
  
      setTripData(jsonResponse);
      console.log(jsonResponse);
      toast.success(translate("tripGeneratedSuccess"));
  
    } catch (error) {
      console.warn('Could not fetch flight data, falling back to AI suggestions:', error);
      console.error('Error generating trip:', error);
      toast.error(translate("errorGeneratingTrip"));
    }
    finally {
      setIsGenerating(false);
    }
  };

  const handleHelpMeDecide = () => {
    setIsAISelected(!isAISelected);
    setShowWeatherOptions(!showWeatherOptions); // Toggle weather options only
    if (place) {
      setPlace(null); // Clear destination if Help Me Decide is selected
    }
  };

  const handleSelect = (id, category) => {
    switch (category) {
      case "weather":
        setSelectedWeather((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
        break;
      case "activities":
        setSelectedActivities((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
        break;
      case "sightseeing":
        setSelectedSightseeing((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
        break;
      case "budget":
      // Single selection for budget
        setSelectedBudgets((prev) => 
          prev.includes(id) ? [] : [id]
        );
        break;
      case "people":
      // Single selection for people
        setSelectedPeople((prev) => 
          prev.includes(id) ? [] : [id]
        );
        break;
      default:
        break;
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

  const SaveAiTrip=(tripData)

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-20 px-5 mt-20">
      <h2
        className="font-bold text-4xl text-white text-center mb-6"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {translate("createTripTitle")}
      </h2>
      <p
        className="text-gray-300 text-xl text-center mb-10"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {translate("createTripDescription")}
      </p>

      <div
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6 flex flex-col gap-9"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* Destination Section */}
        <DestinationInput
      place={place}
      setPlace={setPlace}
      translate={translate}
      onToggle={handleHelpMeDecide}
      onInputClick={() => {
        setIsAISelected(false);
        setShowWeatherOptions(false);
      }}
      isAISelected={isAISelected}
    />
                {/* Number of Days */}

        <DaysInput
          translate={translate}
          useDates={useDates}
          setUseDates={setUseDates}
          numDays={numDays}
          setNumDays={setNumDays}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {/* class */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {translate("flightPreferences")}
        </h3>
        <div className="space-y-4">
          <TripTypeSelector
            selected={tripType}
            onSelect={setTripType}
            options={tripTypeOptions}
          />
          <SeatClassSelector
            selected={seatClass}
            onSelect={setSeatClass}
            options={seatClassOptions}
          />
        </div>
      </div>

        {/* Additional Questions */}
        <div className="space-y-10">
          {/* Weather Options - Only show when Help Me Decide is active */}
        {showWeatherOptions && (
          <SelectableOptions
            title={translate("weatherPreference")}
            options={WeatherOptions}
            selectedOptions={selectedWeather}
            onSelect={(id) => handleSelect(id, "weather")}
          />
        )}
          <SelectableOptions
            title={translate("activitiesPreference")}
            options={ActivityOptions}
            selectedOptions={selectedActivities}
            onSelect={(id) => handleSelect(id, "activities")}
            gridCols="grid-cols-2 md:grid-cols-4"
          />
          <SelectableOptions
            title={translate("sightseeingPreference")}
            options={SightseeingOptions}
            selectedOptions={selectedSightseeing}
            onSelect={(id) => handleSelect(id, "sightseeing")}
            gridCols="grid-cols-2 md:grid-cols-4"
          />
        </div>

        

        {/* Budget */}
        <BudgetOptions
        title={translate("budgetTitle")}
        options={SelectBudgetOptions}
        selectedOptions={selectedBudgets}
        onSelect={(id) => handleSelect(id, "budget")}
        
    />

        {/* Number of People */}
        <PeopleInput title={translate("peopleTraveling")}
        options={SelectTravelsList}
        selectedOptions={selectedPeople}
        onSelect={(id) => handleSelect(id, "people")} 

        />

        {/* Generate Trip */}
        <div className="text-center">
        <button 
  onClick={async () => {
    setIsGenerating(true);
    try {
      await generateTrip(place);
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error(translate("errorGeneratingTrip"));
    } finally {
      setIsGenerating(false);
    }
  }}
  disabled={isGenerating}
  className={`
    px-8 py-3 
    bg-blue-600 
    text-white 
    font-bold 
    text-lg 
    transition-all 
    duration-300
    rounded-lfull
    ${isGenerating ? 'animate-pulse' : 'hover:scale-105'}
  `}
>
  {isGenerating ? translate("generating") + "..." : translate("generateTrip")}
</button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg">
    <DialogHeader>
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <IoClose className="h-5 w-5 text-gray-600" />
        <span className="sr-only">Close</span>
      </DialogClose>
      <DialogDescription>
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <img src="/logo.svg" alt="Easy Travel Logo" className="h-12 w-12" />
          <h2 className="font-bold text-lg text-gray-800">Sign In With Google</h2>
          <p className="text-sm text-gray-600 text-center">
            Sign in to the App with Google authentication securely
          </p>
          <Button
            className="w-full mt-4 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 py-2 rounded-md"
            onClick={login}
          >
            <FcGoogle className="h-5 w-5" />
            <span>Sign In With Google</span>
          </Button>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  );
}

export default CreateTrip;