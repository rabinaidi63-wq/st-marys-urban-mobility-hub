import { useEffect, useState } from 'react';

// Persists state to localStorage under `key`, restoring it on mount.
// Used across the app for input persistence, saved journeys,
// alert subscriptions and sustainability goals — all client-side,
// no backend required.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private browsing, quota); fail silently.
    }
  }, [key, value]);

  return [value, setValue];
}
