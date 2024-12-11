import React, { createContext, useContext, useState } from "react";
import translations from "./translate.json"; // Import the translations JSON file

// Create the language context
const LanguageContext = createContext();

// Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Function to change the language
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Function to fetch the translated text based on the current language
  const translate = (key) => {
    return translations[language]?.[key] || key; // Default to the key if no translation is found
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = () => {
  return useContext(LanguageContext);
};
