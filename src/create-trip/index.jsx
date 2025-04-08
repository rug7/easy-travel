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
  return `$${parseFloat(price).toFixed(2)}`;
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


// Helper function to get all airport codes for a cit

// Validate airport code
export const isValidAirportCode = (code) => {
  return typeof code === 'string' && code.length === 3 && /^[A-Z]{3}$/.test(code);
};


const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const fetchFlights = async (origin, destination, departureDate, returnDate) => {
  try {
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    const formattedDepartureDate = formatDate(departureDate);
    const formattedReturnDate = formatDate(returnDate);

    if (!formattedDepartureDate || !formattedReturnDate) {
      throw new Error('Invalid dates');
    }

    // Get token
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

    // Updated search parameters - removed nonStop requirement
    const searchParams = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: formattedDepartureDate,
      returnDate: formattedReturnDate,
      adults: 1,
      currencyCode: 'USD',
      max: 5
    };

    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: searchParams
    });

    return response.data.data;
  } catch (error) {
    console.error('Flight API Error:', error);
    throw error;
  }
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
const validateItinerary = async (jsonResponse, numDays, destination, getBudgetText, getPeopleText, selectedBudgets, selectedPeople, generateActivitiesForDay,setGenerationProgress  ) => {
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
      console.log(`Generating activities for ${dayKey}`);
      const activities = await generateActivitiesForDay(
        i,
        destination.value.description,
        getBudgetText(selectedBudgets[0]),
        getPeopleText(selectedPeople[0])
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

const generateActivitiesForDay = async (dayNumber, destination, budget, travelers) => {
  console.group(`🔄 Generating Day ${dayNumber} Activities`);
  console.time(`Day ${dayNumber} Generation`);

  try {
    const activityPrompt = `Create activities for day ${dayNumber} in ${destination} for travelers with a ${budget} budget.
    Travelers: ${travelers}
    
    IMPORTANT: Respond ONLY with a valid JSON array. No additional text or formatting.
    Return 1-4 activities for the day, optimizing for quality over quantity.

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
      outbound: [],
      return: []
    }
  });

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


  const generateTrip = async (destination) => {

    const user= localStorage.getItem('user');
    if(!user){
      setOpenDialog(true);
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
      if (!destination && showMoreQuestions) {
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

    
  
      // Generate the trip itinerary
      const basePrompt = `Create a detailed travel itinerary for ${finalDestination.value.description} for ${numDays} days.
  Travelers: ${getPeopleText(selectedPeople[0])}
  Budget Level: ${getBudgetText(selectedBudgets[0])}

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
      "travelers": "${getPeopleText(selectedPeople[0])}",
      "budget": "${getBudgetText(selectedBudgets[0])}",
      "currency": "USD"
    },
    "hotels": [
      {
        "name": "",
        "address": "",
        "priceRange": "",
        "rating": 0,
        "description": "",
        "amenities": ["WiFi", "Pool", "Restaurant"],
        "coordinates": {
          "latitude": 0,
          "longitude": 0
        },
        "imageUrl": "",
        "bookingLinks": {
          "booking": "",
          "skyscanner": "",
          "tripadvisor": "",
          "googleMaps": ""
        }
      }
    ],
     ${generateDayItineraries(parseInt(numDays))}
  }`;
  
  const guidelines = `
  
  Guidelines:
  - Provide at least 3 hotel suggestions with complete details including name, address, price range, rating, description, amenities, coordinates, image URL, and booking links.
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
  hotels: [],
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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const returnDate = new Date(tomorrow);
    returnDate.setDate(returnDate.getDate() + parseInt(numDays));

    flightData = await fetchFlights(
      'TLV',
      airportInfo.code,
      tomorrow,
      returnDate
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
    jsonResponse.flights = {
      outbound: flightData.map(offer => {
        const segments = offer.itineraries[0].segments;
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];
        
        return {
          airline: offer.validatingAirlineCodes[0],
          stops: segments.length - 1, // Number of stops
          departure: {
            airport: firstSegment.departure.iataCode,
            time: firstSegment.departure.at.split('T')[1],
            date: firstSegment.departure.at.split('T')[0]
          },
          arrival: {
            airport: lastSegment.arrival.iataCode,
            time: lastSegment.arrival.at.split('T')[1],
            date: lastSegment.arrival.at.split('T')[0]
          },
          duration: formatDuration(offer.itineraries[0].duration),
          price: formatPrice(offer.price.total),
          bookingLink: `https://www.kayak.com/flights/${firstSegment.departure.iataCode}-${lastSegment.arrival.iataCode}/${firstSegment.departure.at.split('T')[0]}`
        };
      }),
      return: flightData
        .filter(offer => offer.itineraries[1])
        .map(offer => {
          const segments = offer.itineraries[1].segments;
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];
          
          return {
            airline: offer.validatingAirlineCodes[0],
            stops: segments.length - 1, // Number of stops
            departure: {
              airport: firstSegment.departure.iataCode,
              time: firstSegment.departure.at.split('T')[1],
              date: firstSegment.departure.at.split('T')[0]
            },
            arrival: {
              airport: lastSegment.arrival.iataCode,
              time: lastSegment.arrival.at.split('T')[1],
              date: lastSegment.arrival.at.split('T')[0]
            },
            duration: formatDuration(offer.itineraries[1].duration),
            price: formatPrice(offer.price.total),
            bookingLink: `https://www.kayak.com/flights/${firstSegment.departure.iataCode}-${lastSegment.arrival.iataCode}/${firstSegment.departure.at.split('T')[0]}`
          };
        })
    };
  } else {
    console.warn('No flights found, using empty flight data');
    jsonResponse.flights = {
      outbound: [],
      return: []
    };
    console.log('✅ Flights fetched successfully:', jsonResponse.flights);

  }

} catch (error) {
  console.warn('Could not fetch flight data, falling back to AI suggestions:', error);
  jsonResponse.flights = {
    outbound: [],
    return: []
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
    console.log('✅ Hotels generated:', initialResponse.hotels);
    jsonResponse.hotels = initialResponse.hotels;
    setTripData(prev => ({ ...prev, hotels: initialResponse.hotels }));
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
        setGenerationProgress
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

  const handleHelpMeDecide = async () => {
    // if (!selectedWeather.length || !selectedActivities.length || !selectedSightseeing.length || 
    //     !selectedBudgets.length || !selectedPeople.length || !numDays) {
    //   toast.error(translate("pleaseCompletePreferences"));
    //   return;
    // }
  
    // Just set showMoreQuestions to true to show the preference options
    setShowMoreQuestions(true);
    // toast.success(translate("preferencesCollected"));
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
            onInputClick={() => setShowMoreQuestions(false)}

        />

        {/* Additional Questions */}
        {showMoreQuestions && (
          <div className="space-y-10">
            <SelectableOptions
              title={translate("weatherPreference")}
              options={WeatherOptions}
              selectedOptions={selectedWeather}
              onSelect={(id) => handleSelect(id, "weather")}
            />
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
        )}

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