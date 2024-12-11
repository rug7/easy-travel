import React, { useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  SelectBudgetOptions,
  WeatherOptions,
  ActivityOptions,
  SightseeingOptions,
} from "@/constants/options";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [useDates, setUseDates] = useState(false); // Toggle between number of days or date picker
  const [numDays, setNumDays] = useState("");

  const handleToggle = (option) => {
    if (option === "dates") {
      setUseDates(true);
      setNumDays(""); // Clear number of days if switching to date picker
    } else {
      setUseDates(false);
      setStartDate(null);
      setEndDate(null); // Clear dates if switching to number of days
    }
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-20 px-5 mt-20">
      <h2 className="font-bold text-4xl text-white text-center mb-6">
        Tell Us Your Travel Preferences
      </h2>
      <p className="text-gray-300 text-xl text-center mb-10">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary based on your preferences.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6 flex flex-col gap-9">
        {/* Destination Section */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Where do you want to go?
          </h3>
          <div className="flex items-center justify-between">
            <div className="w-4/5"> {/* 80% of the width */}
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                selectProps={{
                  value: place,
                  onChange: (v) => setPlace(v),
                  placeholder: "Enter a destination...",
                }}
              />
            </div>
            <button
              className="ml-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
              onClick={() => setShowMoreQuestions(!showMoreQuestions)}
            >
              Help Me Decide
            </button>
          </div>
        </div>



        {/* Additional Questions */}
        {showMoreQuestions && (
          <div className="space-y-10">
            <h3 className="text-2xl font-bold text-white text-center">
              Let's narrow it down for you!
            </h3>

            {/* Weather */}
            <div>
              <p className="text-lg font-medium text-gray-200 mb-4 text-center">
                What kind of weather do you prefer?
              </p>
              <div className="grid grid-cols-3 gap-6 justify-items-center">
                {WeatherOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-36 h-36 rounded-xl bg-cover bg-center relative shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundImage: `url(${option.image})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 rounded-xl"></div>
                    <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center text-white font-semibold text-sm bg-black/50 rounded-full py-1 px-3">
                      {option.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <p className="text-lg font-medium text-gray-200 mb-4 text-center">
                What type of activities do you prefer?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                {ActivityOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-36 h-36 rounded-xl bg-cover bg-center relative shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundImage: `url(${option.image})`, // Use images dynamically
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                    <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center text-white font-semibold text-sm bg-black/50 rounded-full py-1 px-3">
                      {option.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sightseeing */}
            <div>
              <p className="text-lg font-medium text-gray-200 mb-4 text-center">
                What would you like to see in your destination?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                {SightseeingOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-36 h-36 rounded-xl bg-cover bg-center relative shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundImage: `url(${option.image})`, // Use images dynamically
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                    <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center text-white font-semibold text-sm bg-black/50 rounded-full py-1 px-3">
                      {option.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Number of Days */}
       <div>
      <h2 className="text-xl font-bold text-white mb-4">
        How many days are you planning on staying?
      </h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg space-y-4">
        {/* Toggle Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleToggle("days")}
            className={`px-4 py-2 rounded-full text-white font-bold ${
              !useDates ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            Number of Days
          </button>
          <button
            onClick={() => handleToggle("dates")}
            className={`px-4 py-2 rounded-full text-white font-bold ${
              useDates ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            Pick Dates
          </button>
        </div>

        {/* Input for Number of Days */}
        {!useDates && (
          <div className="flex flex-col">
            <label className="text-gray-200 mb-2">Enter number of days:</label>
            <input
              type="number"
              value={numDays}
              onChange={(e) => setNumDays(e.target.value)}
              placeholder="Number of days"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-full"
            />
          </div>
        )}

        {/* Date Range Picker */}
        {useDates && (
          <div className="flex flex-col">
            <label className="text-gray-200 mb-2">Select date range:</label>
            <DatePicker
              selected={startDate}
              onChange={(update) => {
                setStartDate(update[0]);
                setEndDate(update[1]);
              }}
              startDate={startDate}
              endDate={endDate}
              dateFormat={"dd/MM/yyyy"}
              selectsRange
              placeholderText="Select start and end date"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-full"
              isClearable
            />
          </div>
        )}
      </div>
    </div>

        {/* Budget */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            What is your budget?
          </h3>
          <div className="grid grid-cols-3 gap-5">
            {SelectBudgetOptions.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover:shadow-lg bg-gray-700 text-white"
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold mb-2 text-lg">{item.title}</h2>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Number of People */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            How many people are you traveling with?
          </h3>
          <input
            type="number"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            placeholder="Enter number of people"
          />
        </div>

        {/* Generate Trip */}
        <div className="text-center">
          <button className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700">
            Generate Trip
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTrip;
