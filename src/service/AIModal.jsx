  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  
  
  export const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate Travel Plan for Location : Las Vegas, for 3 Days for Couple with a Cheap budget, Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for 3 days with each day plan with best time to visit in JSON format\n"},
            {text: "Generate Travel Plan for Location : Las Vegas, for 3 Days for Couple with a Cheap budget, Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for 3 days with each day plan with best time to visit in JSON format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "I cannot access real-time information, including live pricing for hotels, availability, and images.  I also cannot access and process image URLs.  Therefore, I cannot fulfill the request completely as specified.  However, I can provide a JSON structure with the *kind* of information you requested, and you can then fill in the details using online travel booking sites like Expedia, Kayak, Booking.com, etc.\n\n```json\n{\n  \"trip\": {\n    \"location\": \"Las Vegas, Nevada\",\n    \"duration\": \"3 Days\",\n    \"budget\": \"Cheap\",\n    \"travelers\": \"Couple\"\n  },\n  \"hotels\": [\n    {\n      \"hotelName\": \"Hotel Name 1 (Example)\",\n      \"hotelAddress\": \"123 Example St, Las Vegas, NV 89101\",\n      \"price\": \"$$$ (Replace with actual price range)\",\n      \"hotelImageUrl\": \"URL_PLACEHOLDER_1\",\n      \"geoCoordinates\": { \"latitude\": 36.1699, \"longitude\": -115.1398 }, \n      \"rating\": 3.5, \n      \"description\": \"A budget-friendly hotel near the Strip. Basic amenities.\"\n    },\n    {\n      \"hotelName\": \"Hotel Name 2 (Example)\",\n      \"hotelAddress\": \"456 Another Ave, Las Vegas, NV 89109\",\n      \"price\": \"$$ (Replace with actual price range)\",\n      \"hotelImageUrl\": \"URL_PLACEHOLDER_2\",\n      \"geoCoordinates\": { \"latitude\": 36.1146, \"longitude\": -115.1728 },\n      \"rating\": 4.0,\n      \"description\": \"Slightly more upscale, but still affordable. Offers a pool.\"\n    },\n    {\n      \"hotelName\": \"Hotel Name 3 (Example)\",\n      \"hotelAddress\": \"789 Off Strip Blvd, Las Vegas, NV 89119\",\n      \"price\": \"$ (Replace with actual price range)\",\n      \"hotelImageUrl\": \"URL_PLACEHOLDER_3\",\n      \"geoCoordinates\": { \"latitude\": 36.09, \"longitude\": -115.22},\n      \"rating\": 3.0,\n      \"description\": \"Basic motel option, furthest from the Strip, but cheapest.\"\n    }\n\n  ],\n  \"itinerary\": {\n    \"day1\": [\n      {\n        \"placeName\": \"Fremont Street Experience\",\n        \"placeDetails\": \"Free walking area with light shows, street performers.\",\n        \"placeImageUrl\": \"URL_PLACEHOLDER_4\",\n        \"geoCoordinates\": { \"latitude\": 36.1699, \"longitude\": -115.1398 },\n        \"ticketPricing\": \"Free\",\n        \"rating\": 4.5,\n        \"timeTravel\": \"Evening (6 PM - 10 PM)\"\n      },\n      {\n        \"placeName\": \"Downtown Las Vegas Buffets\",\n        \"placeDetails\": \"Various buffet options for affordable meals.\",\n        \"placeImageUrl\": \"URL_PLACEHOLDER_5\",\n        \"geoCoordinates\": { \"latitude\": 36.1699, \"longitude\": -115.1398 },\n        \"ticketPricing\": \"$$ (Replace with price range)\",\n        \"rating\": 4.0,\n        \"timeTravel\": \"Lunch (12 PM - 2 PM)\"\n      }\n    ],\n    \"day2\": [\n      {\n        \"placeName\": \"The Strip (walking tour)\",\n        \"placeDetails\": \"Walk the Las Vegas Strip, admire the hotels and casinos.\",\n        \"placeImageUrl\": \"URL_PLACEHOLDER_6\",\n        \"geoCoordinates\": { \"latitude\": 36.12, \"longitude\": -115.17 },\n        \"ticketPricing\": \"Free\",\n        \"rating\": 5.0,\n        \"timeTravel\": \"Afternoon (2 PM - 6 PM)\"\n      },\n      {\n        \"placeName\": \"Bellagio Fountains\",\n        \"placeDetails\": \"Free water show with music.\",\n        \"placeImageUrl\": \"URL_PLACEHOLDER_7\",\n        \"geoCoordinates\": { \"latitude\": 36.1146, \"longitude\": -115.1728 },\n        \"ticketPricing\": \"Free\",\n        \"rating\": 4.8,\n        \"timeTravel\": \"Evening (8 PM - 9 PM)\"\n      }\n    ],\n    \"day3\": [\n      {\n        \"placeName\": \"Seven Magic Mountains\",\n        \"placeDetails\": \"Colorful art installation outside the city (requires transportation).\",\n        \"placeImageUrl\": \"URL_PLACEHOLDER_8\",\n        \"geoCoordinates\": { \"latitude\": 36.033, \"longitude\": -114.998 },\n        \"ticketPricing\": \"Free\",\n        \"rating\": 4.2,\n        \"timeTravel\": \"Morning (9 AM - 12 PM)\"\n\n      },\n      {\n        \"placeName\": \"Red Rock Canyon National Conservation Area (Optional, requires car)\",\n        \"placeDetails\": \"Scenic hiking trails and rock formations.\",\n        \"placeImageUrl\": \"URL_PLACEHOLDER_9\",\n        \"geoCoordinates\": { \"latitude\": 36.18, \"longitude\": -115.66},\n        \"ticketPricing\": \"$15 per vehicle (check current prices)\",\n        \"rating\": 4.7,\n        \"timeTravel\": \"Afternoon (2 PM - 5 PM)\"\n      }\n    ]\n  }\n}\n```\n\nRemember to replace all the `URL_PLACEHOLDER` values, price ranges (`$$$`, `$$`, `$`), and coordinate values (if you choose different locations) with accurate information from reputable sources.  Also, consider adding transportation details (e.g., using the monorail or bus system in Vegas to minimize taxi costs) to make the plan more comprehensive.\n"},
          ],
        },
      ],
    });