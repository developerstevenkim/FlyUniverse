// Planet catalogue + procedural canvas textures (no image assets needed).

export const PLANETS = [
  {
    id: 'mercury', name: 'Mercury', type: 'Tiny rocky world',
    radius: 1.2, distance: 16, speed: 1.6, tilt: 0.03,
    palette: ['#8d8680', '#6e6862', '#a59d94', '#55504b'],
    style: 'cratered',
    facts: [
      'The smallest planet — about as wide as the Atlantic Ocean!',
      'A year here lasts only 88 Earth days.',
      'Daytime is super hot, nighttime is freezing cold.',
    ],
    story: 'This is Mercury, the speedy little planet closest to the Sun. It races around the Sun faster than any other planet, and its surface is covered in craters, just like our Moon!',
  },
  {
    id: 'venus', name: 'Venus', type: 'Cloudy hot world',
    radius: 1.9, distance: 23, speed: 1.18, tilt: 0.02,
    palette: ['#e8c47a', '#d4a755', '#f4dba0', '#b98c3e'],
    style: 'swirl',
    facts: [
      'The hottest planet of all — hotter than an oven!',
      'It spins backwards compared to Earth.',
      'Thick golden clouds hide its whole surface.',
    ],
    story: 'Say hello to Venus, the brightest planet in our evening sky. It is wrapped in thick golden clouds, and it is even hotter than a pizza oven. Venus also spins the opposite way from Earth — how silly!',
  },
  {
    id: 'earth', name: 'Earth', type: 'Our blue home',
    radius: 2.0, distance: 31, speed: 1.0, tilt: 0.41, hasMoon: true, hasClouds: true,
    palette: ['#2563c9', '#1a4a9e', '#3aa05a', '#7bc77e'],
    style: 'earth',
    facts: [
      'The only planet we know with living things!',
      'More than 70% of it is covered by ocean.',
      'Our Moon takes about a month to circle us.',
    ],
    story: 'Here is Earth — our beautiful blue home! It is the only planet we know that has animals, trees, oceans, and you! Can you spot the little Moon dancing around it?',
  },
  {
    id: 'mars', name: 'Mars', type: 'The red planet',
    radius: 1.5, distance: 39, speed: 0.8, tilt: 0.44,
    palette: ['#c1543a', '#9c3f29', '#d97b54', '#7e2f1e'],
    style: 'cratered',
    facts: [
      'Its red color comes from rusty iron dust.',
      'Home to the tallest volcano in the solar system!',
      'Robot rovers are exploring it right now.',
    ],
    story: 'This is Mars, the famous red planet! It looks red because its ground is full of rusty dust. Right now, robot explorers are driving around on Mars, looking for clues about water and life.',
  },
  {
    id: 'jupiter', name: 'Jupiter', type: 'Giant gas king',
    radius: 5.2, distance: 53, speed: 0.44, tilt: 0.05,
    palette: ['#d9a675', '#b67c4e', '#ecd0a8', '#8f5a36', '#e2b88a'],
    style: 'bands', hasSpot: true,
    facts: [
      'The biggest planet — 1,300 Earths could fit inside!',
      'Its Great Red Spot is a storm bigger than Earth.',
      'It has more than 90 moons!',
    ],
    story: 'Wow, this is Jupiter, the king of the planets! It is so big that one thousand three hundred Earths could fit inside it. See that big red spot? That is a giant storm that has been spinning for hundreds of years!',
  },
  {
    id: 'saturn', name: 'Saturn', type: 'Lord of the rings',
    radius: 4.4, distance: 68, speed: 0.33, tilt: 0.47, hasRings: true,
    palette: ['#e6d3a3', '#cdb277', '#f2e4bf', '#a98e58'],
    style: 'bands',
    facts: [
      'Its rings are made of ice and rock pieces.',
      'So light it could float in a giant bathtub!',
      'A day on Saturn lasts only about 10 hours.',
    ],
    story: 'Here is Saturn, the planet with the most beautiful rings! The rings are made of billions of sparkling ice chunks. And guess what — Saturn is so light, it could float in a giant bathtub!',
  },
  {
    id: 'uranus', name: 'Uranus', type: 'Sideways ice giant',
    radius: 3.0, distance: 82, speed: 0.23, tilt: 1.7,
    palette: ['#9fdcde', '#7fc4cc', '#c2eef0', '#67aab6'],
    style: 'smooth',
    facts: [
      'It rolls around the Sun on its side, like a ball!',
      'Made of icy stuff that smells like rotten eggs. Eww!',
      'One trip around the Sun takes 84 Earth years.',
    ],
    story: 'This is Uranus, the sideways planet! While other planets spin like tops, Uranus rolls around like a ball. It is a giant world of pale blue ice — and scientists say it might smell like rotten eggs!',
  },
  {
    id: 'neptune', name: 'Neptune', type: 'Windy blue giant',
    radius: 2.9, distance: 95, speed: 0.18, tilt: 0.49,
    palette: ['#3b5bdb', '#2c46b8', '#5c7cfa', '#1f3494'],
    style: 'swirl',
    facts: [
      'The windiest planet — winds faster than a jet plane!',
      'The farthest planet from the Sun.',
      'It was found using math before anyone saw it!',
    ],
    story: 'And way out here is Neptune, the farthest planet from the Sun. It is deep blue and super windy — its winds blow faster than a jet plane! It is so far away that sunlight takes four hours to reach it.',
  },
];

export const SUN_STORY = 'This is the Sun, our very own star! It is a giant ball of glowing hot gas that gives us light and warmth. Every plant, animal, and person on Earth needs the Sun to live. Never look at it directly — it is too bright!';

