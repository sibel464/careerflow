import { useEffect, useReducer, useRef, useState } from 'react';

/** Fired whenever any feature saves data, so derived views (XP, badges) can refresh. */
export const DATA_EVENT = 'careerflow-data';

export const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * useState that persists to localStorage. Every instance using the same key stays in sync —
 * within this tab (via DATA_EVENT) and across tabs (via the storage event).
 */
export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
    return readStored(key, fallback);
  });
  const json = useRef('');

  useEffect(() => {
    try {
      const next = JSON.stringify(value);
      json.current = next;
      if (localStorage.getItem(key) === next) return;
      localStorage.setItem(key, next);
      window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: key }));
    } catch (error) {
      console.error(`Error writing ${key}`, error);
    }
  }, [key, value]);

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem(key);
      if (raw !== null && raw !== json.current) {
        try {
          json.current = raw;
          setValue(JSON.parse(raw));
        } catch { /* ignore malformed data */ }
      }
    };
    window.addEventListener(DATA_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(DATA_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);

  return [value, setValue] as const;
}

/** Re-renders the caller whenever any persisted feature data changes. */
export function useDataVersion() {
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    window.addEventListener(DATA_EVENT, bump);
    return () => window.removeEventListener(DATA_EVENT, bump);
  }, []);
  return version;
}
