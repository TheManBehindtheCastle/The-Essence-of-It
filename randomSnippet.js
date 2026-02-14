import { LOREM } from '../constants/lorem';

const SNIPPETS = [
  LOREM.substring(0, 200) + '…',
  'The ink of the scholar is more precious than the blood of the martyr.',
  'Wisdom is the lost property of the believer.',
  'The universe is a book written in the language of mathematics.',
  'Healing the body begins with healing the soul.',
  'The stars are signs for those who reflect.',
  'Reason and revelation are twin sisters.',
  'Every manuscript contains the echo of its author.',
  'To preserve knowledge is to preserve humanity.',
];

export const getRandomSnippet = () => {
  return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
};