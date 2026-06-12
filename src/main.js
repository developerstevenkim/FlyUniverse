import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// style.css is linked in index.html head so layout paints before this module runs
import './style.css';

document.body.classList.add('app-ready');
import {
  PLANETS, SUN_STORY,
  createPlanetTexture, createCloudTexture, createSunTexture,
  createRingTexture,
} from './planets.js';
import { initNarration, speak, stopNarration, setNarrationEnabled } from './narration.js';
import { setMuted, isMuted, sfxClick, sfxWhoosh, sfxSparkle, startAmbientPad } from './audio.js';
import { buildDeepSky } from './deepSky.js';
import { buildCosmicLayers } from './cosmicViews.js';
import { ZOOM_CONFIG, camDistToLevel } from './zoomScale.js';
import {
  MEAN_AU, formatAuKm, formatLightYears,
  distanceEarthToBodyAUFromPositions, fetchDailySpaceFact,
} from './astroApi.js';
import { buildSpaceKnowledge, mountSpaceGuide } from './spaceGuide.js';
import { getLearnMoreLinks, DATA_SOURCES } from './learnMore.js';

// ---------------------------------------------------------------- renderer
// Rendered at low resolution and upscaled with image-rendering: pixelated
// for a chunky retro-arcade look.
const PIXEL_SCALE = 0.42;
const canvas = document.getElementById('space');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);

function sizeRenderer() {
  renderer.setSize(
    Math.round(window.innerWidth * PIXEL_SCALE),
    Math.round(window.innerHeight * PIXEL_SCALE),
    false
  );
}
sizeRenderer();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 6000);
camera.position.set(0, 62, 142);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 2400;

scene.add(new THREE.AmbientLight(0x8877cc, 0.55));
const sunLight = new THREE.PointLight(0xfff2cc, 2200, 0, 2);
scene.add(sunLight);

// ---------------------------------------------------------------- starfield
function buildStars(count, spread, size, color) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * (0.35 + Math.random() * 0.65);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size, sizeAttenuation: true,
    transparent: true, opacity: 0.9, depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}
const bgStars = new THREE.Group();
bgStars.add(buildStars(900, 1200, 1.4, 0xffffff));
bgStars.add(buildStars(280, 900, 2.0, 0xbfd4ff));
bgStars.add(buildStars(120, 1400, 2.4, 0xffe3b8));
scene.add(bgStars);

// soft purple nebula sprites in deep space
function nebulaSprite(color, size, pos) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, color + 'aa');
  grad.addColorStop(0.5, color + '33');
  grad.addColorStop(1, color + '00');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.55 });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  s.position.copy(pos);
  return s;
}
const nebulae = [
  nebulaSprite('#7c5cff', 420, new THREE.Vector3(-540, 160, -680)),
  nebulaSprite('#34e5c2', 320, new THREE.Vector3(620, -120, -540)),
  nebulaSprite('#ff6f91', 380, new THREE.Vector3(180, 360, 720)),
];
nebulae.forEach((n) => scene.add(n));

// ---------------------------------------------------------------- sun
// tiny pixel "scan strip" of a body's texture for the data terminal
function makeThumb(srcCanvas) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(srcCanvas, 0, 0, 64, 32);
  return c.toDataURL();
}

const sunCanvas = createSunTexture();
const sunTex = new THREE.CanvasTexture(sunCanvas);
sunTex.colorSpace = THREE.SRGBColorSpace;
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(7, 48, 48),
  new THREE.MeshBasicMaterial({ map: sunTex })
);
sun.userData = {
  isSun: true, name: 'The Sun', thumb: makeThumb(sunCanvas), type: 'Our star',
  auFromSun: MEAN_AU.sun,
  story: SUN_STORY,
  facts: [
    'A giant ball of glowing hot gas.',
    'Over one million Earths could fit inside!',
    'Sunlight takes 8 minutes to reach Earth.',
  ],
};

const sunGlow = nebulaSprite('#ffb347', 46, new THREE.Vector3(0, 0, 0));
sunGlow.material.opacity = 0.85;

