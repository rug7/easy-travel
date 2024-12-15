import React, { useState } from "react";

const PeopleInput = ({ options, selectedOptions, onSelect, title }) => {
  const [hoveredId, setHoveredId] = useState(null); // Track which image is hovered

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        {title}
      </h3>
      <div className="grid grid-cols-4 gap-5">
        {options.map((item) => (
          <button
            key={item.id}
            className={`w-full h-48 rounded-xl bg-cover bg-center relative shadow-lg transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl ${
              selectedOptions.includes(item.id) ? "" : ""
            }`}
            style={{
              backgroundImage: `url(${item.image})`,
            }}
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => setHoveredId(item.id)} // Trigger hover effect
            onMouseLeave={() => setHoveredId(null)} // Remove hover effect
          >
            {/* Checkmark overlay */}
            {selectedOptions.includes(item.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {/* Title Overlay */}
            <span className="absolute bottom-0 left-0 w-full text-center text-white font-semibold text-sm bg-black/65 rounded-b-xl py-1.5">
              {item.title}
            </span>

            {/* Description Overlay on Hover */}
            {hoveredId === item.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                <p className="text-white font-medium text-center px-4">
                  {item.desc} {/* Add descriptions to your options */}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeopleInput;
