
export const validateResponse = (response) => {
  // Remove any non-JSON content
  const jsonStart = response.indexOf('{');
  const jsonEnd = response.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return null;
  
  const jsonString = response.substring(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Validation failed:", error);
    return null;
  }
};

export const isValidAirportCode = (code) => {
    return typeof code === 'string' && code.length === 3 && /^[A-Z]{3}$/.test(code);
  };