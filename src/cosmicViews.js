import * as THREE from 'three';
import { MILKY_WAY, LOCAL_GROUP, OBSERVABLE_UNIVERSE } from './galaxyData.js';
import { EXTRA_LOCAL_GROUP, COSMOS_FIELD } from './galaxyCatalogExtra.js';
import { buildGalaxyNode } from './galaxyVisuals.js';
import { createStarLabelTexture } from './planets.js';

function makeDrillUserData(base, extra = {}) {
  return { ...base, ...extra };
}

function buildSolarSystemMarker(pickables) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(5, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xffee66 })
  );
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(8, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.35 })
  );
  const ud = makeDrillUserData({
    isDrill: true,
    drillLevel: 'system',
    pickViews: ['galaxy'],
    name: 'Solar System',
    type: 'Our Sun and planets',
    thumb: null,
    ly: 0,
    pickRadius: 12,
    facts: [
      'Eight planets orbit our Sun.',
      'Click to zoom into the solar system!',
      'From here you can visit Earth and other worlds.',
    ],
    story: 'This is our Solar System — a cozy family of planets, moons, and asteroids all held by the Sun\'s gravity. Let\'s fly closer!',
  });
  core.userData = ud;
  pickables.push(core);

  const labelTex = new THREE.CanvasTexture(createStarLabelTexture('SOL SYSTEM'));
  labelTex.magFilter = THREE.NearestFilter;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false })
  );
  label.scale.set(32, 12, 1);
  label.position.y = 14;
  label.userData = { isLabel: true };

  group.add(glow);
  group.add(core);
  group.add(label);
  group.position.set(52, 10, 24);
  return { group, core, label };
}

export function buildCosmicLayers(scene, pickables) {
  const root = new THREE.Group();
  root.name = 'cosmicLayers';

  // --- GAL: Milky Way + solar-system entry point ---
  const galGroup = new THREE.Group();
  const galMW = buildGalaxyNode(
    { ...MILKY_WAY, discRadius: 140, pickRadius: 95, drillLevel: 'system', pickViews: ['galaxy'] },
    pickables
  );
  galGroup.add(galMW.group);
  const solMarker = buildSolarSystemMarker(pickables);
  galGroup.add(solMarker.group);

  // --- GRP: Local Group (expanded) ---
  const grpGroup = new THREE.Group();
  const allLocal = [...LOCAL_GROUP, ...EXTRA_LOCAL_GROUP];
  for (const g of allLocal) {
    const isHome = g.id === 'milky_way';
    const scaled = {
      ...g,
      discRadius: isHome ? 72 : g.discRadius * 0.82,
      pickRadius: g.pickRadius * 0.82,
      drillPath: isHome ? ['galaxy', 'system', 'close'] : null,
      drillFinal: isHome ? 'earth' : null,
      pickViews: ['cluster'],
    };
    grpGroup.add(buildGalaxyNode(scaled, pickables).group);
  }

  // --- COS: 35+ named galaxies ---
  const cosGroup = new THREE.Group();

  const cosHome = buildGalaxyNode({
    ...MILKY_WAY,
    short: 'HOME',
    x: 0, y: 0, z: 0,
    discRadius: 38,
    pickRadius: 30,
    drillPath: ['cluster', 'galaxy', 'system', 'close'],
    drillFinal: 'earth',
    pickViews: ['universe'],
  }, pickables);
  cosGroup.add(cosHome.group);

  for (const g of COSMOS_FIELD) {
    cosGroup.add(buildGalaxyNode({ ...g, pickViews: ['universe'] }, pickables).group);
  }
  cosGroup.add(buildGalaxyNode({
    ...OBSERVABLE_UNIVERSE,
    drillPath: null,
    pickViews: ['universe'],
  }, pickables).group);

  root.add(galGroup);
  root.add(grpGroup);
  root.add(cosGroup);
  scene.add(root);

  function setDiscOpacity(group, alpha) {
    group.traverse((obj) => {
      if (obj.geometry?.type === 'CircleGeometry' && obj.material) {
        obj.material.opacity = alpha;
      }
    });
  }

  function setLabelOpacity(group, alpha) {
    group.traverse((obj) => {
      if (obj.userData?.isLabel && obj.material) obj.material.opacity = alpha;
    });
  }

  function setCosmicView(view) {
    const showGal = view === 'near' || view === 'system' || view === 'galaxy';
    galGroup.visible = showGal;
    grpGroup.visible = view === 'cluster' || view === 'galaxy' || view === 'system';
    cosGroup.visible = view === 'universe' || view === 'cluster';

    setDiscOpacity(galMW.group, view === 'galaxy' ? 0.97 : 0.06);
    galMW.label.material.opacity = view === 'galaxy' ? 1 : 0;
    solMarker.group.visible = view === 'galaxy';
    solMarker.label.material.opacity = view === 'galaxy' ? 1 : 0;

    const grpAlpha = view === 'cluster' ? 0.97 : view === 'galaxy' ? 0.12 : 0;
    setDiscOpacity(grpGroup, grpAlpha);
    setLabelOpacity(grpGroup, view === 'cluster' ? 1 : 0);

    const cosAlpha = view === 'universe' ? 0.94 : view === 'cluster' ? 0.15 : 0;
    setDiscOpacity(cosGroup, cosAlpha);
    setLabelOpacity(cosGroup, view === 'universe' ? 1 : 0);
  }

  return { root, setCosmicView, solMarker };
}
