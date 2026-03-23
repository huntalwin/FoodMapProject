import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { Restaurant } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  restaurant: Restaurant;
}

export function RestaurantPin({ restaurant }: Props) {
  const map = useMap();
  const selectRestaurant = useAppStore((s) => s.selectRestaurant);

  useEffect(() => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="restaurant-pin" title="${restaurant.name}">🍽</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker([restaurant.lat, restaurant.lng], { icon })
      .addTo(map)
      .on('click', () => selectRestaurant(restaurant));

    return () => {
      marker.remove();
    };
  }, [map, restaurant, selectRestaurant]);

  return null;
}