const solarGroup = new THREE.Group();
scene.add(solarGroup);
solarGroup.add(sun);
solarGroup.add(sunGlow);

// ---------------------------------------------------------------- planets
const planetMeshes = [];
const orbitLines = [];
const pickables = [sun];
let earthMesh = null;
let currentView = 'system';

for (const p of PLANETS) {
  const texCanvas = createPlanetTexture(p);
  const tex = new THREE.CanvasTexture(texCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.radius, 48, 48),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 })
  );
  mesh.rotation.z = p.tilt;
  mesh.userData = { ...p, auFromSun: MEAN_AU[p.id] };
  mesh.userData.thumb = makeThumb(texCanvas);
  if (p.id === 'earth') earthMesh = mesh;

  const pivot = new THREE.Object3D();
  pivot.rotation.y = Math.random() * Math.PI * 2;
  mesh.position.x = p.distance;
  pivot.add(mesh);
  solarGroup.add(pivot);

  if (p.hasClouds) {
    const cloudTex = new THREE.CanvasTexture(createCloudTexture());
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(p.radius * 1.035, 48, 48),
      new THREE.MeshStandardMaterial({ map: cloudTex, transparent: true, opacity: 0.6, depthWrite: false })
    );
    mesh.add(clouds);
    mesh.userData.clouds = clouds;
  }

  if (p.hasMoon) {
    const moonPivot = new THREE.Object3D();
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(p.radius * 0.27, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xc9c4bb, roughness: 1 })
    );
    moon.position.x = p.radius * 2.6;
    moonPivot.add(moon);
    mesh.add(moonPivot);
    mesh.userData.moonPivot = moonPivot;
  }

  if (p.hasRings) {
    const ringTex = new THREE.CanvasTexture(createRingTexture());
    const inner = p.radius * 1.35, outer = p.radius * 2.3;
    const ringGeo = new THREE.RingGeometry(inner, outer, 96);
    // remap UVs so the strip texture follows the ring radius
    const uv = ringGeo.attributes.uv;
    const posAttr = ringGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < uv.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true })
    );
    ring.rotation.x = Math.PI / 2.25;
    mesh.add(ring);
  }

  const orbitPts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    orbitPts.push(new THREE.Vector3(Math.cos(a) * p.distance, 0, Math.sin(a) * p.distance));
  }
  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(orbitPts),
    new THREE.LineBasicMaterial({ color: 0x6f5bd0, transparent: true, opacity: 0.25 })
  );
  solarGroup.add(orbit);
  orbitLines.push(orbit);

  planetMeshes.push({ mesh, pivot, data: p });
  pickables.push(mesh);
}

// ---------------------------------------------------------------- deep sky (real stars + constellations)
const { setDeepSkyView } = buildDeepSky(scene, pickables);
const { setCosmicView } = buildCosmicLayers(scene, pickables);

// ---------------------------------------------------------------- UI refs
const banner = document.getElementById('planet-banner');
const caption = document.getElementById('caption');
const infoCard = document.getElementById('info-card');
const infoThumb = document.getElementById('info-thumb');
const infoNameLink = document.getElementById('info-name-link');
const infoType = document.getElementById('info-type');
const infoDistance = document.getElementById('info-distance');
const infoFacts = document.getElementById('info-facts');
const infoHead = document.getElementById('info-head');
const infoSource = document.getElementById('info-source');

let focused = null;          // currently focused mesh
let camTween = null;
let captionTimer = null;

function showCaption(text, ms = 6000, link = null) {
  if (link?.url) {
    caption.innerHTML = `${text} <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`;
  } else {
    caption.textContent = text;
  }
  caption.classList.add('show');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(() => {
    caption.classList.remove('show');
    caption.textContent = '';
  }, ms);
}

