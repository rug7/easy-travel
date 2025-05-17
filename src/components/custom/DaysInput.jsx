import React, { useState } from "react";
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
  language,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  

  const getTranslatedMonths = () => {
    return [
      translate("months.january"),
      translate("months.february"),
      translate("months.march"),
      translate("months.april"),
      translate("months.may"),
      translate("months.june"),
      translate("months.july"),
      translate("months.august"),
      translate("months.september"),
      translate("months.october"),
      translate("months.november"),
      translate("months.december")
    ];
  };
    const translatedMonths = getTranslatedMonths();


  // Get number of days in selected month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateRandomDates = (month, year, days) => {
    if (!days) return;
    
    const daysInMonth = getDaysInMonth(month, year);
    const maxStartDay = daysInMonth - parseInt(days) + 1;
    const randomStartDay = Math.floor(Math.random() * maxStartDay) + 1;
    
    // Create dates at midnight UTC to avoid timezone issues
    const start = new Date(Date.UTC(year, month, randomStartDay));
    const end = new Date(Date.UTC(year, month, randomStartDay + parseInt(days) - 1));
    
    setStartDate(start);
    setEndDate(end);
  
    console.log('Generated Dates:', {
      start: start.toISOString(),
      end: end.toISOString(),
    });
  };

  const handleToggle = (option) => {
    if (option === "dates") {
      setUseDates(true);
      setNumDays("");
      setStartDate(null);
      setEndDate(null);
    } else {
      setUseDates(false);
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    
    if (start) {
      start.setHours(0, 0, 0, 0);
    }
    if (end) {
      end.setHours(0, 0, 0, 0);
    }

    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      setNumDays(daysDiff.toString());
    } else {
      setNumDays("");
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setSelectedMonth(newMonth);
    if (numDays) {
      generateRandomDates(newMonth, selectedYear, numDays);
    }
  };

  const handleDaysChange = (e) => {
    const days = e.target.value;
    setNumDays(days);
    if (days) {
      generateRandomDates(selectedMonth, selectedYear, days);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {translate("daysPlanningTitle")}
      </h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Number of Days and Month Selection */}
          <div className="flex-1">
            <button
              onClick={() => handleToggle("days")}
              className={`px-4 py-2 rounded-full text-white font-bold transition-all duration-300 ${
                !useDates ? "bg-blue-600 scale-105 shadow-md" : "bg-gray-600"
              }`}
            >
              {translate("numberOfDays")}
            </button>
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                value={numDays}
                onChange={handleDaysChange}
                placeholder={translate("numberOfDays")}
                className={`flex-1 px-4 py-2 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  useDates ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={useDates}
                min="1"
                max={getDaysInMonth(selectedMonth, selectedYear)}
              />
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className={`flex-1 px-4 py-2 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  useDates ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={useDates}
              >
                {translatedMonths.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            {startDate && !useDates && (
              <p className="text-gray-300 mt-2 text-sm">
                {`${formatDate(startDate)} - ${formatDate(endDate)}`}
              </p>
            )}
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
                // Add localization for DatePicker
                locale={language}
                // Optional: Customize month names in the datepicker
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="flex justify-between px-2 py-2">
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      type="button"
                      className="bg-gray-700 rounded-full p-1"
                    >
                      {"<"}
                    </button>
                    <select
                      value={date.getFullYear()}
                      onChange={({ target: { value } }) => changeYear(value)}
                      className="bg-gray-700 text-white rounded px-2"
                    >
                      {Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i).map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      value={date.getMonth()}
                      onChange={({ target: { value } }) => changeMonth(value)}
                      className="bg-gray-700 text-white rounded px-2"
                    >
                      {translatedMonths.map((option, i) => (
                        <option key={i} value={i}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      type="button"
                      className="bg-gray-700 rounded-full p-1"
                    >
                      {">"}
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaysInput;