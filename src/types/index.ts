export interface Restaurant {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  cuisineTypes: string[];
  phoneNumber?: string;
  websiteUri?: string;
  googlePhotoRefs: string[];
  priceLevel?: 1 | 2 | 3 | 4;
}

export interface UserVisit {
  placeId: string;
  visitedAt: string;
  rating: 1 | 2 | 3 | 4 | 5;
  notes: string;
  userPhotoIds: string[];
}

export interface UserPhoto {
  id: string;
  placeId: string;
  blob: Blob;
  mimeType: string;
  uploadedAt: string;
}
