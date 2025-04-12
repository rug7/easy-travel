

export const generateBookingLinks = (dep, arr, depDate, retDate = null, cabin, tripType, sortType = 'price') => {
    const formatDateForUrl = (date) => date.split('T')[0];
    const formattedDepDate = formatDateForUrl(depDate);
    const formattedRetDate = retDate ? formatDateForUrl(retDate) : null;
    const isRoundTrip = tripType === 'roundTrip';
  
    // Helper function to get Momondo sort parameter
    const getMomondoSort = (sortType) => {
      switch (sortType) {
        case 'cheapest':
          return 'price_a';
        case 'best':
          return 'bestflight_a';
        case 'quickest':
          return 'duration_a';
        default:
          return 'price_a';
      }
    };
  
    // Helper function to get cabin class URL segment
    const getCabinClass = (cabin) => {
      const cabinUpper = cabin.toUpperCase();
      switch (cabinUpper) {
        case 'ECONOMY':
          return 'economy';
        case 'BUSINESS':
          return 'business';
        case 'FIRST':
          return 'first';
        default:
          return 'economy';
      }
    };
  
    const cabinClass = getCabinClass(cabin);
    const sortParam = getMomondoSort(sortType);
  
    // Construct URLs
    const momondoUrl = isRoundTrip
      ? `https://www.momondo.com/flight-search/${dep}-${arr}/${formattedDepDate}/${formattedRetDate}/${cabinClass}?ucs=bdg6to&sort=${sortParam}`
      : `https://www.momondo.com/flight-search/${dep}-${arr}/${formattedDepDate}/${cabinClass}?ucs=bdg6to&sort=${sortParam}`;
  
    const kayakUrl = isRoundTrip
      ? `https://www.kayak.com/flights/${dep}-${arr}/${formattedDepDate}/${formattedRetDate}/${cabinClass}?sort=${sortParam}`
      : `https://www.kayak.com/flights/${dep}-${arr}/${formattedDepDate}/${cabinClass}?sort=${sortParam}`;
  
    const googleUrl = isRoundTrip
      ? `https://www.google.com/travel/flights?q=Flights%20to%20${arr}%20from%20${dep}%20on%20${formattedDepDate}%20through%20${formattedRetDate}%20${cabinClass}`
      : `https://www.google.com/travel/flights?q=Flights%20to%20${arr}%20from%20${dep}%20on%20${formattedDepDate}%20${cabinClass}`;
  
    return {
      momondo: momondoUrl,
      kayak: kayakUrl,
      google: googleUrl
    };
  };
  