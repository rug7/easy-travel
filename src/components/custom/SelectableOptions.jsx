import React from "react";

const SelectableOptions = ({
  title,
  options,
  selectedOptions,
  onSelect,
  gridCols = "grid-cols-3", // Default grid columns
}) => {
  return (
    <div>
      <p className="text-lg font-medium text-gray-200 mb-4 text-center">{title}</p>
      <div className={`grid ${gridCols} gap-4`}>
        {options.map((option) => (
          <button
            key={option.id}
            className={`w-full h-48 rounded-xl bg-cover bg-center relative shadow-lg transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl`}
            style={{
              backgroundImage: `url(${option.image})`,
            }}
            onClick={() => onSelect(option.id)}
          >
            {/* Checkmark overlay */}
            {selectedOptions.includes(option.id) && (
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
            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center text-white font-semibold text-sm bg-black/50 rounded-full py-1 px-3">
              {option.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectableOptions;
