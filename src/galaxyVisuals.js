import * as THREE from 'three';
import { createStarLabelTexture } from './planets.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function rand(seed) {
  seed.s = (seed.s * 1664525 + 1013904223) % 4294967296;
  return seed.s / 4294967296;
}

// Procedural galaxy disc texture — same craft level as planet textures.
export function createGalaxyTexture(g) {
  const W = 512, H = 512;
  const [canvas, ctx] = makeCanvas(W, H);
  const seed = { s: [...(g.id || 'galaxy')].reduce((a, c) => a + c.charCodeAt(0) * 11, 7) };
  const pal = g.palette || ['#fff8e0', '#c8a8e8', '#6040a0', '#201040'];
  const cx = W / 2, cy = H / 2;

  // background fades to transparent so the disc has no hard circular edge
  const bgCol = pal[4] || '#08041a';
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 252);
  bg.addColorStop(0, bgCol + 'ee');
  bg.addColorStop(0.6, bgCol + '99');
  bg.addColorStop(1, bgCol + '00');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const type = g.visual || 'spiral';

  // outer halo
  const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, 248);
  halo.addColorStop(0, pal[0] + 'cc');
  halo.addColorStop(0.2, pal[1] + '88');
  halo.addColorStop(0.55, pal[2] + '44');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  if (type === 'spiral' || type === 'barred') {
    const arms = type === 'barred' ? 4 : 3;
    for (let arm = 0; arm < arms; arm++) {
      const armOff = (arm / arms) * Math.PI * 2;
      ctx.beginPath();
      for (let t = 0; t < 120; t++) {
        const a = armOff + t * 0.11;
        const r = 18 + t * 1.85;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.38;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + rand(seed) * 0.08})`;
      ctx.lineWidth = 14 + rand(seed) * 10;
      ctx.stroke();
      ctx.strokeStyle = `rgba(200,180,255,${0.08 + rand(seed) * 0.1})`;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    if (type === 'barred') {
      ctx.fillStyle = 'rgba(255,240,200,0.35)';
      ctx.fillRect(cx - 55, cy - 8, 110, 16);
    }
    // dust lanes
    for (let d = 0; d < 3; d++) {
      ctx.strokeStyle = 'rgba(10,5,20,0.35)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      const a0 = rand(seed) * Math.PI * 2;
      for (let t = 0; t < 80; t++) {
        const a = a0 + t * 0.09;
        const r = 30 + t * 2.2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.38;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (type === 'elliptical' || type === 'lenticular') {
    const eg = ctx.createRadialGradient(cx, cy, 5, cx, cy, 200);
    eg.addColorStop(0, pal[0]);
    eg.addColorStop(0.35, pal[1]);
    eg.addColorStop(0.75, pal[2] + 'aa');
    eg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 210, type === 'lenticular' ? 55 : 160, 0, 0, Math.PI * 2);
    ctx.fill();
    if (type === 'lenticular') {
      ctx.fillStyle = 'rgba(8,4,16,0.55)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 200, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'irregular') {
    for (let cl = 0; cl < 7; cl++) {
      const gx = cx + (rand(seed) - 0.5) * 180;
      const gy = cy + (rand(seed) - 0.5) * 120;
      const gr = ctx.createRadialGradient(gx, gy, 2, gx, gy, 40 + rand(seed) * 60);
      gr.addColorStop(0, pal[0] + 'dd');
      gr.addColorStop(0.5, pal[1] + '88');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(gx, gy, 50 + rand(seed) * 40, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // bright core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.35, pal[0]);
  core.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fill();

  // star particles along disc
  for (let i = 0; i < 2200; i++) {
    const angle = rand(seed) * Math.PI * 2;
    const dist = Math.pow(rand(seed), 0.55) * 230;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist * 0.38;
    const b = 0.25 + rand(seed) * 0.75;
    ctx.fillStyle = rand(seed) > 0.6 ? `rgba(255,255,255,${b * 0.7})` : `rgba(200,220,255,${b * 0.5})`;
    const s = rand(seed) > 0.92 ? 2.2 : 1;
    ctx.fillRect(x, y, s, s);
  }

  return canvas;
}

export function makeGalaxyThumb(g) {
  const src = createGalaxyTexture(g);
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#05030f';
  ctx.fillRect(0, 0, 64, 32);
  ctx.drawImage(src, 0, 0, 64, 32);
  return c.toDataURL();
}

export function buildGalaxyNode(g, pickables) {
  const group = new THREE.Group();
  group.name = g.id;

  const texCanvas = createGalaxyTexture(g);
  const tex = new THREE.CanvasTexture(texCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(g.discRadius, 96),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.97,
    })
  );
  disc.rotation.x = g.tilt ?? -Math.PI / 2.2;
  disc.rotation.z = g.spin ?? 0;

  const picker = new THREE.Mesh(
    new THREE.SphereGeometry(g.pickRadius, 16, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );

  const userData = {
    isCosmic: true,
    isDrill: !!(g.drillLevel || g.drillPath),
    name: g.name,
    type: g.type,
    thumb: makeGalaxyThumb(g),
    ly: g.ly,
    pickRadius: g.pickRadius,
    drillLevel: g.drillLevel || null,
    drillPath: g.drillPath || null,
    drillFinal: g.drillFinal || null,
    pickViews: g.pickViews || null,
    facts: g.facts,
    story: g.story,
  };
  picker.userData = userData;
  disc.userData = userData;
  pickables.push(picker);

  const labelTex = new THREE.CanvasTexture(createStarLabelTexture(g.short || g.name));
  labelTex.magFilter = THREE.NearestFilter;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false })
  );
  const labelScale = Math.max(28, g.discRadius * 0.38);
  label.scale.set(labelScale, labelScale * 0.37, 1);
  label.position.y = g.discRadius * 0.55;
  label.userData = { isLabel: true };

  group.add(disc);
  group.add(picker);
  group.add(label);
  group.position.set(g.x ?? 0, g.y ?? 0, g.z ?? 0);

  return { group, label, disc, picker };
}
