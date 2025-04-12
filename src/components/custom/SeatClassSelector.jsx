import React from 'react';

const SeatClassSelector = ({ selected, onSelect, options }) => {
  return (
    <div className="flex gap-4 justify-center">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`
            px-6 py-3 rounded-full flex items-center gap-2
            transition-all duration-300 transform hover:scale-105
            ${selected === option.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300'
            }
          `}
        >
          <span>{option.icon}</span>
          <span>{option.title}</span>
        </button>
      ))}
    </div>
  );
};

export default SeatClassSelector;
