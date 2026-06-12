// Extended galaxy catalog — NASA/IPAC public data (static).
// Positions are artistic layout for the COS view, not true sky coordinates.

const PALETTES = {
  spiral: ['#f0f4ff', '#b8c8e8', '#6880b8', '#384878', '#182040'],
  barred: ['#fff8e0', '#e8c86a', '#9a7ad4', '#3a2878', '#12082a'],
  elliptical: ['#fff0d8', '#d8b888', '#a08060', '#604838', '#302018'],
  irregular: ['#ffe8d0', '#d8a898', '#a87888', '#684860', '#301828'],
  lenticular: ['#fffae8', '#d8c888', '#887858', '#403828', '#181008'],
};

function g(id, name, short, type, visual, ly, x, z, y = 0, size = 1) {
  return {
    id, name, short: short || name, type, visual,
    palette: PALETTES[visual] || PALETTES.spiral,
    x, y, z,
    discRadius: (28 + size * 14) * (ly > 50_000_000 ? 1.15 : 1),
    pickRadius: (20 + size * 10),
    ly,
    tilt: -0.45 - Math.random() * 0.4,
    spin: (Math.random() - 0.5) * 1.2,
    facts: [
      `${ly >= 1_000_000 ? `${(ly / 1_000_000).toFixed(0)} million` : ly.toLocaleString()} light-years away.`,
      `A ${type.toLowerCase()} in the deep universe.`,
      'Each galaxy holds billions of stars.',
    ],
    story: `This is ${name}${short ? ` (${short})` : ''} — a distant island of stars ${ly >= 1_000_000 ? `${(ly / 1_000_000).toFixed(1)} million light-years` : `${ly.toLocaleString()} light-years`} from Earth. Every tiny smudge in a telescope can be an entire cosmos like this one.`,
  };
}

export const EXTRA_LOCAL_GROUP = [
  g('ngc6822', 'Barnard\'s Galaxy', 'NGC 6822', 'Irregular galaxy', 'irregular', 1_630_000, -220, 180, -10, 1.2),
  g('ic1613', 'IC 1613', 'IC 1613', 'Irregular galaxy', 'irregular', 2_380_000, 240, -200, 15, 1),
  g('ngc3109', 'NGC 3109', 'NGC 3109', 'Irregular galaxy', 'irregular', 4_300_000, -320, -80, -20, 0.9),
  g('leo_a', 'Leo A', 'Leo A', 'Dwarf irregular', 'irregular', 2_500_000, 180, 280, 25, 0.7),
];

