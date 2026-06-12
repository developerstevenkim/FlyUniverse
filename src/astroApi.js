// Optional live space data (NASA Open APIs — free DEMO_KEY, no signup required).

const NASA_KEY = 'DEMO_KEY';
const CACHE_KEY = 'flyuniverse.nasa_apod';
const CACHE_MS = 12 * 60 * 60 * 1000; // 12 h

function apodPageUrl(dateStr) {
  // API date "YYYY-MM-DD" → apod.nasa.gov/apod/apYYMMDD.html
  const compact = dateStr.replace(/-/g, '').slice(2);
  return `https://apod.nasa.gov/apod/ap${compact}.html`;
}

/** NASA APOD — only live API in this app. Cached 12 h per device. */
export async function fetchDailySpaceFact() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const { ts, payload, text } = parsed;
      if (Date.now() - ts < CACHE_MS) {
        if (payload?.title) return payload;
        if (text) return { title: 'NASA APOD', snippet: text, pageUrl: 'https://apod.nasa.gov/apod/astropix.html', apiUrl: 'https://api.nasa.gov/' };
      }
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&thumbs=true`
    );
    if (!res.ok) throw new Error(`NASA APOD ${res.status}`);
    const data = await res.json();
    if (!data.title) return null;
    const payload = {
      title: data.title,
      snippet: `${(data.explanation || '').slice(0, 140)}…`,
      pageUrl: apodPageUrl(data.date),
      apiUrl: 'https://api.nasa.gov/',
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }));
    return payload;
  } catch {
    return null;
  }
}

// Mean orbital distances (AU) — NASA/JPL reference values, used when live APIs are unavailable.
export const MEAN_AU = {
  sun: 0,
  mercury: 0.387,
  venus: 0.723,
  earth: 1.0,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.07,
};

export const AU_KM = 149_597_870.7;

export function formatAuKm(au) {
  const km = au * AU_KM;
  if (au < 0.1) return `${km.toLocaleString('en-US', { maximumFractionDigits: 0 })} km`;
  if (au < 10) return `${au.toFixed(2)} AU  (${(km / 1e6).toFixed(1)} million km)`;
  return `${au.toFixed(1)} AU  (${(km / 1e6).toFixed(0)} million km)`;
}

export function formatLightYears(ly) {
  if (ly < 100) return `${ly} light-years from Earth`;
  if (ly < 1_000_000) return `${Math.round(ly).toLocaleString()} light-years from Earth`;
  if (ly < 1_000_000_000) return `${(ly / 1_000_000).toFixed(1)} million light-years away`;
  return `${(ly / 1_000_000_000).toFixed(1)} billion light-years away`;
}

// Distance between two bodies orbiting the Sun (AU), from 3D world positions.
export function distanceEarthToBodyAUFromPositions(earthPos, targetPos, targetAu) {
  const rE = earthPos.length();
  const rT = targetPos.length();
  if (rE < 0.001 || rT < 0.001) return targetAu;
  const cosAng = earthPos.dot(targetPos) / (rE * rT);
  const dAng = Math.acos(Math.min(1, Math.max(-1, cosAng)));
  const rAu = MEAN_AU.earth;
  return Math.sqrt(rAu * rAu + targetAu * targetAu - 2 * rAu * targetAu * Math.cos(dAng));
}