// ---------- procedural texture helpers ----------

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function rand(seedRef) {
  // simple LCG so each planet texture is stable per page load
  seedRef.s = (seedRef.s * 1664525 + 1013904223) % 4294967296;
  return seedRef.s / 4294967296;
}

export function createPlanetTexture(p) {
  const W = 512, H = 256;
  const [canvas, ctx] = makeCanvas(W, H);
  const seed = { s: [...p.id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 1) };
  const pal = p.palette;

  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, W, H);

  if (p.style === 'bands') {
    let y = 0;
    while (y < H) {
      const bandH = 8 + rand(seed) * 30;
      ctx.fillStyle = pal[Math.floor(rand(seed) * pal.length)];
      ctx.globalAlpha = 0.55 + rand(seed) * 0.45;
      ctx.fillRect(0, y, W, bandH);
      y += bandH;
    }
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = rand(seed) > 0.5 ? '#ffffff' : pal[1];
      const yy = rand(seed) * H, ww = 40 + rand(seed) * 140;
      ctx.beginPath();
      ctx.ellipse(rand(seed) * W, yy, ww, 4 + rand(seed) * 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.hasSpot) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.ellipse(W * 0.68, H * 0.62, 38, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.ellipse(W * 0.68, H * 0.62, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (p.style === 'cratered') {
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = pal[Math.floor(rand(seed) * pal.length)];
      ctx.globalAlpha = 0.2 + rand(seed) * 0.5;
      const r = 1 + rand(seed) * 7;
      ctx.beginPath();
      ctx.arc(rand(seed) * W, rand(seed) * H, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 40; i++) {
      const x = rand(seed) * W, y = rand(seed) * H, r = 3 + rand(seed) * 12;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#00000055';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff44';
      ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
  } else if (p.style === 'swirl') {
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = pal[Math.floor(rand(seed) * pal.length)];
      ctx.globalAlpha = 0.18 + rand(seed) * 0.35;
      ctx.lineWidth = 4 + rand(seed) * 18;
      const y = rand(seed) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(W * 0.3, y + (rand(seed) - 0.5) * 80, W * 0.7, y + (rand(seed) - 0.5) * 80, W, y);
      ctx.stroke();
    }
  } else if (p.style === 'smooth') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal[2]); g.addColorStop(0.5, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, rand(seed) * H, W, 2 + rand(seed) * 6);
    }
  } else if (p.style === 'earth') {
    const og = ctx.createLinearGradient(0, 0, 0, H);
    og.addColorStop(0, '#1d56c2'); og.addColorStop(0.5, '#1b6fd6'); og.addColorStop(1, '#1d56c2');
    ctx.fillStyle = og;
    ctx.fillRect(0, 0, W, H);
    // continents: blobby clusters
    for (let i = 0; i < 6; i++) {
      const cx = rand(seed) * W, cy = H * 0.2 + rand(seed) * H * 0.6;
      const col = rand(seed) > 0.35 ? '#2f8f4e' : '#7d9343';
      for (let j = 0; j < 18; j++) {
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.9;
        const r = 5 + rand(seed) * 14;
        ctx.beginPath();
        ctx.arc(cx + (rand(seed) - 0.5) * 85, cy + (rand(seed) - 0.5) * 46, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // polar caps
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#eef6ff';
    ctx.fillRect(0, 0, W, 14);
    ctx.fillRect(0, H - 14, W, 14);
  }

  ctx.globalAlpha = 1;
  return canvas;
}

export function createCloudTexture() {
  const W = 512, H = 256;
  const [canvas, ctx] = makeCanvas(W, H);
  const seed = { s: 777 };
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < 34; i++) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.08 + rand(seed) * 0.18;
    const x = rand(seed) * W, y = rand(seed) * H;
    for (let j = 0; j < 7; j++) {
      ctx.beginPath();
      ctx.ellipse(x + (rand(seed) - 0.5) * 70, y + (rand(seed) - 0.5) * 18, 12 + rand(seed) * 26, 5 + rand(seed) * 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return canvas;
}

export function createSunTexture() {
  const W = 512, H = 256;
  const [canvas, ctx] = makeCanvas(W, H);
  const seed = { s: 42 };
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ffdd55'); g.addColorStop(0.5, '#ffaa22'); g.addColorStop(1, '#ffdd55');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) {
    ctx.fillStyle = rand(seed) > 0.5 ? '#ffcc33' : '#ff8811';
    ctx.globalAlpha = 0.12 + rand(seed) * 0.3;
    ctx.beginPath();
    ctx.arc(rand(seed) * W, rand(seed) * H, 4 + rand(seed) * 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

export function createRingTexture() {
  const W = 256, H = 32;
  const [canvas, ctx] = makeCanvas(W, H);
  const seed = { s: 99 };
  for (let x = 0; x < W; x++) {
    const t = x / W;
    const a = (t < 0.08 || (t > 0.4 && t < 0.48)) ? 0.05 : 0.35 + rand(seed) * 0.55;
    const shade = 190 + Math.floor(rand(seed) * 60);
    ctx.fillStyle = `rgba(${shade}, ${shade - 22}, ${shade - 60}, ${a})`;
    ctx.fillRect(x, 0, 1, H);
  }
  return canvas;
}

export function createStarLabelTexture(name) {
  const W = 512, H = 192;
  const [canvas, ctx] = makeCanvas(W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = false;
  ctx.font = '40px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = name.toUpperCase();
  // chunky pixel drop shadow
  ctx.fillStyle = '#ff4fd2';
  ctx.fillText(text, W / 2 + 5, H / 2 + 5);
  ctx.fillStyle = '#ffe34d';
  ctx.fillText(text, W / 2, H / 2);
  return canvas;
}
