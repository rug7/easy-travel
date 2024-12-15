import React, { useState } from "react";
import DestinationInput from "@/components/custom/DestinationInput";
import DaysInput from "@/components/custom/DaysInput";
import SelectableOptions from "@/components/custom/SelectableOptions";
import BudgetOptions from "@/components/custom/BudgetOptions";
import PeopleInput from "@/components/custom/PeopleInput";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslatedOptions } from "@/constants/options";

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [useDates, setUseDates] = useState(false);
  const [numDays, setNumDays] = useState("");
  const { translate, language } = useLanguage();
  const isRTL = language === "he";

  const {
    SelectTravelsList,
    SelectBudgetOptions,
    WeatherOptions,
    ActivityOptions,
    SightseeingOptions,
  } = getTranslatedOptions(translate);

  // Selection states
  const [selectedWeather, setSelectedWeather] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedSightseeing, setSelectedSightseeing] = useState([]);

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
      default:
        break;
    }
  };
  const handleBudgetSelect = (id) => {
    setSelectedBudgets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
        selectedOptions={SelectBudgetOptions}
        onSelect={handleBudgetSelect}
        translate={(key) => key} // Dummy translate function
    />

        {/* Number of People */}
        <PeopleInput options={SelectTravelsList} translate={translate} />

        {/* Generate Trip */}
        <div className="text-center">
          <button className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700">
            {translate("generateTrip")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTrip;
