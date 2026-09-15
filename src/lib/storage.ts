// Local storage and IndexedDB utilities for StudyScope

const DB_NAME = 'studyscope_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const stores = ['notes', 'tasks', 'flashcards', 'projects', 'subjects', 'timetable', 'timer', 'stats', 'settings', 'references', 'quizzes', 'assignments', 'essayPlans', 'presentations'];
      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
  });
}

export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function dbGet<T>(storeName: string, id: string): Promise<T | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return undefined;
  }
}

export async function dbPut<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbDelete(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbClear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportAllData(): Promise<string> {
  const stores = ['notes', 'tasks', 'flashcards', 'projects', 'subjects', 'timetable', 'timer', 'stats', 'settings', 'references', 'quizzes', 'assignments', 'essayPlans', 'presentations'];
  const data: Record<string, unknown[]> = {};
  for (const store of stores) {
    data[store] = await dbGetAll(store);
  }
  // Also get localStorage items
  const lsData: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('studyscope_')) {
      lsData[key] = localStorage.getItem(key) || '';
    }
  }
  data['_localStorage'] = lsData as unknown as unknown[];
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

export async function importAllData(json: string): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { success: false, error: 'Invalid backup file format.' };
    }
    const stores = ['notes', 'tasks', 'flashcards', 'projects', 'subjects', 'timetable', 'timer', 'stats', 'settings', 'references', 'quizzes', 'assignments', 'essayPlans', 'presentations'];
    for (const store of stores) {
      if (parsed.data[store] && Array.isArray(parsed.data[store])) {
        await dbClear(store);
        for (const item of parsed.data[store]) {
          if (item && typeof item === 'object' && 'id' in item) {
            await dbPut(store, item);
          }
        }
      }
    }
    // Restore localStorage
    if (parsed.data['_localStorage']) {
      const lsData = parsed.data['_localStorage'] as Record<string, string>;
      Object.entries(lsData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: `Failed to import: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}

export async function clearAllData(): Promise<void> {
  const stores = ['notes', 'tasks', 'flashcards', 'projects', 'subjects', 'timetable', 'timer', 'stats', 'settings', 'references', 'quizzes', 'assignments', 'essayPlans', 'presentations'];
  for (const store of stores) {
    await dbClear(store);
  }
  // Clear localStorage
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('studyscope_')) keys.push(key);
  }
  keys.forEach(key => localStorage.removeItem(key));
}
