/**
 * RepositoryContext – The single source of truth for all application data.
 * 
 * This context provides access to the unified `saveData` object, which contains:
 *   - subjects     : array of topics
 *   - dispatches   : array of short essays
 *   - manuscripts  : array of long‑form texts with treatises
 *   - portfolio    : CV‑style object
 *   - points       : array of points of interest
 * 
 * It also exposes CRUD methods for each data type, automatically updating the
 * persisted state via `useAsyncStorage`.
 * 
 * @module RepositoryContext
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { DEFAULT_SAVE_DATA } from '../constants/defaultData';

// AsyncStorage key for the entire save data object
const STORAGE_KEY = '@al_khalasa/saveData';

const RepositoryContext = createContext();

/**
 * Provider component that wraps the app and makes data available to all children.
 * 
 * @param {Object} props – Standard React props
 * @param {ReactNode} props.children – The child components
 * @returns {JSX.Element} – Provider with context value
 */
export const RepositoryProvider = ({ children }) => {
  // Load the entire save data object (or use default)
  const [rawSaveData, setSaveData, isLoading] = useAsyncStorage(STORAGE_KEY, DEFAULT_SAVE_DATA);

  // Ensure we always have an object (defensive)
  const saveData = (rawSaveData && typeof rawSaveData === 'object') ? rawSaveData : {};

  // Derive individual collections with fallbacks (always arrays)
  const subjects = Array.isArray(saveData.subjects) ? saveData.subjects : [];
  const dispatches = Array.isArray(saveData.dispatches) ? saveData.dispatches : [];
  const manuscripts = Array.isArray(saveData.manuscripts) ? saveData.manuscripts : [];
  const portfolio = saveData.portfolio && typeof saveData.portfolio === 'object'
    ? saveData.portfolio
    : DEFAULT_SAVE_DATA.portfolio;
  const points = Array.isArray(saveData.points) ? saveData.points : [];

  /**
   * Helper to update the entire saveData object.
   * Used internally by all CRUD methods.
   * 
   * @param {Object} newData – The new complete saveData object
   * @returns {Promise<void>}
   */
  const updateSaveData = useCallback(async (newData) => {
    await setSaveData(newData);
  }, [setSaveData]);

  // ----- TOPICS (subjects) -----
  /**
   * Adds a new topic.
   * @param {Object} subject – The topic object (should contain id, name, field, etc.)
   * @returns {Promise<void>}
   */
  const addSubject = useCallback(async (subject) => {
    const newSubjects = [...subjects, { ...subject }];
    await updateSaveData({ ...saveData, subjects: newSubjects });
  }, [saveData, subjects, updateSaveData]);

  /**
   * Updates an existing topic.
   * @param {string} id – The topic's unique id
   * @param {Object} updated – The updated topic object
   * @returns {Promise<void>}
   */
  const updateSubject = useCallback(async (id, updated) => {
    const newSubjects = subjects.map(s => s.id === id ? { ...updated } : s);
    await updateSaveData({ ...saveData, subjects: newSubjects });
  }, [saveData, subjects, updateSaveData]);

  /**
   * Deletes a topic and all associated dispatches/manuscripts.
   * @param {string} id – The topic's id
   * @returns {Promise<void>}
   */
  const deleteSubject = useCallback(async (id) => {
    const newSubjects = subjects.filter(s => s.id !== id);
    const newDispatches = dispatches.filter(d => d.subjectId !== id);
    const newManuscripts = manuscripts.filter(m => m.subjectId !== id);
    await updateSaveData({
      ...saveData,
      subjects: newSubjects,
      dispatches: newDispatches,
      manuscripts: newManuscripts,
    });
  }, [saveData, subjects, dispatches, manuscripts, updateSaveData]);

  // ----- DISPATCHES -----
  /** Adds a new dispatch. */
  const addDispatch = useCallback(async (dispatch) => {
    const newDispatches = [...dispatches, { ...dispatch }];
    await updateSaveData({ ...saveData, dispatches: newDispatches });
  }, [saveData, dispatches, updateSaveData]);

  /** Updates an existing dispatch. */
  const updateDispatch = useCallback(async (id, updated) => {
    const newDispatches = dispatches.map(d => d.id === id ? { ...updated } : d);
    await updateSaveData({ ...saveData, dispatches: newDispatches });
  }, [saveData, dispatches, updateSaveData]);

  /** Deletes a dispatch. */
  const deleteDispatch = useCallback(async (id) => {
    const newDispatches = dispatches.filter(d => d.id !== id);
    await updateSaveData({ ...saveData, dispatches: newDispatches });
  }, [saveData, dispatches, updateSaveData]);

  // ----- MANUSCRIPTS -----
  /** Adds a new manuscript. */
  const addManuscript = useCallback(async (manuscript) => {
    const newManuscripts = [...manuscripts, { ...manuscript }];
    await updateSaveData({ ...saveData, manuscripts: newManuscripts });
  }, [saveData, manuscripts, updateSaveData]);

  /** Updates an existing manuscript. */
  const updateManuscript = useCallback(async (id, updated) => {
    const newManuscripts = manuscripts.map(m => m.id === id ? { ...updated } : m);
    await updateSaveData({ ...saveData, manuscripts: newManuscripts });
  }, [saveData, manuscripts, updateSaveData]);

  /** Deletes a manuscript. */
  const deleteManuscript = useCallback(async (id) => {
    const newManuscripts = manuscripts.filter(m => m.id !== id);
    await updateSaveData({ ...saveData, manuscripts: newManuscripts });
  }, [saveData, manuscripts, updateSaveData]);

  // ----- PORTFOLIO -----
  /**
   * Replaces the entire portfolio object.
   * @param {Object} newPortfolio – The new portfolio (should match the expected structure)
   */
  const updatePortfolio = useCallback(async (newPortfolio) => {
    await updateSaveData({ ...saveData, portfolio: newPortfolio });
  }, [saveData, updateSaveData]);

  // ----- POINTS OF INTEREST -----
  /** Adds a new point. Automatically generates an id. */
  const addPoint = useCallback(async (point) => {
    const newPoints = [...points, { ...point, id: Date.now().toString() }];
    await updateSaveData({ ...saveData, points: newPoints });
  }, [saveData, points, updateSaveData]);

  /** Updates an existing point. */
  const updatePoint = useCallback(async (id, updated) => {
    const newPoints = points.map(p => p.id === id ? { ...updated } : p);
    await updateSaveData({ ...saveData, points: newPoints });
  }, [saveData, points, updateSaveData]);

  /** Deletes a point. */
  const deletePoint = useCallback(async (id) => {
    const newPoints = points.filter(p => p.id !== id);
    await updateSaveData({ ...saveData, points: newPoints });
  }, [saveData, points, updateSaveData]);

  // Memoize the context value to prevent unnecessary re‑renders
  const value = useMemo(
    () => ({
      subjects,
      dispatches,
      manuscripts,
      portfolio,
      points,
      isLoading,
      addSubject,
      updateSubject,
      deleteSubject,
      addDispatch,
      updateDispatch,
      deleteDispatch,
      addManuscript,
      updateManuscript,
      deleteManuscript,
      updatePortfolio,
      addPoint,
      updatePoint,
      deletePoint,
    }),
    [
      subjects,
      dispatches,
      manuscripts,
      portfolio,
      points,
      isLoading,
      addSubject,
      updateSubject,
      deleteSubject,
      addDispatch,
      updateDispatch,
      deleteDispatch,
      addManuscript,
      updateManuscript,
      deleteManuscript,
      updatePortfolio,
      addPoint,
      updatePoint,
      deletePoint,
    ]
  );

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
};

/**
 * Custom hook to access the repository context.
 * 
 * @returns {Object} The context value containing all data and CRUD methods.
 * @throws {Error} If used outside of a RepositoryProvider.
 * 
 * @example
 * const { subjects, addSubject } = useRepository();
 */
export const useRepository = () => {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error('useRepository must be used within RepositoryProvider');
  return ctx;
};