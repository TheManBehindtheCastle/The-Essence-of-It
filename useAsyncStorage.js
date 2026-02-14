/**
 * useAsyncStorage – A custom React hook for reading and writing data to AsyncStorage.
 * 
 * It mimics the familiar `useState` interface while automatically persisting the value
 * to AsyncStorage. It also provides a loading flag.
 * 
 * @module useAsyncStorage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook that manages a piece of state synchronized with AsyncStorage.
 * 
 * @param {string} key – The AsyncStorage key under which the value is stored.
 * @param {any} initialValue – The default value to use if no value is found in storage.
 *                              Should be a serializable object (default is {}).
 * @returns {[any, Function, boolean]} – A tuple containing:
 *   - storedValue : the current value (restored from storage or initialValue)
 *   - setValue    : a function to update the value (persists to storage)
 *   - isLoading   : boolean indicating whether the initial load is still in progress
 * 
 * @example
 * const [user, setUser, loading] = useAsyncStorage('@user', { name: 'Guest' });
 * 
 * // Update user – automatically saved
 * setUser({ name: 'Alia' });
 */
export const useAsyncStorage = (key, initialValue = {}) => {
  // Local state for the value and loading flag
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load the stored value when the component mounts or the key changes
  useEffect(() => {
    let isMounted = true;          // Prevent state updates after unmount

    const load = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (isMounted) {
          if (item !== null) {
            try {
              const parsed = JSON.parse(item);
              setStoredValue(parsed);          // Restore parsed object
            } catch (e) {
              // Malformed JSON – fallback to initialValue silently
              setStoredValue(initialValue);
            }
          } else {
            // No stored data – use initialValue
            setStoredValue(initialValue);
          }
        }
      } catch (e) {
        // AsyncStorage error – log but keep initial value
        if (isMounted) console.error(`[useAsyncStorage:${key}] load error:`, e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => { isMounted = false; };
  }, [key, initialValue]);   // Re‑run if key or initialValue changes

  /**
   * Updates the value in state and attempts to persist it to AsyncStorage.
   * The function can be called with a new value directly, or with a function
   * that receives the previous value and returns the new one (like useState).
   * 
   * @param {any|Function} value – New value or updater function
   * @returns {Promise<void>} – Resolves after state update; storage write is fire‑and‑forget.
   * 
   * @example
   * setValue({ count: 1 })                     // direct
   * setValue(prev => ({ ...prev, count: 2 })) // functional update
   */
  const setValue = useCallback(async (value) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);                         // update UI immediately
      // Persist in background – errors are logged but don't affect UI
      await AsyncStorage.setItem(key, JSON.stringify(newValue)).catch(e => {
        console.warn(`AsyncStorage write failed for ${key}:`, e);
      });
    } catch (e) {
      console.warn(`Error in setValue for ${key}:`, e);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading];
};