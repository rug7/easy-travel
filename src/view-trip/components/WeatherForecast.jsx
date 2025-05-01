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
        // Professional colors matching website theme
        background: '#1e1e2d', // Dark background matching website
        cardBg: '#2b2b40', // Slightly lighter for cards
        highlightCardBg: '#2A2A42', // Highlighted card
        selectedBorder: '#3699FF', // Bright blue for accents (matching your website's buttons)
        text: '#ffffff',
        lightText: '#92929F',
        border: '#3699FF',
        sunny: '#fbbf24',
        cloudy: '#94a3b8',
        rainy: '#38bdf8',
        thunderstorm: '#f59e0b',
        snow: '#e2e8f0',
        primary: '#3699FF', // Matching your website's primary blue
        accent: '#60a5fa',
        infoBoxBg: '#1b1b29', // Slightly darker for info box
        containerBorder: '#2b2b40',
      },
      protanopia: {
        // Protanopia-friendly colors
        background: '#0f172a',
        cardBg: '#1e293b',
        highlightCardBg: '#172554',
        text: '#ffffff',
        lightText: '#94a3b8',
        border: '#2563eb',
        sunny: '#93c5fd',
        cloudy: '#64748b',
        rainy: '#2563eb',
        thunderstorm: '#60a5fa',
        snow: '#e2e8f0',
        primary: '#2563eb',
        accent: '#93c5fd',
      },
      deuteranopia: {
        // Deuteranopia-friendly colors
        background: '#0f172a',
        cardBg: '#1e293b',
        highlightCardBg: '#172554',
        text: '#ffffff',
        lightText: '#94a3b8',
        border: '#475569',
        sunny: '#bfdbfe', // Light blue instead of yellow
        cloudy: '#64748b', // Mid-gray
        rainy: '#1d4ed8', // Darker blue
        thunderstorm: '#2563eb', // Medium blue
        snow: '#e2e8f0', // Light gray
        primary: '#1d4ed8',
        secondary: '#1e3a8a',
        accent: '#bfdbfe',
      },
      tritanopia: {
        // Tritanopia-friendly colors
        background: '#0f172a',
        cardBg: '#1e293b',
        highlightCardBg: '#172554',
        text: '#ffffff',
        lightText: '#94a3b8',
        border: '#475569',
        sunny: '#a5b4fc', // Light purple instead of yellow
        cloudy: '#64748b',
        rainy: '#4f46e5', // Purple
        thunderstorm: '#4338ca', // Dark purple
        snow: '#e2e8f0',
        primary: '#4f46e5',
        secondary: '#4338ca',
        accent: '#a5b4fc',
      },
      monochromacy: {
        // Monochrome-friendly colors
        background: '#0f172a',
        cardBg: '#1e293b',
        highlightCardBg: '#172554',
        text: '#ffffff',
        lightText: '#94a3b8',
        border: '#475569',
        sunny: '#9ca3af', // Light gray
        cloudy: '#6b7280', // Mid gray
        rainy: '#4b5563', // Darker gray
        thunderstorm: '#374151', // Very dark gray
        snow: '#e2e8f0', // Very light gray
        primary: '#4b5563',
        secondary: '#374151',
        accent: '#6b7280',
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

  // Modified getWeatherIcon function with color-blind friendly colors
  const getColorBlindIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <IoSunnyOutline className="w-10 h-10" style={{ color: getAccessibleColor('sunny') }} />;
    } else if (conditionLower.includes('partly cloudy')) {
      return (
        <div className="relative">
          <IoSunnyOutline 
            className="w-8 h-8 absolute -top-1 -left-1" 
            style={{ color: getAccessibleColor('sunny') }}
          />
          <IoCloudOutline 
            className="w-10 h-10" 
            style={{ color: getAccessibleColor('cloudy') }}
          />
        </div>
      );
    } else if (conditionLower.includes('cloud')) {
      return <IoCloudOutline 
        className="w-10 h-10" 
        style={{ color: getAccessibleColor('cloudy') }}
      />;
    } else if (conditionLower.includes('thunder')) {
      return <IoThunderstormOutline 
        className="w-10 h-10" 
        style={{ color: getAccessibleColor('thunderstorm') }}
      />;
    } else if (conditionLower.includes('rain')) {
      return <IoRainyOutline 
        className="w-10 h-10" 
        style={{ color: getAccessibleColor('rainy') }}
      />;
    } else if (conditionLower.includes('snow')) {
      return <IoSnowOutline 
        className="w-10 h-10" 
        style={{ color: getAccessibleColor('snow') }}
      />;
    } else {
      return <IoCloudOutline 
        className="w-10 h-10" 
        style={{ color: getAccessibleColor('cloudy') }}
      />;
    }
};

// Updated getWeatherIcon function to use the color-blind handling
const getWeatherIcon = (condition) => {
    if (colorMode === 'default') {
        return getColorBlindIcon(condition); // Will use default colors
    } else {
        return getColorBlindIcon(condition); // Will use color-blind friendly colors
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
    <div className="my-8 rounded-xl shadow-lg overflow-hidden border"
         style={{ 
             backgroundColor: getAccessibleColor('background'),
             borderColor: getAccessibleColor('containerBorder'),
         }}>
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: getAccessibleColor('text') }}>
                <IoCloudOutline 
                    className="w-6 h-6" 
                    style={{ color: getAccessibleColor('primary') }} 
                />
                {getWeatherTitle()}
            </h2>
  
        {/* Forecast Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
          {weatherData.forecast.map((day, idx) => (
            <div key={idx}
                 className="p-4 rounded-xl text-center transition-all"
                 style={{
                   backgroundColor: idx === 0 ? getAccessibleColor('highlightBg') : getAccessibleColor('cardBg'),
                   borderColor: idx === 0 ? getAccessibleColor('border') : 'transparent',
                   borderWidth: idx === 0 ? '1px' : '0'
                 }}>
              <div className="text-sm font-medium mb-3"
                   style={{ color: getAccessibleColor('lightText') }}>
                {day.day}
              </div>
              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-2xl font-bold mb-1"
                   style={{ color: getAccessibleColor('text') }}>
                {day.temperature.max}°C
              </div>
              <div className="text-sm mb-2"
                   style={{ color: getAccessibleColor('lightText') }}>
                {day.temperature.min}°C
              </div>
              <div className="text-sm font-medium mb-2"
                   style={{ color: getAccessibleColor('text') }}>
                {day.condition}
              </div>
              <div className="flex justify-between text-xs"
                   style={{ color: getAccessibleColor('lightText') }}>
                <span>💧 {day.precipitation}%</span>
                <span>💨 {day.windSpeed}km/h</span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Summary and Recommendations */}
        <div className="rounded-xl p-5 flex items-start gap-4"
             style={{
               backgroundColor: getAccessibleColor('highlightBg'),
               borderColor: getAccessibleColor('border'),
               borderWidth: '1px'
             }}>
          <IoInformationCircleOutline 
            className="w-6 h-6 flex-shrink-0 mt-0.5"
            style={{ color: getAccessibleColor('iconPrimary') }}
          />
          <div>
            <p className="text-sm leading-relaxed" 
               style={{ color: getAccessibleColor('lightText') }}>
              {weatherData.summary}
            </p>
            {weatherData.recommendation && (
              <p className="text-sm mt-3 font-medium"
                 style={{ color: getAccessibleColor('text') }}>
                {weatherData.recommendation}
              </p>
            )}
          </div>
        </div>
  
        <div className="mt-3 text-xs text-right"
             style={{ color: getAccessibleColor('lightText') }}>
          *{isWithinSevenDays() 
             ? 'Forecast data is for planning purposes only. Check local weather before activities.'
             : 'Historical average conditions. Actual weather may vary.'}
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;