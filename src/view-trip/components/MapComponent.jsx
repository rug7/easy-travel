import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useLanguage } from "@/context/LanguageContext";


const formatDate = (dateString, language) => {
  if (!dateString) return translate("noDate");

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return translate("invalidDate");

    // Format based on language
    if (language === "he") {
      // Hebrew date format (day/month/year)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (language === "fr") {
      // French date format (day/month/year)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (language === "es") {
      // Spanish date format (day/month/year)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      // Default format for other languages
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return translate("dateError");
  }
};

function MapComponent({ destinations }) {
  const mapContainerRef = useRef(null);
  const { colorMode } = useAccessibility();
  const { translate, language } = useLanguage();
  const isRTL = language === "he";


  // Get accessible marker color based on color mode
  const getMarkerColor = () => {
    const colorMap = {
      default: '#dc2626', // Default red
      protanopia: '#9ca3af', // Gray instead of red
      deuteranopia: '#b91c1c', // More visible red
      tritanopia: '#dc2626', // Bright red
      monochromacy: '#1f2937', // Dark gray
      highContrast: '#b91c1c', // Deep red
    };
    
    return colorMap[colorMode] || colorMap.default;
  };

  // Get accessible border color based on color mode
  const getBorderColor = () => {
    // For most color modes, white works as a border
    // For monochromacy, use a different shade of gray
    return colorMode === 'monochromacy' ? '#e5e7eb' : '#ffffff';
  };

  // Add an effect to handle the header overlap issue
  useEffect(() => {
    // Get the header element
    const header = document.querySelector('header') || document.querySelector('nav');
    
    if (header && mapContainerRef.current) {
      // Add a buffer zone between the header and map
      const headerHeight = header.offsetHeight;
      mapContainerRef.current.style.marginTop = '20px'; // Add additional spacing
    }

    // Clean up function
    return () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.marginTop = '0';
      }
    };
  }, []);
  
  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
        zoomControl={true}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={true}
        boxZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {destinations.map((dest, index) => {
          // Calculate marker size based on trip duration
          const markerSize = dest.days > 10 ? 10 : Math.max(5, dest.days);
          
          // For upcoming trips, use primary color, otherwise use the danger color
          const isUpcoming = dest.startDate && new Date(dest.startDate) > new Date();
          const markerColor = isUpcoming ? 
            (colorMode === 'monochromacy' ? '#4b5563' : getMarkerColor()) : 
            getMarkerColor();
            
          return (
            <CircleMarker
              key={`marker-${index}-${colorMode}-${language}`} // Add language to force re-render
              center={dest.coordinates}
              radius={markerSize}
              fillColor={markerColor}
              color={getBorderColor()}
              weight={1.5} 
              opacity={1}
              fillOpacity={0.8}
            >
              <MapTooltip>
                <div className="p-2 bg-gray-800 text-white rounded-md shadow-md" style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}>
                  <strong className="block text-sm font-bold mb-1">{dest.name}</strong>
                  <span className="text-xs block">{dest.days} {translate("days")}</span>
                  {dest.startDate && (
                    <div className="text-xs mt-1 text-gray-300">
                      {translate("startingDate")}: {formatDate(dest.startDate, language)}
                    </div>
                  )}
                </div>
              </MapTooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Update legend with translations */}
      <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-80 p-2 rounded text-white text-xs z-10" style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}>
        <div className="flex items-center gap-2 mb-1" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getMarkerColor(), border: `1px solid ${getBorderColor()}` }} 
          />
          <span>{translate("destination")}</span>
        </div>
        <div>{translate("sizeIndicatesDuration")}</div>
      </div>
    </div>
  );
}

// Update date formatting function to be language-aware


export default MapComponent;