import { getRandomSegmentId } from '../utils/segmentHelper';
import { getRandomSnippet } from '../utils/randomSnippet';

// ----- 6 CORE TOPICS -----
const CORE_SUBJECTS = [
  {
    id: 'liberalism',
    name: 'Liberalism',
    field: 'Political Philosophy',
    era: '17th–21st Century',
    sage: 'John Locke',
    question: 'How do individual rights and liberty shape modern governance?',
  },
  {
    id: 'socialism',
    name: 'Socialism',
    field: 'Political Economy',
    era: '19th–21st Century',
    sage: 'Karl Marx',
    question: 'How can society organize to achieve collective welfare?',
  },
  {
    id: 'nationalism',
    name: 'Nationalism',
    field: 'Political Theory',
    era: '19th–20th Century',
    sage: 'Johann Gottfried Herder',
    question: 'What role does national identity play in political cohesion?',
  },
  {
    id: 'capitalism',
    name: 'Capitalism',
    field: 'Economics',
    era: '18th–21st Century',
    sage: 'Adam Smith',
    question: 'How do free markets and private ownership drive prosperity?',
  },
  {
    id: 'communism',
    name: 'Communism',
    field: 'Revolutionary Theory',
    era: '19th–20th Century',
    sage: 'Karl Marx',
    question: 'How can a classless society be achieved through revolution?',
  },
  {
    id: 'fascism',
    name: 'Fascism',
    field: 'Authoritarian Ideology',
    era: '20th Century',
    sage: 'Benito Mussolini',
    question: 'How does the fusion of state and corporate power manifest?',
  },
];

export const ALL_SUBJECTS = CORE_SUBJECTS;

// ----- GENERATE DISPATCHES AND MANUSCRIPTS (non‑fiction) -----
export const INITIAL_DISPATCHES = [];
export const INITIAL_MANUSCRIPTS = [];

// Helper to generate realistic titles
const getDispatchTitle = (sub, segmentId, index) => {
  const titles = {
    lineage: [
      `The Genealogy of ${sub.name}`,
      `Origins of ${sub.name} Thought`,
      `Precursors to ${sub.name}`,
      `Development of ${sub.name} in the ${sub.era.split('–')[0]}`,
    ],
    voices: [
      `The Life and Work of ${sub.sage}`,
      `Key Thinkers of ${sub.name}`,
      `${sub.sage}'s Legacy`,
      `Biographical Sketch: ${sub.sage}`,
    ],
    impacts: [
      `${sub.name} in Practice: Historical Cases`,
      `The Influence of ${sub.name} on Modern Policy`,
      `${sub.name} and Economic Transformation`,
      `Case Study: ${sub.name} in the 20th Century`,
    ],
    discourses: [
      `Debates Within ${sub.name}`,
      `${sub.name} and Its Critics`,
      `Thesis and Antithesis in ${sub.name}`,
      `Contemporary Discourse on ${sub.name}`,
    ],
  };
  const pool = titles[segmentId] || [`${sub.name} Dispatch ${index}`];
  return pool[index % pool.length];
};

const getManuscriptTitle = (sub, segmentId, index) => {
  const titles = {
    lineage: [
      `A History of ${sub.name} Ideas`,
      `The Evolution of ${sub.name}`,
      `Foundational Texts of ${sub.name}`,
      `Genealogy of a Concept: ${sub.name}`,
    ],
    voices: [
      `Collected Works of ${sub.sage}`,
      `Biographies of ${sub.name} Thinkers`,
      `The Intellectual Circle of ${sub.name}`,
      `Portraits of ${sub.name} Philosophers`,
    ],
    impacts: [
      `${sub.name} and Society: A Historical Analysis`,
      `The Impact of ${sub.name} on Institutions`,
      `${sub.name} in Action: Case Studies`,
      `Economic and Political Outcomes of ${sub.name}`,
    ],
    discourses: [
      `Critical Perspectives on ${sub.name}`,
      `${sub.name} Under Scrutiny`,
      `The Future of ${sub.name} Debate`,
      `Dialogues on ${sub.name}`,
    ],
  };
  const pool = titles[segmentId] || [`${sub.name} Manuscript ${index}`];
  return pool[index % pool.length];
};

const getManuscriptAuthor = (sub, index) => {
  const authors = [
    sub.sage,
    `Prof. A. Scholar`,
    `Dr. E. Researcher`,
    `Institute for ${sub.name} Studies`,
  ];
  return authors[index % authors.length];
};

