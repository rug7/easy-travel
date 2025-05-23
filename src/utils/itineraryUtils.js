
import { toast } from "sonner";
import { chatSession } from "@/service/AIModal";
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { getAirportCodeFromAI } from "@/services/aiService";
import { formatDate,formatDuration,formatFlightSegment,formatPrice,safeJSONParse } from "./formatUtils";
import { processFlightOffers } from "./flightUtils";
import { validateResponse } from "./validationUtils";
import { fetchFlights } from "@/services/flightService"; 
import { generateHotels, validateHotels,generateDefaultHotels} from "./hotelUtils";




export * from './hotelUtils';
export * from './flightUtils';
export * from './formatUtils';
export * from './itineraryUtils';

export const saveLocationToHistory = async (userId, destination,startDate = null) => {
  try {
    if (!userId || !destination) return;
    
    // Clean and normalize the destination string
    let cleanDestination = destination.trim();
    if (!cleanDestination || cleanDestination.includes('undefined')) return;
    
    // Ensure proper capitalization
    cleanDestination = cleanDestination
      .split(',')
      .map(part => {
        return part.trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      })
      .join(', ');
    
    // Create a document ID based on userId and destination to prevent duplicates
    const docId = `${userId}_${cleanDestination.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    await setDoc(doc(db, "userLocationHistory", docId), {
      userId,
      destination: cleanDestination,
      visitedAt: startDate || new Date().toISOString()
    });
    
    console.log(`Added ${cleanDestination} to user's location history`);
  } catch (error) {
    console.error("Error saving location to history:", error);
  }
};

export const getUserLocationHistory = async (userId) => {
  try {
    if (!userId) return [];
    
    // Try the simple query first (no ordering)
    try {
      const q = query(
        collection(db, "userLocationHistory"), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const locations = [];
      
      querySnapshot.forEach((doc) => {
        locations.push(doc.data().destination);
      });
      
      console.log(`Retrieved ${locations.length} locations from user history`);
      return locations;
    } catch (indexError) {
      console.warn("Index error with location history query:", indexError);
      console.log("Returning empty location history due to index error");
      return [];
    }
  } catch (error) {
    console.error("Error fetching location history:", error);
    return [];
  }
};

// Add this function after getUserLocationHistory
const isDestinationVisited = (newDestination, visitedLocations) => {
  // Normalize the new destination
  const normalizedNew = {
    city: newDestination.destination.toLowerCase().trim(),
    country: newDestination.country.toLowerCase().trim(),
    full: `${newDestination.destination}, ${newDestination.country}`.toLowerCase().trim()
  };
  
  console.log(`Checking if ${normalizedNew.full} has been visited before`);
  
  // Check against each visited location
  for (const location of visitedLocations) {
    // Skip empty locations
    if (!location) continue;
    
    // Split the location into city and country if possible
    const parts = location.split(',').map(part => part.toLowerCase().trim());
    
    // Direct match on full destination
    if (normalizedNew.full === location.toLowerCase().trim()) {
      console.log(`Exact match: ${normalizedNew.full} equals ${location}`);
      return true;
    }
    
    // Match on city name
    if (parts.length >= 1) {
      const visitedCity = parts[0];
      if (normalizedNew.city === visitedCity) {
        console.log(`City match: ${normalizedNew.city} equals ${visitedCity}`);
        return true;
      }
    }
    
    // Match on country if both city and country don't match exactly
    if (parts.length >= 2) {
      const visitedCountry = parts[1];
      if (normalizedNew.country === visitedCountry && 
          (normalizedNew.city.includes(parts[0]) || parts[0].includes(normalizedNew.city))) {
        console.log(`Country and partial city match: ${normalizedNew.full} similar to ${location}`);
        return true;
      }
    }
  }
  
  console.log(`${normalizedNew.full} has not been visited before`);
  return false;
};

export const generateDayItineraries = (numDays) => {
  const activityTemplate = {
    activity: "Activity",
    duration: "2-3 hours",
    bestTime: "",
    price: "",
    description: "",
    travelTime: "",
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    imageUrl: "",
    bookingLinks: {
      official: "",
      tripadvisor: "",
      googleMaps: ""
    }
  };

  return `"itinerary": {
    ${Array.from({ length: numDays }, (_, i) => `"day${i + 1}": []`).join(',')}
  }`;
};
export const validateItinerary = async (jsonResponse, numDays, destination, getBudgetText, getPeopleText, selectedBudgets, selectedPeople, generateActivitiesForDay, setGenerationProgress, preferences, SaveAiTrip = null) => {
  console.log('Starting itinerary validation...');
  let firstDayGenerated = false;
  let tripId = jsonResponse.id || null; // Store the trip ID

  // Initialize itinerary if it doesn't exist or is empty
  if (!jsonResponse.itinerary || Object.keys(jsonResponse.itinerary).length === 0) {
    jsonResponse.itinerary = {};
    for (let i = 1; i <= numDays; i++) {
      jsonResponse.itinerary[`day${i}`] = [];
    }
  }

  // Process each day sequentially
  for (let i = 1; i <= numDays; i++) {
    const dayKey = `day${i}`;
    console.log(`Processing ${dayKey}...`);
    
    // Update progress to show which day we're working on
    setGenerationProgress(prev => ({
      ...prev,
      currentDay: i,
      totalDays: numDays
    }));

    try {
      // Generate new activities for this day
      console.log(`Generating activities for ${dayKey} with preferences:`, preferences);
      const activities = await generateActivitiesForDay(
        i,
        destination.value.description,
        getBudgetText(selectedBudgets[0]),
        getPeopleText(selectedPeople[0]),
        preferences
      );

      // Update the itinerary immediately for this day
      jsonResponse.itinerary[dayKey] = activities;

      // Save the trip data to Firestore if SaveAiTrip is provided
      if (SaveAiTrip) {
        try {
          const progressInfo = {
            currentDay: i,
            totalDays: numDays,
            completed: i === numDays
          };
          
          if (i === 1 && !firstDayGenerated) {
            firstDayGenerated = true;
            // Save the partial trip data to Firestore for the first time
            tripId = await SaveAiTrip(jsonResponse, progressInfo);
            console.log('Saved partial trip with first day, ID:', tripId);
            
            // Store the ID in the jsonResponse for future updates
            jsonResponse.id = tripId;
          } else if (tripId || jsonResponse.id) {
            // Use the existing trip ID for updates
            const existingId = tripId || jsonResponse.id;
            await SaveAiTrip(jsonResponse, progressInfo, existingId);
            console.log(`Updated trip ${existingId} with day ${i} activities`);
          }
        } catch (saveError) {
          console.error(`Error saving trip data for day ${i}:`, saveError);
        }
      }

      // Validate each activity's required fields
      jsonResponse.itinerary[dayKey] = activities.map((activity, index) => {
        const timeOfDay = index === 0 ? 'Morning' : index === 1 ? 'Afternoon' : 'Evening';
        return {
          activity: activity.activity || `${timeOfDay} Activity`,
          duration: activity.duration || "2-3 hours",
          bestTime: activity.bestTime || (
            index === 0 ? "9:00 AM - 12:00 PM" :
            index === 1 ? "2:00 PM - 5:00 PM" :
            "7:00 PM - 10:00 PM"
          ),
          price: activity.price || "",
          description: activity.description || `${timeOfDay} exploration time`,
          travelTime: activity.travelTime || "",
          coordinates: {
            latitude: Number(activity.coordinates?.latitude) || 0,
            longitude: Number(activity.coordinates?.longitude) || 0
          },
          imageUrl: activity.imageUrl || "",
          bookingLinks: {
            official: activity.bookingLinks?.official || "",
            tripadvisor: activity.bookingLinks?.tripadvisor || "",
            googleMaps: activity.bookingLinks?.googleMaps || ""
          }
        };
      });

    } catch (error) {
      console.error(`Error generating activities for ${dayKey}:`, error);
      // Use default activities as fallback
      jsonResponse.itinerary[dayKey] = [
        {
          activity: "Morning Exploration",
          duration: "2-3 hours",
          bestTime: "9:00 AM - 12:00 PM",
          price: "",
          description: `Morning exploration in ${destination.value.description}`,
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        },
        {
          activity: "Afternoon Activity",
          duration: "2-3 hours",
          bestTime: "2:00 PM - 5:00 PM",
          price: "",
          description: `Afternoon activity in ${destination.value.description}`,
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        },
        {
          activity: "Evening Experience",
          duration: "2-3 hours",
          bestTime: "7:00 PM - 10:00 PM",
          price: "",
          description: `Evening experience in ${destination.value.description}`,
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        }
      ];
    }
  }

  console.log('✅ Itinerary validation complete');
  return jsonResponse;
};

export const generateActivitiesForDay = async (dayNumber, destination, budget, travelers,preferences) => {
    console.group(`🔄 Generating Day ${dayNumber} Activities`);
    console.time(`Day ${dayNumber} Generation`);
  
    try {
      // Check if preferences exist and provide defaults if not
      const weatherPref = preferences?.weather || '';
      const activitiesPref = preferences?.activities || '';
      const sightseeingPref = preferences?.sightseeing || '';
  
      const activityPrompt = `Create activities for day ${dayNumber} in ${destination}.
Trip Details:
- Travelers: ${travelers}
- Budget: ${budget}
- Weather Preference: ${weatherPref}
- Activity Types: ${activitiesPref}
- Sightseeing Interests: ${sightseeingPref}

IMPORTANT: DO NOT include any specific URLs for images or websites. These will be handled by the frontend.
Instead, focus on providing accurate activity names, descriptions, durations, and price estimates.

Return 3-4 activities that specifically match these preferences.
Each activity must be realistic and available in ${destination}.

The response must exactly match this structure:
[
  {
    "activity": "Morning Activity",
    "duration": "2-3 hours",
    "bestTime": "9:00 AM - 12:00 PM",
    "price": "$XX - $XX",
    "description": "Detailed description of the activity including what visitors can expect, highlights, and tips.",
    "travelTime": "XX minutes from previous location",
    "coordinates": {
      "latitude": XX.XXXXX,
      "longitude": XX.XXXXX
    },
    "imageUrl": "",
    "bookingLinks": {
      "official": "",
      "tripadvisor": "",
      "googleMaps": ""
    }
  }
]`;
  
      const result = await chatSession.sendMessage([{ text: activityPrompt }]);
      const response = await result.response.text();
  
      // Clean and parse the response
      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
  
        let activities = JSON.parse(cleanResponse);
        console.log(`✅ Day ${dayNumber} activities parsed successfully:`, activities);
  
  
        // Log activities as soon as they're generated
        console.group(`✅ Day ${dayNumber} Activities:`);
        activities.forEach((activity, index) => {
          const timeIcon = index === 0 ? '🌅' : index === 1 ? '☀️' : '🌙';
          console.group(`${timeIcon} Activity ${index + 1}:`);
          console.log(`📍 Name: ${activity.activity}`);
          console.log(`⏰ Time: ${activity.bestTime}`);
          console.log(`⌛ Duration: ${activity.duration}`);
          console.log(`💰 Price: ${activity.price}`);
          console.log(`📝 Description: ${activity.description}`);
          console.groupEnd();
        });
        console.groupEnd();
        
  
      // Validate the activities array
      if (!Array.isArray(activities)) {
        throw new Error('Response is not an array');
      }
  
      // Ensure we have exactly 3 activities
      if (activities.length === 0) {
        console.warn(`No activities for day ${dayNumber}, adding default activity`);
        activities = [{
          activity: "Day Exploration",
          duration: "2-3 hours",
          bestTime: "9:00 AM - 12:00 PM",
          price: "",
          description: "Flexible time for exploration",
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        }];
      } else if (activities.length > 4) {
        console.warn(`Too many activities for day ${dayNumber}, trimming to 4`);
        activities = activities.slice(0, 4);
      }
  
      // Validate each activity
      activities = activities.map((activity, index) => {
        let timeSlot, defaultTime;
        if (activities.length === 1) {
          timeSlot = "Full Day";
          defaultTime = "9:00 AM - 5:00 PM";
        } else if (activities.length === 2) {
          timeSlot = index === 0 ? "Morning" : "Evening";
          defaultTime = index === 0 ? "9:00 AM - 2:00 PM" : "3:00 PM - 8:00 PM";
        } else {
          timeSlot = index === 0 ? "Morning" : 
                     index === 1 ? "Afternoon" : 
                     "Evening";
          defaultTime = index === 0 ? "9:00 AM - 12:00 PM" : 
                       index === 1 ? "2:00 PM - 5:00 PM" : 
                       "7:00 PM - 10:00 PM";
        }
  
        // Ensure all required fields exist with valid values
        const validatedActivity = {
          activity: activity.activity || `${timeSlot} Activity`,
          duration: activity.duration || "2-3 hours",
          bestTime: activity.bestTime || defaultTime,
          price: activity.price || "",
          description: activity.description || `${timeSlot} exploration time`,
          travelTime: activity.travelTime || "",
          coordinates: {
            latitude: Number(activity.coordinates?.latitude) || 0,
            longitude: Number(activity.coordinates?.longitude) || 0
          },
          imageUrl: activity.imageUrl || "",
          bookingLinks: {
            official: activity.bookingLinks?.official || "",
            tripadvisor: activity.bookingLinks?.tripadvisor || "",
            googleMaps: activity.bookingLinks?.googleMaps || ""
          }
        };
  
        // Validate URL formats if provided
        if (validatedActivity.imageUrl && !validatedActivity.imageUrl.startsWith('http')) {
          validatedActivity.imageUrl = "";
        }
        
        Object.keys(validatedActivity.bookingLinks).forEach(key => {
          if (validatedActivity.bookingLinks[key] && !validatedActivity.bookingLinks[key].startsWith('http')) {
            validatedActivity.bookingLinks[key] = "";
          }
        });
  
        return validatedActivity;
      });
  
      console.timeEnd(`Day ${dayNumber} Generation`);
      console.groupEnd();
      return activities;
  
    } catch (error) {
      console.error(`Error generating activities for day ${dayNumber}:`, error);
      console.timeEnd(`Day ${dayNumber} Generation`);
      console.groupEnd();
      
      // Return default activities if something goes wrong
      return [
        {
          activity: "Morning Exploration",
          duration: "2-3 hours",
          bestTime: "9:00 AM - 12:00 PM",
          price: "",
          description: "Free time for morning exploration",
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        },
        {
          activity: "Afternoon Leisure",
          duration: "2-3 hours",
          bestTime: "2:00 PM - 5:00 PM",
          price: "",
          description: "Free time for afternoon activities",
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        },
        {
          activity: "Evening Free Time",
          duration: "2-3 hours",
          bestTime: "7:00 PM - 10:00 PM",
          price: "",
          description: "Free time for evening activities",
          travelTime: "",
          coordinates: { latitude: 0, longitude: 0 },
          imageUrl: "",
          bookingLinks: { official: "", tripadvisor: "", googleMaps: "" }
        }
      ];
    }
  };
  export const generateTrip = async ({
    destination,
    place,
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
    preferences,
    SaveAiTrip,
    translate,
    setGenerationProgress,
    setTripData,
    setOpenDialog,
    setIsGenerating,
    options
  }) => {
    const {
      SelectTravelsList,
      SelectBudgetOptions,
      WeatherOptions,
      ActivityOptions,
      SightseeingOptions
    } = options; // Destructure options here

        if (!place && !isAISelected) {
          toast.error(translate("pleaseSelectDestination"));
          return;
        }
    
        const user= localStorage.getItem('user');
        if(!user){
          setOpenDialog(true);
          return;
        }
        if (isAISelected && selectedWeather.length === 0) {
          toast.error(translate("pleaseSelectWeatherPreference"));
          return;
        }
    
        if (!numDays || selectedBudgets.length === 0 || selectedPeople.length === 0) {
          toast.error(translate("pleaseCompleteAllFields"));
          return;
        }
      
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
          ).join(", ");
        };
      
        const getActivityPreferences = () => {
          return selectedActivities.map(id => 
            ActivityOptions.find(a => a.id === id)?.title
          ).join(", ");
        };
      
        const getSightseeingPreferences = () => {
          return selectedSightseeing.map(id => 
            SightseeingOptions.find(s => s.id === id)?.title
          ).join(", ");
        };
    
      
        try {
          let finalDestination = destination;

          // Reset progress state
    setGenerationProgress({
      destination: !isAISelected,
      flights: false,
      hotels: false,
      activities: false,
      finalizing: false,
      completed: false,
      currentDay: 0,
      totalDays: parseInt(numDays)
    });
      
          // If no destination is selected but preferences are set, get an AI suggestion
          if (isAISelected) {
            let retryCount = 0;
            let validDestination = false;
            let suggestionData = null;
            const blacklistedDestinations = []; // Track rejected destinations
          
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              const userId = user?.id || user?.email;
              
              // Get user's location history
              let visitedLocations = [];
              try {
                visitedLocations = await getUserLocationHistory(userId);
                console.log("Retrieved user's location history:", visitedLocations);
              } catch (historyError) {
                console.warn("Could not retrieve location history:", historyError);
                // Continue without history if there's an error
              }
              
              // Format visited locations for the prompt
              const visitedLocationsText = visitedLocations.length > 0 
                ? `PREVIOUSLY VISITED LOCATIONS (DO NOT SUGGEST THESE):\n${visitedLocations.map(loc => `- ${loc}`).join('\n')}`
                : 'No previous trips recorded';
              
              while (!validDestination && retryCount < 5) { // Increased max retries to 5
                try {
                  // Add blacklisted destinations to the prompt
                  const blacklistText = blacklistedDestinations.length > 0 
                    ? `\nALSO DO NOT SUGGEST THESE ADDITIONAL DESTINATIONS:\n${blacklistedDestinations.map(loc => `- ${loc}`).join('\n')}`
                    : '';
                  
                  const suggestionPrompt = `As a travel expert, suggest a perfect destination based on the following preferences:
          Trip Duration: ${numDays} days
          Travel Group: ${getPeopleText(selectedPeople[0])}
          Budget Level: ${getBudgetText(selectedBudgets[0])}
          
          Preferences:
          - Weather: ${getWeatherPreferences()}
          - Desired Activities: ${getActivityPreferences()}
          - Preferred Sightseeing: ${getSightseeingPreferences()}
          
          ${visitedLocationsText}${blacklistText}
          
          CRITICAL INSTRUCTIONS:
          1. You MUST NOT suggest any destination that the user has previously visited.
          2. For example, if "Paris, France" is in the list above, do not suggest Paris.
          3. If "Rome, Italy" is in the list, do not suggest Rome.
          4. Suggest a completely new destination not in the list above.
          5. Respond with a valid, specific city and country.
          
          Respond ONLY with a JSON object in this exact format:
          {
            "destination": "Name of the city",
            "country": "Country name",
            "reasoning": "Brief explanation why this matches the preferences"
          }`;
          
                  console.log(`Attempt ${retryCount + 1} to get destination suggestion`);
                  const suggestionResult = await chatSession.sendMessage([{ text: suggestionPrompt }]);
                  const suggestionResponse = await suggestionResult.response.text();
                  suggestionData = safeJSONParse(suggestionResponse);
              
                  // Validate the destination data
                  if (suggestionData && 
                      suggestionData.destination && 
                      suggestionData.country && 
                      suggestionData.destination !== "undefined" && 
                      suggestionData.country !== "undefined") {
                    
                    // Check if this destination is in the visited locations using our improved function
                    const isVisited = isDestinationVisited(suggestionData, visitedLocations);
                    
                    if (isVisited) {
                      // If visited, add to blacklist and try again
                      console.log(`Destination ${suggestionData.destination}, ${suggestionData.country} already visited, trying again`);
                      blacklistedDestinations.push(`${suggestionData.destination}, ${suggestionData.country}`);
                      retryCount++;
                    } else {
                      // Not visited, we can use this destination
                      validDestination = true;
                    }
                  } else {
                    console.warn(`Invalid destination suggestion received: ${JSON.stringify(suggestionData)}`);
                    retryCount++;
                  }
                } catch (error) {
                  console.error('Error getting destination suggestion:', error);
                  retryCount++;
                }
              }
              
              if (!validDestination) {
                // Fallback to a default destination if all retries fail
                toast.error(translate("couldNotGenerateDestination"));
                
                // Find a destination not in the visited list
                const defaultDestinations = [
                  { destination: "Barcelona", country: "Spain" },
                  { destination: "Tokyo", country: "Japan" },
                  { destination: "Sydney", country: "Australia" },
                  { destination: "Cape Town", country: "South Africa" },
                  { destination: "Rio de Janeiro", country: "Brazil" }
                ];
                
                // Try to find a default destination not in the visited list
                suggestionData = defaultDestinations.find(dest => 
                  !isDestinationVisited(dest, visitedLocations)
                ) || defaultDestinations[0]; // Use first default if all have been visited
                
                suggestionData.reasoning = "A popular destination with diverse activities suitable for most preferences.";
              }
              
              finalDestination = {
                value: {
                  description: `${suggestionData.destination}, ${suggestionData.country}`,
                  reasoning: suggestionData.reasoning
                }
              };
              
              toast.success(translate("suggestedDestination")
  .replace("{0}", suggestionData.destination)
  .replace("{1}", suggestionData.country));
              setGenerationProgress(prev => ({ ...prev, destination: true }));
            } catch (error) {
              console.error("Error in AI destination selection:", error);
              toast.error(translate("errorSelectingDestination"));
              throw error;
            }
          }
      
        // Ensure finalDestination is properly formatted before continuing
        if (!finalDestination?.value?.description) {
          throw new Error('Invalid destination format');
        }
    
        const preferences = {
          weather: getWeatherPreferences(),
          activities: getActivityPreferences(),
          sightseeing: getSightseeingPreferences()
        };
        
        // Get budget and travelers
        const budget = getBudgetText(selectedBudgets[0]);
        const travelers = getPeopleText(selectedPeople[0]);
    
        
      
          // Generate the trip itinerary
          const basePrompt = `Create a detailed travel itinerary for ${finalDestination.value.description} for ${numDays} days.
    Trip Details:
    - Travelers: ${travelers}
    - Budget: ${budget}
    - Weather Preference: ${preferences.weather}
    - Desired Activities: ${preferences.activities}
    - Sightseeing Interests: ${preferences.sightseeing}
    
    The activities MUST:
    - Match ALL specified preferences
    - Be available during the selected season
    - Include accurate pricing and timing
    - Have valid booking links
    - Be geographically accurate for ${finalDestination.value.description}
    
        CRITICAL INSTRUCTIONS:
        1. Response MUST be ONLY valid JSON
        2. NO markdown, NO text outside JSON
        3. NO explanations or comments
        4. Property names MUST be in double quotes
        5. String values MUST be in double quotes
        6. NO trailing commas
        7. NO single quotes
        
      {
        "trip": {
          "destination": "${finalDestination.value.description}",
          "duration": "${numDays} days",
          "travelers": "${travelers}",
          "budget": "${budget}",
          "currency": "USD"
        },
         ${generateDayItineraries(parseInt(numDays))}
      }`;
      
      const guidelines = `
      
      Guidelines:
      - Each day's activities should follow this structure:
      {
        "activity": "Name of activity",
        "duration": "2-3 hours",
        "bestTime": "Time slot (e.g., 9:00 AM - 12:00 PM)",
        "price": "Price in USD",
        "description": "Detailed description",
        "travelTime": "Travel time from previous location",
        "coordinates": {"latitude": 0, "longitude": 0},
        "imageUrl": "URL to activity image",
        "bookingLinks": {
          "official": "Official website URL",
          "tripadvisor": "TripAdvisor URL",
          "googleMaps": "Google Maps URL"
        }
      }
      - Each day MUST have at least 1 activity (preferably 3) with complete details including activity name, duration, best time, price, description, travel time, coordinates, image URL, and booking links.
      - Activities should be properly spaced throughout the day.
      - All activities must have real, accessible URLs for images and booking.
      - Include specific pricing and timing for each activity.
      - Consider travel time between locations.
      - Ensure activities match the selected budget level.
      - Activities should be varied and not repetitive across days.
      
      Remember to provide a complete itinerary for all ${numDays} days with at least 1 activity per day and at least 3 hotel suggestions.`;
      
      const fullPrompt = basePrompt + guidelines;
    
    setIsGenerating(true);
    console.log('Starting trip generation...');
    console.log('Generating hotels...');
    
    let hotels = [];
