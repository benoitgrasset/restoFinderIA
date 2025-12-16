import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { Restaurant } from '../types';
import L from 'leaflet';

interface MapProps {
  center: [number, number];
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Component to handle map resize
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    handleResize();
    const timeoutId = setTimeout(handleResize, 100);
    const resizeObserver = new ResizeObserver(() => handleResize());
    const container = map.getContainer();
    if (container) resizeObserver.observe(container);
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [map]);
  return null;
};

// Automatically fit map bounds to include all markers and the search center
const FitBounds = ({ restaurants, center }: { restaurants: Restaurant[], center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (restaurants.length > 0) {
      const markers = restaurants
        .filter(r => r.lat !== undefined && r.lng !== undefined)
        .map(r => L.latLng(Number(r.lat), Number(r.lng)));
      
      // Always include the search center in the bounds
      markers.push(L.latLng(center[0], center[1]));

      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    } else {
      // If no results, just fly to center
      map.setView(center, 14, { animate: true });
    }
  }, [restaurants, center, map]);

  return null;
};

const MapComponent: React.FC<MapProps> = ({ center, restaurants, selectedId, onSelect }) => {
  // Use useMemo for icons to avoid recreation on every render, though defined inside to be safe with L import
  const { defaultIcon, selectedIcon } = useMemo(() => {
    return {
      defaultIcon: new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      selectedIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
  }, []);

  return (
    <MapContainer 
      center={center} 
      zoom={14} 
      scrollWheelZoom={true} 
      className="h-full w-full z-0 bg-gray-100" 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <MapResizer />
      <FitBounds restaurants={restaurants} center={center} />

      {/* User / Search Location Marker */}
      <CircleMarker 
        center={center} 
        radius={8} 
        pathOptions={{ 
          color: 'white', 
          fillColor: '#3b82f6', 
          fillOpacity: 1, 
          weight: 3 
        }}
      >
        <Popup>
          <div className="text-sm font-semibold text-center">Position recherchée</div>
        </Popup>
      </CircleMarker>
      
      {restaurants.map((restaurant) => {
         // Extra safety check and conversion
         if (restaurant.lat === undefined || restaurant.lng === undefined) return null;
         
         const lat = Number(restaurant.lat);
         const lng = Number(restaurant.lng);
         
         if (isNaN(lat) || isNaN(lng)) return null;

         const isSelected = selectedId === restaurant.id;

         return (
          <Marker 
            key={restaurant.id} 
            position={[lat, lng]}
            icon={isSelected ? selectedIcon : defaultIcon}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect(restaurant.id),
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <div className="text-sm font-bold mb-1">{restaurant.name}</div>
                <div className="text-xs text-gray-600 mb-1">{restaurant.cuisine}</div>
                <div className="flex items-center gap-1 text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                   <span>⭐ {restaurant.rating}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;