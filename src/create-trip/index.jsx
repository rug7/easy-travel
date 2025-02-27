import React, { useState, useEffect } from "react";
import DestinationInput from "@/components/custom/DestinationInput";
import DaysInput from "@/components/custom/DaysInput";
import SelectableOptions from "@/components/custom/SelectableOptions";
import BudgetOptions from "@/components/custom/BudgetOptions";
import PeopleInput from "@/components/custom/PeopleInput";
import { useLanguage } from "@/context/LanguageContext";
import { AI_PROMPT, getTranslatedOptions } from "@/constants/options";
import { toast } from "sonner";

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
    // Modified validation
    if (!numDays || selectedBudgets.length === 0 || selectedPeople.length === 0) {
      toast.error(translate("pleaseCompleteAllFields"));
      return;
    }

    // If we're in "Help Me Decide" mode and have preferences but no destination yet, that's OK
    if (!destination && !showMoreQuestions) {
      toast.error(translate("pleaseSelectDestination"));
      return;
    }
    const getBudgetText = (budgetId) => {
      const budget = SelectBudgetOptions.find(b => b.id === parseInt(budgetId));
      return budget?.title || 'Moderate'; // Default to Moderate if not found
    };
  
    const getPeopleText = (peopleId) => {
      const people = SelectTravelsList.find(p => p.id === parseInt(peopleId));
      return people?.title || 'Family'; // Default to Family if not found
    };


    const aiRequestData = {
      destination: destination?.value?.description || "AI_SUGGEST",
      numberOfDays: useDates ? null : numDays,
      dateRange: useDates ? {
        startDate: startDate,
        endDate: endDate
      } : null,
      budget: getBudgetText(selectedBudgets[0]),
      travelGroup: getPeopleText(selectedPeople[0]),
      preferences: {
        weather: selectedWeather,
        activities: selectedActivities,
        sightseeing: selectedSightseeing,
      }
    };

    const FINAL_PROMPT = AI_PROMPT
    .replace('{location}', destination?.value?.description)
    .replace('{totalDays}', numDays)
    .replace('{traveler}', getPeopleText(selectedPeople[0]))
    .replace('{budget}', getBudgetText(selectedBudgets[0]))
    .replace('{totalDays}', numDays);

  console.log("Final Prompt:", FINAL_PROMPT); // This will show the formatted prompt

  console.log("Sending to AI:", aiRequestData);

    try {
      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiRequestData)
      });

      const data = await response.json();
      console.log("AI Response:", data); // Debug log
      
      if (response.ok) {
        toast.success(translate("tripGeneratedSuccess"));
        // Handle successful response
      } else {
        toast.error(translate("errorGeneratingTrip"));
      }
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error(translate("errorGeneratingTrip"));
    }

  };

  const handleHelpMeDecide = async () => {
    if (!selectedWeather.length || !selectedActivities.length || !selectedSightseeing.length || 
        !selectedBudgets.length || !selectedPeople.length || !numDays) {
      toast.error(translate("pleaseCompletePreferences"));
      return;
    }

    const preferences = {
      weather: selectedWeather,
      activities: selectedActivities,
      sightseeing: selectedSightseeing,
      budget: selectedBudgets[0],
      travelGroup: selectedPeople[0],
      numberOfDays: numDays
    };

    try {
      const response = await fetch('/api/gemini/suggest-destination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();
      
      if (response.ok) {
        const suggestedPlace = {
          label: data.destination,
          value: {
            description: data.destination,
            place_id: data.placeId
          }
        };
        setPlace(suggestedPlace);
        // Generate trip with the suggested place
        generateTrip(suggestedPlace);
      } else {
        toast.error(translate("errorSuggestingDestination"));
      }
    } catch (error) {
      console.error('Error suggesting destination:', error);
      toast.error(translate("errorSuggestingDestination"));
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
        setSelectedBudgets((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
        break;
        case "people":
        setSelectedPeople((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
           onToggle={() => setShowMoreQuestions(!showMoreQuestions)}
           onInputClick={() => setShowMoreQuestions(false)}
           selectedWeather={selectedWeather}
           selectedActivities={selectedActivities}
           selectedSightseeing={selectedSightseeing}
           selectedBudgets={selectedBudgets}
           selectedPeople={selectedPeople}
           onHelpMeDecide={handleHelpMeDecide}

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
        onSelect={(id) => handleSelect(id, "people")} />

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
