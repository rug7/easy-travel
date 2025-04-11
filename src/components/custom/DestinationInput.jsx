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
  isAISelected 
}) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">
        {translate("destinationTitle")}
      </h3>
      <div className="flex items-center gap-4">
        <button
          className={`
            flex items-center gap-2 px-4 py-2 text-sm md:px-6 md:py-3 md:text-lg 
            font-bold rounded-full
            transition-all duration-300
            transform hover:scale-105
            ${isAISelected 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-md'
            }
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
          `}
          onClick={() => {
            setPlace(null);
            onToggle();
          }}
        >
          <FaLightbulb className={`w-5 h-5 transition-all duration-300 ${
            isAISelected ? 'text-yellow-300' : 'text-gray-300'
          } group-hover:text-yellow-300`} />
          {translate("helpMeDecide")}
        </button>

        <span className="text-gray-400 font-medium">OR</span>

        <div className="flex-1">
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              value: place,
              onChange: (v) => {
                setPlace(v);
                onInputClick();
              },
              placeholder: translate("enterDestination"),
              onMenuOpen: () => onInputClick(),
              styles: {
                control: (provided) => ({
                  ...provided,
                  backgroundColor: 'white',
                  borderColor: '#e2e8f0',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 1px #3b82f6'
                  }
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#3b82f6' : 'white',
                  color: state.isSelected ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: state.isSelected ? '#2563eb' : '#f3f4f6'
                  }
                }),
                container: (provided) => ({
                  ...provided,
                  width: '100%',
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