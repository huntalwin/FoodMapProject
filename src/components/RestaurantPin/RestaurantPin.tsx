import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { Restaurant } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { getPlaceDetails } from '../../api/places';

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
      .on('click', async () => {
        // Show stored data immediately, then refresh with live hours
        selectRestaurant(restaurant);
        try {
          const fresh = await getPlaceDetails(restaurant.placeId);
          selectRestaurant({ ...restaurant, ...fresh });
        } catch {
          // Keep the stored data if the fetch fails
        }
      });

    return () => {
      marker.remove();
    };
  }, [map, restaurant, selectRestaurant]);

  return null;
}
