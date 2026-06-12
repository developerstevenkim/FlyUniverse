// English narration via the Web Speech API.
// Picks the best-sounding English voice available on the device.

let voices = [];
let chosenVoice = null;
let enabled = true;

const PREFERRED = [
  // macOS / iOS premium voices first, then Google/Microsoft, then any en-US
  'samantha', 'ava', 'allison', 'susan', 'zoe', 'evan', 'nathan', 'joelle',
  'google us english', 'microsoft aria', 'microsoft jenny', 'microsoft guy',
  'karen', 'daniel', 'moira',
];

function pickVoice() {
  if (!voices.length) return null;
  const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  if (!english.length) return voices[0];

  for (const want of PREFERRED) {
    const hit = english.find((v) => v.name.toLowerCase().includes(want));
    if (hit) return hit;
  }
  // prefer en-US, then default flag, then first english
  return (
    english.find((v) => v.lang.toLowerCase() === 'en-us' && v.localService) ||
    english.find((v) => v.lang.toLowerCase() === 'en-us') ||
    english.find((v) => v.default) ||
    english[0]
  );
}

function refreshVoices() {
  if (!('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices();
  chosenVoice = pickVoice();
}

export function initNarration() {
  if (!('speechSynthesis' in window)) return;
  refreshVoices();
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

export function setNarrationEnabled(on) {
  enabled = on;
  if (!on) stopNarration();
}

let pendingSpeak = null;

export function stopNarration() {
  clearTimeout(pendingSpeak);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function speak(text, { onEnd } = {}) {
  if (!enabled || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  stopNarration();
  // Chrome quirk: speak() right after cancel() is silently dropped — wait a beat
  pendingSpeak = setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    if (!chosenVoice) refreshVoices();
    if (chosenVoice) {
      u.voice = chosenVoice;
      u.lang = chosenVoice.lang;
    } else {
      u.lang = 'en-US';
    }
    u.rate = 0.92;   // a touch slower for kids
    u.pitch = 1.08;  // slightly brighter
    u.volume = 1;
    if (onEnd) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    window.speechSynthesis.speak(u);
  }, 120);
}
