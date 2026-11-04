# SKILLS_USAGE_NOTES.md — Étude et Intégration des 11 Dépôts de Référence

Ce document synthétise l'étude des **onze dépôts GitHub** clonés localement dans `references/upstream/` pour la création du court-métrage d'animation 2D dessiné image par image **« Le Gâteau de Mamie »** (45,0 secondes, 1080 frames à 24 fps, format vertical 9:16 `1080×1920`).

Conformément aux consignes, nous n'avons **pas** construit onze pipelines concurrents : nous avons extrait les meilleures briques artistiques et logicielles pour les unifier dans une seule architecture déterministe (`src/animation/`).

---

## 1. Inventaire des 11 dépôts clonés (`references/upstream/`)

| # | Dépôt | Dossier local | Commit SHA | Licence | Focus principal |
|---|---|---|---|---|---|
| 1 | `alesha-pro/tools` (`hand-drawn-canvas-animation`) | `references/upstream/01-alesha-pro-tools` | `90e966201add3ff41dc4ebd1348165c0cb2d5eab` | MIT (Alexey Fateev) | Animation 2D dessinée à la main, feuilles d'exposition (`exposureSheet`), poses entières, qualité du trait |
| 2 | `anzal1/hand-drawn-film` (`hand-drawn-film`) | `references/upstream/02-anzal1-hand-drawn-film` | `c4e600c97c76c61123201285caa89fb260a992d6` | MIT (Alexey Fateev) | `cels.js`, `sketch.js`, `materials.js`, `boilCels`, hachures persistantes `formHatch`, `graphite`, `pigmentWash` |
| 3 | `kuhnhomeuk-cell/procedural-film` (`procedural-film`) | `references/upstream/03-kuhnhomeuk-procedural-film` | `f59413999ae24f6e1f9165b73a0eaa97a0b1c407` | MIT (Dean Kuhn) | Architecture pilotée par `TIMELINE`, grille rythmique, contrôles de déterminisme, marges verticales 9:16 |
| 4 | `beriki770-ship-it/code-animations` (`code-animations`) | `references/upstream/04-beriki770-code-animations` | `46accf66e59975633250aa115cb30e8ccb3d7d8c` | MIT (Beri Kirsh) | Pipeline headless `render.mjs`, synthèse Web Audio procédurale, vérification QA automatisée |
| 5 | `iart-ai/javascript-animation-skills` | `references/upstream/05-iart-ai-javascript-animation-skills` | `f7d0882a313249cbd43f0e4e9e209b1622870253` | MIT (iart.ai) | Contrat `drawFrame` pur sans état, `SHOTS` déclaratifs, caméra 2D, planches contact de contrôle |
| 6 | `illodev/drawn-by-code` (`drawn-by-code`) | `references/upstream/06-illodev-drawn-by-code` | `3c9c949421e4aa86dba444dfe8cba46d000f9d87` | MIT (illodev) | Styles d'illustration artisanale (`engraving`, `line`, `paper-cutout`), transitions, revue de frames |
| 7 | `buildwithhanif/claude-animation-skill` | `references/upstream/07-buildwithhanif-claude-animation-skill` | `4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b` | MIT (Hanif) | Articulation de personnages, poses clés expressives, feuilles de contact multi-poses |
| 8 | `JohnHeibel/ClaudeAnimationBase` | `references/upstream/08-JohnHeibel-ClaudeAnimationBase` | `0ac8bf2b31942376cb6b8c4074715595d512acd2` | MIT (John Heibel) | Système d'expressions faciales, clignements d'yeux, synchronisation labiale, studio de prévisualisation |
| 9 | `hoangkien1703/example-draw-javascript` | `references/upstream/09-hoangkien1703-example-draw-javascript` | `a31a4aaa8c20c9341f63e90ee18b38cbf6c37c98` | Non spécifiée (étude uniquement) | `pencil.js` : générateur `mulberry32`, grain de papier (`buildTooth`), traits de graphite `pline`, remplissage crayonné |
| 10 | `anthropics/skills` (`algorithmic-art`, `canvas-design`) | `references/upstream/10-anthropics-skills` | `ca45fc496a3436251f191354091d557da31c15b5` | Apache-2.0 / Source-available | Composition éditoriale, hiérarchie visuelle, palettes papier ancien et grain organique |
| 11 | `vercel-labs/agent-skills` (`web-design-guidelines`) | `references/upstream/11-vercel-labs-agent-skills` | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | MIT | Ergonomie de l'interface du lecteur live, accessibilité clavier/ARIA, responsive 9:16 et contrôles |

---

## 2. Analyse détaillée par dépôt : Étudié / Adapté / Intégré / Écarté

