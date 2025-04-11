import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DaysInput = ({
  translate,
  useDates,
  setUseDates,
  numDays,
  setNumDays,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const handleToggle = (option) => {
    if (option === "dates") {
      setUseDates(true);
      setNumDays(""); // Reset number input
    } else {
      setUseDates(false);
      setStartDate(null);
      setEndDate(null); // Reset date input
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    
    // Set the time to the start of the day (midnight) to ensure consistent calculations
    if (start) {
      start.setHours(0, 0, 0, 0);
    }
    if (end) {
      end.setHours(0, 0, 0, 0);
    }

    setStartDate(start);
    setEndDate(end);

    // Calculate the number of days if both start and end dates are selected
    if (start && end) {
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
      setNumDays(daysDiff.toString());
    } else {
      setNumDays("");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {translate("daysPlanningTitle")}
      </h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Number of Days Input */}
          <div className="flex-1">
            <button
              onClick={() => handleToggle("days")}
              className={`px-4 py-2 rounded-full text-white font-bold transition-all duration-300 ${
                !useDates ? "bg-blue-600 scale-105 shadow-md" : "bg-gray-600"
              }`}
            >
              {translate("numberOfDays")}
            </button>
            <input
              type="number"
              value={numDays}
              onChange={(e) => setNumDays(e.target.value)}
              placeholder={translate("numberOfDays")}
              className={`w-full px-4 py-2 mt-3 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                useDates ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={useDates}
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex-1">
            <button
              onClick={() => handleToggle("dates")}
              className={`px-4 py-2 rounded-full text-white font-bold transition-all duration-300 ${
                useDates ? "bg-blue-600 scale-105 shadow-md" : "bg-gray-600"
              }`}
            >
              {translate("pickDates")}
            </button>
            <div className="mt-3">
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                selectsRange
                placeholderText={translate("startEndDate")}
                className={`w-full px-4 py-2 bg-gray-700 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  !useDates ? "opacity-50 cursor-not-allowed" : ""
                }`}
                isClearable
                disabled={!useDates}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaysInput;