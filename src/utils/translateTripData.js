// translateTripData.js
export const translateTripDetails = (trip, currentLanguage) => {
  // Translate the full trip object
  const translatedTrip = translateTripData(trip, currentLanguage);
  
  // Additional translations for dashboard display
  if (translatedTrip.tripData?.trip?.duration) {
    // If duration contains a number followed by "days", translate just the "days" part
    const durationMatch = translatedTrip.tripData.trip.duration.match(/(\d+)\s*(days|ימים|días|dias|jours|giorni)/i);
    
    if (durationMatch) {
      const daysTranslation = {
        "en": "days",
        "he": "ימים",
        "es": "días",
        "pt": "dias",
        "fr": "jours",
        "it": "giorni"
      };
      
      if (currentLanguage && daysTranslation[currentLanguage]) {
        translatedTrip.tripData.trip.duration = `${durationMatch[1]} ${daysTranslation[currentLanguage]}`;
      }
    }
  }
  
  return translatedTrip;
};
export const translateTripData = (data, currentLanguage) => {
    // Define mappings to normalize values to English
    const budgetMappings = {
      "Barato": "Cheap",
      "Moderado": "Moderate",
      "Lujo": "Luxury",
      "Bon marché": "Cheap",
      "Modéré": "Moderate",
      "Luxe": "Luxury",
      "Economico": "Cheap",
      "Moderato": "Moderate",
      "Lusso": "Luxury",
      "Barato": "Cheap",
      "Moderado": "Moderate",
      "Luxo": "Luxury",
      "זול": "Cheap",
      "בינוני": "Moderate",
      "יוקרה": "Luxury",
      // Handle the case where Hebrew full phrases come in
      "תקציב זול": "Cheap",
      "תקציב בינוני": "Moderate",
      "תקציב יוקרה": "Luxury"
    };
  
    const travelerMappings = {
      "Solo Yo": "Just Me",
      "Una Pareja": "A Couple",
      "Familia": "Family",
      "Amigos": "Friends",
      "Apenas eu": "Just Me",
      "Um Casal": "A Couple",
      "Família": "Family",
      "Amigos": "Friends",
      "Juste moi": "Just Me", 
      "Un Couple": "A Couple",
      "Famille": "Family",
      "Amis": "Friends",
      "Solo io": "Just Me",
      "Una Coppia": "A Couple",
      "Famiglia": "Family",
      "Amici": "Friends",
      "רק אני": "Just Me",
      "זוג": "A Couple",
      "משפחה": "Family",
      "חברים": "Friends"
    };
  
    // Define direct translation mappings for each language
    const budgetTranslations = {
      "he": {
        "Cheap": "זול",         // Changed from "תקציב זול" to just "זול"
        "Moderate": "בינוני",    // Changed from "תקציב בינוני" to just "בינוני"
        "Luxury": "יוקרה"       // Changed from "תקציב יוקרה" to just "יוקרה"
      },
      "es": {
        "Cheap": "Barato",
        "Moderate": "Moderado",
        "Luxury": "Lujo"
      },
      "pt": {
        "Cheap": "Barato",
        "Moderate": "Moderado",
        "Luxury": "Luxo"
      },
      "fr": {
        "Cheap": "Bon marché",
        "Moderate": "Modéré",
        "Luxury": "Luxe"
      },
      "it": {
        "Cheap": "Economico",
        "Moderate": "Moderato",
        "Luxury": "Lusso"
      }
    };
  
    const travelerTranslations = {
      "he": {
        "Just Me": "רק אני",
        "A Couple": "זוג",
        "Family": "משפחה",
        "Friends": "חברים"
      },
      "es": {
        "Just Me": "Solo Yo",
        "A Couple": "Una Pareja",
        "Family": "Familia",
        "Friends": "Amigos"
      },
      "pt": {
        "Just Me": "Apenas eu",
        "A Couple": "Um Casal",
        "Family": "Família",
        "Friends": "Amigos"
      },
      "fr": {
        "Just Me": "Juste moi",
        "A Couple": "Un Couple",
        "Family": "Famille",
        "Friends": "Amis"
      },
      "it": {
        "Just Me": "Solo io",
        "A Couple": "Una Coppia",
        "Family": "Famiglia",
        "Friends": "Amici"
      }
    };
  
    // Create a copy of the data to avoid mutating the original
    const newData = { ...data };
    
    // Skip translation if we're already in English or no language specified
    if (!currentLanguage || currentLanguage === "en") {
      return newData;
    }
    
    // Check if budget needs translation
    if (newData.userSelection?.budget) {
      // First normalize to English
      const normalizedBudget = budgetMappings[newData.userSelection.budget] || newData.userSelection.budget;
      
      // Then get the translation from our direct mappings
      if (budgetTranslations[currentLanguage] && budgetTranslations[currentLanguage][normalizedBudget]) {
        newData.userSelection.budget = budgetTranslations[currentLanguage][normalizedBudget];
      }
    }
    
    // Check if travelers needs translation
    if (newData.userSelection?.travelers) {
      // First normalize to English
      const normalizedTravelers = travelerMappings[newData.userSelection.travelers] || newData.userSelection.travelers;
      
      // Then get the translation from our direct mappings
      if (travelerTranslations[currentLanguage] && travelerTranslations[currentLanguage][normalizedTravelers]) {
        newData.userSelection.travelers = travelerTranslations[currentLanguage][normalizedTravelers];
      }
    }
    
    return newData;
  };