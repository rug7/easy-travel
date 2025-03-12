// DestinationInput.jsx
import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const DestinationInput = ({ 
  place, 
  setPlace, 
  translate, 
  onToggle, 
  onInputClick,
  onHelpMeDecide 
}) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">
        {translate("destinationTitle")}
      </h3>
      <div className="flex items-center justify-between">
        <div className="w-4/5">
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
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#3b82f6' : 'white',
                  color: state.isSelected ? 'white' : 'black',
                }),
              }
            }}
          />
        </div>
        <button
          className="px-4 py-2 text-sm md:px-6 md:py-3 md:text-lg bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:scale-105 duration-500"
          onClick={() => {
            setPlace(null); // Clear the current place
            onToggle(); // Toggle the preferences section
          }}
        >
          {translate("helpMeDecide")}
        </button>
      </div>
    </div>
  );
};

export default DestinationInput;