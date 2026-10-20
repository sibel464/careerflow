/**
 * Photos and drawings are too big for localStorage, so they live in IndexedDB as data URLs.
 * Entries only keep the media id.
 */
const DB_NAME = 'careerflow_media';
const STORE = 'media';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

const run = async <T,>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = fn(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveMedia = (id: string, dataUrl: string) => run('readwrite', s => s.put(dataUrl, id));
export const loadMedia = (id: string) => run<string | undefined>('readonly', s => s.get(id));
export const deleteMedia = (id: string) => run('readwrite', s => s.delete(id));

/** Every stored media item, for full backups. */
export const allMedia = async (): Promise<Record<string, string>> => {
  const keys = await run<IDBValidKey[]>('readonly', s => s.getAllKeys());
  const values = await run<string[]>('readonly', s => s.getAll());
  return Object.fromEntries(keys.map((k, i) => [String(k), values[i]]));
};

/** Shrinks a photo to a sensible size before storing it. */
export const compressImage = (file: File, maxSide = 1400, quality = 0.82) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Görsel okunamadı')); };
    img.src = url;
  });
