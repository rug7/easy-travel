// // utils/placeImageUtils.js
// import { GetPlaceDetails } from "@/service/GlobalApi";

// const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=800&maxWidthPx=1200&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

// // Cache to avoid duplicate API calls
// const imageCache = {};

// export const getPlaceImage = async (searchQuery, fallbackImage) => {
//   // Return from cache if available
//   if (imageCache[searchQuery]) {
//     return imageCache[searchQuery];
//   }
  
//   try {
//     const data = { textQuery: searchQuery };
//     const result = await GetPlaceDetails(data);
    
//     if (result.data?.places?.[0]?.photos?.[0]?.name) {
//       const photoName = result.data.places[0].photos[0].name;
//       const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName);
      
//       // Store in cache
//       imageCache[searchQuery] = photoUrl;
//       return photoUrl;
//     }
//   } catch (error) {
//     console.error(`Error fetching image for ${searchQuery}:`, error);
//   }
  
//   // Return fallback if API call fails
//   imageCache[searchQuery] = fallbackImage;
//   return fallbackImage;
// };