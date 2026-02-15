import { SEGMENTS } from '../constants/segments';

export const getRandomSegmentId = () => {
  return SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)].id;
};

export const getSegmentLabel = (id) => {
  const seg = SEGMENTS.find((s) => s.id === id);
  return seg ? seg.label : '';
};