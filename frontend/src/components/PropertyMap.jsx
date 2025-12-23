import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const cityCoordinates = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4237, 27.1428],
  bursa: [40.1885, 29.0610],
  antalya: [36.8969, 30.7133],
};

const PropertyMap = ({ properties, filters }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: icon,
        shadowUrl: iconShadow
      });
      mapInstance.current = L.map(mapRef.current).setView([39.9334, 32.8597], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }
  }, []);

  // Update markers and view when properties/filters change
  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    properties.forEach((prop) => {
      const city = prop.address?.city?.toLowerCase() || '';
      let pos = cityCoordinates[city] || [39.9334, 32.8597];
      const lat = pos[0] + (Math.random() * 0.05 - 0.025);
      const lng = pos[1] + (Math.random() * 0.05 - 0.025);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; font-family: sans-serif;">
            <b style="font-size: 14px; display: block; margin-bottom: 4px;">${prop.propertyType}</b>
            <span style="color: #2563eb; font-weight: bold; font-size: 13px;">${prop.price.toLocaleString()} ₺</span><br/>
            <span style="color: #6b7280; font-size: 12px;">${prop.address?.district || ''}</span><br/>
            <a href="/property/${prop.propertyId}" style="display: inline-block; margin-top: 8px; color: white; background: #2563eb; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">View Details</a>
          </div>
        `);
    });

    // Adjust map view based on filter
    const filterCity = filters?.city?.toLowerCase();
    if (filterCity && cityCoordinates[filterCity]) {
      map.setView(cityCoordinates[filterCity], 10, { animate: true });
    } else if (properties.length > 0) {
      // If no city filter, fit bounds to all properties
      const bounds = L.latLngBounds(properties.map(p => {
         const city = p.address?.city?.toLowerCase() || '';
         return cityCoordinates[city] || [39.9334, 32.8597];
      }));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    } else if (!filterCity) {
        // If no properties and no filter, reset to default
        map.setView([39.9334, 32.8597], 6, { animate: true });
    }

  }, [properties, filters]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default PropertyMap;
