import * as THREE from 'three';
import { BRIGHT_STARS, CONSTELLATIONS, raDecToPosition } from './starsData.js';
import { MORE_STARS, MORE_CONSTELLATIONS } from './constellationsMore.js';

const ALL_STARS = [...BRIGHT_STARS, ...MORE_STARS];
const ALL_CONSTELLATIONS = [...CONSTELLATIONS, ...MORE_CONSTELLATIONS];
import { createStarLabelTexture } from './planets.js';

const SKY_RADIUS = 780;
const LINE_PICK_RADIUS = 3.8;

function makeStarThumb(colorHex) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 32);
  g.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
  for (let i = 0; i < 40; i++) {
    g.fillRect(Math.random() * 60, Math.random() * 28, 2, 2);
  }
  g.fillStyle = '#fff';
  g.fillRect(28, 12, 8, 8);
  return c.toDataURL();
}

function makeConstellationUserData(con) {
  return {
    isDeepSky: true,
    isConstellation: true,
    id: con.id,
    name: con.name,
    type: con.type,
    thumb: makeStarThumb(0xff4fd2),
    facts: con.facts,
    story: con.story,
    ly: null,
  };
}

// Invisible thick tube along each constellation line — much easier to tap than a 1px line.
function addLinePicker(group, a, b, userData, pickables) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.01) return;
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const picker = new THREE.Mesh(
    new THREE.CylinderGeometry(LINE_PICK_RADIUS, LINE_PICK_RADIUS, len, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  picker.position.copy(mid);
  picker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  picker.userData = userData;
  group.add(picker);
  pickables.push(picker);
}

export function buildDeepSky(scene, pickables) {
  const group = new THREE.Group();
  group.name = 'deepSky';
  const starMap = new Map();

  function registerStar(star) {
    if (starMap.has(star.id)) return starMap.get(star.id);
    const pos = raDecToPosition(star.ra, star.dec, SKY_RADIUS);
    const v = new THREE.Vector3(pos.x, pos.y, pos.z);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(star.ly < 50 ? 3.6 : 3.0, 10, 10),
      new THREE.MeshBasicMaterial({ color: star.color })
    );
    mesh.position.copy(v);
    mesh.userData = {
      isDeepSky: true,
      isStar: true,
      id: star.id,
      name: star.name,
      type: 'Real star',
      ly: star.ly,
      thumb: makeStarThumb(star.color),
      facts: [
        `${star.ly} light-years from Earth.`,
        'A real star in our Milky Way galaxy.',
        'Part of a constellation — tap the green lines for the full story!',
      ],
      story: `This is ${star.name}, a real star ${star.ly} light-years away! Its light left long ago and is just reaching your eyes now. That is how far away space really is.`,
    };
    group.add(mesh);
    pickables.push(mesh);
    starMap.set(star.id, { mesh, pos: v });
    return starMap.get(star.id);
  }

  for (const s of ALL_STARS) registerStar(s);

  for (const con of ALL_CONSTELLATIONS) {
    for (const s of con.extraStars || []) registerStar(s);

    const conData = makeConstellationUserData(con);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x59ff7e, transparent: true, opacity: 0.55,
    });

    for (const [a, b] of con.lines) {
      const sa = starMap.get(a);
      const sb = starMap.get(b);
      if (!sa || !sb) continue;
      const geo = new THREE.BufferGeometry().setFromPoints([sa.pos, sb.pos]);
      group.add(new THREE.Line(geo, lineMat));
      addLinePicker(group, sa.pos, sb.pos, conData, pickables);
    }

    const pts = con.starIds.map((id) => starMap.get(id)?.pos).filter(Boolean);
    if (!pts.length) continue;
    const center = new THREE.Vector3();
    pts.forEach((p) => center.add(p));
    center.divideScalar(pts.length);

    const badge = new THREE.Mesh(
      new THREE.SphereGeometry(11, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4fd2, transparent: true, opacity: 0.22 })
    );
    badge.position.copy(center);
    badge.userData = conData;
    group.add(badge);
    pickables.push(badge);

    const labelTex = new THREE.CanvasTexture(createStarLabelTexture(con.name));
    labelTex.magFilter = THREE.NearestFilter;
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false })
    );
    label.scale.set(40, 15, 1);
    label.position.copy(center).add(new THREE.Vector3(0, 14, 0));
    label.userData = { ...conData, isConstellationLabel: true };
    group.add(label);
    pickables.push(label);
  }

  scene.add(group);

  function setDeepSkyView(view) {
    group.visible = view === 'galaxy' || view === 'system';
  }

  return { group, setDeepSkyView };
}
