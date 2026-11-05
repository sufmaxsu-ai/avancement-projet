# Le Gâteau de Mamie — Court-Métrage d'Animation 2D Dessiné Image par Image

Film d'animation vertical **9:16 (1080 × 1920)** à **24 fps** d'une durée de **7,5 secondes (180 frames)**, dessiné intégralement image par image via JavaScript et HTML5 Canvas 2D dans un style livre jeunesse au crayon graphite et aquarelle/crayon de couleur, rendu de façon déterministe par Chromium Headless (Playwright) et assemblé avec FFmpeg.

## Caractéristiques Techniques
- **Format :** 9:16 vertical (`1080 × 1920`)
- **Cadence :** 24 fps constants (`180 frames`, soit `7,50 secondes`)
- **Rendu :** JavaScript Canvas 2D déterministe (`window.drawFrame(frameIndex)` / `window.seek(t)`)
- **Style graphique :** Trait de crayon organique vibrant image par image (*line boil*), silhouettes anatomiques continues (sans traits de jonction internes entre bras/avant-bras ou sous les cheveux), coloriage légèrement décalé façon illustration jeunesse à la main, perspective 3D cohérente.
- **Export vidéo :** MP4 (`libx264`, `yuv420p`, `-movflags +faststart`) + piste sonore bruitages discrets synchronisés (`AAC 48 kHz stéréo`).

## Arborescence du Dépôt
- `src/animation/` : Moteur de dessin au crayon (`pencilEngine.ts`), personnages à silhouettes unifiées et cinématique inverse (`characters.ts`), décor 3D et jardin (`environment.ts`), accessoires permanents (`props.ts`), timeline et scènes (`scenes.ts`), rendu (`renderer.ts`).
- `src/App.tsx` : Interface studio interactive (prévisualisation Canvas 9:16 temps réel, contrôle image par image, onion skinning, grille safe-zone, feuille d'exposition, lecteur MP4).
- `web/` : Dossier autonome livrable contenant `preview.html` (prévisualisation JavaScript directe autonome + lecteur MP4) et `animation.mp4`.
- `scripts/export-video.sh` : Script d'export autonome universel (HTML/JS → Chromium → FFmpeg, séquence d'images → FFmpeg, vidéo → FFmpeg).
- `scripts/render-frames.mjs` : Capture déterministe frame par frame avec Playwright + Chromium.
- `scripts/generate-audio.mjs` : Synthèse locale de bruitages discrets synchronisés (fouet, four, pas, rires, assiettes).
- `scripts/qa-check.py` : Contrôle qualité automatisé (Pillow, NumPy, OpenCV, ffprobe, planches contact, onion skin).
- `docs/` : Bible graphique (`GRAPHIC_BIBLE.md`), feuille d'exposition (`EXPOSURE_SHEET.md`), poses clés (`docs/keyframes/`) et planches QA (`docs/qa/`).
- `final/animation.mp4` : Vidéo finale validée.

## Installation et Lancement Rapide
```bash
# 1. Installer les dépendances Node.js
npm install

# 2. Lancer la prévisualisation interactive dans le navigateur
npm run dev

# 3. Exporter la vidéo depuis la source HTML/JS via Chromium + FFmpeg
./scripts/export-video.sh web/preview.html final/animation.mp4

# 4. Exécuter le contrôle qualité complet
python3 scripts/qa-check.py
```
