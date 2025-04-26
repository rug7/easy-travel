import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent({ destinations }) {
  // Let's make sure we don't affect scrolling behavior
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
      zoomControl={true}
      scrollWheelZoom={false} // Changed to false to fix scrolling issues
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
              {dest.startDate && <div>Starting: {new Date(dest.startDate).toLocaleDateString()}</div>}
            </div>
          </MapTooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;