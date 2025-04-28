import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { db } from '@/service/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoClose, IoCalendarOutline, IoTimeOutline, IoLocationOutline, IoInformationCircleOutline } from "react-icons/io5";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import './calendar-styles.css'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IoCloudOutline, IoSunnyOutline, IoRainyOutline, IoSnowOutline, IoThunderstormOutline } from "react-icons/io5";
import { chatSession } from '@/service/AIModal';

const Badge = ({ children, className, ...props }) => (
    <div 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
  
  // Set up the localizer
  const localizer = momentLocalizer(moment);
  
  function TravelCalendar() {
    const [trips, setTrips] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedView, setSelectedView] = useState('month');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [exportVisible, setExportVisible] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all', 'trip', 'activity'
    const [weatherData, setWeatherData] = useState({});

    


  useEffect(() => {
    async function fetchTrips() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.email) return;
        
        const q = query(
          collection(db, 'AITrips'),
          where('userEmail', '==', user.email)
        );
        
        const querySnapshot = await getDocs(q);
        const tripsData = [];
        
        querySnapshot.forEach((doc) => {
          tripsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setTrips(tripsData);
        generateCalendarEvents(tripsData);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrips();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.resource?.type === filterType;
  });

  const [calendarView, setCalendarView] = useState({
    compactAgenda: false,
    showWeekends: true,
    colorCoding: 'type', // 'type', 'destination', or 'custom'
  });

  const TodayIndicator = () => {
    return (
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
        Today
      </div>
    );
  };
  const fetchWeatherFromGemini = async (destination, startDate) => {
    try {
      // Format the prompt for Gemini API
      const prompt = `Generate realistic weather forecast data for "${destination}" starting from ${moment(startDate).format('YYYY-MM-DD')} for the next 7 days. 
      Return the data as a JSON object with this structure:
      {
        "location": "${destination}",
        "forecast": [
          {
            "date": "YYYY-MM-DD",
            "day": "Day of week",
            "temperature": {
              "min": minimum temperature in Celsius,
              "max": maximum temperature in Celsius
            },
            "condition": "Weather condition (Sunny, Partly Cloudy, Cloudy, Rainy, Thunderstorm, Snowy, Foggy, or Windy)",
            "humidity": humidity percentage,
            "windSpeed": wind speed in km/h,
            "uvIndex": UV index (0-11),
            "chanceOfPrecipitation": percentage chance of precipitation
          },
          ... (for all 7 days)
        ],
        "climateSummary": "A brief 1-2 sentence summary of the week's weather pattern",
        "travelRecommendation": "A brief recommendation for travelers during this period"
      }
  
      Base your forecast on typical weather patterns for ${destination} during ${moment(startDate).format('MMMM')}. 
      Include appropriate variations in temperature and conditions across the week.
      Don't include any explanations, just return the JSON object.`;
  
      // IMPORTANT: Use chatSession instance instead of ChatSession class
      // You need to import or access the chatSession instance
      const result = await chatSession.sendMessage([{ text: prompt }]);
      const textResponse = await result.response.text();
      
      // Rest of the function remains the same
      const jsonStart = textResponse.indexOf('{');
      const jsonEnd = textResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("Could not extract valid JSON from the response");
      }
      
      const jsonStr = textResponse.substring(jsonStart, jsonEnd);
      const weatherData = JSON.parse(jsonStr);
      
      // Map weather conditions to appropriate icons
      weatherData.forecast = weatherData.forecast.map(day => ({
        ...day,
        iconComponent: getIconComponentForCondition(day.condition)
      }));
      
      console.log("Weather data fetched:", weatherData);
      return weatherData;
    } catch (error) {
      console.error("Error fetching weather from Gemini:", error);
      
      // Fallback to generating random weather data
      return generateFallbackWeatherData(destination, startDate);
    }
  };
  
  // Helper function to map weather conditions to icon components
  const getIconComponentForCondition = (condition) => {
    const condition_lc = condition?.toLowerCase() || '';
    
    if (condition_lc.includes('sunny') && condition_lc.includes('partly')) {
      return (
        <div className="relative">
          <IoSunnyOutline className="w-10 h-10 text-yellow-400" />
          <IoCloudOutline className="w-6 h-6 text-gray-400 absolute -bottom-1 -right-1" />
        </div>
      );
    } else if (condition_lc.includes('sunny') || condition_lc.includes('clear')) {
      return <IoSunnyOutline className="w-10 h-10 text-yellow-400" />;
    } else if (condition_lc.includes('partly cloudy')) {
      return (
        <div className="relative">
          <IoSunnyOutline className="w-8 h-8 text-yellow-400 absolute -top-1 -left-1" />
          <IoCloudOutline className="w-10 h-10 text-gray-400" />
        </div>
      );
    } else if (condition_lc.includes('cloudy')) {
      return <IoCloudOutline className="w-10 h-10 text-gray-400" />;
    } else if (condition_lc.includes('thunder')) {
      return <IoThunderstormOutline className="w-10 h-10 text-yellow-300" />;
    } else if (condition_lc.includes('rain') && condition_lc.includes('light')) {
      return (
        <div className="relative">
          <IoCloudOutline className="w-10 h-10 text-gray-400" />
          <IoRainyOutline className="w-6 h-6 text-blue-400 absolute -bottom-1 -right-1" />
        </div>
      );
    } else if (condition_lc.includes('rain')) {
      return <IoRainyOutline className="w-10 h-10 text-blue-400" />;
    } else if (condition_lc.includes('snow')) {
      return <IoSnowOutline className="w-10 h-10 text-white" />;
    } else if (condition_lc.includes('fog')) {
      return (
        <div className="relative">
          <IoCloudOutline className="w-10 h-10 text-gray-300" />
          <IoCloudOutline className="w-6 h-6 text-gray-400 absolute -bottom-1 -right-1" />
        </div>
      );
    } else if (condition_lc.includes('wind')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      );
    } else {
      return <IoCloudOutline className="w-10 h-10 text-gray-400" />;
    }
  };
  
  // Fallback function to generate random weather data if API fails
  const generateFallbackWeatherData = (destination, startDate) => {
    const weatherTypes = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snowy', 'Foggy', 'Windy'];
    const weatherIcons = {
      'Sunny': <IoSunnyOutline className="w-10 h-10 text-yellow-400" />,
      'Partly Cloudy': <div className="flex"><IoSunnyOutline className="w-8 h-8 text-yellow-400 -mr-2" /><IoCloudOutline className="w-8 h-8 text-gray-400" /></div>,
      'Cloudy': <IoCloudOutline className="w-10 h-10 text-gray-400" />,
      'Rainy': <IoRainyOutline className="w-10 h-10 text-blue-400" />,
      'Thunderstorm': <IoThunderstormOutline className="w-10 h-10 text-yellow-300" />,
      'Snowy': <IoSnowOutline className="w-10 h-10 text-white" />,
      'Foggy': <IoCloudOutline className="w-10 h-10 text-gray-300" />,
      'Windy': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )
    };
    
    // Generate 7 days of forecast data
    const forecast = Array.from({length: 7}, (_, i) => {
      const forecastDate = new Date(startDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const condition = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      const minTemp = Math.floor(Math.random() * 15) + 10; // 10-25 degrees
      const maxTemp = minTemp + Math.floor(Math.random() * 10) + 5; // 5-15 degrees higher than min
      
      return {
        date: moment(forecastDate).format('YYYY-MM-DD'),
        day: moment(forecastDate).format('ddd'),
        temperature: {
          min: minTemp,
          max: maxTemp
        },
        condition: condition,
        humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        uvIndex: Math.floor(Math.random() * 10) + 1, // 1-10
        chanceOfPrecipitation: Math.floor(Math.random() * 100), // 0-100%
        icon: condition,
        iconComponent: weatherIcons[condition]
      };
    });
    
    return {
      location: destination,
      forecast: forecast,
      climateSummary: `Expected ${forecast[0].condition.toLowerCase()} conditions initially, with changes later in the week.`,
      travelRecommendation: "Pack versatile clothing and check for weather changes before heading out each day."
    };
  };
  
  const generateCalendarEvents = (tripsData) => {
    const allEvents = [];
    
    tripsData.forEach(trip => {
      const tripStart = trip.userSelection?.startDate ? new Date(trip.userSelection.startDate) : null;
      const tripEnd = trip.userSelection?.endDate ? new Date(trip.userSelection.endDate) : null;
      
      if (tripStart && tripEnd) {
        // Add the overall trip as a multi-day event
        const endDateAdjusted = new Date(tripEnd);
        endDateAdjusted.setDate(endDateAdjusted.getDate() + 1); // Adjust end date for proper display
        
        allEvents.push({
          id: `trip-${trip.id}`,
          title: `Trip to ${trip.tripData?.trip?.destination || 'Destination'}`,
          start: tripStart,
          end: endDateAdjusted,
          allDay: true,
          resource: {
            type: 'trip',
            tripId: trip.id,
            color: '#3B82F6' // Blue
          }
        });
        
        // Add individual activities
        const itinerary = trip.tripData?.itinerary || {};
        let currentDate = new Date(tripStart);
        
        Object.keys(itinerary).forEach(dayKey => {
          const dayActivities = itinerary[dayKey];
          if (Array.isArray(dayActivities)) {
            dayActivities.forEach(activity => {
              // Parse time from bestTime field
              let activityTime = null;
              if (activity.bestTime) {
                // Handle formats like "9:00 AM - 12:00 PM"
                const timeMatch = activity.bestTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (timeMatch) {
                  const [_, hours, minutes, period] = timeMatch;
                  
                  // Convert to 24-hour format
                  let hour = parseInt(hours);
                  if (period.toUpperCase() === 'PM' && hour < 12) {
                    hour += 12;
                  } else if (period.toUpperCase() === 'AM' && hour === 12) {
                    hour = 0;
                  }
                  
                  // Create date object for this activity
                  activityTime = new Date(currentDate);
                  activityTime.setHours(hour, parseInt(minutes), 0);
                }
              }
              
              // If we couldn't parse a time, use arbitrary times for morning/afternoon/evening
              if (!activityTime) {
                activityTime = new Date(currentDate);
                if (activity.bestTime?.toLowerCase().includes('morning')) {
                  activityTime.setHours(9, 0, 0);
                } else if (activity.bestTime?.toLowerCase().includes('afternoon')) {
                  activityTime.setHours(14, 0, 0);
                } else {
                  activityTime.setHours(19, 0, 0);
                }
              }
              
              // Calculate end time based on duration or default to 2 hours
              const durationHours = activity.duration ? 
                parseFloat(activity.duration.match(/\d+\.?\d*/)?.[0] || 2) : 2;
              
              const activityEnd = new Date(activityTime);
              activityEnd.setHours(activityTime.getHours() + durationHours);
              
              allEvents.push({
                id: `activity-${trip.id}-${dayKey}-${activity.activity}`,
                title: activity.activity,
                start: activityTime,
                end: activityEnd,
                resource: {
                  type: 'activity',
                  tripId: trip.id,
                  destination: trip.tripData?.trip?.destination,
                  description: activity.description,
                  location: trip.tripData?.trip?.destination,
                  price: activity.price,
                  duration: activity.duration,
                  color: '#DC2626' // Red
                }
              });
            });
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        });
      }
    });
    
    setEvents(allEvents);
  };
  
  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    
    // If it's a trip, fetch weather data
    if (event.resource?.type === 'trip') {
      const destination = event.title.replace('Trip to ', '');
      const weatherData = await fetchWeatherFromGemini(destination, event.start);
      setWeatherData(weatherData);
    }
  };
  
  const handleExportCalendar = () => {
    setExportVisible(true);
  };
  
  // Custom event component to show colored events
  const EventComponent = ({ event }) => {
    const isActivity = event.resource?.type === 'activity';
    let backgroundColor;
    
    // Apply different color coding based on preferences
    if (calendarView.colorCoding === 'type') {
      backgroundColor = isActivity ? '#DC2626' : '#3B82F6';
    } else if (calendarView.colorCoding === 'destination') {
      // Generate color based on destination
      const destination = event.resource?.destination || '';
      const hash = destination.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const h = Math.abs(hash) % 360;
      backgroundColor = `hsl(${h}, 70%, 50%)`;
    } else if (calendarView.colorCoding === 'custom') {
      // For custom, you could allow users to set colors per trip
      backgroundColor = isActivity ? '#9333EA' : '#10B981'; // Purple for activities, green for trips
    }
    
    const isTruncated = event.title.length > 30;
    
    return (
      <div 
        className="travel-calendar-event"
        style={{ backgroundColor }}
      >
        <div className="travel-calendar-event-content">
          {isActivity && (
            <div className="travel-calendar-event-time">
              {moment(event.start).format('HH:mm')}
            </div>
          )}
          <div className="travel-calendar-event-title">
            {isTruncated ? `${event.title.substring(0, 28)}...` : event.title}
          </div>
          {isActivity && event.resource?.location && (
            <div className="travel-calendar-event-location">
              <IoLocationOutline className="inline-block mr-1" size={10} />
              {event.resource.location}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleNavigate = (date) => {
    setCalendarDate(date);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };
  const DayHeaderComponent = ({ date, label }) => {
    const isToday = moment(date).isSame(new Date(), 'day');
    
    return (
      <div className={`travel-calendar-day-header ${isToday ? 'travel-calendar-today' : ''}`}>
        <div className="travel-calendar-day-name">{moment(date).format('ddd')}</div>
        <div className="travel-calendar-day-number">{moment(date).format('D')}</div>
      </div>
    );
  };
  
  // Custom toolbar component
  const CustomToolbar = (toolbar) => {
    const navigate = (action) => {
      toolbar.onNavigate(action);
    };
    
    return (
      <div className="travel-calendar-toolbar">
        <div className="travel-calendar-toolbar-nav">
          <Button 
            variant="outline" 
            className="calendar-nav-button"
            onClick={() => navigate('TODAY')}
          >
            Today
          </Button>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              className="calendar-nav-button"
              onClick={() => navigate('PREV')}
            >
              <span>❮</span>
            </Button>
            <Button 
              variant="outline" 
              className="calendar-nav-button"
              onClick={() => navigate('NEXT')}
            >
              <span>❯</span>
            </Button>
          </div>
          
          {/* Mini calendar dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-2 calendar-nav-button">
                <IoCalendarOutline className="mr-2" />
                Jump to Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <DatePicker
                selected={calendarDate}
                onChange={date => {
                  setCalendarDate(date);
                  toolbar.onNavigate('DATE', date);
                }}
                inline
                calendarClassName="bg-gray-800 text-white"
                dayClassName={date => 
                  moment(date).isSame(new Date(), 'day') 
                    ? "bg-blue-600 text-white rounded-full" 
                    : undefined
                }
                popperClassName="date-picker-popper"
                wrapperClassName="date-picker-wrapper"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="travel-calendar-toolbar-label">
          <h2>{toolbar.label}</h2>
        </div>
        
        <div className="travel-calendar-toolbar-views">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button 
              className={`px-4 py-2 rounded-md transition ${toolbar.view === 'month' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => toolbar.onView('month')}
            >
              Month
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition ${toolbar.view === 'week' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => toolbar.onView('week')}
            >
              Week
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition ${toolbar.view === 'day' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => toolbar.onView('day')}
            >
              Day
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition ${toolbar.view === 'agenda' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              onClick={() => toolbar.onView('agenda')}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>
    );
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-[100px] pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Travel Calendar</h1>
            <p className="text-gray-400 mt-1">View and manage your travel schedule</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
  <span className="text-gray-400 text-sm">Filter:</span>
  <select 
    value={filterType} 
    onChange={e => setFilterType(e.target.value)}
    className="bg-gray-800 border-gray-700 text-white rounded-md px-3 py-1.5 text-sm"
  >
    <option value="all">All Events</option>
    <option value="trip">Trips Only</option>
    <option value="activity">Activities Only</option>
  </select>
</div>
{/* Add after your filter dropdown in the header section */}
<div className="flex items-center gap-4">
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="gap-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>View Options</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-72 p-4 bg-gray-800 border-gray-700 text-white">
      <div className="space-y-4">
        <h3 className="font-medium">Calendar Preferences</h3>
        
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <label htmlFor="showWeekends" className="text-sm">Show Weekends</label>
            <div className="relative inline-block w-10 h-5 rounded-full bg-gray-700">
              <input 
                type="checkbox" 
                id="showWeekends" 
                className="sr-only"
                checked={calendarView.showWeekends} 
                onChange={(e) => setCalendarView(prev => ({...prev, showWeekends: e.target.checked}))}
              />
              <span 
                className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${calendarView.showWeekends ? 'bg-blue-500 transform translate-x-5' : 'bg-gray-400'}`}
              ></span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="compactAgenda" className="text-sm">Compact Agenda View</label>
            <div className="relative inline-block w-10 h-5 rounded-full bg-gray-700">
              <input 
                type="checkbox" 
                id="compactAgenda" 
                className="sr-only"
                checked={calendarView.compactAgenda} 
                onChange={(e) => setCalendarView(prev => ({...prev, compactAgenda: e.target.checked}))}
              />
              <span 
                className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${calendarView.compactAgenda ? 'bg-blue-500 transform translate-x-5' : 'bg-gray-400'}`}
              ></span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Color Coding</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              className={`text-xs p-2 rounded ${calendarView.colorCoding === 'type' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setCalendarView(prev => ({...prev, colorCoding: 'type'}))}
            >
              By Type
            </button>
            <button 
              className={`text-xs p-2 rounded ${calendarView.colorCoding === 'destination' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setCalendarView(prev => ({...prev, colorCoding: 'destination'}))}
            >
              By Destination
            </button>
            <button 
              className={`text-xs p-2 rounded ${calendarView.colorCoding === 'custom' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setCalendarView(prev => ({...prev, colorCoding: 'custom'}))}
            >
              Custom
            </button>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              onClick={handleExportCalendar}
            >
              Export to Google Calendar
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="travel-calendar-container">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleEventClick}
              views={['month', 'week', 'day', 'agenda']}
              view={selectedView}
              onView={handleViewChange}
              date={calendarDate}
              onNavigate={handleNavigate}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
                day: {
                  header: DayHeaderComponent
                },
                dateCellWrapper: (props) => {
                    const { children, value } = props;
                    const isToday = moment(value).isSame(new Date(), 'day');
                    return (
                      <div style={{ position: 'relative' }}>
                        {children}
                        {isToday && <TodayIndicator />}
                      </div>
                    );
                  }
                }}
            
              eventPropGetter={(event) => {
                return {
                  style: {
                    backgroundColor: 'transparent', // Make the default background transparent
                    borderRadius: '0',
                    border: 'none',
                    color: 'white'
                  }
                };
              }}
              dayPropGetter={(date) => {
                // Highlight today and weekend days
                const isToday = moment(date).isSame(new Date(), 'day');
                const isWeekend = moment(date).day() === 0 || moment(date).day() === 6;
                const isPast = moment(date).isBefore(new Date(), 'day');
                
                let style = {};
                
                if (isToday) {
                  style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                  style.borderLeft = '3px solid #3B82F6';
                } else if (isWeekend) {
                  style.backgroundColor = 'rgba(17, 24, 39, 0.7)';
                } else if (isPast) {
                  style.backgroundColor = 'rgba(31, 41, 55, 0.7)';
                }
                
                return { style };
              }}
              formats={{
                dateFormat: 'D',
                dayFormat: 'ddd D/M',
                dayHeaderFormat: 'dddd, MMMM D',
                dayRangeHeaderFormat: ({ start, end }) => {
                  return `${moment(start).format('MMMM D')} - ${moment(end).format('MMMM D, YYYY')}`;
                },
                monthHeaderFormat: 'MMMM YYYY',
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) => {
                  return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
                },
              }}
            />
          </div>
        </div>
        
        {/* Trip Legend */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 shadow-xl">
  <h2 className="text-xl font-semibold text-white mb-4">Calendar Legend</h2>
  
  <div className="flex flex-wrap gap-6 mb-6">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
      <span className="text-gray-300">Trip Duration</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-sm bg-red-600"></div>
      <span className="text-gray-300">Activities</span>
    </div>
  </div>
  
  <div className="mt-8">
    <div className="flex items-center gap-2 mb-4">
      <IoCloudOutline className="text-blue-400 w-6 h-6" />
      <h3 className="text-lg font-medium text-white">Weather Forecast</h3>
    </div>
    
    {weatherData.forecast?.length > 0 ? (
      <>
        <div className="grid grid-cols-5 gap-2 p-4 bg-gray-900/50 rounded-lg">
          {weatherData.forecast.slice(0, 5).map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="text-sm font-medium text-gray-400 mb-2">{day.day}</div>
              <div className="flex justify-center mb-2">
                {day.iconComponent}
              </div>
              <div className="text-lg font-bold text-white">
                {day.temperature.max}°
              </div>
              <div className="text-sm text-gray-400">
                {day.temperature.min}°
              </div>
              <div className="mt-1 text-xs text-gray-500 truncate">{day.condition}</div>
            </div>
          ))}
        </div>
        
        {weatherData.climateSummary && (
          <div className="mt-3 bg-blue-900/20 border border-blue-900/30 rounded-md p-3 text-blue-300 flex items-start gap-2">
            <IoInformationCircleOutline className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">{weatherData.climateSummary}</p>
              {weatherData.travelRecommendation && (
                <p className="text-sm mt-2 font-medium">{weatherData.travelRecommendation}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500 text-right">
          *Forecast data for {weatherData.location} is for planning purposes only
        </div>
      </>
    ) : (
      <div className="p-6 bg-gray-900/50 rounded-lg">
        <div className="flex items-center justify-center flex-col">
          <div className="text-gray-500 mb-4">Select a trip to view weather forecast</div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center animate-pulse">
                <div className="h-4 w-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-10 w-10 bg-gray-700 rounded-full mb-2"></div>
                <div className="h-4 w-12 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 w-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Trip Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Upcoming Trips" 
            value={events.filter(e => e.resource?.type === 'trip' && e.start > new Date()).length} 
            icon={<IoCalendarOutline className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-600 to-blue-700"
          />
          <StatsCard 
            title="Planned Activities" 
            value={events.filter(e => e.resource?.type === 'activity').length} 
            icon={<IoTimeOutline className="w-6 h-6" />}
            color="bg-gradient-to-br from-red-600 to-red-700"
          />
          <StatsCard 
            title="Destinations" 
            value={new Set(trips.map(t => t.tripData?.trip?.destination).filter(Boolean)).size} 
            icon={<IoLocationOutline className="w-6 h-6" />}
            color="bg-gradient-to-br from-green-600 to-green-700"
          />
        </div>
      </div>

            {/* Event Details Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedEvent?.title}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <IoClose className="h-5 w-5" />
            </DialogClose>
          </DialogHeader>
          
          <div className="mt-2">
            {selectedEvent?.resource?.type === 'trip' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <IoCalendarOutline className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Trip Duration</p>
                    <p className="text-white font-medium">
                      {moment(selectedEvent.start).format('MMM D, YYYY')} - {moment(selectedEvent.end).subtract(1, 'day').format('MMM D, YYYY')}
                    </p>
                  </div>
                </div>

                
                
                
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Activities on This Trip</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {events
                      .filter(e => e.resource?.type === 'activity' && e.resource?.tripId === selectedEvent.resource.tripId)
                      .sort((a, b) => a.start - b.start)
                      .map((activity, index) => (
                        <div key={index} className="p-3 bg-gray-800 rounded-lg flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                            {moment(activity.start).format('HH:mm')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{activity.title}</p>
                            <p className="text-sm text-gray-400">
                              {moment(activity.start).format('ddd, MMM D')} • {moment(activity.start).format('HH:mm')} - {moment(activity.end).format('HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    View Full Itinerary
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Edit Trip
                  </Button>
                </div>
              </div>
            ) : (
              /* Activity Details */
              <div className="space-y-4">
                <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Badge className="bg-red-600 hover:bg-red-700">Activity</Badge>
                    <span className="text-sm text-gray-400">
                      {moment(selectedEvent?.start).format('dddd, MMMM D, YYYY')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoTimeOutline className="text-gray-400" />
                    <span className="text-white">
                      {moment(selectedEvent?.start).format('HH:mm')} - {moment(selectedEvent?.end).format('HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoLocationOutline className="text-gray-400" />
                    <span className="text-white">{selectedEvent?.resource?.location || 'Location not specified'}</span>
                  </div>
                </div>
                
                {selectedEvent?.resource?.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                    <p className="text-white">{selectedEvent.resource.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {selectedEvent?.resource?.duration && (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-white font-medium">{selectedEvent.resource.duration}</p>
                    </div>
                  )}
                  
                  {selectedEvent?.resource?.price && (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-white font-medium">{selectedEvent.resource.price}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Add to Personal Calendar
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Trip Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Export Calendar Dialog */}
      <Dialog open={exportVisible} onOpenChange={setExportVisible}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Export Calendar
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <IoClose className="h-5 w-5" />
            </DialogClose>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Select which calendar services you want to export your travel schedule to:</p>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                  <input type="checkbox" id="googleCalendar" className="mr-3" />
                  <label htmlFor="googleCalendar" className="flex-1 cursor-pointer">
                    <div className="font-medium">Google Calendar</div>
                    <div className="text-sm text-gray-400">Sync with your Google account</div>
                  </label>
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" fill="none"></path>
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
                  </svg>
                </div>
                
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                  <input type="checkbox" id="appleCalendar" className="mr-3" />
                  <label htmlFor="appleCalendar" className="flex-1 cursor-pointer">
                    <div className="font-medium">Apple Calendar</div>
                    <div className="text-sm text-gray-400">Export as .ics file</div>
                  </label>
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" fill="none"></path>
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
                  </svg>
                </div>
                
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                  <input type="checkbox" id="outlookCalendar" className="mr-3" />
                  <label htmlFor="outlookCalendar" className="flex-1 cursor-pointer">
                    <div className="font-medium">Outlook</div>
                    <div className="text-sm text-gray-400">Export as .ics file</div>
                  </label>
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" fill="none"></path>
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-300 text-sm">
                Exporting your travel calendar will create events in your preferred calendar application. 
                You can choose to export all trips or just selected ones.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => setExportVisible(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Export Selected
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Component for Stats
function StatsCard({ title, value, icon, color }) {
    return (
      <motion.div 
        className={`${color} rounded-xl p-6 shadow-lg`}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-opacity-80">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-white">
            {icon}
          </div>
        </div>
      </motion.div>
    );
  }
  
  export default TravelCalendar;