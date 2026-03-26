import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import type { Restaurant } from '../../types';
import './SearchBar.css';

export function SearchBar() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const searchResults = useAppStore((s) => s.searchResults);
  const isSearching = useAppStore((s) => s.isSearching);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectRestaurant = useAppStore((s) => s.selectRestaurant);
  const visitedRestaurants = useAppStore((s) => s.visitedRestaurants);

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  usePlacesSearch();

  useEffect(() => {
    setIsOpen(searchQuery.trim().length > 0);
  }, [searchQuery, searchResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(r: Restaurant) {
    selectRestaurant(r);
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function formatCuisine(types: string[]) {
    return types
      .slice(0, 2)
      .map((t) => t.replace(/_/g, ' '))
      .join(', ');
  }

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {isSearching && (
            <div className="search-status">Searching...</div>
          )}
          {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
            <div className="search-status">No results found</div>
          )}
          {searchResults.map((r) => (
            <button key={r.placeId} className="search-result-item" onClick={() => handleSelect(r)}>
              <div className="result-name">
                {r.name}
                {visitedRestaurants[r.placeId] && <span className="visited-badge">✓ Visited</span>}
              </div>
              <div className="result-meta">
                <span className="result-address">{r.address}</span>
                {formatCuisine(r.cuisineTypes) && (
                  <span className="result-cuisine">{formatCuisine(r.cuisineTypes)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
