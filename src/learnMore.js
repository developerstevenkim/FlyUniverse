// External learn-more links (Wikipedia + NASA). Static catalog data — not live API per object.

const WIKI = (page) => `https://en.wikipedia.org/wiki/${encodeURIComponent(page.replace(/ /g, '_'))}`;

const PLANET_PAGES = {
  mercury: { wiki: 'Mercury_(planet)', nasa: 'https://science.nasa.gov/mercury/' },
  venus: { wiki: 'Venus', nasa: 'https://science.nasa.gov/venus/' },
  earth: { wiki: 'Earth', nasa: 'https://science.nasa.gov/earth/facts/' },
  mars: { wiki: 'Mars', nasa: 'https://science.nasa.gov/mars/' },
  jupiter: { wiki: 'Jupiter', nasa: 'https://science.nasa.gov/jupiter/' },
  saturn: { wiki: 'Saturn', nasa: 'https://science.nasa.gov/saturn/' },
  uranus: { wiki: 'Uranus', nasa: 'https://science.nasa.gov/uranus/' },
  neptune: { wiki: 'Neptune', nasa: 'https://science.nasa.gov/neptune/' },
};

const CONSTELLATION_WIKI = {
  orion: 'Orion_(constellation)',
  ursa_major: 'Ursa_Major',
  cassiopeia: 'Cassiopeia_(constellation)',
  leo: 'Leo_(constellation)',
  scorpius: 'Scorpius',
  cygnus: 'Cygnus_(constellation)',
  lyra: 'Lyra',
  gemini: 'Gemini_(constellation)',
  taurus: 'Taurus_(constellation)',
  canis_major: 'Canis_Major',
  aquila: 'Aquila_(constellation)',
  pegasus: 'Pegasus_(constellation)',
  andromeda: 'Andromeda_(constellation)',
  perseus: 'Perseus_(constellation)',
  draco: 'Draco_(constellation)',
  bootes: 'Boötes',
  virgo: 'Virgo_(constellation)',
  libra: 'Libra_(constellation)',
  sagittarius: 'Sagittarius_(constellation)',
  capricornus: 'Capricornus',
  aquarius: 'Aquarius_(constellation)',
  pisces: 'Pisces_(constellation)',
  aries: 'Aries_(constellation)',
  cancer: 'Cancer_(constellation)',
  hercules: 'Hercules_(constellation)',
  ophiuchus: 'Ophiuchus',
  serpens: 'Serpens',
  centaurus: 'Centaurus',
  crux: 'Crux',
  phoenix: 'Phoenix_(constellation)',
  cetus: 'Cetus_(constellation)',
  eridanus: 'Eridanus_(constellation)',
  hydra: 'Hydra_(constellation)',
};

const GALAXY_WIKI = {
  milky_way: 'Milky_Way',
  andromeda: 'Andromeda_Galaxy',
  triangulum: 'Triangulum_Galaxy',
  lmc: 'Large_Magellanic_Cloud',
  smc: 'Small_Magellanic_Cloud',
  sombrero: 'Sombrero_Galaxy',
  whirlpool: 'Whirlpool_Galaxy',
  pinwheel: 'Pinwheel_Galaxy',
  cigar: 'Cigar_Galaxy',
  centaurus_a: 'Centaurus_A',
  observable_universe: 'Observable_universe',
};

/** @returns {{ page: string, source?: { label: string, url: string } } | null} */
export function getLearnMoreLinks(data) {
  if (!data?.name) return null;

  if (data.isSun) {
    return {
      page: WIKI('Sun'),
      source: { label: 'NASA — The Sun', url: 'https://science.nasa.gov/sun/' },
    };
  }

  if (data.id && PLANET_PAGES[data.id]) {
    const p = PLANET_PAGES[data.id];
    return { page: WIKI(p.wiki), source: { label: 'NASA Solar System', url: p.nasa } };
  }

  if (data.isConstellation) {
    const wikiKey = CONSTELLATION_WIKI[data.id] || `${data.name}_(constellation)`;
    return {
      page: WIKI(wikiKey),
      source: { label: 'IAU constellations', url: 'https://www.iau.org/public/themes/constellations/' },
    };
  }

  if (data.isStar) {
    return {
      page: WIKI(data.name),
      source: { label: 'SIMBAD astronomical database', url: `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(data.name)}` },
    };
  }

  if (data.isCosmic) {
    const wikiKey = GALAXY_WIKI[data.id] || data.name;
    return {
      page: WIKI(wikiKey),
      source: { label: 'NASA/IPAC Extragalactic Database', url: 'https://ned.ipac.caltech.edu/' },
    };
  }

  return null;
}

export const DATA_SOURCES = {
  distances: { label: 'NASA/JPL Horizons (mean AU)', url: 'https://ssd.jpl.nasa.gov/' },
  apod: { label: 'NASA Astronomy Picture of the Day API', url: 'https://api.nasa.gov/' },
};
