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
      const itineraryPrompt = `Create a detailed travel itinerary for ${finalDestination.value.description} for ${numDays} days.
  Travelers: ${getPeopleText(selectedPeople[0])}
  Budget Level: ${getBudgetText(selectedBudgets[0])}

  Important guidelines:
  - Provide at least 3 hotel options with different price ranges
  - Include at least 3 activities per day
  - For budget level "${getBudgetText(selectedBudgets[0])}", provide specific price ranges
  - Hotel prices should be per night in local currency and USD
  - Activity prices should be per person in local currency and USD
  - For free activities, specifically state "Free"
  - For paid activities, provide exact or estimated prices
  - Do not use vague terms like "Variable" or "Varies"
  - Ensure activities are properly spread throughout the day (morning, afternoon, evening)
  - Consider travel time between activities

  Provide a detailed itinerary in the following JSON format:
  {
    "trip": {
      "destination": "${finalDestination.value.description}",
      "duration": "${numDays} days",
      "travelers": "${getPeopleText(selectedPeople[0])}",
      "budget": "${getBudgetText(selectedBudgets[0])}",
      "currency": "Local Currency Code (e.g., USD, EUR, JPY)"
    },
    "hotels": [
      {
        "name": "Hotel Name",
        "address": "Full Address",
        "priceRange": "100-150 USD per night",
        "rating": 4.5,
        "description": "Detailed hotel description",
        "amenities": ["WiFi", "Pool", "Restaurant", etc],
        "coordinates": {
          "latitude": 0.0,
          "longitude": 0.0
        }
      }
    ],
    "itinerary": {
      "day1": [
        {
          "activity": "Morning Activity Name",
          "duration": "2 hours",
          "bestTime": "9:00 AM - 11:00 AM",
          "price": "25 USD per person",
          "description": "Detailed activity description",
          "travelTime": "20 minutes from previous location",
          "coordinates": {
            "latitude": 0.0,
            "longitude": 0.0
          }
        },
        {
          "activity": "Afternoon Activity Name",
          "duration": "3 hours",
          "bestTime": "2:00 PM - 5:00 PM",
          "price": "Free",
          "description": "Detailed activity description",
          "travelTime": "15 minutes from previous location",
          "coordinates": {
            "latitude": 0.0,
            "longitude": 0.0
          }
        },
        {
          "activity": "Evening Activity Name",
          "duration": "2 hours",
          "bestTime": "7:00 PM - 9:00 PM",
          "price": "80 USD per person",
          "description": "Detailed activity description",
          "travelTime": "25 minutes from previous location",
          "coordinates": {
            "latitude": 0.0,
            "longitude": 0.0
          }
        }
      ]
    }
  }

  Requirements for hotels:
  1. Must include at least 3 different hotels
  2. Hotels should be in different price ranges (budget, moderate, luxury)
  3. Each hotel should have a complete description and list of amenities
  4. Include accurate price ranges in both local currency and USD
  5. Provide exact location coordinates

  Requirements for daily activities:
  1. Must include at least 3 activities per day
  2. Activities should be spread throughout the day (morning, afternoon, evening)
  3. Include travel time between activities
  4. Provide specific price information for each activity
  5. Include detailed descriptions and practical information
  6. Consider the selected budget level when suggesting activities

  Please ensure all prices are current and activities are appropriate for ${getPeopleText(selectedPeople[0])} travelers with a ${getBudgetText(selectedBudgets[0])} budget.`;
      
      console.log(itineraryPrompt);
      const result = await chatSession.sendMessage([{ text: itineraryPrompt }]);
      const response = await result.response.text();
      const jsonResponse = JSON.parse(response);
      
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
