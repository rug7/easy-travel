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



const generateDayItineraries = (numDays) => {
  let template = '';
  for (let i = 1; i <= numDays; i++) {
    template += `"day${i}": [
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
    ]${i < numDays ? ',' : ''}`;
  }
  return template;
};
const validateItinerary = async (jsonResponse, numDays, destination, getBudgetText, getPeopleText, selectedBudgets, selectedPeople, generateActivitiesForDay ) => {
  // Check if itinerary exists
  if (!jsonResponse.itinerary) {
    throw new Error('Missing itinerary in response');
  }

  // Check number of days
  const days = Object.keys(jsonResponse.itinerary).length;
  if (days !== parseInt(numDays)) {
    throw new Error(`Expected ${numDays} days, but got ${days}`);
  }

  // Process each day's activities
  for (let i = 1; i <= numDays; i++) {
    const dayKey = `day${i}`;
    const dayActivities = jsonResponse.itinerary[dayKey];

    // If activities are missing or invalid, generate new ones
    if (!dayActivities || !Array.isArray(dayActivities) || dayActivities.length !== 3) {
      console.log(`Generating activities for ${dayKey}`);
      try {
        jsonResponse.itinerary[dayKey] = await generateActivitiesForDay(
          i,
          destination.value.description,
          getBudgetText(selectedBudgets[0]),
          getPeopleText(selectedPeople[0])
        );
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
      }
    }

    // Validate each activity's required fields
    jsonResponse.itinerary[dayKey] = jsonResponse.itinerary[dayKey].map((activity, index) => {
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
  }

  return jsonResponse;
};

const generateActivitiesForDay = async (dayNumber, destination, budget, travelers) => {
  try {
    const activityPrompt = `Create activities for day ${dayNumber} in ${destination} for travelers with a ${budget} budget.
    Travelers: ${travelers}
    
    IMPORTANT: Respond ONLY with a valid JSON array. No additional text or formatting.
    
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

    let activities;
    try {
      // Try to parse the cleaned response
      activities = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error(`JSON Parse Error for day ${dayNumber}:`, parseError);
      
      // Try to extract JSON array if wrapped in other content
      const arrayMatch = cleanResponse.match(/$$[\s\S]*$$/);
      if (arrayMatch) {
        try {
          activities = JSON.parse(arrayMatch[0]);
        } catch (secondaryParseError) {
          console.error('Secondary parse attempt failed:', secondaryParseError);
          throw new Error('Failed to parse activities JSON');
        }
      } else {
        throw new Error('No valid JSON array found in response');
      }
    }

    // Validate the activities array
    if (!Array.isArray(activities)) {
      throw new Error('Response is not an array');
    }

    // Ensure we have exactly 3 activities
    if (activities.length !== 3) {
      console.warn(`Expected 3 activities for day ${dayNumber}, got ${activities.length}`);
      // Pad or trim the array to exactly 3 activities
      while (activities.length < 3) {
        activities.push({
          activity: `Additional Activity ${activities.length + 1}`,
          duration: "2-3 hours",
          bestTime: "Flexible",
          price: "",
          description: "Flexible time for personal exploration",
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        });
      }
      activities = activities.slice(0, 3);
    }

    // Validate each activity
    activities = activities.map((activity, index) => {
      const timeSlot = index === 0 ? "Morning" : index === 1 ? "Afternoon" : "Evening";
      const defaultTime = index === 0 ? "9:00 AM - 12:00 PM" : 
                         index === 1 ? "2:00 PM - 5:00 PM" : 
                         "7:00 PM - 10:00 PM";

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

    return activities;

  } catch (error) {
    console.error(`Error generating activities for day ${dayNumber}:`, error);
    
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
        const cleanStr = str
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
  
        // Try to find JSON object or array
        const match = cleanStr.match(/(\{[\s\S]*\}|$$[\s\S]*$$)/);
        if (match) {
          return JSON.parse(match[0]);
        }
  
        // If no JSON found, throw error
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error("JSON Parse Error:", error);
      console.log("Problematic string:", str);
      return null;
    }
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
  
      toast.success(`Suggesting destination: ${suggestionData.destination}, ${suggestionData.country}`);
    } else if (!destination) {
      toast.error(translate("pleaseSelectDestination"));
      return;
    } else {
      // Validate direct destination input
      if (!destination.value || !destination.value.description) {
        throw new Error('Invalid destination format');
      }
      finalDestination = {
        value: {
          description: destination.value.description,
          // Add any other necessary properties
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

  IMPORTANT: Your response must be a valid JSON object. Do not include any additional text, markdown formatting, or explanations outside the JSON structure.

  
  Respond with a JSON object exactly matching this structure:
  
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
    "itinerary": {
      ${generateDayItineraries(parseInt(numDays))}
    }
  }`;
  
  const guidelines = `
  
  Guidelines:
  - Provide at least 3 hotel suggestions with complete details including name, address, price range, rating, description, amenities, coordinates, image URL, and booking links.
  - Each day MUST have at least 1 activity (preferably 3) with complete details including activity name, duration, best time, price, description, travel time, coordinates, image URL, and booking links.
  - Activities should be properly spaced throughout the day.
  - All activities must have real, accessible URLs for images and booking.
  - Include specific pricing and timing for each activity.
  - Consider travel time between locations.
  - Ensure activities match the selected budget level.
  - Activities should be varied and not repetitive across days.
  
  Remember to provide a complete itinerary for all ${numDays} days with at least 1 activity per day and at least 3 hotel suggestions.`;
  
  const fullPrompt = basePrompt + guidelines;
  
      const result = await chatSession.sendMessage([{ text: fullPrompt }]);
      const response = await result.response.text();
      let jsonResponse = safeJSONParse(response);

      if (!jsonResponse) {
        // If parsing failed, try to clean and retry
        console.log("Initial parsing failed, attempting to clean response");
        
        // Remove any markdown formatting if present
        const cleanResponse = response
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();
          
        jsonResponse = safeJSONParse(cleanResponse);
        
        if (!jsonResponse) {
          throw new Error('Failed to parse AI response after cleaning');
        }
      }
      
      if (!jsonResponse.trip || !jsonResponse.hotels || !jsonResponse.itinerary) {
        throw new Error('Invalid response structure');
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
        generateActivitiesForDay
      );
  
      setTripData(jsonResponse);
      console.log(jsonResponse);
      toast.success(translate("tripGeneratedSuccess"));
  
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error(translate("errorGeneratingTrip"));
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
  const generateTripWithRetry = async (destination, maxRetries = 3) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      setIsGenerating(true);
      const result = await generateTrip(destination);
      if (result) {
        setIsGenerating(false);
        return result;
      }
      throw new Error('Invalid response');
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts === maxRetries) {
        toast.error(translate("maxRetriesReached"));
        setIsGenerating(false);
        return null;
      }
      // Wait longer between retries
      await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
    }
  }
};

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