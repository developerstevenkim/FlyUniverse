// Bright stars + constellation patterns (public catalog data, no API key).
// RA in hours, Dec in degrees, distance in light-years.

export const BRIGHT_STARS = [
  { id: 'sirius', name: 'Sirius', ra: 6.752, dec: -16.716, ly: 8.6, color: 0xaad4ff },
  { id: 'canopus', name: 'Canopus', ra: 6.399, dec: -52.696, ly: 310, color: 0xfff4d6 },
  { id: 'arcturus', name: 'Arcturus', ra: 14.261, dec: 19.182, ly: 37, color: 0xffb347 },
  { id: 'vega', name: 'Vega', ra: 18.616, dec: 38.784, ly: 25, color: 0xd8f0ff },
  { id: 'capella', name: 'Capella', ra: 5.278, dec: 45.998, ly: 43, color: 0xfff0c8 },
  { id: 'rigel', name: 'Rigel', ra: 5.242, dec: -8.202, ly: 860, color: 0xc8e8ff },
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 5.919, dec: 7.407, ly: 548, color: 0xff7744 },
  { id: 'aldebaran', name: 'Aldebaran', ra: 4.599, dec: 16.509, ly: 65, color: 0xff9955 },
  { id: 'antares', name: 'Antares', ra: 16.49, dec: -26.432, ly: 550, color: 0xff5533 },
  { id: 'spica', name: 'Spica', ra: 13.42, dec: -11.161, ly: 250, color: 0xb8d4ff },
  { id: 'pollux', name: 'Pollux', ra: 7.755, dec: 28.026, ly: 34, color: 0xffcc88 },
  { id: 'fomalhaut', name: 'Fomalhaut', ra: 22.961, dec: -29.622, ly: 25, color: 0xe8f4ff },
  { id: 'deneb', name: 'Deneb', ra: 20.69, dec: 45.28, ly: 2600, color: 0xf0f8ff },
  { id: 'regulus', name: 'Regulus', ra: 10.139, dec: 11.967, ly: 79, color: 0xdce8ff },
  { id: 'polaris', name: 'Polaris', ra: 2.53, dec: 89.264, ly: 433, color: 0xfff8e8 },
  { id: 'altair', name: 'Altair', ra: 19.846, dec: 8.868, ly: 17, color: 0xf0f8ff },
  { id: 'mizar', name: 'Mizar', ra: 13.398, dec: 54.925, ly: 83, color: 0xe0ecff },
  { id: 'dubhe', name: 'Dubhe', ra: 11.062, dec: 61.751, ly: 123, color: 0xffd080 },
  { id: 'schedar', name: 'Schedar', ra: 0.675, dec: 56.537, ly: 228, color: 0xffaa66 },
  { id: 'shaula', name: 'Shaula', ra: 17.56, dec: -37.104, ly: 570, color: 0xb8d8ff },
];

