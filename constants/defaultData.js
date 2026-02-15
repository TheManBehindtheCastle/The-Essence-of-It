import { ALL_SUBJECTS, INITIAL_DISPATCHES, INITIAL_MANUSCRIPTS } 
from '../data/initialData'; // adjust ../ count based on file location

const DEFAULT_PORTFOLIO = {
  name: '',
  subtitle: '',
  about: '',
  skills: [],
  experience: [],
  education: [],
  contact: {},
};

export const DEFAULT_SAVE_DATA = {
  subjects: ALL_SUBJECTS,
  dispatches: INITIAL_DISPATCHES,
  manuscripts: INITIAL_MANUSCRIPTS,
  portfolio: DEFAULT_PORTFOLIO,
  points: [],
};