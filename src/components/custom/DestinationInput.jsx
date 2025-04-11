// DestinationInput.jsx
import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { FaLightbulb } from 'react-icons/fa'; // Import the icon

const DestinationInput = ({ 
  place, 
  setPlace, 
  translate, 
  onToggle, 
  onInputClick,
  onHelpMeDecide,
  isAISelected // Add new prop
}) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">
        {translate("destinationTitle")}
      </h3>
      <div className="flex items-center gap-4">
        {/* Help Me Decide Button - Now on the left */}
        <button
          className={`flex items-center gap-2 px-4 py-2 text-sm md:px-6 md:py-3 md:text-lg 
            ${isAISelected 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'} 
            font-bold rounded-full hover:bg-blue-700 hover:scale-105 duration-500`}
          onClick={() => {
            setPlace(null);
            onToggle();
          }}
        >
          <FaLightbulb className="w-5 h-5" />
          {translate("helpMeDecide")}
        </button>

        {/* OR Separator */}
        <span className="text-gray-400 font-medium">OR</span>

        {/* Google Places Autocomplete - Taking remaining space */}
        <div className="flex-1">
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              value: place,
              onChange: (v) => {
                setPlace(v);
              },
              placeholder: translate("enterDestination"),
              onMenuOpen: () => onInputClick(),
              styles: {
                control: (provided) => ({
                  ...provided,
                  backgroundColor: 'white',
                  borderColor: '#e2e8f0',
                  width: '100%', // Ensure full width
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#3b82f6' : 'white',
                  color: state.isSelected ? 'white' : 'black',
                }),
                container: (provided) => ({
                  ...provided,
                  width: '100%', // Ensure container takes full width
                }),
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DestinationInput;