export const CONSTELLATIONS = [
  {
    id: 'orion',
    name: 'Orion',
    type: 'Winter hunter',
    starIds: ['betelgeuse', 'rigel', 'bellatrix', 'saiph'],
    lines: [['betelgeuse', 'bellatrix'], ['bellatrix', 'rigel'], ['betelgeuse', 'rigel']],
    extraStars: [
      { id: 'bellatrix', name: 'Bellatrix', ra: 5.419, dec: 6.35, ly: 250, color: 0xc8e0ff },
      { id: 'saiph', name: 'Saiph', ra: 5.795, dec: -9.67, ly: 720, color: 0xb8d8ff },
    ],
    facts: [
      'One of the easiest constellations to spot!',
      'Orion\'s Belt is three stars in a row.',
      'The red star Betelgeuse is a giant near the end of its life.',
    ],
    story: 'This is Orion, the great hunter of the winter sky! Find his bright belt of three stars, his red shoulder Betelgeuse, and his blue foot Rigel. People have told stories about Orion for thousands of years.',
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major',
    type: 'Big Dipper',
    starIds: ['dubhe', 'mizar', 'alkaid', 'megrez', 'phecda', 'merak'],
    lines: [['dubhe', 'merak'], ['merak', 'phecda'], ['phecda', 'megrez'], ['megrez', 'mizar'], ['mizar', 'alkaid']],
    extraStars: [
      { id: 'alkaid', name: 'Alkaid', ra: 13.792, dec: 49.313, ly: 104, color: 0xe8f0ff },
      { id: 'megrez', name: 'Megrez', ra: 12.257, dec: 57.033, ly: 81, color: 0xf0f4ff },
      { id: 'phecda', name: 'Phecda', ra: 11.897, dec: 53.695, ly: 83, color: 0xdce8ff },
      { id: 'merak', name: 'Merak', ra: 11.03, dec: 56.382, ly: 79, color: 0xe0ecff },
    ],
    facts: [
      'The Big Dipper is part of Ursa Major, the Great Bear.',
      'Two stars in the dipper point toward Polaris, the North Star.',
      'Visible all year from the northern hemisphere.',
    ],
    story: 'Meet Ursa Major — the Great Bear! Its brightest part looks like a big soup ladle called the Big Dipper. If you draw a line through the front of the dipper, it leads you to Polaris, the North Star!',
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    type: 'W-shaped queen',
    starIds: ['schedar', 'caph', 'gamma_cas', 'ruchbah', 'segin'],
    lines: [['caph', 'schedar'], ['schedar', 'gamma_cas'], ['gamma_cas', 'ruchbah'], ['ruchbah', 'segin']],
    extraStars: [
      { id: 'caph', name: 'Caph', ra: 0.153, dec: 59.15, ly: 54, color: 0xfff0d0 },
      { id: 'gamma_cas', name: 'Tsih', ra: 0.945, dec: 60.717, ly: 550, color: 0xf0f8ff },
      { id: 'ruchbah', name: 'Ruchbah', ra: 1.43, dec: 60.235, ly: 99, color: 0xf0f0ff },
      { id: 'segin', name: 'Segin', ra: 1.906, dec: 63.67, ly: 440, color: 0xe8f4ff },
    ],
    facts: [
      'Looks like a letter W or M in the sky.',
      'Named after a queen in Greek mythology.',
      'On the opposite side of Polaris from the Big Dipper.',
    ],
    story: 'This is Cassiopeia, the vain queen! Her stars make a shiny W shape high in the sky. She spins around Polaris all night long, never dipping below the horizon in many northern countries.',
  },
  {
    id: 'leo',
    name: 'Leo',
    type: 'The lion',
    starIds: ['regulus', 'denebola', 'algieba', 'zosma'],
    lines: [['regulus', 'algieba'], ['algieba', 'denebola'], ['regulus', 'zosma'], ['zosma', 'denebola']],
    extraStars: [
      { id: 'denebola', name: 'Denebola', ra: 11.818, dec: 14.572, ly: 36, color: 0xf0f8ff },
      { id: 'algieba', name: 'Algieba', ra: 10.333, dec: 19.842, ly: 130, color: 0xffdd88 },
      { id: 'zosma', name: 'Zosma', ra: 11.235, dec: 20.524, ly: 58, color: 0xe8f0ff },
    ],
    facts: [
      'A spring constellation shaped like a crouching lion.',
      'Regulus is one of the brightest stars in the whole sky.',
      'The Leonid meteor shower seems to come from Leo.',
    ],
    story: 'Roar! This is Leo the Lion, king of the spring sky. His brightest star Regulus marks the lion\'s heart. Look for a backward question mark shape — that is the lion\'s head and mane!',
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    type: 'The scorpion',
    starIds: ['antares', 'shaula', 'sargas', 'grafias'],
    lines: [['antares', 'grafias'], ['grafias', 'sargas'], ['sargas', 'shaula']],
    extraStars: [
      { id: 'sargas', name: 'Sargas', ra: 17.621, dec: -42.998, ly: 270, color: 0xfff0d8 },
      { id: 'grafias', name: 'Grafias', ra: 16.005, dec: -22.621, ly: 530, color: 0xd0e8ff },
    ],
    facts: [
      'Antares is a huge red supergiant star.',
      'Looks like a scorpion with a curving tail.',
      'Best seen in summer from the northern hemisphere.',
    ],
    story: 'Here is Scorpius, the cosmic scorpion! Its red heart Antares glows like a ruby. Long ago, Greek storytellers said this scorpion was sent to chase Orion across the sky — that is why they are never up together!',
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    type: 'Northern Cross',
    starIds: ['deneb', 'albireo', 'sadr', 'gienah'],
    lines: [['deneb', 'sadr'], ['sadr', 'albireo'], ['sadr', 'gienah']],
    extraStars: [
      { id: 'albireo', name: 'Albireo', ra: 19.512, dec: 27.96, ly: 390, color: 0xffeebb },
      { id: 'sadr', name: 'Sadr', ra: 20.37, dec: 40.257, ly: 1800, color: 0xf0f8ff },
      { id: 'gienah', name: 'Gienah', ra: 20.77, dec: 33.971, ly: 72, color: 0xe8f0ff },
    ],
    facts: [
      'Also called the Northern Cross.',
      'Deneb is one of the most distant stars you can see with your eyes.',
      'The Milky Way runs right through Cygnus.',
    ],
    story: 'This is Cygnus, the Swan, flying along the Milky Way! It also looks like a giant cross. Its tail star Deneb is so far away that its light started traveling toward us when ancient Egypt was building pyramids!',
  },
];

// Place a star on a celestial sphere (radius in scene units).
export function raDecToPosition(raHours, decDeg, radius) {
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = (decDeg * Math.PI) / 180;
  return {
    x: radius * Math.cos(dec) * Math.cos(ra),
    y: radius * Math.sin(dec),
    z: radius * Math.cos(dec) * Math.sin(ra),
  };
}
