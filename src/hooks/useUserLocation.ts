import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

export function useUserLocation(): Location | null {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation(null)
    );
  }, []);

  return location;
}
