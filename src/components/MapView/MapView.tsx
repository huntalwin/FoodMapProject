import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import { RestaurantPin } from '../RestaurantPin/RestaurantPin';
import './MapView.css';

function MapPanner() {
  const map = useMap();
  const selectedRestaurant = useAppStore((s) => s.selectedRestaurant);

  useEffect(() => {
    if (selectedRestaurant) {
      map.flyTo([selectedRestaurant.lat, selectedRestaurant.lng], 15, { duration: 1.2 });
    }
  }, [selectedRestaurant, map]);

  return null;
}

export function MapView() {
  const visitedRestaurants = useAppStore((s) => s.visitedRestaurants);
  const mapCenter = useAppStore((s) => s.mapCenter);
  const mapZoom = useAppStore((s) => s.mapZoom);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="map-container"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapPanner />
        {Object.values(visitedRestaurants).map((r) => (
          <RestaurantPin key={r.placeId} restaurant={r} />
        ))}
      </MapContainer>
    </div>
  );
}
