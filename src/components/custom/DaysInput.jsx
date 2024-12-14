import React from "react";
import DatePicker from "react-datepicker";

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
      setNumDays("");
    } else {
      setUseDates(false);
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {translate("daysPlanningTitle")}
      </h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        {/* Flex container for inputs */}
        <div className="flex gap-6">
          {/* Number of Days Input */}
          <div className="flex-1">
            <button
              onClick={() => handleToggle("days")}
              className={`px-4 py-2 rounded-full text-white font-bold ${
                !useDates ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              {translate("numberOfDays")}
            </button>
            <input
              type="number"
              value={numDays}
              onChange={(e) => setNumDays(e.target.value)}
              placeholder={translate("numberOfDays")}
              className={`w-full px-4 py-2 bg-gray-700 text-white rounded-full mt-3 ${
                useDates ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={useDates}
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex-1">
            <button
              onClick={() => handleToggle("dates")}
              className={`px-4 py-2 rounded-full text-white font-bold ${
                useDates ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              {translate("pickDates")}
            </button>
            <div
              className={`mt-3 ${
                !useDates ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <DatePicker
                selected={startDate}
                onChange={(update) => {
                  setStartDate(update[0]);
                  setEndDate(update[1]);
                }}
                startDate={startDate}
                endDate={endDate}
                dateFormat={"dd/MM/yyyy"}
                selectsRange
                placeholderText={translate("startEndDate")}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-full shadow-md"
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