// Generate non‑fiction dispatches and manuscripts
ALL_SUBJECTS.forEach((sub) => {
  const count = 15; // 15 per subject
  for (let i = 1; i <= count; i++) {
    const segmentId = getRandomSegmentId();

    // Dispatch (non‑fiction)
    INITIAL_DISPATCHES.push({
      id: `D-${sub.id}-${i}`,
      subjectId: sub.id,
      segmentId,
      type: 'dispatch',
      heading: getDispatchTitle(sub, segmentId, i),
      title: `${sub.name} Dispatch ${i}`,
      body: `## Introduction\n\n${getRandomSnippet()}\n\n## Core Arguments\n\n${getRandomSnippet()}\n\n## Implications\n\n${getRandomSnippet()}`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Manuscript (non‑fiction)
    const treatiseCount = Math.floor(Math.random() * 3) + 1;
    const treatises = [];
    for (let t = 1; t <= treatiseCount; t++) {
      treatises.push({
        id: `T-${sub.id}-${i}-${t}`,
        title: `Treatise ${t}: ${['Foundations', 'Critique', 'Synthesis'][(t-1) % 3]}`,
        content: `## Chapter ${t}\n\n${getRandomSnippet()}\n\n${getRandomSnippet()}`,
      });
    }

    INITIAL_MANUSCRIPTS.push({
      id: `M-${sub.id}-${i}`,
      subjectId: sub.id,
      segmentId,
      type: 'manuscript',
      title: getManuscriptTitle(sub, segmentId, i),
      author: getManuscriptAuthor(sub, i),
      blurb: `A comprehensive examination of ${sub.name} within the context of ${sub.field}.`,
      summary: `This manuscript (Vol. ${i}) explores ${segmentId} themes in ${sub.name}, drawing on primary sources and contemporary scholarship.`,
      treatises,
      attachments: [],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      genre: 'Non-fiction',
    });
  }
});

// ----- ADD 12 FICTION MANUSCRIPTS (placeholders) -----
const fictionTitles = [
  'The Dream of the Iron Tower',
  'Echoes of the Lost Caliphate',
  'The Alchemist’s Daughter',
  'A Tale of Two Cities: Baghdad and Cordoba',
  'The Last Philosopher',
  'The Ink of the Soul',
  'Winds of Change',
  'The Secret Garden of Wisdom',
  'The Night of the Moon',
  'The Caravan of Stars',
  'The Manuscript of Eternity',
  'The Shadow of the Scholar',
];

const fictionAuthors = [
  'Layla Al‑Rashid',
  'Omar Khayyam Jr.',
  'Aisha bint Tariq',
  'Zayd Al‑Andalusi',
  'Fatima Al‑Zahra',
  'Khalil Jibran',
  'Rumi’s Heir',
  'Ibn Tufayl’s Descendant',
  'Scheherazade’s Ghost',
  'Al‑Mutasim the Younger',
  'The Scribe of Baghdad',
  'The Poet of Cordoba',
];

for (let i = 0; i < 12; i++) {
  const segmentId = getRandomSegmentId();
  const treatiseCount = Math.floor(Math.random() * 3) + 1;
  const treatises = [];
  for (let t = 1; t <= treatiseCount; t++) {
    treatises.push({
      id: `T-fiction-${i}-${t}`,
      title: `Chapter ${t}: ${['The Beginning', 'The Conflict', 'The Resolution'][(t-1) % 3]}`,
      content: `## ${['Prologue', 'Chapter One', 'Epilogue'][(t-1) % 3]}\n\n${getRandomSnippet()}\n\n${getRandomSnippet()}`,
    });
  }

  INITIAL_MANUSCRIPTS.push({
    id: `M-fiction-${i}`,
    subjectId: ALL_SUBJECTS[i % ALL_SUBJECTS.length].id, // distribute across topics
    segmentId,
    type: 'manuscript',
    title: fictionTitles[i],
    author: fictionAuthors[i],
    blurb: `A captivating work of fiction exploring themes of knowledge, power, and mystery.`,
    summary: `This imaginative tale weaves together elements of history, philosophy, and adventure.`,
    treatises,
    attachments: [],
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(), // within last 6 months
    genre: 'Fiction',
  });
}

// ----- DEFAULT PORTFOLIO -----
const DEFAULT_PORTFOLIO = {
  name: '',
  subtitle: '',
  about: '',
  skills: [],
  experience: [],
  education: [],
  contact: {},
};

// ----- DEFAULT POINTS -----
const DEFAULT_POINTS = [];

// ----- EXPORT -----
export const DEFAULT_SAVE_DATA = {
  subjects: ALL_SUBJECTS,
  dispatches: INITIAL_DISPATCHES,
  manuscripts: INITIAL_MANUSCRIPTS,
  portfolio: DEFAULT_PORTFOLIO,
  points: DEFAULT_POINTS,
};