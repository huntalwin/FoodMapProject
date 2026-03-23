import { useEffect, useRef } from 'react';
import { searchPlaces } from '../api/places';
import { useAppStore } from '../store/useAppStore';

export function usePlacesSearch() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchResults = useAppStore((s) => s.setSearchResults);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([], false);
      return;
    }

    setSearchResults([], true);

    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results, false);
      } catch {
        setSearchResults([], false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, setSearchResults]);
}