function setLearnMoreUI(data) {
  const links = getLearnMoreLinks(data);
  if (links?.page) {
    infoNameLink.href = links.page;
    infoNameLink.textContent = data.name;
    banner.innerHTML = `<a href="${links.page}" target="_blank" rel="noopener noreferrer">${data.name}</a>`;
  } else {
    infoNameLink.removeAttribute('href');
    infoNameLink.textContent = data.name;
    banner.textContent = data.name;
  }

  const parts = [];
  if (links?.source) {
    parts.push(`<a href="${links.source.url}" target="_blank" rel="noopener noreferrer">${links.source.label}</a>`);
  }
  if (!data.isCosmic && !data.isConstellation && !data.isStar && data.auFromSun != null) {
    parts.push(`<a href="${DATA_SOURCES.distances.url}" target="_blank" rel="noopener noreferrer">${DATA_SOURCES.distances.label}</a>`);
  }
  infoSource.innerHTML = parts.length
    ? `Learn more: ${parts.join(' · ')}`
    : '';
}

function distanceLabelFor(data, mesh) {
  if (data.isConstellation) return 'Pattern in Earth\'s night sky';
  if (data.isCosmic && data.ly > 0) return formatLightYears(data.ly);
  if (data.isCosmic) return 'You are inside this galaxy';
  if (data.isStar && data.ly != null) return formatLightYears(data.ly);
  if (!earthMesh || !mesh) return '';
  if (mesh === earthMesh) return 'You are here! (0 km from home)';
  const e = new THREE.Vector3();
  const t = new THREE.Vector3();
  earthMesh.getWorldPosition(e);
  mesh.getWorldPosition(t);
  const au = data.isSun
    ? MEAN_AU.earth
    : distanceEarthToBodyAUFromPositions(e, t, data.auFromSun ?? MEAN_AU.earth);
  return `FROM EARTH: ${formatAuKm(au)}`;
}

function showInfo(data, mesh) {
  banner.classList.add('show');
  setLearnMoreUI(data);
  if (data.thumb) {
    infoThumb.src = data.thumb;
    infoThumb.style.display = '';
  } else {
    infoThumb.style.display = 'none';
  }
  infoType.textContent = data.type;
  infoDistance.textContent = distanceLabelFor(data, mesh);
  if (data.isConstellation) infoHead.textContent = '// CONSTELLATION DATA';
  else if (data.isCosmic) infoHead.textContent = '// GALAXY DATA';
  else if (data.isDeepSky) infoHead.textContent = '// STAR DATA';
  else infoHead.textContent = '// PLANET DATA';
  infoFacts.innerHTML = '';
  for (const f of data.facts) {
    const li = document.createElement('li');
    li.textContent = f;
    infoFacts.appendChild(li);
  }
  infoCard.classList.add('show');
}

function hideInfo() {
  banner.classList.remove('show');
  banner.textContent = '';
  infoCard.classList.remove('show');
  caption.classList.remove('show');
  infoDistance.textContent = '';
  infoSource.textContent = '';
}

// ---------------------------------------------------------------- camera fly
function flyTo(targetPos, lookAt, duration = 1.6) {
  camTween = {
    t: 0, duration,
    fromPos: camera.position.clone(),
    toPos: targetPos.clone(),
    fromTarget: controls.target.clone(),
    toTarget: lookAt.clone(),
  };
}

function focusBody(mesh, duration) {
  focused = mesh;
  const data = mesh.userData;
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);
  const r = mesh.geometry?.parameters?.radius ?? data.pickRadius ?? 8;
  // approach from the sunlit side so the planet's day face greets us
  const toSun = data.isSun
    ? new THREE.Vector3(0.6, 0.25, 0.75).normalize()
    : worldPos.clone().negate().normalize();
  const camPos = worldPos.clone()
    .add(toSun.multiplyScalar(r * 4.2))
    .add(new THREE.Vector3(0, r * 1.4, 0));
  if (data.isCosmic) {
    const dist = (data.pickRadius || 40) * 2.2;
    flyTo(worldPos.clone().add(new THREE.Vector3(0, dist * 0.35, dist)), worldPos, duration ?? 2);
  } else if (data.isConstellation) {
    flyTo(worldPos.clone().add(new THREE.Vector3(0, 30, 90)), worldPos, duration ?? 2);
  } else if (data.isStar) {
    flyTo(worldPos.clone().multiplyScalar(0.88), worldPos, duration ?? 1.8);
  } else {
    flyTo(camPos, worldPos, duration ?? 1.6);
  }
  sfxWhoosh();
  showInfo(data, mesh);
  const dist = distanceLabelFor(data, mesh);
  const narration = dist ? `${data.story} Distance from Earth: ${dist.replace('FROM EARTH: ', '')}` : data.story;
  speak(narration);
  showCaption(data.story, 14000);
}

