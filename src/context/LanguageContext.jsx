// LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import languageData from './translate.json';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [listeners, setListeners] = useState([]);

  const changeLanguage = (newLanguage) => {
    localStorage.setItem('language', newLanguage);
    setLanguage(newLanguage);
    // Notify all listeners about the language change
    listeners.forEach(listener => listener(newLanguage));
  };

  const translate = (key, params = {}) => {
    const keys = key.split('.');
    let value = languageData[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        let englishValue = languageData['en'];
        for (const k of keys) {
          if (englishValue && englishValue[k]) {
            englishValue = englishValue[k];
          } else {
            return key; // Return the key if no translation found in English either
          }
        }
        value = englishValue;
      }
    }
    
    // Replace parameters in the translation string
    if (params && typeof value === 'string') {
      Object.keys(params).forEach(param => {
        const regex = new RegExp(`{${param}}`, 'g');
        value = value.replace(regex, params[param]);
      });
    }
    
    return value;
  };

  // Add a listener function that components can subscribe to
  const addLanguageChangeListener = (callback) => {
    setListeners(prev => [...prev, callback]);
    return () => {
      setListeners(prev => prev.filter(listener => listener !== callback));
    };
  };

  const value = {
    language,
    changeLanguage,
    translate,
    addLanguageChangeListener,
    isRTL: language === 'he',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);