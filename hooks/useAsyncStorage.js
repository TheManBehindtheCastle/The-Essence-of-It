import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAsyncStorage = (key, initialValue = {}) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (isMounted) {
          if (item !== null) {
            try {
              const parsed = JSON.parse(item);
              setStoredValue(parsed);
            } catch (e) {
              setStoredValue(initialValue);
            }
          } else {
            setStoredValue(initialValue);
          }
        }
      } catch (e) {
        if (isMounted) console.error(`[useAsyncStorage:${key}] load error:`, e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [key, initialValue]);

  const setValue = useCallback(async (value) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue)).catch(e => {
        console.warn(`AsyncStorage write failed for ${key}:`, e);
      });
    } catch (e) {
      console.warn(`Error in setValue for ${key}:`, e);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading];
};