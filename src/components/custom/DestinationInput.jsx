// DestinationInput.jsx
import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const DestinationInput = ({ 
  place, 
  setPlace, 
  translate, 
  onToggle, 
  onInputClick,
  selectedWeather,
  selectedActivities,
  selectedSightseeing,
  selectedBudgets,
  selectedPeople,
  onHelpMeDecide   // Add this prop
}) => {
  const handleHelpMeDecide = async () => {
    setPlace(null);
    onToggle();
    onHelpMeDecide(); // Call the parent's help me decide handler

    const preferences = {
      weather: selectedWeather,
      activities: selectedActivities,
      sightseeing: selectedSightseeing,
      budget: selectedBudgets[0],
      travelGroup: selectedPeople[0]
    };

    try {
      const response = await fetch('/api/gemini/suggest-destination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to get destination suggestion');
      }

      const data = await response.json();
      
      const suggestedPlace = {
        label: data.destination,
        value: {
          description: data.destination,
          place_id: data.placeId
        }
      };

      setPlace(suggestedPlace);
      // After setting the place, generate the trip
      onGenerateTrip(suggestedPlace);

    } catch (error) {
      console.error('Error getting destination suggestion:', error);
    }
  };

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
                // Optionally, you can also generate trip here if you want it to happen immediately after destination selection
                // onGenerateTrip(v);
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
          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
          onClick={handleHelpMeDecide}
        >
          {translate("helpMeDecide")}
        </button>
      </div>
    </div>
  );
};

export default DestinationInput;