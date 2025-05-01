// components/WeatherForecast.jsx
// components/WeatherForecast.jsx
import React, { useState, useEffect } from 'react';
import { chatSession } from '@/service/AIModal';
import dayjs from 'dayjs';
import { useAccessibility } from "@/context/AccessibilityContext";
import { 
  IoCloudOutline, 
  IoSunnyOutline, 
  IoRainyOutline, 
  IoSnowOutline, 
  IoThunderstormOutline, 
  IoInformationCircleOutline 
} from "react-icons/io5";

const WeatherForecast = ({ destination, startDate, endDate }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { colorMode } = useAccessibility();
  
  // Function to get accessible colors
  const getAccessibleColor = (colorType) => {
    const colorMap = {
      default: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        accent: '#60a5fa',
        text: '#ffffff',
        background: '#1e293b',
        border: '#475569',
      },
      protanopia: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#93c5fd',
        text: '#ffffff',
        background: '#1e293b',
        border: '#475569',
      },
      deuteranopia: {
        primary: '#1d4ed8',
        secondary: '#1e3a8a',
        accent: '#bfdbfe',
        text: '#ffffff',
        background: '#1e293b',
        border: '#475569',
      },
      tritanopia: {
        primary: '#4f46e5',
        secondary: '#4338ca',
        accent: '#a5b4fc',
        text: '#ffffff',
        background: '#1e293b',
        border: '#475569',
      },
      monochromacy: {
        primary: '#4b5563',
        secondary: '#374151',
        accent: '#6b7280',
        text: '#ffffff',
        background: '#1e293b',
        border: '#475569',
      }
    };
    
    return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
  };

  // Check if the trip is within 7 days
  const isWithinSevenDays = () => {
    const today = dayjs();
const tripStart = dayjs(startDate);
return tripStart.diff(today, 'day') <= 7;

  };

  // Get weather title based on timeframe
  const getWeatherTitle = () => {
    if (isWithinSevenDays()) {
      return `Weather Forecast for ${destination}`;
    }
    return `Average Weather Conditions for ${destination}`;
  };

  useEffect(() => {
    if (destination && startDate) {
      fetchWeatherData();
    }
  }, [destination, startDate]);
  
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
            
      // Format prompt for weather forecast
      const prompt = `Generate realistic weather forecast data for "${destination}" starting from ${dayjs(startDate).format('YYYY-MM-DD')}
 for the next 7 days. 
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
            "precipitation": percentage chance of precipitation
          },
          ... (for 7 days)
        ],
        "summary": "A brief 1-2 sentence summary of the week's weather pattern",
        "recommendation": "A brief travel recommendation based on the forecast"
      }
      
      Base your forecast on typical weather patterns for ${destination} during ${dayjs(startDate).format('MMMM')}.
      Include realistic variations in temperature and conditions across the week.
      Only return the JSON object without explanations.`;
      
      // Fixed: Use proper response handling
      const result = await chatSession.sendMessage([{ text: prompt }]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("Could not extract valid JSON from the response");
      }
      
      const jsonStr = text.substring(jsonStart, jsonEnd);
      const data = JSON.parse(jsonStr);
      
      setWeatherData(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Unable to fetch weather forecast. Using typical conditions.");
      
      // Fallback to typical weather data
      setWeatherData(generateFallbackWeather(destination, startDate));
    } finally {
      setLoading(false);
    }
  };
  
  const generateFallbackWeather = (destination, startDate) => {
    // Generate realistic fallback weather based on destination
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const forecastDate = new Date(startDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Simple logic to generate different conditions based on destination name
      let conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
      let conditionIndex = (destination.charCodeAt(0) + i) % conditions.length;
      let condition = conditions[conditionIndex];
      
      // Generate reasonable temperature ranges based on first letter of destination
      const baseTemp = (destination.charCodeAt(0) % 15) + 15; // 15-30°C base
      const minTemp = baseTemp - (Math.random() * 5 + 3);
      const maxTemp = baseTemp + (Math.random() * 5 + 2);
      
      return {
        date: dayjs(forecastDate).format('YYYY-MM-DD'),
        day: dayjs(forecastDate).format('ddd'),
        temperature: {
          min: Math.round(minTemp),
          max: Math.round(maxTemp)
        },
        condition: condition,
        humidity: Math.floor(Math.random() * 30) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        precipitation: condition === 'Rainy' ? Math.floor(Math.random() * 60) + 30 : Math.floor(Math.random() * 20)
      };
    });
    
    return {
      location: destination,
      forecast: forecast,
      summary: `Typical ${forecast[0].condition.toLowerCase()} conditions for ${destination} in ${dayjs(startDate).format('MMMM')}.`,
      recommendation: "Pack layers and be prepared for changing conditions."
    };
  };

  // Helper function to map weather conditions to icon components
  // Modified getWeatherIcon function with color-blind friendly colors
  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    const iconColor = getAccessibleColor('accent');
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <IoSunnyOutline className="w-10 h-10" style={{ color: iconColor }} />;
    } else if (conditionLower.includes('partly cloudy')) {
      return (
        <div className="relative">
          <IoSunnyOutline className="w-8 h-8 absolute -top-1 -left-1" style={{ color: iconColor }} />
          <IoCloudOutline className="w-10 h-10" style={{ color: getAccessibleColor('secondary') }} />
        </div>
      );
    } else if (conditionLower.includes('cloud')) {
      return <IoCloudOutline className="w-10 h-10 text-gray-400" />;
    } else if (conditionLower.includes('thunder')) {
      return <IoThunderstormOutline className="w-10 h-10 text-yellow-500" />;
    } else if (conditionLower.includes('rain')) {
      return <IoRainyOutline className="w-10 h-10 text-blue-400" />;
    } else if (conditionLower.includes('snow')) {
      return <IoSnowOutline className="w-10 h-10 text-white" />;
    } else {
      return <IoCloudOutline className="w-10 h-10" style={{ color: getAccessibleColor('secondary') }} />;

    }
  };
  
  if (loading) {
    return (
      <div className="my-8 rounded-xl shadow-md p-6 animate-pulse"
           style={{ backgroundColor: getAccessibleColor('background') }}>
        <h2 className="text-xl font-semibold mb-4 bg-gray-700 h-7 w-48 rounded"></h2>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-5 w-10 bg-gray-700 rounded mb-2"></div>
              <div className="h-10 w-10 bg-gray-700 rounded-full mb-2"></div>
              <div className="h-6 w-14 bg-gray-700 rounded mb-1"></div>
              <div className="h-5 w-10 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!weatherData) return null;
  
  return (
    <div className="my-8 rounded-xl shadow-md overflow-hidden"
         style={{ backgroundColor: getAccessibleColor('background') }}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ color: getAccessibleColor('text') }}>
          <IoCloudOutline className="w-6 h-6" style={{ color: getAccessibleColor('primary') }} />
          {getWeatherTitle()}
        </h2>

        {/* Forecast Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-6">
          {weatherData.forecast.map((day, idx) => (
            <div key={idx}
                 className={`p-4 rounded-lg text-center transition-all`}
                 style={{
                   backgroundColor: idx === 0 ? `${getAccessibleColor('primary')}20` : `${getAccessibleColor('secondary')}10`,
                   borderColor: idx === 0 ? getAccessibleColor('primary') : 'transparent',
                   borderWidth: idx === 0 ? '1px' : '0'
                 }}>
              <div className="text-sm font-medium mb-2"
                   style={{ color: getAccessibleColor('accent') }}>
                {day.day}
              </div>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-lg font-bold"
                   style={{ color: getAccessibleColor('text') }}>
                {day.temperature.max}°C
              </div>
              <div className="text-sm"
                   style={{ color: getAccessibleColor('accent') }}>
                {day.temperature.min}°C
              </div>
              <div className="mt-1 text-xs font-medium"
                   style={{ color: getAccessibleColor('text') }}>
                {day.condition}
              </div>
              <div className="mt-2 flex justify-between text-xs"
                   style={{ color: getAccessibleColor('accent') }}>
                <span>💧 {day.precipitation}%</span>
                <span>💨 {day.windSpeed}km/h</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary and Recommendations */}
        <div className="rounded-lg p-4 flex items-start gap-3"
             style={{
               backgroundColor: `${getAccessibleColor('primary')}20`,
               borderColor: getAccessibleColor('primary'),
               borderWidth: '1px'
             }}>
          <IoInformationCircleOutline 
            className="w-6 h-6 flex-shrink-0 mt-0.5"
            style={{ color: getAccessibleColor('primary') }}
          />
          <div>
            <p className="text-sm" style={{ color: getAccessibleColor('accent') }}>
              {weatherData.summary}
            </p>
            {weatherData.recommendation && (
              <p className="text-sm mt-2 font-medium"
                 style={{ color: getAccessibleColor('text') }}>
                {weatherData.recommendation}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 text-xs text-right"
             style={{ color: getAccessibleColor('accent') }}>
          *{isWithinSevenDays() 
             ? 'Forecast data is for planning purposes only. Check local weather before activities.'
             : 'Historical average conditions. Actual weather may vary.'}
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;