import React, { useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);

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
          <h3 className="text-xl font-bold text-white mb-2">
            Where do you want to go?
          </h3>
          <div className="flex items-center space-x-4">
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
              selectProps={{
                value: place,
                onChange: (v) => setPlace(v),
                placeholder: "Enter a destination...",
              }}
              className="flex-grow"
            />
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setShowMoreQuestions(!showMoreQuestions)}
            >
              No Idea
            </button>
          </div>
        </div>

        {/* Show additional questions if "No Idea" is clicked */}
        {showMoreQuestions && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">
              Let's narrow it down for you!
            </h3>

            {/* Weather Question */}
            <div>
              <p className="text-lg font-medium text-gray-200 mb-3">
                What kind of weather do you prefer?
              </p>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Warm
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Cold
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Moderate
                </button>
              </div>
            </div>

            {/* Activities Question */}
            <div>
              <p className="text-lg font-medium text-gray-200 mb-3">
                What type of activities do you want to do?
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Adventure
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Relaxation
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Cultural
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Nature
                </button>
              </div>
            </div>

            {/* What to See Question */}
            <div>
              <p className="text-lg font-medium text-gray-200 mb-3">
                What would you like to see in your destination?
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Beaches
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Mountains
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Cities
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Countryside
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Number of Days */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            How many days are you planning on staying?
          </h2>
          <input 
            type="number"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            placeholder="Enter number of days "
          />
        </div>

        {/* Budget */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            What is your budget?
          </h3>
          <input
            type="number"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
            placeholder="Enter budget in USD"
          />
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

        {/* Generate Trip Button */}
        <div className="text-center mt-6">
          <button className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700">
            Generate Trip
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTrip;
