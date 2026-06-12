// Camera-distance → zoom level. Enables auto CAM highlight + drill-down.

export const ZOOM_ORDER = ['universe', 'cluster', 'galaxy', 'system', 'close'];

export const ZOOM_CONFIG = {
  close: {
    pos: [0, 12, 40],
    label: 'NEAR — tap a planet',
    maxDist: 120,
    camDist: 42,
  },
  system: {
    pos: [0, 62, 142],
    label: 'SOLAR SYSTEM — tap a planet or zoom in',
    maxDist: 400,
    camDist: 142,
  },
  galaxy: {
    pos: [0, 220, 480],
    label: 'MILKY WAY — tap Solar System to zoom in',
    maxDist: 900,
    camDist: 510,
  },
  cluster: {
    pos: [0, 420, 980],
    label: 'LOCAL GROUP — tap Milky Way to zoom in',
    maxDist: 1400,
    camDist: 1060,
  },
  universe: {
    pos: [0, 650, 1550],
    label: 'DEEP COSMOS — tap a galaxy',
    maxDist: 2200,
    camDist: 1680,
  },
};

export function camDistToLevel(dist) {
  if (dist < 70) return 'close';
  if (dist < 220) return 'system';
  if (dist < 620) return 'galaxy';
  if (dist < 1200) return 'cluster';
  return 'universe';
}

export function levelToVector3(level) {
  const p = ZOOM_CONFIG[level].pos;
  return { x: p[0], y: p[1], z: p[2] };
}
