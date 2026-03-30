// File de synchronisation hors ligne (IndexedDB)
// Stocke les mutations en attente et les rejoue à la reconnexion

export type OfflineOperation =
  | { type: 'UPSERT_POIDS'; payload: { date: string; poids: number } }
  | { type: 'DELETE_POIDS'; payload: { id: string } }
  | {
      type: 'ADD_NUTRITION';
      payload: {
        repas: 'petit-dejeuner' | 'dejeuner' | 'diner' | 'snacks';
        alimentId: string;
        quantiteG: number;
        date: string;
      };
    }
  | { type: 'DELETE_NUTRITION'; payload: { id: string } }
  | { type: 'UPDATE_PROFIL'; payload: { prenom: string; taille: number | null } }
  | {
      type: 'UPDATE_OBJECTIFS';
      payload: {
        objectif_calories: number;
        objectif_proteines: number | null;
        objectif_glucides: number | null;
        objectif_lipides: number | null;
      };
    };

export interface QueuedOperation {
  id: string;
  operation: OfflineOperation;
  createdAt: number;
  retries: number;
}

const DB_NAME = 'elev-offline';
const DB_VERSION = 2;
const STORE = 'operations';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueOperation(operation: OfflineOperation): Promise<string> {
  const db = await openDB();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: QueuedOperation = { id, operation, createdAt: Date.now(), retries: 0 };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.add(item);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as QueuedOperation[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeOperation(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getQueueCount(): Promise<number> {
  if (typeof indexedDB === 'undefined') return 0;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}
