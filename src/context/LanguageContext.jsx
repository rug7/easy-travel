import React, { createContext, useContext, useState } from "react";
import translations from "./translate.json";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const translate = (key) => {
    // Support for nested keys like "loadingScreen.findingDestination"
    const keys = key.split('.');
    let value = translations[language];
    
    // Traverse the nested structure
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // If key not found, return the original key
        return key;
      }
    }
    
    return value;
  };

  const isRTL = () => language === "he"; // Add this to determine if the language is RTL

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translate, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
