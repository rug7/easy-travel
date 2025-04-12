
export const formatDuration = (isoDuration) => {
    // Remove 'PT' and split into hours and minutes
    const duration = isoDuration.replace('PT', '');
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };
  
  // Add this helper function to format price
  export const formatPrice = (price) => {
    if (!price) return "$0.00";
    // Convert to number and round to 2 decimal places
    const numPrice = parseFloat(price);
    // Format with commas for thousands and fixed 2 decimal places
    return `$${numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  export const formatDate = (date) => {
    if (!date) return null;
    
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
      }
      
      // Format as YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log('Formatted date:', formattedDate); // Debug log
      return formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      return null;
    }
  };
  
 export const safeJSONParse = (str) => {
    try {
      // First try direct parsing
      try {
        return JSON.parse(str);
      } catch (e) {
        // If direct parsing fails, try cleaning
        let cleanStr = str
          .replace(/```json/g, '')
          .replace(/```/g, '')
          // Remove all non-printable characters
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
          // Remove all unicode quotes
          .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
          // Replace multiple spaces with single space
          .replace(/\s+/g, ' ')
          // Remove line breaks and tabs
          .replace(/[\n\r\t]/g, '')
          .trim();
  
        // Try to find the JSON object
        const matches = cleanStr.match(/\{(?:[^{}]|{[^{}]*})*\}/g);
        if (matches) {
          // Try each matched object
          for (const match of matches) {
            try {
              const parsed = JSON.parse(match);
              if (parsed && typeof parsed === 'object') {
                return parsed;
              }
            } catch (err) {
              continue;
            }
          }
        }
  
        // Try to find a JSON array
        const arrayMatch = cleanStr.match(/\[(?:[^$$$$]|$$.*?$$)*\]/g);
        if (arrayMatch) {
          try {
            return JSON.parse(arrayMatch[0]);
          } catch (err) {
            console.error('Array parsing failed:', err);
          }
        }
  
        // If all else fails, try to extract anything that looks like JSON
        const jsonLike = cleanStr.match(/{[\s\S]*}/);
        if (jsonLike) {
          try {
            // Additional cleaning for common issues
            const finalAttempt = jsonLike[0]
              .replace(/,\s*}/g, '}') // Remove trailing commas
              .replace(/,\s*]/g, ']')
              .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Ensure property names are quoted
              .replace(/:\s*'([^']*)'/g, ':"$1"') // Replace single quotes with double quotes
              .replace(/\\/g, '\\\\'); // Escape backslashes
  
            return JSON.parse(finalAttempt);
          } catch (err) {
            console.error('Final parsing attempt failed:', err);
          }
        }
      }
    } catch (error) {
      console.error("JSON Parse Error:", error);
      console.log("Problematic string:", str);
    }
    return null;
  };

 export const formatFlightSegment = (segments) => {
    if (!segments || !Array.isArray(segments)) {
      console.error('Invalid segments:', segments);
      return null;
    }
  
    try {
      return {
        departure: {
          airport: segments[0].departure.iataCode,
          time: segments[0].departure.at.split('T')[1],
          date: segments[0].departure.at.split('T')[0]
        },
        arrival: {
          airport: segments[segments.length - 1].arrival.iataCode,
          time: segments[segments.length - 1].arrival.at.split('T')[1],
          date: segments[segments.length - 1].arrival.at.split('T')[0]
        },
        duration: segments.reduce((total, seg) => total + (seg.duration || ''), ''),
        stops: segments.length - 1,
        stopLocations: segments.slice(0, -1).map(seg => ({
          airport: seg.arrival.iataCode,
          duration: seg.duration || ''
        }))
      };
    } catch (error) {
      console.error('Error in formatFlightSegment:', error);
      return null;
    }
  };