function goHome() {
  focused = null;
  hideInfo();
  stopNarration();
  setViewLevel('system', false, true);
}

// one continuous cinematic dive: layers crossfade automatically while flying
function diveToEarth() {
  if (!earthMesh) return;
  const dur = Math.min(7, Math.max(2.5, camera.position.length() * 0.004));
  focusBody(earthMesh, dur);
}

function handlePick(mesh) {
  const data = mesh.userData;
  if (data.isDrill) {
    sfxClick();
    focused = null;
    hideInfo();
    stopNarration();
    if (data.drillFinal === 'earth') {
      diveToEarth();
      return;
    }
    const level = data.drillLevel || data.drillPath?.[data.drillPath.length - 1] || 'system';
    setViewLevel(level, true, true);
    if (data.story) {
      speak(data.story);
      showCaption(data.story, 8000);
    }
    return;
  }
  sfxClick();
  focusBody(mesh);
}

function isSolarBody(u) {
  return !!(u && !u.isCosmic && !u.isConstellation && !u.isStar && !u.isDrill);
}

function syncViewFromCamera() {
  // release focus when the user manually zooms far away from the focused object
  if (focused && !camTween) {
    const u = focused.userData;
    const d = camera.position.distanceTo(controls.target);
    const release = isSolarBody(u) ? 220 : Math.max(300, (u.pickRadius || 60) * 5);
    if (d > release) {
      focused = null;
      hideInfo();
      stopNarration();
    }
  }

  // pick the distance metric: planet focus → distance to planet, else distance to origin
  let dist;
  if (focused && isSolarBody(focused.userData)) {
    dist = camera.position.distanceTo(controls.target);
  } else if (focused) {
    return; // looking at a galaxy/constellation up close — keep current layers
  } else {
    dist = camera.position.length();
  }

  const level = camDistToLevel(dist);
  if (level !== currentView) setViewLevel(level, false, false);
}

// ---------------------------------------------------------------- picking
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downAt = null;

// raycaster ignores the visible flag, so filter out objects in hidden layers
function isChainVisible(obj) {
  let o = obj;
  while (o) {
    if (o.visible === false) return false;
    o = o.parent;
  }
  return true;
}

canvas.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 8) return; // it was a drag, not a tap

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, true).filter((h) => {
    const u = h.object.userData || {};
    if (u.isLabel) return false;
    if (u.pickViews && !u.pickViews.includes(currentView)) return false;
    return isChainVisible(h.object);
  });
  hits.sort((a, b) => {
    const ua = a.object.userData || {};
    const ub = b.object.userData || {};
    // Stars beat green line hit-zones when both overlap — tap star for star, line for constellation myth.
    if (ua.isStar && !ub.isStar) return -1;
    if (!ua.isStar && ub.isStar) return 1;
    const rank = (u) => (
      u.isDrill ? 0
        : u.isConstellation ? 1
          : u.isStar ? 2
            : 3
    );
    const r = rank(ua) - rank(ub);
    return r !== 0 ? r : a.distance - b.distance;
  });
  if (hits.length) handlePick(hits[0].object);
});

// ---------------------------------------------------------------- HUD wiring
document.getElementById('btn-home').addEventListener('click', () => {
  sfxClick();
  goHome();
});

