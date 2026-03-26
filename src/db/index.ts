import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Restaurant, UserVisit, UserPhoto } from '../types';

interface FoodMapDB extends DBSchema {
  restaurants: {
    key: string;
    value: Restaurant;
  };
  userVisits: {
    key: string;
    value: UserVisit;
  };
  userPhotos: {
    key: string;
    value: UserPhoto;
    indexes: { byPlaceId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<FoodMapDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FoodMapDB>('FoodMapDB', 1, {
      upgrade(db) {
        db.createObjectStore('restaurants', { keyPath: 'placeId' });
        db.createObjectStore('userVisits', { keyPath: 'placeId' });
        const photoStore = db.createObjectStore('userPhotos', { keyPath: 'id' });
        photoStore.createIndex('byPlaceId', 'placeId');
      },
    });
  }
  return dbPromise;
}

export async function getAllVisitedRestaurants(): Promise<Restaurant[]> {
  const db = await getDB();
  return db.getAll('restaurants');
}

export async function getAllUserVisits(): Promise<UserVisit[]> {
  const db = await getDB();
  return db.getAll('userVisits');
}

export async function saveRestaurant(r: Restaurant): Promise<void> {
  const db = await getDB();
  await db.put('restaurants', r);
}

export async function saveUserVisit(v: UserVisit): Promise<void> {
  const db = await getDB();
  await db.put('userVisits', v);
}

export async function saveUserPhoto(p: UserPhoto): Promise<void> {
  const db = await getDB();
  await db.put('userPhotos', p);
}

export async function getUserPhotosByPlaceId(placeId: string): Promise<UserPhoto[]> {
  const db = await getDB();
  return db.getAllFromIndex('userPhotos', 'byPlaceId', placeId);
}

export async function deleteUserPhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('userPhotos', id);
}

export async function deleteRestaurant(placeId: string): Promise<void> {
  const db = await getDB();
  await db.delete('restaurants', placeId);
}

export async function deleteUserVisit(placeId: string): Promise<void> {
  const db = await getDB();
  await db.delete('userVisits', placeId);
}
