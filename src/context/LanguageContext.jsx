import React, { createContext, useContext, useState } from "react";
import translations from "./translate.json";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const translate = (key) => {
    return translations[language]?.[key] || key;
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