### Dépôts 1 & 2 — `alesha-pro/tools` (`hand-drawn-canvas-animation`) & `anzal1/hand-drawn-film`
- **Ce qui a été étudié** :
  - `assets/cels.js` : gestion des feuilles d'exposition (`exposureSheet`) à 12 dessins/s sur une timeline à 24 fps, profils de pression de crayon (`strokeProfile`), double passage de graphite interrompu.
  - `assets/materials.js` : hachures de forme (`formHatch`), ombrage `graphite`, lavis aquarelle/pigment (`pigmentWash`), grain papier (`screenFill`). L'ancrage spatial des hachures par hachage de grille (`Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663)`) évite que la texture ne « nage » quand la caméra ou l'objet bouge.
  - `assets/sketch.js` : `boilCels` (légère vibration organique du trait calculée uniquement au changement de dessin sur la feuille d'exposition, jamais à chaque frame 24Hz).
- **Ce qui a été adapté et réellement intégré** :
  - Intégré dans `src/animation/pencilEngine.ts` : le profil de pression de crayon, le double passage de graphite organique, le `boilStep = Math.floor(frame / 2)` (maintien sur 2 frames = 12 dessins/s pour l'authenticité traditionnelle), les hachures croisées (`drawHatching`) et les lavis doux (`drawWatercolorWash`).
- **Ce qui a été écarté** :
  - Les modules `roto.js`, `sand.js` et `paper3d.js` (rotoscopie photo et sable) qui ne correspondent pas au style livre d'histoires illustré au crayon et aquarelle douce demandé.

### Dépôt 3 — `kuhnhomeuk-cell/procedural-film`
- **Ce qui a été étudié** :
  - La structure de `TIMELINE` centralisée définissant résolution (`1080×1920`), cadence (`24 fps`), marges de sécurité (`safeTop`, `safeBottom`, `safeLeft`, `safeRight`) et découpage séquentiel des scènes.
  - L'outil de validation (`check.cjs`) vérifiant le déterminisme (deux appels au même temps `t` produisent exactement les mêmes pixels).
- **Ce qui a été adapté et réellement intégré** :
  - Intégré dans `src/animation/config.ts` et `src/animation/timeline.ts` : définition explicite des constantes de marge de sécurité 9:16 (`SAFE_ZONE = { top: 250, bottom: 450, left: 64, right: 130 }`, soit `x ∈ [64, 950]`, `y ∈ [250, 1470]`) et table d'exposition complète des 10 scènes sur 45,0 secondes (1080 frames).
- **Ce qui a été écarté** :
  - Le mode `retro` NES pixel-art et le mode `photo-doodle`.

### Dépôts 4, 5 & 6 — `beriki770/code-animations`, `iart-ai/javascript-animation-skills` & `illodev/drawn-by-code`
- **Ce qui a été étudié** :
  - Le contrat universel de rendu déterministe exposé sur `window` (`window.drawFrame(frameIndex)`, `window.seek(timeSeconds)`, `window.__FILM_META__`) permettant au navigateur live et au script Chromium headless d'utiliser **exactement le même code** sans divergence.
  - La synthèse sonore locale Web Audio API (`OfflineAudioContext`) permettant de générer une bande-son douce (boîte à musique / guitare acoustique / piano feutré + bruitages subtils de cuisine, jardin et rires d'enfants) sans dépendance externe ni clé API.
  - Les scripts de génération de planches contact (`strip.mjs`, `--sheet`) et d'audit de rendu.
- **Ce qui a été adapté et réellement intégré** :
  - Intégré dans `src/animation/renderer.ts` et `src/main.tsx` : exposition globale de `window.drawFrame`, `window.seek` et `window.getFilmMeta`.
  - Intégré dans `src/animation/soundtrack.ts` : synthèse audio douce et nostalgique temps réel (Web Audio API dans le navigateur) et génération WAV hors-ligne pour le mixage AAC 48 kHz dans `scripts/export-video.sh`.
  - Intégré dans `scripts/render-frames.mjs` et `scripts/qa-check.py` : capture frame par frame via Playwright + Chromium et contrôle qualité OpenCV/Pillow/FFprobe.

### Dépôts 7 & 8 — `buildwithhanif/claude-animation-skill` & `JohnHeibel/ClaudeAnimationBase`
- **Ce qui a été étudié** :
  - L'articulation cinématique 2D (épaule → coude → poignet → main/doigts ; hanche → genou → cheville → pied/orteils) guidant des dessins complets et organiques (manches plissées, tablier, jupe, cheveux, chaussures).
  - La feuille d'expressions faciales (clignements naturels, regard dirigé vers l'action, sourire tendre, ouverture de bouche synchronisée lors de l'appel de la scène 7).
- **Ce qui a été adapté et réellement intégré** :
  - Intégré dans `src/animation/characters.ts` :
    - **Mamie Colette** : chignon gris-argenté tenu par une épingle, lunettes rondes dorées sur le nez, joues rosées, cardigan beige-ocre aux manches retroussées, tablier crème à nouette, jupe vert sauge, chaussons bruns. Bras articulés par cinématique inverse 2-segments (`solveTwoBoneIK`) pour que ses mains saisissent réellement l'œuf, le fouet, le saladier, la spatule, le moule, la poignée du four, le tamis de sucre glace, les fraises, le couteau et les assiettes.
    - **Léo (7 ans)** et **Clara (5 ans)** : proportions enfantines cohérentes d'une scène à l'autre, cycles de course authentiques (contact au sol, propulsion, rebond des cheveux et vêtements) et animation dédiée de la **Scène 9 & 10** où leurs jambes trop courtes pendent sous les chaises en bois et **balancent joyeusement d'avant en arrière** en opposition de phase avec flexion des genoux et des chevilles.

### Dépôt 9 — `hoangkien1703/example-draw-javascript`
- **Ce qui a été étudié** :
  - `src/pencil.js` : PRNG déterministe `mulberry32(seed)`, masque de grain de papier multi-échelle (`buildTooth`), tracé `pline` au crayon graphite avec tremblement organique contrôlé et variation d'épaisseur.
- **Ce qui a été adapté et réellement intégré** :
  - Réécrit proprement en TypeScript dans `src/animation/pencilEngine.ts` : générateur `mulberry32`, texture de papier aquarelle grain fin mise en cache hors-écran (`createPaperTextureCanvas`), tracés crayonnés organiques (`drawPencilStroke`, `drawOrganicShape`, `drawHatching`), garantissant qu'aucune forme n'a l'aspect froid ou géométrique d'un tracé vectoriel brut.

### Dépôts 10 & 11 — `anthropics/skills` & `vercel-labs/agent-skills`
- **Ce qui a été étudié** :
  - Direction artistique livre de contes illustré (couleurs passées : crème `#F7EFE1`, beige chaud `#EADBC4`, ocre doré `#D69F4C`, brun doux `#5C4033`, vert sauge `#7E997B`, jaune pâle `#F4DFA2`, rose poudré `#DFA598`).
  - Bonnes pratiques d'interface web pour la page de livraison `index.html` : lecteur Canvas 9:16 temps réel au premier plan, contrôles accessibles, superposition activable de la zone de sécurité 9:16 et de l'onion-skinning (pelure d'oignon), feuille d'exposition interactive, bible graphique et lecteur/téléchargement du MP4 final.

---

## 3. Architecture unifiée retenue dans ce projet

Plutôt que de juxtaposer des scripts disparates, notre projet assemble ces techniques dans une architecture unique :

1. **`src/animation/config.ts`** : Constantes du film (`WIDTH = 1080`, `HEIGHT = 1920`, `FPS = 24`, `DURATION = 45.0`, `TOTAL_FRAMES = 1080`), zone de sécurité 9:16 (`SAFE_ZONE`), et palette de couleurs livre d'enfance (`PALETTE`).
2. **`src/animation/pencilEngine.ts`** : Moteur de dessin traditionnel au crayon graphite, aquarelle douce, hachures croisées et texture papier grainé, 100 % déterministe par graine (`mulberry32`) et cadencé à 12 dessins/s (`boilStep`).
3. **`src/animation/characterBible.ts` & `src/animation/characters.ts`** : Bible graphique verrouillée et dessinateur anatomique articulé (IK 2-segments, mains à doigts articulés, expressions faciales, plis de vêtements, balancement des pieds sous la table).
4. **`src/animation/environment.ts` & `src/animation/props.ts`** : Décors détaillés et cohérents (cuisine familiale en bois, vieux placards, fenêtre, four, table, chaises, jardin ensoleillé) et accessoires évolutifs (saladier, œufs qui se cassent, pâte qui évolue, fouet, moule, gâteau doré, vapeur, sucre glace et fraises posés progressivement, couteau qui découpe réellement les parts, assiettes servies).
5. **`src/animation/scenes.ts` & `src/animation/renderer.ts`** : Mise en scène complète des 10 scènes obligatoires avec transitions douces, éclairage d'après-midi doré et fonction déterministe `drawFrame(canvas, frameIndex, options)`.
6. **`src/animation/soundtrack.ts`** : Synthèse sonore procédurale douce (mélodie nostalgique et bruitages d'ambiance synchronisés).
7. **`scripts/render-frames.mjs` & `scripts/export-video.sh`** : Rendu image par image dans Chromium headless via Playwright et assemblage FFmpeg H.264 `yuv420p` `-movflags +faststart` + vérification FFprobe.
8. **`scripts/qa-check.py`** : Contrôle qualité automatisé (OpenCV, Pillow, NumPy, FFprobe) générant les planches contact, les images clés avec zone de sécurité 9:16 superposée et les métriques de continuité/mouvement.
