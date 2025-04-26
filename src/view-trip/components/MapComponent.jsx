import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid date';

        // Get day, month, and year
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Error';
    }
};

function MapComponent({ destinations }) {
  const mapContainerRef = useRef(null);

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
        
        {destinations.map((dest, index) => (
          <CircleMarker
            key={index}
            center={dest.coordinates}
            radius={dest.days > 10 ? 10 : Math.max(5, dest.days)}
            fillColor="#dc2626"
            color="#ffffff"
            weight={1}
            opacity={1}
            fillOpacity={0.8}
          >
            <MapTooltip>
              <div>
                <strong>{dest.name}</strong><br/>
                {dest.days} days
                {dest.startDate && <div>Starting: {formatDate(dest.startDate)}</div>}
              </div>
            </MapTooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapComponent;