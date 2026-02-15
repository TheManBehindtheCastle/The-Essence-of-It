import { getRandomSegmentId } from '../utils/segmentHelper';
import { getRandomSnippet } from '../utils/randomSnippet';

const CORE_SUBJECTS = [
  {
    id: 'falsafa',
    name: 'Falsafa',
    field: 'Philosophy',
    era: 'Abbasid',
    sage: 'Al-Farabi',
    question: 'How does the preservation of Philosophy illuminate the modern seeker?',
  },
  {
    id: 'kalam',
    name: 'Kalam',
    field: 'Theology',
    era: 'Classical',
    sage: 'Al-Ghazali',
    question: 'How does dialectical theology shape our understanding of faith?',
  },
  {
    id: 'jabr',
    name: 'Al-Jabr',
    field: 'Mathematics',
    era: 'House of Wisdom',
    sage: 'Al-Khwarizmi',
    question: 'How does the language of algebra reveal hidden patterns?',
  },
  {
    id: 'tibb',
    name: 'Tibb',
    field: 'Medicine',
    era: 'Andalusian',
    sage: 'Ibn Sina',
    question: 'How does the humoral theory inform modern holistic health?',
  },
  {
    id: 'nujum',
    name: 'Nujum',
    field: 'Astronomy',
    era: 'Maragheh',
    sage: 'Al-Tusi',
    question: 'How does the celestial motion reflect divine order?',
  },
];

const EXTRA_SUBJECTS = [];
for (let i = 6; i <= 12; i++) {
  EXTRA_SUBJECTS.push({
    id: `topic-${i}`,
    name: `Topic ${i}`,
    field: `Field ${i}`,
    era: `Era ${i}`,
    sage: `Sage ${i}`,
    question: `How does Topic ${i} illuminate the modern seeker?`,
  });
}

export const ALL_SUBJECTS = [...CORE_SUBJECTS, ...EXTRA_SUBJECTS];

export const INITIAL_DISPATCHES = [];
export const INITIAL_MANUSCRIPTS = [];

ALL_SUBJECTS.forEach((sub) => {
  const count = sub.id.startsWith('topic-') ? 2 : 25;
  for (let i = 1; i <= count; i++) {
    INITIAL_DISPATCHES.push({
      id: `D-${sub.id}-${i}`,
      subjectId: sub.id,
      segmentId: getRandomSegmentId(),
      type: 'dispatch',
      heading: `On ${sub.field} – Inquiry #${i}`,
      title: `${sub.name} Dispatch ${i}`,
      body: `## Introduction\n\n${getRandomSnippet()}\n\n## Core Arguments\n\n${getRandomSnippet()}\n\n## Implications\n\n${getRandomSnippet()}`,
    });

    const treatiseCount = Math.floor(Math.random() * 2) + 1;
    const treatises = [];
    for (let t = 1; t <= treatiseCount; t++) {
      treatises.push({
        id: `T-${sub.id}-${i}-${t}`,
        title: `Treatise ${t}`,
        content: `## Chapter ${t}\n\n${getRandomSnippet()}\n\n${getRandomSnippet()}`,
      });
    }

    INITIAL_MANUSCRIPTS.push({
      id: `M-${sub.id}-${i}`,
      subjectId: sub.id,
      segmentId: getRandomSegmentId(),
      type: 'manuscript',
      title: `Codex ${sub.name} – Vol. ${i}`,
      author: sub.sage || 'Unknown',
      blurb: `A ${sub.field} manuscript from the ${sub.era} era.`,
      summary: `Volume ${i} explores the teachings of ${sub.sage || 'the author'}.`,
      treatises,
      attachments: [],
    });
  }
});