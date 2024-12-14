import React from "react";

const BudgetOptions = ({ options, selectedOptions, onSelect, translate }) => (
  <div>
    <h3 className="text-xl font-bold text-white mb-2">
      {translate("budgetTitle")}
    </h3>
    <div className="grid grid-cols-3 gap-5">
      {options.map((item) => (
        <button
          key={item.id}
          className={`p-4 border rounded-lg bg-gray-700 text-white relative shadow-lg transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl ${
            selectedOptions.includes(item.id) ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onSelect(item.id)}
        >
          {/* Checkmark overlay */}
          {selectedOptions.includes(item.id) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
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
          <h2 className="text-4xl">{item.icon}</h2>
          <h2 className="font-bold mb-2 text-lg">{item.title}</h2>
          <p className="text-sm text-gray-400">{item.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

export default BudgetOptions;
