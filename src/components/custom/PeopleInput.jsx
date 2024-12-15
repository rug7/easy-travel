import React from "react";

const PeopleInput = ({ options, selectedOptions, onSelect, title }) => (
  <div>
    <h3 className="text-xl font-bold text-white mb-4 text-center">
      {title}
    </h3>
    <div className="grid grid-cols-4 gap-5">
      {options.map((item) => (
        <button
          key={item.id}
          className={`w-full h-48 rounded-xl bg-cover bg-center relative shadow-lg transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl ${
            selectedOptions.includes(item.id) ? "ring-2 ring-blue-500" : ""
          }`}
          style={{
            backgroundImage: `url(${item.image})`, // Use image as background
          }}
          onClick={() => onSelect(item.id)}
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
        </button>
      ))}
    </div>
  </div>
);

export default PeopleInput;