export const COSMOS_FIELD = [
  g('bodes', 'Bode\'s Galaxy', 'M81', 'Spiral galaxy', 'spiral', 11_800_000, -480, 320, 30, 1.4),
  g('cigar', 'Cigar Galaxy', 'M82', 'Starburst galaxy', 'irregular', 12_000_000, -420, -380, 50, 1.2),
  g('sombrero', 'Sombrero Galaxy', 'M104', 'Lenticular galaxy', 'lenticular', 29_300_000, 520, -420, 20, 1.3),
  g('whirlpool', 'Whirlpool Galaxy', 'M51', 'Spiral galaxy', 'spiral', 23_000_000, -580, 260, -40, 1.5),
  g('pinwheel', 'Pinwheel Galaxy', 'M101', 'Spiral galaxy', 'spiral', 21_000_000, 720, 480, 60, 1.6),
  g('black_eye', 'Black Eye Galaxy', 'M64', 'Spiral galaxy', 'spiral', 17_000_000, 220, 640, -30, 1.1),
  g('sunflower', 'Sunflower Galaxy', 'M63', 'Spiral galaxy', 'spiral', 29_000_000, 600, -520, 70, 1.2),
  g('centaurus_a', 'Centaurus A', 'NGC 5128', 'Elliptical galaxy', 'elliptical', 13_000_000, -680, -220, -50, 1.4),
  g('sculptor', 'Sculptor Galaxy', 'NGC 253', 'Starburst spiral', 'spiral', 11_400_000, -300, 580, 40, 1.3),
  g('m83', 'Southern Pinwheel', 'M83', 'Spiral galaxy', 'spiral', 14_700_000, 380, -600, -20, 1.3),
  g('m106', 'Messier 106', 'M106', 'Spiral galaxy', 'spiral', 23_700_000, 820, -280, 35, 1.1),
  g('m95', 'Messier 95', 'M95', 'Barred spiral', 'barred', 33_000_000, -760, 120, 15, 1),
  g('m96', 'Messier 96', 'M96', 'Spiral galaxy', 'spiral', 31_000_000, -700, 60, 10, 1.1),
  g('m91', 'Messier 91', 'M91', 'Barred spiral', 'barred', 63_000_000, 900, 180, -15, 0.9),
  g('ngc1300', 'NGC 1300', 'NGC 1300', 'Barred spiral', 'barred', 61_000_000, 450, 820, 45, 1.2),
  g('ngc4565', 'Needle Galaxy', 'NGC 4565', 'Spiral galaxy', 'spiral', 42_000_000, -850, 700, -35, 1.1),
  g('ngc4631', 'Whale Galaxy', 'NGC 4631', 'Edge-on spiral', 'spiral', 25_000_000, 680, 720, 25, 1),
  g('ngc7331', 'Deer Lick Group', 'NGC 7331', 'Spiral galaxy', 'spiral', 40_000_000, -920, -480, 55, 1.1),
  g('ngc2403', 'NGC 2403', 'NGC 2403', 'Spiral galaxy', 'spiral', 8_000_000, 160, -340, 20, 1.2),
  g('ngc4236', 'NGC 4236', 'NGC 4236', 'Barred spiral', 'barred', 11_700_000, -180, -560, -10, 0.9),
  g('ic342', 'Hidden Galaxy', 'IC 342', 'Spiral galaxy', 'spiral', 11_000_000, 280, 380, 30, 1.1),
  g('m87', 'Virgo A', 'M87', 'Elliptical galaxy', 'elliptical', 53_000_000, -550, 850, 80, 1.5),
  g('m86', 'Messier 86', 'M86', 'Lenticular galaxy', 'lenticular', 52_000_000, -500, 800, 70, 1),
  g('m84', 'Messier 84', 'M84', 'Lenticular galaxy', 'lenticular', 60_000_000, -460, 760, 65, 0.95),
  g('m49', 'Messier 49', 'M49', 'Elliptical galaxy', 'elliptical', 56_000_000, 500, 900, 90, 1.1),
  g('m88', 'Messier 88', 'M88', 'Spiral galaxy', 'spiral', 47_000_000, -400, 920, 40, 1),
  g('m99', 'Messier 99', 'M99', 'Spiral galaxy', 'spiral', 44_000_000, 350, 950, 35, 1),
  g('m61', 'Messier 61', 'M61', 'Spiral galaxy', 'spiral', 52_000_000, 780, 850, 50, 1),
  g('m100', 'Messier 100', 'M100', 'Spiral galaxy', 'spiral', 55_000_000, -620, 950, 45, 1.1),
  g('m65', 'Messier 65', 'M65', 'Spiral galaxy', 'spiral', 35_000_000, -380, 680, 25, 0.95),
  g('m66', 'Messier 66', 'M66', 'Spiral galaxy', 'spiral', 36_000_000, -340, 640, 20, 1),
  g('m109', 'Messier 109', 'M109', 'Barred spiral', 'barred', 83_000_000, 950, 420, 60, 0.9),
  g('ic1101', 'IC 1101', 'IC 1101', 'Giant elliptical', 'elliptical', 1_040_000_000, 1100, -900, 100, 1.8),
  g('udf', 'Hubble Deep Field', 'HDF', 'Galaxy field', 'elliptical', 12_000_000_000, 0, -1100, 120, 1.6),
];
