// src/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingScreen = ({ progress, tripData, onComplete }) => {
  const [dots, setDots] = useState('');
  const navigate = useNavigate();
  
  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Navigate to trip view when complete
  useEffect(() => {
    if (progress.completed && tripData?.id) {
      setTimeout(() => {
        onComplete();
        navigate(`/view-trip/${tripData.id}`);
      }, 1000);
    }
  }, [progress.completed, tripData, navigate, onComplete]);
  
  // Get loading message based on current progress
  const getLoadingMessage = () => {
    if (progress.destination) return "Finding your perfect destination";
    if (progress.flights) return "Searching for the best flights";
    if (progress.hotels) return "Discovering amazing accommodations";
    if (progress.activities) {
      if (progress.currentDay && progress.totalDays) {
        return `Planning activities for day ${progress.currentDay} of ${progress.totalDays}`;
      }
      return "Planning exciting activities";
    }
    if (progress.finalizing) return "Finalizing your perfect trip";
    return "Preparing your adventure";
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      {/* Animated globe */}
      <div className="w-64 h-64 mb-8 relative">
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-4 bg-blue-600 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute inset-8 bg-blue-700 rounded-full opacity-40 animate-pulse delay-100"></div>
        <div className="absolute inset-12 bg-blue-800 rounded-full opacity-50 animate-pulse delay-200"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-32 h-32 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      {/* Progress text */}
      <h2 className="text-2xl font-bold text-white mb-2">{getLoadingMessage()}{dots}</h2>
      
      {/* Progress bar */}
      <div className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ 
            width: `${calculateProgress(progress)}%` 
          }}
        ></div>
      </div>
      
      {/* Progress details */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <ProgressItem 
          label="Destination" 
          complete={progress.destination} 
          current={!progress.destination && !progress.flights && !progress.hotels && !progress.activities}
        />
        <ProgressItem 
          label="Flights" 
          complete={progress.flights} 
          current={progress.destination && !progress.flights}
        />
        <ProgressItem 
          label="Hotels" 
          complete={progress.hotels} 
          current={progress.flights && !progress.hotels}
        />
        <ProgressItem 
          label="Activities" 
          complete={progress.activities} 
          current={progress.hotels && !progress.activities}
        />
      </div>
      
      {progress.currentDay > 0 && progress.totalDays > 0 && (
        <div className="mt-4 text-blue-400">
          <span className="font-medium">Day {progress.currentDay}</span> of {progress.totalDays}
        </div>
      )}
      
      <p className="text-gray-400 mt-8 text-sm max-w-md text-center">
        We're crafting a personalized travel experience just for you. This may take a minute or two.
      </p>
    </div>
  );
};

// Helper component for progress items
const ProgressItem = ({ label, complete, current }) => (
  <div className="flex flex-col items-center">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
      complete ? 'bg-green-500 text-white' : 
      current ? 'bg-blue-500 text-white animate-pulse' : 
      'bg-gray-700 text-gray-500'
    }`}>
      {complete ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : current ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <span>{label.charAt(0)}</span>
      )}
    </div>
    <span className={`text-xs ${
      complete ? 'text-green-400' : 
      current ? 'text-blue-400' : 
      'text-gray-500'
    }`}>
      {label}
    </span>
  </div>
);

// Calculate overall progress percentage
const calculateProgress = (progress) => {
  let percent = 0;
  if (progress.destination) percent += 25;
  if (progress.flights) percent += 25;
  if (progress.hotels) percent += 25;
  if (progress.activities) percent += 25;
  
  // If we're in the activities phase, calculate based on days
  if (progress.currentDay && progress.totalDays && progress.hotels && !progress.activities) {
    const activityPercent = 25 * (progress.currentDay / progress.totalDays);
    percent = 75 + activityPercent;
  }
  
  return percent;
};

export default LoadingScreen;