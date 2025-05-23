import React, { useState, useEffect } from "react";
import DestinationInput from "@/components/custom/DestinationInput";
import DaysInput from "@/components/custom/DaysInput";
import SelectableOptions from "@/components/custom/SelectableOptions";
import BudgetOptions from "@/components/custom/BudgetOptions";
import PeopleInput from "@/components/custom/PeopleInput";
import TripTypeSelector from "@/components/custom/TripTypeSelector";
import SeatClassSelector from "@/components/custom/SeatClassSelector";
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { getTranslatedOptions } from "@/constants/options";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

import FlightPreferences from "./FlightPreferences";
import { 
  generateTrip, 
  saveLocationToHistory, 
  getUserLocationHistory 
} from "@/utils/itineraryUtils";

import LoadingScreen from "@/view-trip/components/LoadingScreen";

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const location = useLocation();

  const [endDate, setEndDate] = useState(null);
  const [useDates, setUseDates] = useState(false);
  const [numDays, setNumDays] = useState("");
  const { translate, language } = useLanguage();
  const { colorMode, colorSchemes } = useAccessibility();
  const isRTL = language === "he";

  const [selectedWeather, setSelectedWeather] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedSightseeing, setSelectedSightseeing] = useState([]);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  
  // Function to get accessible colors based on color mode
  const getAccessibleColor = (colorType) => {
    const colorMap = {
      default: {
        primary: '#3b82f6', // blue-500
        secondary: '#8b5cf6', // purple-500
        success: '#10b981', // green-500
        danger: '#ef4444', // red-500
        warning: '#f59e0b', // amber-500
        info: '#3b82f6', // blue-500
      },
      protanopia: {
        primary: '#2563eb', // More bluish
        secondary: '#7c3aed', // More visible purple
        success: '#059669', // Adjusted green
        danger: '#9ca3af', // Gray instead of red
        warning: '#d97706', // Darker amber
        info: '#0284c7', // Darker blue
      },
      deuteranopia: {
        primary: '#1d4ed8', // Deeper blue
        secondary: '#6d28d9', // Deeper purple
        success: '#0f766e', // Teal instead of green
        danger: '#b91c1c', // More visible red
        warning: '#b45309', // Darker amber
        info: '#1e40af', // Deeper blue
      },
      tritanopia: {
        primary: '#4f46e5', // Indigo
        secondary: '#7e22ce', // Darker purple
        success: '#15803d', // Darker green
        danger: '#dc2626', // Bright red
        warning: '#ca8a04', // Darker yellow
        info: '#4338ca', // Indigo
      },
      monochromacy: {
        primary: '#4b5563', // Gray-600
        secondary: '#6b7280', // Gray-500
        success: '#374151', // Gray-700
        danger: '#1f2937', // Gray-800
        warning: '#6b7280', // Gray-500
        info: '#4b5563', // Gray-600
      },
      highContrast: {
        primary: '#1d4ed8', // Deep blue
        secondary: '#6d28d9', // Deep purple
        success: '#047857', // Deep green
        danger: '#b91c1c', // Deep red
        warning: '#b45309', // Deep amber
        info: '#1e40af', // Deep blue
      }
    };
  
    // Use colorMode-specific colors, falling back to default
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    destination: false,
    flights: false,
    hotels: false,
    activities: false,
    finalizing: false,
    completed: false,
    currentDay: 0,
    totalDays: 0
  });

  // Add state to track the trip ID for navigation
  const [generatedTripId, setGeneratedTripId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

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
    },
    flights: {
      roundTrip: {
        cheapest: null,
        best: null,
        quickest: null
      },
      oneWay: {
        cheapest: null,
        best: null,
        quickest: null
      }
    }
  });
  const [showWeatherOptions, setShowWeatherOptions] = useState(false);

  const [isAISelected, setIsAISelected] = useState(false);

  const [tripType, setTripType] = useState('roundTrip'); // 'roundTrip' or 'oneWay'
  const [seatClass, setSeatClass] = useState('ECONOMY'); // 'ECONOMY', 'BUSINESS', or 'FIRST'

  // Add options for the new selectors
  const tripTypeOptions = [
    { id: 'roundTrip', title: translate("roundTrip"), icon: '🔄' },
    { id: 'oneWay', title: translate("oneWay"), icon: '➡️' }
  ];

  const seatClassOptions = [
    { id: 'ECONOMY', title: translate("economy"), icon: '💺' },
    { id: 'BUSINESS', title: translate("business"), icon: '🛋️' },
    { id: 'FIRST', title: translate("first"), icon: '👑' }
  ];

  const {
    SelectTravelsList,
    SelectBudgetOptions,
    WeatherOptions,
    ActivityOptions,
    SightseeingOptions,
  } = getTranslatedOptions(translate);

  // Function for accessible button styles
  const getButtonStyle = (type = 'primary') => {
    if (colorMode === 'default') {
      return {}; // Use default Tailwind classes
    }
    
    // Return color-blind accessible styles
    switch (type) {
      case 'primary':
        return {
          backgroundColor: getAccessibleColor('primary'),
          color: 'white',
        };
      case 'secondary':
        return {
          backgroundColor: getAccessibleColor('secondary'),
          color: 'white',
        };
      case 'danger':
        return {
          backgroundColor: getAccessibleColor('danger'),
          color: 'white',
        };
      case 'success':
        return {
          backgroundColor: getAccessibleColor('success'),
          color: 'white',
        };
      default:
        return {
          backgroundColor: getAccessibleColor('primary'),
          color: 'white',
        };
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    // Navigation is handled in the LoadingScreen component
  };

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
  
  useEffect(() => {
    if (location.state?.destination) {
      setPlace(location.state.destination);
      // Optionally scroll to the form
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [location.state]);

  // Add this useEffect in CreateTrip
  // useEffect(() => {
  //   // Check if user is logged in
  //   if (!user || !user.email) {
  //     toast.error('You need to be logged in to create a trip');
  //     navigate('/');
  //   }
  // }, [user, navigate]);
  
  const tripWithUserEmail = {
    ...tripData,
    userEmail: user?.email,
    createdAt: new Date().toISOString()
  };

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Get user profile after successful login
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${codeResponse.access_token}`,
            Accept: 'application/json'
          }
        });
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userInfo.data));
        toast.success('Successfully signed in!');
        setOpenDialog(false);
        
        // Now that the user is logged in, proceed with trip generation
        if (place) {
          // Reset progress state
          setGenerationProgress({
            destination: false,
            flights: false,
            hotels: false,
            activities: false,
            finalizing: false,
            completed: false,
            currentDay: 0,
            totalDays: 0
          });
          
          setIsGenerating(true);
          
          try {
            await generateTrip({
              place,
              destination: place,
              isAISelected,
              numDays,
              selectedBudgets,
              selectedPeople,
              selectedWeather,
              selectedActivities,
              selectedSightseeing,
              startDate,
              endDate,
              tripType,
              seatClass,
              preferences: {
                weather: selectedWeather,
                activities: selectedActivities,
                sightseeing: selectedSightseeing
              },
              SaveAiTrip,
              translate,
              setGenerationProgress,
              setTripData,
              setOpenDialog,
              setIsGenerating,
              options: {
                SelectTravelsList,
                SelectBudgetOptions,
                WeatherOptions,
                ActivityOptions,
                SightseeingOptions
              }
            });
            
            // Mark generation as complete
            setGenerationProgress(prev => ({
              ...prev,
              completed: true
            }));
            
          } catch (error) {
            console.error('Error generating trip:', error);
            toast.error(error.message || translate("errorGeneratingTrip"));
            setIsGenerating(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to get user information');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Google login failed');
    }
  });

  const handleGenerateTrip = async () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      // If not logged in, show the sign-in dialog
      setOpenDialog(true);
      return; // Stop execution until user is logged in
    }
    
    // User is logged in, proceed with trip generation
    // Reset progress state
    setGenerationProgress({
      destination: false,
      flights: false,
      hotels: false,
      activities: false,
      finalizing: false,
      completed: false,
      currentDay: 0,
      totalDays: 0
    });
    
    setIsGenerating(true);
    
    try {
      await generateTrip({
        place,
        destination: place,
        isAISelected,
        numDays,
        selectedBudgets,
        selectedPeople,
        selectedWeather,
        selectedActivities,
        selectedSightseeing,
        startDate,
        endDate,
        tripType,
        seatClass,
        preferences: {
          weather: selectedWeather,
          activities: selectedActivities,
          sightseeing: selectedSightseeing
        },
        SaveAiTrip, // Pass the function directly
        translate,
        setGenerationProgress,
        setTripData,
        setOpenDialog,
        setIsGenerating,
        options: {
          SelectTravelsList,
          SelectBudgetOptions,
          WeatherOptions,
          ActivityOptions,
          SightseeingOptions
        }
      });
      
      // Mark generation as complete
      setGenerationProgress(prev => ({
        ...prev,
        completed: true
      }));
      
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error(error.message || translate("errorGeneratingTrip"));
      setIsGenerating(false);
    }
  };

  const handleHelpMeDecide = () => {
    setIsAISelected(!isAISelected);
    setShowWeatherOptions(!showWeatherOptions); // Toggle weather options only
    if (place) {
      setPlace(null); // Clear destination if Help Me Decide is selected
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

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,{
      headers:{
        Authorization:`Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    }).then((resp)=>{
      console.log(resp);
      localStorage.setItem('user',JSON.stringify(resp.data));
      setOpenDialog(false);
      generateTrip();
    })
  }

  const SaveAiTrip = async (tripData, progressInfo = null, existingId = null) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?.email;
      const docId = existingId || Date.now().toString();
      
      console.log(`Saving trip with ID: ${docId}, existing ID: ${existingId}`);
      
      // Get the actual names/labels from the selected IDs
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
        );
      };
  
      const getActivityPreferences = () => {
        return selectedActivities.map(id => 
          ActivityOptions.find(a => a.id === id)?.title
        );
      };
  
      const getSightseeingPreferences = () => {
        return selectedSightseeing.map(id => 
          SightseeingOptions.find(s => s.id === id)?.title
        );
      };
  
      // Format dates properly
      const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toISOString();
      };
  
      const formData = {
        destination: place?.value?.description || tripData?.trip?.destination || '',
        numDays: numDays,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        budget: getBudgetText(selectedBudgets[0]),
        travelers: getPeopleText(selectedPeople[0]),
        weather: getWeatherPreferences(),
        activities: getActivityPreferences(),
        sightseeing: getSightseeingPreferences(),
        tripType: tripType,
        seatClass: seatClass,
        isAISelected: isAISelected
      };
  
      // Make a deep copy of tripData to avoid modifying the original
      const tripDataCopy = JSON.parse(JSON.stringify(tripData));
      
      // Add progress info to the trip data
      const updatedTripData = {
        ...tripDataCopy,
        generationProgress: progressInfo || {
          currentDay: 0,
          totalDays: parseInt(tripDataCopy.trip.duration.split(' ')[0]) || 0,
          completed: false
        }
      };
  
      // Set the generated trip ID for navigation
      if (!existingId) {
        setGeneratedTripId(docId);
      }
  
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: updatedTripData,
        userEmail: user?.email,
        id: docId,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      // Only save to location history if this is a completed trip
      if (progressInfo && progressInfo.completed) {
        const destination = tripData.trip?.destination;
        if (destination) {
          try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id || user?.email;
            await saveLocationToHistory(userId, destination,formData.startDate);
            console.log(`Saved ${destination} to location history`);
          } catch (historyError) {
            console.error("Error saving to location history:", historyError);
          }
        }
      }
      
      return docId;
    } catch (error) {
      console.error("Error saving trip:", error);
      return null;
    }
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-20 px-5 mt-20">
      {/* Show loading screen when generating */}
      {isGenerating && (
        <LoadingScreen 
          progress={generationProgress} 
          tripData={{ id: generatedTripId }}
          onComplete={handleGenerationComplete}
        />
      )}
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
          onInputClick={() => {
            setIsAISelected(false);
            setShowWeatherOptions(false);
          }}
          isAISelected={isAISelected}
          colorMode={colorMode}
        />
        
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
          colorMode={colorMode}
        />