const btnSound = document.getElementById('btn-sound');
btnSound.addEventListener('click', () => {
  const nowMuted = !isMuted();
  setMuted(nowMuted);
  setNarrationEnabled(!nowMuted);
  btnSound.classList.toggle('is-muted', nowMuted);
  btnSound.setAttribute('aria-label', nowMuted ? 'Sound off' : 'Sound on');
  if (!nowMuted) sfxClick();
});

function flyToLevel(level, duration = 1.7) {
  const p = ZOOM_CONFIG[level].pos;
  flyTo(new THREE.Vector3(p[0], p[1], p[2]), new THREE.Vector3(0, 0, 0), duration);
}

function applyViewLayers(key) {
  const showSolar = key === 'close' || key === 'system';
  solarGroup.visible = showSolar;
  bgStars.visible = true;
  bgStars.children.forEach((layer, i) => {
    layer.material.opacity = key === 'universe' ? 0.35 : key === 'cluster' ? 0.5 : 0.75;
    if (i === 2) layer.visible = key !== 'close';
  });
  nebulae.forEach((n) => { n.visible = key === 'cluster' || key === 'universe'; });
  setCosmicView(key);
  setDeepSkyView(key);
}

function setViewLevel(key, announce = true, doFly = false) {
  currentView = key;
  document.querySelectorAll('.view-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === key));
  if (doFly) {
    focused = null;
    hideInfo();
    stopNarration();
  }
  applyViewLayers(key);
  if (doFly) flyToLevel(key);
  if (announce && doFly) {
    sfxWhoosh();
    showCaption(ZOOM_CONFIG[key].label, 4000);
  }
}

document.querySelectorAll('.view-btn').forEach((btn) => {
  btn.addEventListener('click', () => setViewLevel(btn.dataset.view, true, true));
});

// ---------------------------------------------------------------- start screen + space guide
const overlay = document.getElementById('start-overlay');
const spaceKnowledge = buildSpaceKnowledge();
mountSpaceGuide(spaceKnowledge);

function launchApp() {
  overlay.classList.add('hidden');
  initNarration();
  startAmbientPad();
  sfxSparkle();
  const hello = 'Welcome aboard, space explorer! Tap any planet or constellation — or open the Space Guide to ask questions!';
  setTimeout(async () => {
    speak(hello);
    showCaption(hello, 9000);
    const apod = await fetchDailySpaceFact();
    if (apod) {
      setTimeout(() => {
        showCaption(
          `NASA Pic of the Day: ${apod.title}. ${apod.snippet}`,
          14000,
          { url: apod.pageUrl, label: 'Open on NASA APOD →' },
        );
      }, 9500);
    }
  }, 600);
}

document.getElementById('btn-launch').addEventListener('click', launchApp);

// warm up voice list early (some browsers populate async)
initNarration();

// init view after all handlers are wired
setViewLevel('system', false, false);

// ---------------------------------------------------------------- resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  sizeRenderer();
});

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
const tmpV = new THREE.Vector3();

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  sun.rotation.y += dt * 0.05;

  for (const { mesh, pivot, data } of planetMeshes) {
    // the planet we are visiting waits for us — everything else keeps orbiting
    if (mesh !== focused) pivot.rotation.y += dt * data.speed * 0.12;
    mesh.rotation.y += dt * 0.35;
    if (mesh.userData.clouds) mesh.userData.clouds.rotation.y += dt * 0.05;
    if (mesh.userData.moonPivot) mesh.userData.moonPivot.rotation.y += dt * 0.9;
  }

  // camera tween
  if (camTween) {
    camTween.t += dt / camTween.duration;
    const k = easeInOut(Math.min(camTween.t, 1));
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, k);
    controls.target.lerpVectors(camTween.fromTarget, camTween.toTarget, k);
    if (camTween.t >= 1) camTween = null;
  } else if (focused) {
    focused.getWorldPosition(tmpV);
    controls.target.lerp(tmpV, 0.1);
    const d = focused.userData;
    if (d && infoCard.classList.contains('show')) {
      infoDistance.textContent = distanceLabelFor(d, focused);
    }
  }

  controls.update();
  syncViewFromCamera();
  renderer.render(scene, camera);
}
animate();
