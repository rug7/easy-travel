import React, { useState, useEffect } from "react";
import DestinationInput from "@/components/custom/DestinationInput";
import DaysInput from "@/components/custom/DaysInput";
import SelectableOptions from "@/components/custom/SelectableOptions";
import BudgetOptions from "@/components/custom/BudgetOptions";
import PeopleInput from "@/components/custom/PeopleInput";
import TripTypeSelector from "@/components/custom/TripTypeSelector";
import SeatClassSelector from "@/components/custom/SeatClassSelector";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslatedOptions } from "@/constants/options";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { generateTrip } from "@/utils/itineraryUtils";


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

  const [openDialog,setOpenDialog]=useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    currentDay: 0,
    totalDays: 0
  });

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
        setOpenDialog(false);
        
        // If there was a pending trip generation, execute it
        if (place) {
          generateTrip(place);
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
    } catch (error) {
      console.error('Error generating trip:', error);
      toast.error(error.message || translate("errorGeneratingTrip"));
    } finally {
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

  const SaveAiTrip=(tripData)

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
      onToggle={handleHelpMeDecide}
      onInputClick={() => {
        setIsAISelected(false);
        setShowWeatherOptions(false);
      }}
      isAISelected={isAISelected}
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
        />

        {/* class */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {translate("flightPreferences")}
        </h3>
        <div className="space-y-4">
          <TripTypeSelector
            selected={tripType}
            onSelect={setTripType}
            options={tripTypeOptions}
          />
          <SeatClassSelector
            selected={seatClass}
            onSelect={setSeatClass}
            options={seatClassOptions}
          />
        </div>
      </div>

        {/* Additional Questions */}
        <div className="space-y-10">
          {/* Weather Options - Only show when Help Me Decide is active */}
        {showWeatherOptions && (
          <SelectableOptions
            title={translate("weatherPreference")}
            options={WeatherOptions}
            selectedOptions={selectedWeather}
            onSelect={(id) => handleSelect(id, "weather")}
          />
        )}
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
        onSelect={(id) => handleSelect(id, "people")} 

        />

        {/* Generate Trip */}
        <div className="text-center">
        <button 
  onClick={handleGenerateTrip}
  disabled={isGenerating}
  className={`
    px-8 py-3 
    bg-blue-600 
    text-white 
    font-bold 
    text-lg 
    transition-all 
    duration-300
    rounded-lfull
    ${isGenerating ? 'animate-pulse' : 'hover:scale-105'}
  `}
>
  {isGenerating ? translate("generating") + "..." : translate("generateTrip")}
</button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-lg">
    <DialogHeader>
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <IoClose className="h-5 w-5 text-gray-600" />
        <span className="sr-only">Close</span>
      </DialogClose>
      <DialogDescription>
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <img src="/logo.svg" alt="Easy Travel Logo" className="h-12 w-12" />
          <h2 className="font-bold text-lg text-gray-800">Sign In With Google</h2>
          <p className="text-sm text-gray-600 text-center">
            Sign in to the App with Google authentication securely
          </p>
          <Button
            className="w-full mt-4 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 py-2 rounded-md"
            onClick={login}
          >
            <FcGoogle className="h-5 w-5" />
            <span>Sign In With Google</span>
          </Button>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  );
}

export default CreateTrip;