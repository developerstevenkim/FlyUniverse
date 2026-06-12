# FLYUNIVERSE

**A kid-friendly, retro pixel-art 3D space explorer in the browser.**

Fly from Earth through the Solar System, the Milky Way, the Local Group, and deep cosmos. Tap planets, **individual stars**, constellation lines, and galaxies to hear English narration. Ask the built-in **Space Guide** questions — answers come from preloaded astronomy data, no API key needed.

Built with **Vite + vanilla JS + Three.js**. Static site, MIT licensed, deployable to Vercel.

### GitHub description (short)

```
Retro pixel-art space explorer for kids — tap planets, stars & constellations, zoom to galaxies, offline Space Guide. Vite + Three.js
```

### GitHub About topics

`threejs` `astronomy` `education` `kids` `space` `vite` `webgl` `javascript`

- Chunky retro look: low-res pixelated 3D rendering + CRT scanlines
- Pixel fonts (Press Start 2P / VT323), neon arcade palette
- Procedurally generated planet textures (no image assets)
- English narration via the Web Speech API (best English voice auto-selected)
- Synthesized sound effects and ambient pad via the Web Audio API
- **Space Guide** chat — answers from preloaded planet/constellation/galaxy data (offline)

## License

[MIT](LICENSE) — free for personal and commercial use. Public GitHub repos commonly use MIT for open-source web apps like this.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Vercel auto-detects Vite via `vercel.json` and serves `dist/` as a static site.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: FlyUniverse space arcade"
gh repo create FlyUniverse --public --source=. --push
```

Or create a repo on github.com, then:

```bash
git remote add origin https://github.com/YOUR_USER/FlyUniverse.git
git push -u origin main
```

## Space Guide vs QueuingMe Copilot

QueuingMe's AI Copilot uses a **backend server** (Azure OpenAI / GitHub Models API) with live restaurant data.

FlyUniverse is a **static site** — the Space Guide searches a knowledge base bundled at build time (planets, constellations, galaxies). No API key required. For full GPT-style chat later, add a Vercel serverless function + API key.
