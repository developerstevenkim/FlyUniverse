// Offline Space Guide — keyword search over bundled space data (browser-only, no API).

import { PLANETS, SUN_STORY } from './planets.js';
import { BRIGHT_STARS, CONSTELLATIONS } from './starsData.js';
import { MORE_STARS, MORE_CONSTELLATIONS } from './constellationsMore.js';
import { MILKY_WAY, LOCAL_GROUP, OBSERVABLE_UNIVERSE } from './galaxyData.js';
import { COSMOS_FIELD } from './galaxyCatalogExtra.js';
import { speak } from './narration.js';

const ALL_BRIGHT = [...BRIGHT_STARS, ...MORE_STARS];

const TOPICS = [
  { q: 'Tell me about Earth', keys: ['earth'] },
  { q: 'What is the Milky Way?', keys: ['milky way'] },
  { q: 'How far is Mars?', keys: ['mars'] },
  { q: 'What is Orion?', keys: ['orion'] },
];

function cleanKeys(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .map((k) => String(k).toLowerCase().trim())
    .filter((k) => k.length > 0);
}

function norm(s) {
  return String(s).toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokens(s) {
  return norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1);
}

function scoreEntry(question, entry) {
  const q = norm(question);
  let score = 0;
  const keys = entry.keys || [];

  for (const k of keys) {
    if (!k) continue;
    if (q.includes(k)) score += k.split(' ').length * 4;
  }
  for (const t of tokens(question)) {
    for (const k of keys) {
      if (!k) continue;
      if (k.includes(t) || t.includes(k)) score += 2;
    }
    if (entry.name && norm(entry.name).includes(t)) score += 6;
    if (entry.searchText && entry.searchText.includes(t)) score += 1;
  }
  return score;
}

export function buildSpaceKnowledge() {
  const entries = [
    {
      name: 'The Sun',
      keys: cleanKeys(['sun', 'solar', 'star']),
      answer: SUN_STORY,
      facts: ['A giant ball of glowing hot gas.', 'Light takes 8 minutes to reach Earth.'],
    },
    ...PLANETS.map((p) => ({
      name: p.name,
      keys: cleanKeys(p.id, p.name, p.type, ...(p.id === 'earth' ? ['home'] : [])),
      answer: p.story,
      facts: p.facts,
      searchText: norm(`${p.name} ${p.story} ${p.facts?.join(' ')}`),
    })),
    ...ALL_BRIGHT.map((s) => ({
      name: s.name,
      keys: cleanKeys(s.id, s.name, 'star'),
      answer: `${s.name} is a real star about ${s.ly} light-years from Earth! Its light has been traveling through space for years to reach your eyes.`,
      facts: [`${s.ly} light-years away.`, 'A real star in our Milky Way.'],
      searchText: norm(s.name),
    })),
    ...[...CONSTELLATIONS, ...MORE_CONSTELLATIONS].map((c) => ({
      name: c.name,
      keys: cleanKeys(c.id, c.name, 'constellation', c.type),
      answer: c.story,
      facts: c.facts,
      searchText: norm(`${c.name} ${c.story} ${c.facts?.join(' ')}`),
    })),
    {
      name: MILKY_WAY.name,
      keys: cleanKeys('milky way', 'milkyway', 'our galaxy', 'home galaxy'),
      answer: MILKY_WAY.story,
      facts: MILKY_WAY.facts,
    },
    ...LOCAL_GROUP.filter((g) => g.id !== 'milky_way').map((g) => ({
      name: g.name,
      keys: cleanKeys(g.id, g.short, g.name, 'local group', 'andromeda'),
      answer: g.story,
      facts: g.facts,
      searchText: norm(`${g.name} ${g.short || ''} ${g.story}`),
    })),
    ...COSMOS_FIELD.slice(0, 15).map((g) => ({
      name: g.name,
      keys: cleanKeys(g.id, g.short, g.name),
      answer: g.story,
      facts: g.facts,
      searchText: norm(`${g.name} ${g.short || ''}`),
    })),
    {
      name: 'Light-year',
      keys: cleanKeys('light year', 'light-year', 'ly', 'how far', 'distance'),
      answer: 'A light-year is how far light travels in one year — about 9.5 trillion kilometers! When you look at a star, you see light that left long ago.',
      facts: ['Stars are measured in light-years.', 'The Moon is about 1.3 light-seconds away.'],
    },
    {
      name: 'Solar System',
      keys: cleanKeys('solar system', 'planets', 'orbit', 'eight planets'),
      answer: 'Our Solar System has the Sun at the center and eight planets orbiting it. Rocky worlds like Earth are closer in; giant gas planets like Jupiter live farther out.',
      facts: ['Eight planets orbit our Sun.', 'Most orbits share one flat plane.'],
    },
    {
      name: 'Moon',
      keys: cleanKeys('moon', 'lunar'),
      answer: 'The Moon is Earth\'s companion in space! It is about 384,000 km away and takes about a month to orbit us. Astronauts walked on it in 1969.',
      facts: ['The Moon causes ocean tides on Earth.', 'It is slowly drifting farther away.'],
    },
    {
      name: OBSERVABLE_UNIVERSE.name,
      keys: cleanKeys('universe', 'observable', 'cosmos', 'deep space', 'edge'),
      answer: OBSERVABLE_UNIVERSE.story,
      facts: OBSERVABLE_UNIVERSE.facts,
    },
  ];

  return { entries, topics: TOPICS };
}

