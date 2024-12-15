import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const DestinationInput = ({ place, setPlace, translate, onToggle }) => (
  <div>
    <h3 className="text-xl font-bold text-white mb-4">
      {translate("destinationTitle")}
    </h3>
    <div className="flex items-center justify-between">
      <div className="w-4/5"> {/* 80% of the width */}
        <GooglePlacesAutocomplete
          apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
          selectProps={{
            value: place,
            onChange: (v) => setPlace(v),
            placeholder: translate("enterDestination"),
          }}
        />
      </div>
      <button
        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
        onClick={onToggle}
      >
        {translate("helpMeDecide")}
      </button>
    </div>
  </div>
);

export default DestinationInput;
