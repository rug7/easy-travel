import { chatSession } from "@/service/AIModal";


export const getAirportCodeFromAI = async (destination) => {
    // Internal helper function for parsing JSON
    const parseAIResponse = (str) => {
      try {
        // First try direct parsing
        return JSON.parse(str);
      } catch (e) {
        // If direct parsing fails, try cleaning the string
        try {
          const cleanStr = str
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
            .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
            .replace(/\s+/g, ' ')
            .replace(/[\n\r\t]/g, '')
            .trim();
  
          // Try to find and parse JSON object
          const match = cleanStr.match(/\{[\s\S]*\}/);
          if (match) {
            return JSON.parse(match[0]);
          }
        } catch (err) {
          console.error('Failed to parse AI response:', err);
        }
      }
      return null;
    };
  
    try {
      const prompt = `For the destination "${destination}", provide the main airport code(s) in IATA format.
      IMPORTANT: Respond ONLY with a valid JSON object containing the airport information.
      
      Example response format for Krakow, Poland:
      {
        "city": "Krakow",
        "region": null,
        "country": "Poland",
        "airports": [
          {
            "code": "KRK",
            "name": "John Paul II International Airport Kraków-Balice",
            "main": true,
            "city": "Krakow"
          }
        ],
        "recommended": "KRK"
      }
  
      For regions or areas, provide the nearest major airport.
      Ensure the IATA code is correct and the airport is currently operational.`;
  
      const result = await chatSession.sendMessage([{ text: prompt }]);
      const response = await result.response.text();
      const data = parseAIResponse(response);
  
      if (!data) {
        console.error('Failed to parse AI response for airport code');
        return null;
      }
  
      if (!data.airports || !data.airports.length) {
        console.error('No airports found in AI response');
        return null;
      }
  
      // Use the recommended airport code if provided, otherwise use the first main airport or the first airport
      const airportCode = data.recommended || 
                         data.airports.find(airport => airport.main)?.code || 
                         data.airports[0].code;
  
      console.log('Successfully found airport code:', {
        code: airportCode,
        city: data.city,
        country: data.country
      });
  
      return {
        code: airportCode,
        city: data.city,
        region: data.region,
        country: data.country,
        allAirports: data.airports
      };
    } catch (error) {
      console.error('Error in getAirportCodeFromAI:', error);
      return null;
    }
  };