if (finalDestination && finalDestination.value && finalDestination.value.description) {
  try {
    hotels = await generateHotels(
        finalDestination.value.description,
        getBudgetText(selectedBudgets[0]),
        preferences,
        parseInt(numDays),
        {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        }
    );
} catch (error) {
    console.error("Error generating hotels:", error);
    hotels = generateDefaultHotels(
        getBudgetText(selectedBudgets[0]),
        finalDestination.value.description,
        {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        }
    );
}
} else {
console.warn('No destination specified, using default hotels');
hotels = generateDefaultHotels(
    getBudgetText(selectedBudgets[0]),
    'Default Location',
    {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    }
);
}

// Make sure hotels is not a Promise
if (hotels instanceof Promise) {
hotels = await hotels;
}
    
    // Initialize base structure with your original prompt structure
    let jsonResponse = {
      trip: {
        destination: finalDestination.value.description,
        duration: `${numDays} days`,
        travelers: getPeopleText(selectedPeople[0]),
        budget: getBudgetText(selectedBudgets[0]),
        currency: "USD"
      },
      flights: {
        outbound: [],
        return: []
      },
      hotels: hotels,
      itinerary: {}
    };
    setGenerationProgress(prev => ({ ...prev, hotels: true }));

    
    
    try {
    
      const destinationInput = finalDestination.value.description;
      console.log('Searching flights for:', destinationInput);
      
      // Get airport code from AI
      const airportInfo = await getAirportCodeFromAI(destinationInput);
      
      if (!airportInfo || !airportInfo.code) {
        console.warn(`No airport code found for ${destinationInput}, skipping flight search`);
        jsonResponse.flights = {
          type: tripType,
          class: seatClass,
          options: {
            cheapest: null,
            best: null,
            quickest: null,
            all: []
          }
        };
          setGenerationProgress(prev => ({ ...prev, flights: true }));

        
      }
      
    
      console.log('Airport Information:', {
        code: airportInfo.code,
        city: airportInfo.city,
        country: airportInfo.country
      });
    
      let flightData = null;
      let successfulAirport = null;
    
      try {
        // Use the selected dates if available, otherwise calculate from tomorrow
        if (!startDate || !endDate) {
          throw new Error('No dates selected');
        }
    
    
        // Ensure dates are properly formatted
        const formattedDepartureDate = formatDate(startDate);
        const formattedReturnDate = formatDate(endDate);
    
        console.log('Flight Search Dates:', {
          departure: formattedDepartureDate,
          return: formattedReturnDate
        });
    
        flightData = await fetchFlights(
          'TLV',
          airportInfo.code,
          formattedDepartureDate,
          formattedReturnDate,
          tripType,
          seatClass
        );
      } catch (flightError) {
        console.warn('Flight search failed:', flightError);
        // Continue with empty flights array rather than throwing
        jsonResponse.flights = {
          type: tripType,
          class: seatClass,
          options: {
            cheapest: null,
            best: null,
            quickest: null,
            all: []
          }
        };
        
        // Mark flights as complete
        setGenerationProgress(prev => ({ ...prev, flights: true }));
      }
    
      if (flightData && flightData.length > 0) {
        console.log(`Found ${flightData.length} total flights`);
        const processedFlights = processFlightOffers(
          flightData,
          tripType === 'roundTrip'
        );
    
        jsonResponse.flights = {
          type: tripType,
          class: seatClass,
          options: processedFlights
        };
    
        console.log('✅✅ Processed flights:', jsonResponse.flights);
        setGenerationProgress(prev => ({ ...prev, flights: true }));

      } else {
        console.log('No flights found in any class');
        jsonResponse.flights = {
          type: tripType,
          class: seatClass,
          options: {
            cheapest: null,
            best: null,
            quickest: null,
            all: []
          }
        };
        
        // Mark flights as complete
        setGenerationProgress(prev => ({ ...prev, flights: true }));
      }
    
    } catch (flightError) {
      console.warn('Flight search failed:', flightError);
      jsonResponse.flights = {
        type: tripType,
        class: seatClass,
        options: {
          cheapest: null,
          best: null,
          quickest: null,
          all: []
        }
      };
      
      // Mark flights as complete
      setGenerationProgress(prev => ({ ...prev, flights: true }));
    }
    
    // Initialize empty itinerary structure
    for (let i = 1; i <= parseInt(numDays); i++) {
      jsonResponse.itinerary[`day${i}`] = [];
    }
        console.log(fullPrompt);
      // First, get hotels using the original prompt structure
      const result = await chatSession.sendMessage([{ text: fullPrompt }]);
      const response = await result.response.text();
      const initialResponse = safeJSONParse(response);
    
      if (initialResponse?.hotels) {
        jsonResponse.hotels = validateHotels(initialResponse.hotels, getBudgetText(selectedBudgets[0]));
    
      }
    
      // Now generate activities day by day
      console.log('Generating daily activities...');
      // setGenerationProgress({ currentDay: 0, totalDays: parseInt(numDays) });
      setGenerationProgress(prev => ({
        ...prev, // Keep previous progress
        currentDay: 0,
        totalDays: parseInt(numDays)
      }));
    
    
          console.log('Initial response:', jsonResponse); // Add this to see what we're getting
    
          if (!jsonResponse) {
            // If parsing failed, try to clean and retry
            console.log("Initial parsing failed, attempting to clean response");
              jsonResponse = validateResponse(response);
              console.log('Cleaned response:', jsonResponse); // Add this to see cleaned response
            }
    
            
            // Initialize structure if missing
        if (!jsonResponse || !jsonResponse.trip || !jsonResponse.hotels || !jsonResponse.itinerary) {
          console.log('Creating base structure');
          jsonResponse = {
            trip: {
              destination: finalDestination.value.description,
              duration: `${numDays} days`,
              travelers: getPeopleText(selectedPeople[0]),
              budget: getBudgetText(selectedBudgets[0]),
              currency: "USD"
            },
            hotels: [],
            itinerary: {}
          };
        }
          
    
          if (!jsonResponse.itinerary) {
            jsonResponse.itinerary = {};
          }
          
          // Validate the response
          jsonResponse = await validateItinerary(
            jsonResponse, 
            numDays,
            finalDestination,
            getBudgetText,
            getPeopleText,
            selectedBudgets,
            selectedPeople,
            generateActivitiesForDay,
            setGenerationProgress,
            preferences,
            SaveAiTrip 
          );
      
          setTripData(jsonResponse);
          console.log(jsonResponse);
          if (SaveAiTrip) {
            const progressInfo = {
              currentDay: parseInt(numDays),
              totalDays: parseInt(numDays),
              completed: true
            };
            
            // If the trip already has an ID, use it
            const tripId = jsonResponse.id || null;
            await SaveAiTrip(jsonResponse, progressInfo, tripId);
          }
          
          toast.success(translate("tripGeneratedSuccess"));
          
          setGenerationProgress(prev => ({
            ...prev,
            activities: true,
            finalizing: true,
            completed: true
          }));
      
        } catch (error) {
          console.warn('Could not fetch flight data, falling back to AI suggestions:', error);
          console.error('Error generating trip:', error);
          toast.error(translate("errorGeneratingTrip"));
        }
        finally {
          // setIsGenerating(false);
          setGenerationProgress(prev => ({
            ...prev,
            completed: false
          }));
        }
      
  };



  