export function askSpaceGuide(question, knowledge) {
  const q = norm(question);
  if (!q) {
    return 'Ask me about planets, stars, constellations, or galaxies!';
  }

  let best = null;
  let bestScore = 0;
  for (const entry of knowledge.entries) {
    const s = scoreEntry(question, entry);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  if (best && bestScore >= 2) {
    const fact = best.facts?.[0];
    return fact ? `${best.answer}\n\nFun fact: ${fact}` : best.answer;
  }

  if (/hello|hi/.test(q)) {
    return 'Hello, space explorer! Try "Mars", "Orion", or "Milky Way".';
  }

  const hints = ['Earth', 'Jupiter', 'Orion', 'Milky Way', 'Mars', 'Andromeda'];
  return `I could not find a perfect match. Try: ${hints.join(', ')} — or tap an object in the sky!`;
}

export function mountSpaceGuide(knowledge) {
  const panel = document.getElementById('guide-panel');
  const log = document.getElementById('guide-log');
  const input = document.getElementById('guide-input');
  const btn = document.getElementById('btn-guide');
  const close = document.getElementById('guide-close');
  const send = document.getElementById('guide-send');
  const chips = document.getElementById('guide-chips');

  if (!panel || !log || !btn) return;

  function append(role, text) {
    const row = document.createElement('div');
    row.className = `guide-msg guide-msg--${role}`;
    row.textContent = text;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function submit(text) {
    const q = text.trim();
    if (!q) return;
    append('user', q);
    input.value = '';
    let answer;
    try {
      answer = askSpaceGuide(q, knowledge);
    } catch (err) {
      console.error('Space Guide error:', err);
      answer = 'Oops — something went wrong. Try "Earth" or "Mars".';
    }
    append('bot', answer);
    try { speak(answer.slice(0, 280)); } catch { /* TTS optional */ }
  }

  for (const t of knowledge.topics) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'guide-chip';
    chip.textContent = t.q;
    chip.addEventListener('click', () => submit(t.q));
    chips.appendChild(chip);
  }

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !log.childElementCount) {
      append('bot', 'Hi! Ask about planets, stars, or galaxies. Try the chips below!');
    }
  });
  close?.addEventListener('click', () => panel.classList.remove('open'));
  send?.addEventListener('click', () => submit(input.value));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit(input.value);
  });
}
