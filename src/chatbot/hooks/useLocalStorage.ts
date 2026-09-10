import { useState, useEffect } from 'react';

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
}

const MAX_MESSAGES = 100;

export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > MAX_MESSAGES) {
          return parsed.slice(-MAX_MESSAGES) as T;
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.warn('useLocalStorage: failed to parse stored value:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Quota exceeded or other storage errors - silently continue
    }
  }, [key, storedValue]);

  return { value: storedValue, setValue: setStoredValue };
}