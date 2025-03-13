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
const validateItinerary = (jsonResponse, numDays) => {
  // Check if itinerary exists
  if (!jsonResponse.itinerary) {
    throw new Error('Missing itinerary in response');
  }

  // Check number of days
  const days = Object.keys(jsonResponse.itinerary).length;
  if (days !== parseInt(numDays)) {
    throw new Error(`Expected ${numDays} days, but got ${days}`);
  }

  // Check each day has exactly 3 activities with complete information
  for (let i = 1; i <= numDays; i++) {
    const dayKey = `day${i}`;
    const dayActivities = jsonResponse.itinerary[dayKey];

    // Check if day exists and has activities
    if (!dayActivities || !Array.isArray(dayActivities)) {
      throw new Error(`Invalid activities for ${dayKey}`);
    }

    // Check number of activities
    if (dayActivities.length !== 3) {
      throw new Error(`${dayKey} should have exactly 3 activities`);
    }

    // Check each activity has required fields
    dayActivities.forEach((activity, index) => {
      const timeOfDay = index === 0 ? 'Morning' : index === 1 ? 'Afternoon' : 'Evening';
      if (!activity.activity || activity.activity === '') {
        throw new Error(`Missing activity name for ${dayKey} ${timeOfDay}`);
      }
      if (!activity.duration || activity.duration === '') {
        throw new Error(`Missing duration for ${dayKey} ${timeOfDay}`);
      }
      if (!activity.description || activity.description === '') {
        throw new Error(`Missing description for ${dayKey} ${timeOfDay}`);
      }
      // Add more field validations as needed
    });
  }

  return jsonResponse;
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


  const generateTrip = async (destination) => {
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
  
    const generateActivitiesForDay = async (dayNumber, destination, budget, travelers) => {
      const activityPrompt = `Create activities for day ${dayNumber} in ${destination} for travelers with a ${budget} budget.
  Travelers: ${travelers}
  
  Respond with a JSON array exactly matching this structure:
  
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
      return JSON.parse(response);
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
        const suggestionData = JSON.parse(suggestionResponse);
  
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
      }
  
      // Generate the trip itinerary
      const basePrompt = `Create a detailed travel itinerary for ${finalDestination.value.description} for ${numDays} days.
  Travelers: ${getPeopleText(selectedPeople[0])}
  Budget Level: ${getBudgetText(selectedBudgets[0])}
  
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
      let jsonResponse = JSON.parse(response);
      
      // Validate the response
      if (!jsonResponse.itinerary || Object.keys(jsonResponse.itinerary).length !== parseInt(numDays)) {
        throw new Error('Invalid itinerary: missing days');
      }
      if (!jsonResponse.hotels || jsonResponse.hotels.length < 3) {
        throw new Error('Invalid hotels: less than 3 hotels provided');
      }
  
      // Check for missing activities and retry for those days
      for (let i = 1; i <= numDays; i++) {
        const dayKey = `day${i}`;
        if (!jsonResponse.itinerary[dayKey] || jsonResponse.itinerary[dayKey].length === 0) {
          console.log(`Retrying activity generation for ${dayKey}`);
          jsonResponse.itinerary[dayKey] = await generateActivitiesForDay(
            i,
            finalDestination.value.description,
            getBudgetText(selectedBudgets[0]),
            getPeopleText(selectedPeople[0])
          );
        } else if (jsonResponse.itinerary[dayKey].length < 3) {
          console.warn(`Warning: ${dayKey} has fewer than 3 activities`);
        }
      }
  
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
           onClick={() => generateTrip(place)}  
          className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lfull hover:bg-blue-700 hover:scale-105 duration-500">
            {translate("generateTrip")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTrip;