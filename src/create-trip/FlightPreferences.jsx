import { motion } from "framer-motion";
import React from "react";

// Add these animations outside the component
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const FlightPreferences = ({ translate, tripType, setTripType, seatClass, setSeatClass, isRTL }) => {
  return (
    <motion.div
      className={`space-y-6 bg-gray-900/50 p-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/70 ${isRTL ? 'rtl' : 'ltr'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center gap-2 mb-6"
        variants={itemVariants}
      >
        <svg 
          className="w-6 h-6 text-blue-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
          />
        </svg>
        <h3 className="text-xl font-bold text-white">
          {translate("flightPreferences")}
        </h3>
      </motion.div>

      {/* Trip Type Selection */}
      <motion.div 
        className="space-y-4"
        variants={itemVariants}
      >
        <label className="text-sm text-gray-400 block">
          {translate("selectTripType")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-md">
          {[
            { id: 'roundTrip', icon: '🔄', title: translate("roundTrip") },
            { id: 'oneWay', icon: '➡️', title: translate("oneWay") }
          ].map((option) => (
            <motion.button
              key={option.id}
              onClick={() => setTripType(option.id)}
              className={`
                flex items-center justify-center gap-2 p-4 
                rounded-xl transition-all duration-300
                ${tripType === option.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
              whileHover={{ scale: tripType === option.id ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={option.title}
              role="radio"
              aria-checked={tripType === option.id}
            >
              <span className="text-xl">{option.icon}</span>
              <span className="font-medium">{option.title}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Seat Class Selection */}
      <motion.div 
        className="space-y-4 mt-6"
        variants={itemVariants}
      >
        <label className="text-sm text-gray-400 block">
          {translate("selectSeatClass")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'ECONOMY', icon: '💺', title: translate("economy") },
            { id: 'BUSINESS', icon: '🛋️', title: translate("business") },
            { id: 'FIRST', icon: '👑', title: translate("first") }
          ].map((option) => (
            <motion.button
              key={option.id}
              onClick={() => setSeatClass(option.id)}
              className={`
                flex items-center justify-center gap-2 p-3
                rounded-xl transition-all duration-300
                ${seatClass === option.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
              whileHover={{ scale: seatClass === option.id ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={option.title}
              role="radio"
              aria-checked={seatClass === option.id}
            >
              <span className="text-xl">{option.icon}</span>
              <span className="font-medium">{option.title}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div 
        className="mt-6 p-4 bg-gray-800/50 rounded-lg"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 text-gray-400">
          <svg 
            className="w-5 h-5 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-sm">{translate("flightPreferencesInfo")}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlightPreferences;