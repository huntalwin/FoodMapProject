import type { Restaurant } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;
const BASE_URL = 'https://places.googleapis.com/v1';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.photos',
  'places.priceLevel',
  'places.currentOpeningHours',
].join(',');

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'types',
  'internationalPhoneNumber',
  'websiteUri',
  'photos',
  'priceLevel',
  'currentOpeningHours',
].join(',');

function normalizePriceLevel(level: string | undefined): 1 | 2 | 3 | 4 | undefined {
  const map: Record<string, 1 | 2 | 3 | 4> = {
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return level ? map[level] : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlaceToRestaurant(place: any): Restaurant {
  return {
    placeId: place.id,
    name: place.displayName?.text ?? 'Unknown',
    address: place.formattedAddress ?? '',
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    cuisineTypes: (place.types ?? []).filter((t: string) =>
      !['establishment', 'point_of_interest', 'food'].includes(t)
    ),
    phoneNumber: place.internationalPhoneNumber,
    websiteUri: place.websiteUri,
    googlePhotoRefs: (place.photos ?? []).slice(0, 5).map((p: { name: string }) => p.name),
    priceLevel: normalizePriceLevel(place.priceLevel),
    openNow: place.currentOpeningHours?.openNow,
    weekdayHours: place.currentOpeningHours?.weekdayDescriptions,
  };
}

export async function searchPlaces(query: string): Promise<Restaurant[]> {
  const res = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${query} restaurant`,
      maxResultCount: 10,
    }),
  });

  if (!res.ok) throw new Error(`Places search failed: ${res.status}`);
  const data = await res.json();
  return (data.places ?? []).map(mapPlaceToRestaurant);
}

export async function getPlaceDetails(placeId: string): Promise<Restaurant> {
  const res = await fetch(`${BASE_URL}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': DETAIL_FIELD_MASK,
    },
  });
  if (!res.ok) throw new Error(`Place details failed: ${res.status}`);
  const place = await res.json();
  return mapPlaceToRestaurant(place);
}

export function getPhotoUrl(photoRef: string, maxWidth = 800): string {
  return `${BASE_URL}/${photoRef}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}
