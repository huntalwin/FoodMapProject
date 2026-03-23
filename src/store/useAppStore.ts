import { create } from 'zustand';
import type { Restaurant, UserVisit, UserPhoto } from '../types';
import {
  getAllVisitedRestaurants,
  getAllUserVisits,
  saveRestaurant,
  saveUserVisit,
  saveUserPhoto,
} from '../db';

interface AppState {
  // Map
  mapCenter: [number, number];
  mapZoom: number;

  // Search
  searchQuery: string;
  searchResults: Restaurant[];
  isSearching: boolean;

  // Selection
  selectedRestaurant: Restaurant | null;
  isDetailPanelOpen: boolean;

  // User data
  visitedRestaurants: Record<string, Restaurant>;
  userVisits: Record<string, UserVisit>;

  // Actions
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: Restaurant[], searching: boolean) => void;
  selectRestaurant: (r: Restaurant | null) => void;
  closeDetailPanel: () => void;
  markVisited: (r: Restaurant, visit: Omit<UserVisit, 'placeId' | 'visitedAt' | 'userPhotoIds'>, photos: File[]) => Promise<void>;
  updateVisit: (placeId: string, updates: Partial<Pick<UserVisit, 'rating' | 'notes'>>, newPhotos: File[]) => Promise<void>;
  loadUserData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  mapCenter: [-37.8136, 144.9631],
  mapZoom: 13,

  searchQuery: '',
  searchResults: [],
  isSearching: false,

  selectedRestaurant: null,
  isDetailPanelOpen: false,

  visitedRestaurants: {},
  userVisits: {},

  setSearchQuery: (q) => set({ searchQuery: q }),

  setSearchResults: (results, searching) =>
    set({ searchResults: results, isSearching: searching }),

  selectRestaurant: (r) =>
    set({ selectedRestaurant: r, isDetailPanelOpen: r !== null }),

  closeDetailPanel: () =>
    set({ isDetailPanelOpen: false, selectedRestaurant: null }),

  markVisited: async (r, visitData, photos) => {
    const photoIds: string[] = [];

    for (const file of photos) {
      const id = crypto.randomUUID();
      const photo: UserPhoto = {
        id,
        placeId: r.placeId,
        blob: file,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };
      await saveUserPhoto(photo);
      photoIds.push(id);
    }

    const visit: UserVisit = {
      placeId: r.placeId,
      visitedAt: new Date().toISOString(),
      rating: visitData.rating,
      notes: visitData.notes,
      userPhotoIds: photoIds,
    };

    await saveRestaurant(r);
    await saveUserVisit(visit);

    set((state) => ({
      visitedRestaurants: { ...state.visitedRestaurants, [r.placeId]: r },
      userVisits: { ...state.userVisits, [r.placeId]: visit },
    }));
  },

  updateVisit: async (placeId, updates, newPhotos) => {
    const state = get();
    const existing = state.userVisits[placeId];
    if (!existing) return;

    const photoIds = [...existing.userPhotoIds];

    for (const file of newPhotos) {
      const id = crypto.randomUUID();
      const photo: UserPhoto = {
        id,
        placeId,
        blob: file,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };
      await saveUserPhoto(photo);
      photoIds.push(id);
    }

    const updated: UserVisit = { ...existing, ...updates, userPhotoIds: photoIds };
    await saveUserVisit(updated);

    set((state) => ({
      userVisits: { ...state.userVisits, [placeId]: updated },
    }));
  },

  loadUserData: async () => {
    const [restaurants, visits] = await Promise.all([
      getAllVisitedRestaurants(),
      getAllUserVisits(),
    ]);

    const visitedRestaurants: Record<string, Restaurant> = {};
    for (const r of restaurants) visitedRestaurants[r.placeId] = r;

    const userVisits: Record<string, UserVisit> = {};
    for (const v of visits) userVisits[v.placeId] = v;

    set({ visitedRestaurants, userVisits });
  },
}));