<FlightPreferences
  translate={translate}
  tripType={tripType}
  setTripType={setTripType}
  seatClass={seatClass}
  setSeatClass={setSeatClass}
  isRTL={isRTL}
/>
        {/* Additional Questions */}
        <div className="space-y-10">
          {/* Weather Options - Only show when Help Me Decide is active */}
          {showWeatherOptions && (
            <SelectableOptions
              title={translate("weatherPreference")}
              options={WeatherOptions}
              selectedOptions={selectedWeather}
              onSelect={(id) => handleSelect(id, "weather")}
              colorMode={colorMode}
            />
          )}
          <SelectableOptions
            title={translate("activitiesPreference")}
            options={ActivityOptions}
            selectedOptions={selectedActivities}
            onSelect={(id) => handleSelect(id, "activities")}
            gridCols="grid-cols-2 md:grid-cols-4"
            colorMode={colorMode}
          />
          <SelectableOptions
            title={translate("sightseeingPreference")}
            options={SightseeingOptions}
            selectedOptions={selectedSightseeing}
            onSelect={(id) => handleSelect(id, "sightseeing")}
            gridCols="grid-cols-2 md:grid-cols-4"
            colorMode={colorMode}
          />
        </div>

        {/* Budget */}
        <BudgetOptions
          title={translate("budgetTitle")}
          options={SelectBudgetOptions}
          selectedOptions={selectedBudgets}
          onSelect={(id) => handleSelect(id, "budget")}
          colorMode={colorMode}
        />

        {/* Number of People */}
        <PeopleInput 
          title={translate("peopleTraveling")}
          options={SelectTravelsList}
          selectedOptions={selectedPeople}
          onSelect={(id) => handleSelect(id, "people")}
          colorMode={colorMode}
        />

        {/* Generate Trip */}
        <div className="text-center">
          <button 
            onClick={handleGenerateTrip}
            disabled={isGenerating}
            className={`
              px-8 py-3 
              ${colorMode === 'default' ? 'bg-blue-600 text-white' : ''}
              font-bold 
              text-lg 
              transition-all 
              duration-300
              rounded-full
              ${isGenerating ? 'animate-pulse' : 'hover:scale-105'}
            `}
            style={colorMode !== 'default' ? getButtonStyle('primary') : {}}
          >
            {isGenerating ? translate("generating") + "..." : translate("generateTrip")}
          </button>
        </div>
      </div>

      {openDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Sign In</h2>
                    <button 
                      onClick={() => setOpenDialog(false)}
                      className={`text-white ${colorMode === 'default' ? 'bg-gray-700' : ''} hover:scale-105 hover:shadow-lg transition-all p-1 rounded-full`}
                      style={
                        colorMode !== 'default' 
                          ? { 
                              backgroundColor: getAccessibleColor('danger'),
                            }
                          : {}
                      }
                    >
                      <IoClose className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center space-y-4 p-2">
                    <img src="/logo.svg" alt="Easy Travel Logo" className="h-12 w-12" />
                    <h2 className="font-bold text-lg text-gray-800">Sign In With Google</h2>
                    <p className="text-sm text-gray-600 text-center">
                      Sign in to the App with Google authentication securely
                    </p>
                    <button
                      className="w-full mt-4 bg-white text-gray-700 border border-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 py-2 rounded-full hover:scale-105 hover:shadow-lg transition-all"
                      onClick={() => login()}
                      style={
                        colorMode !== 'default' 
                          ? { 
                              borderColor: getAccessibleColor('primary'),
                              color: getAccessibleColor('primary'),
                            }
                          : {}
                      }
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span>Sign In With Google</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}

export default CreateTrip;