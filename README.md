# La Promenade de Grand-mère Colette — Film d'Animation 2D Dessiné Image par Image

Film d'animation 2D traditionnel de **6,00 secondes** (`144 frames` à `24 fps` constants, **72 dessins uniques** exposés *« sur 2 »* soit 12 dessins/s) au format vertical **9:16 (`1080 × 1920`)**, entièrement dessiné image par image en **JavaScript / TypeScript & Canvas 2D**, rendu individuellement avec **Chromium headless (Playwright)** et assemblé avec **FFmpeg**.

---

## 1. Démarrage Rapide (Installation, Prévisualisation & Export)

```bash
# 1. Installer les dépendances système (si absentes) et les paquets npm
sudo apt-get update && sudo apt-get install -y ffmpeg chromium python3-pil python3-numpy python3-opencv
npm install

# 2. Lancer la prévisualisation en direct dans le navigateur (depuis l'index.html racine)
npm run dev -- --host

# 3. Construire et tester la version livrable autonome (dist/index.html + dist/animation.mp4)
npm run build && npm run preview -- --host

# 4. Exporter soi-même le film vidéo depuis la source HTML/JS (Chromium -> FFmpeg)
./scripts/export-video.sh index.html final/animation.mp4

# 5. Lancer le contrôle qualité automatisé (OpenCV, Pillow, NumPy, ffprobe)
python3 scripts/qc_check.py
```

---

## 2. Arborescence du Dépôt

```text
.
├── index.html                        # UNIQUE point d'entrée HTML (Prévisualisation Canvas 2D + Livraison MP4)
├── package.json                      # Dépendances et scripts npm (dev, build, preview)
├── vite.config.ts                    # Configuration Vite + TypeScript + Tailwind
├── tsconfig.json                     # Configuration TypeScript
├── avancement.md                     # Journal de suivi continu et détaillé du projet
├── ANIMATION_ENVIRONMENT_GUIDE.md    # Guide de l'environnement, versions et pipeline reproductible
├── SKILLS_USAGE_NOTES.md             # Synthèse de l'étude des 11 dépôts GitHub de référence
├── QC_REPORT.md                      # Rapport de contrôle qualité validé (OpenCV, Pillow, NumPy, ffprobe)
├── src/
│   ├── main.tsx                      # Point d'entrée React monté par index.html
│   ├── App.tsx                       # Studio interactif (Lecteur Canvas 2D temps réel, X-Sheet, MP4)
│   └── animation/
│       ├── prng.ts                   # PRNG déterministe Mulberry32, bruit 1D/2D & splines Catmull-Rom
│       ├── pen.ts                    # Papier grain torchon, lavis aquarelle, crayon & trait d'encre
│       ├── exposureSheet.ts          # Feuille d'exposition (72 dessins CEL_001..072 / 144 frames @ 24 fps)
│       ├── background.ts             # Décor multi-plans (Rue des Glycines, chat roux animé, papillon, pavés)
│       ├── character.ts              # Dessin complet image par image de Grand-mère Colette
│       └── engine.ts                 # Moteur déterministe window.drawFrame(frameIndex) & window.seek(t)
├── art/
│   ├── BIBLE_GRAPHIQUE.md            # Charte graphique du personnage, du décor, palette & zone sûre 9:16
│   ├── STORYBOARD.md                 # Découpage narratif en 3 actes (6,00 s)
│   ├── FEUILLE_EXPOSITION.md         # Table d'exposition complète (72 dessins / 144 frames)
│   ├── exposure_sheet.json           # Données JSON de la feuille d'exposition
│   └── poses/                        # 16 planches haute résolution (1080x1920) des poses clés, breakdowns & études
├── scripts/
│   ├── export-video.sh               # Script autonome d'export vidéo (Modes A: HTML/JS, B: PNG, C: Vidéo)
│   ├── render-frames.mjs             # Capture individuelle des 144 frames dans Chromium via Playwright
│   ├── generate-audio.mjs            # Synthèse locale de la piste sonore stéréo 48 kHz (WAV)
│   └── qc_check.py                   # Contrôle qualité Python (OpenCV, Pillow, NumPy, ffprobe)
├── qc/
│   ├── contact_sheet_walk_cycle_12.png    # Planche contact annotée des 12 poses du cycle de marche
│   ├── contact_sheet_36_cels_overview.png # Planche contact 6x6 des 3 actes
│   ├── onion_skin_composite.png           # Superposition Onion Skin multi-poses OpenCV
│   └── qc_metrics.json                    # Métriques quantitatives de contrôle qualité
├── final/
│   └── animation.mp4                 # Film MP4 final (1080x1920, 24 fps, H.264 yuv420p, AAC 48 kHz)
├── public/
│   └── animation.mp4                 # Copie relative servie par Vite à côté de l'index.html racine
└── build/
    ├── frames/                       # Les 144 frames PNG individuelles (00000.png .. 00143.png)
    └── audio/soundtrack.wav          # Piste sonore stéréo 48 kHz générée localement
```
