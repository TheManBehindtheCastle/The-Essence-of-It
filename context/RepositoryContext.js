import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { DEFAULT_SAVE_DATA } from '../constants/defaultData';

const STORAGE_KEY = '@al_khalasa/saveData';

const RepositoryContext = createContext();

export const RepositoryProvider = ({ children }) => {
  const [rawSaveData, setSaveData, isLoading] = useAsyncStorage(STORAGE_KEY, DEFAULT_SAVE_DATA);

  const saveData = (rawSaveData && typeof rawSaveData === 'object') ? rawSaveData : {};

  const subjects = Array.isArray(saveData.subjects) ? saveData.subjects : [];
  const dispatches = Array.isArray(saveData.dispatches) ? saveData.dispatches : [];
  const manuscripts = Array.isArray(saveData.manuscripts) ? saveData.manuscripts : [];
  const portfolio = saveData.portfolio && typeof saveData.portfolio === 'object'
    ? saveData.portfolio
    : DEFAULT_SAVE_DATA.portfolio;
  const points = Array.isArray(saveData.points) ? saveData.points : [];

  const updateSaveData = useCallback(async (newData) => {
    const cloned = JSON.parse(JSON.stringify(newData));
    await setSaveData(cloned);
  }, [setSaveData]);

  // ----- TOPICS -----
  const addSubject = useCallback(async (subject) => {
    const newSubjects = [...subjects, { ...subject }];
    await updateSaveData({ ...saveData, subjects: newSubjects });
  }, [saveData, subjects, updateSaveData]);

  const updateSubject = useCallback(async (id, updated) => {
    const newSubjects = subjects.map(s => s.id === id ? { ...updated } : s);
    await updateSaveData({ ...saveData, subjects: newSubjects });
  }, [saveData, subjects, updateSaveData]);

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
  const addDispatch = useCallback(async (dispatch) => {
    const newDispatch = {
      ...dispatch,
      createdAt: dispatch.createdAt || new Date().toISOString(),
    };
    const newDispatches = [...dispatches, newDispatch];
    await updateSaveData({ ...saveData, dispatches: newDispatches });
  }, [saveData, dispatches, updateSaveData]);

  const updateDispatch = useCallback(async (id, updated) => {
    const newDispatches = dispatches.map(d => d.id === id ? { ...updated } : d);
    await updateSaveData({ ...saveData, dispatches: newDispatches });
  }, [saveData, dispatches, updateSaveData]);

  const deleteDispatch = useCallback(async (id) => {
    const newDispatches = dispatches.filter(d => d.id !== id);
    await updateSaveData({ ...saveData, dispatches: newDispatches });
  }, [saveData, dispatches, updateSaveData]);

  // ----- MANUSCRIPTS -----
  const addManuscript = useCallback(async (manuscript) => {
    const newManuscript = {
      ...manuscript,
      createdAt: manuscript.createdAt || new Date().toISOString(),
      genre: manuscript.genre || 'Non-fiction',
    };
    const newManuscripts = [...manuscripts, newManuscript];
    await updateSaveData({ ...saveData, manuscripts: newManuscripts });
  }, [saveData, manuscripts, updateSaveData]);

  const updateManuscript = useCallback(async (id, updated) => {
    const newManuscripts = manuscripts.map(m => m.id === id ? { ...updated } : m);
    await updateSaveData({ ...saveData, manuscripts: newManuscripts });
  }, [saveData, manuscripts, updateSaveData]);

  const deleteManuscript = useCallback(async (id) => {
    const newManuscripts = manuscripts.filter(m => m.id !== id);
    await updateSaveData({ ...saveData, manuscripts: newManuscripts });
  }, [saveData, manuscripts, updateSaveData]);

  // ----- PORTFOLIO -----
  const updatePortfolio = useCallback(async (newPortfolio) => {
    await updateSaveData({ ...saveData, portfolio: newPortfolio });
  }, [saveData, updateSaveData]);

  // ----- POINTS -----
  const addPoint = useCallback(async (point) => {
    const newPoints = [...points, { ...point, id: Date.now().toString() }];
    await updateSaveData({ ...saveData, points: newPoints });
  }, [saveData, points, updateSaveData]);

  const updatePoint = useCallback(async (id, updated) => {
    const newPoints = points.map(p => p.id === id ? { ...updated } : p);
    await updateSaveData({ ...saveData, points: newPoints });
  }, [saveData, points, updateSaveData]);

  const deletePoint = useCallback(async (id) => {
    const newPoints = points.filter(p => p.id !== id);
    await updateSaveData({ ...saveData, points: newPoints });
  }, [saveData, points, updateSaveData]);

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

export const useRepository = () => {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error('useRepository must be used within RepositoryProvider');
  return ctx;
};