// Offline Space Guide — answers from preloaded app data (no API key needed).
// QueuingMe-style Copilot uses a server + Azure OpenAI; this runs entirely in the browser.

import { PLANETS, SUN_STORY } from './planets.js';
import { CONSTELLATIONS } from './starsData.js';
import { MORE_CONSTELLATIONS } from './constellationsMore.js';
import { MILKY_WAY, LOCAL_GROUP, OBSERVABLE_UNIVERSE } from './galaxyData.js';
import { COSMOS_FIELD } from './galaxyCatalogExtra.js';
import { speak } from './narration.js';

const TOPICS = [
  { q: 'Tell me about Earth', keys: ['earth', 'our planet', 'home'] },
  { q: 'What is the Milky Way?', keys: ['milky way', 'galaxy', 'our galaxy'] },
  { q: 'How far is Mars?', keys: ['mars', 'red planet', 'distance mars'] },
  { q: 'What is a constellation?', keys: ['constellation', 'orion', 'stars pattern'] },
];

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(s) {
  return norm(s).split(' ').filter((w) => w.length > 1);
}

function scoreEntry(question, entry) {
  const q = norm(question);
  let score = 0;
  for (const k of entry.keys) {
    if (q.includes(k)) score += k.split(' ').length * 4;
  }
  for (const t of tokens(question)) {
    if (entry.keys.some((k) => k.includes(t) || t.includes(k))) score += 2;
    if (entry.name && norm(entry.name).includes(t)) score += 5;
  }
  return score;
}

export function buildSpaceKnowledge() {
  const entries = [
    {
      name: 'The Sun',
      keys: ['sun', 'star', 'solar'],
      answer: SUN_STORY,
      facts: ['A giant ball of glowing hot gas.', 'Light takes 8 minutes to reach Earth.'],
    },
    ...PLANETS.map((p) => ({
      name: p.name,
      keys: [p.id, p.name.toLowerCase(), ...(p.type || '').toLowerCase().split(' ')],
      answer: p.story,
      facts: p.facts,
    })),
    ...[...CONSTELLATIONS, ...MORE_CONSTELLATIONS].map((c) => ({
      name: c.name,
      keys: [c.id, c.name.toLowerCase(), 'constellation', ...(c.type || '').toLowerCase().split(' ')],
      answer: c.story,
      facts: c.facts,
    })),
    {
      name: MILKY_WAY.name,
      keys: ['milky way', 'milkyway', 'our galaxy', 'home galaxy'],
      answer: MILKY_WAY.story,
      facts: MILKY_WAY.facts,
    },
    ...LOCAL_GROUP.map((g) => ({
      name: g.name,
      keys: [g.id, g.short?.toLowerCase(), g.name.toLowerCase(), 'local group', 'andromeda'],
      answer: g.story,
      facts: g.facts,
    })),
    ...COSMOS_FIELD.slice(0, 12).map((g) => ({
      name: g.name,
      keys: [g.id, g.short?.toLowerCase(), g.name.toLowerCase()],
      answer: g.story,
      facts: g.facts,
    })),
    {
      name: 'Light-year',
      keys: ['light year', 'light-year', 'ly', 'distance space', 'how far'],
      answer: 'A light-year is how far light travels in one year — about 9.5 trillion kilometers! When you look at a star, you see light that left long ago. Far away means long ago.',
      facts: ['Stars are measured in light-years.', 'The Moon is about 1.3 light-seconds away.'],
    },
    {
      name: 'Solar System',
      keys: ['solar system', 'planets', 'orbit', 'eight planets'],
      answer: 'Our Solar System has the Sun at the center and eight planets orbiting it. Rocky worlds like Earth are closer in; giant gas planets like Jupiter live farther out. All the planets mostly share one flat plane — like coins on a table!',
      facts: ['Eight planets orbit our Sun.', 'Asteroids and comets live here too.'],
    },
    {
      name: OBSERVABLE_UNIVERSE.name,
      keys: ['universe', 'observable', 'cosmos', 'deep space', 'edge'],
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

  if (best && bestScore >= 3) {
    const fact = best.facts?.[0];
    return fact ? `${best.answer} Fun fact: ${fact}` : best.answer;
  }

  if (q.includes('hello') || q.includes('hi ') || q === 'hi') {
    return 'Hello, space explorer! Tap a planet or constellation, or ask me about the Sun, Mars, the Milky Way, and more!';
  }

  return 'Hmm, I am not sure about that one! Try asking about a planet (like Jupiter), a constellation (like Orion), or the Milky Way. You can also tap objects in the sky to visit them!';
}

export function mountSpaceGuide(knowledge) {
  const panel = document.getElementById('guide-panel');
  const log = document.getElementById('guide-log');
  const input = document.getElementById('guide-input');
  const btn = document.getElementById('btn-guide');
  const close = document.getElementById('guide-close');
  const send = document.getElementById('guide-send');
  const chips = document.getElementById('guide-chips');

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
    const answer = askSpaceGuide(q, knowledge);
    setTimeout(() => {
      append('bot', answer);
      speak(answer.slice(0, 280));
    }, 120);
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
      append('bot', 'Hi! I know about planets, stars, constellations, and galaxies. What do you want to explore?');
    }
  });
  close.addEventListener('click', () => panel.classList.remove('open'));
  send.addEventListener('click', () => submit(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit(input.value);
  });
}
