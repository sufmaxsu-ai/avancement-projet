# « Le Gâteau de Mamie » — Court-Métrage d'Animation 2D Dessiné Image par Image

Court-métrage d'animation 2D traditionnel dessiné image par image en JavaScript/TypeScript sur Canvas 2D (`1080 × 1920`, format vertical 9:16, `24 images/s`, **45,0 secondes** / `1080 frames`), rendu image par image avec Chromium headless (Playwright) et assemblé avec FFmpeg (`libx264`, `yuv420p`, `-movflags +faststart`, audio AAC 48 kHz).

---

## 1. Démarrage Rapide (Prévisualisation Live dans le Navigateur)

```bash
# 1. Installer les dépendances Node.js
npm install

# 2. Lancer le serveur de prévisualisation live (index.html racine)
npm run dev -- --host

# 3. Construire et prévisualiser la version autonome de production
npm run build
npm run preview -- --host
```

L'application web accessible depuis l'`index.html` racine affiche :
- **Le film dessiné en direct sur Canvas 2D (9:16, 1080×1920)** avec lecture, pause, reprise, redémarrage, navigation image par image (`-1f` / `+1f`), barre de progression interactive et affichage du temps actuel / durée totale (`45.0s`).
- **Des outils d'inspection d'animation** : superposition de la zone de sécurité 9:16 (`x: 64..950, y: 250..1470`), pelure d'oignon (*onion skinning*), feuille d'exposition interactive des 10 scènes et bible graphique des personnages et accessoires.
- **Le lecteur vidéo MP4 intégré et le bouton de téléchargement direct** du fichier `animation.mp4`.

---

## 2. Reproduire l'Export Vidéo (`scripts/export-video.sh`)

```bash
# Rendu complet image par image (Chromium headless) + assemblage FFmpeg + vérification FFprobe
./scripts/export-video.sh index.html final/animation.mp4

# Contrôle qualité automatisé (OpenCV, Pillow, NumPy, FFprobe)
python3 scripts/qa-check.py
```

---

## 3. Arborescence du Dépôt

```text
.
├── index.html                        # Point d'entrée unique (prévisualisation live + livraison)
├── package.json                      # Dépendances et scripts npm
├── vite.config.ts                    # Configuration Vite
├── tsconfig.json                     # Configuration TypeScript
├── avancement.md                     # Suivi détaillé de l'état d'avancement du projet
├── ANIMATION_ENVIRONMENT_GUIDE.md    # Guide complet de l'environnement et de reproduction
├── SKILLS_USAGE_NOTES.md             # Étude et intégration des 11 dépôts de référence
├── QA_REPORT.md                      # Rapport de contrôle qualité (planches contact, zone sûre, ffprobe)
├── docs/
│   ├── GRAPHIC_BIBLE.md              # Bible graphique des personnages, décors et accessoires
│   ├── EXPOSURE_SHEET.md             # Feuille d'exposition détaillée (10 scènes, 1080 frames)
│   └── qa/                           # Planches contact, grilles zone de sécurité 9:16 et onion-skin
├── src/
│   ├── main.tsx                      # Entrée React + exposition globale window.drawFrame / window.seek
│   ├── App.tsx                       # Studio de prévisualisation live 9:16 et page de livraison
│   └── animation/
│       ├── config.ts                 # Dimensions 1080×1920, 24 fps, 45.0s, SAFE_ZONE, PALETTE
│       ├── pencilEngine.ts           # Moteur crayon graphite, grain papier, hachures, aquarelle
│       ├── characterBible.ts         # Spécifications anatomiques et chromatiques immuables
│       ├── characters.ts             # Mamie Colette, Léo et Clara (IK, mains, visages, pieds qui balancent)
│       ├── environment.ts            # Décors : cuisine familiale en bois et jardin d'été
│       ├── props.ts                  # Accessoires : saladier, œufs, fouet, moule, gâteau, parts
│       ├── scenes.ts                 # Chorégraphie image par image des 10 scènes obligatoires
│       ├── renderer.ts               # Fonction déterministe drawFrame(canvas, frameIndex, opts)
│       └── soundtrack.ts             # Synthèse musicale et bruitages doux Web Audio API
├── scripts/
│   ├── export-video.sh               # Pipeline automatisé Chromium → PNG → FFmpeg → FFprobe
│   ├── render-frames.mjs             # Capture Playwright/Chromium déterministe frame par frame
│   ├── generate-audio.mjs            # Synthèse de la piste sonore WAV 48 kHz hors-ligne
│   └── qa-check.py                   # Audit OpenCV/Pillow/NumPy et génération des planches QA
├── final/
│   └── animation.mp4                 # Court-métrage final exporté (1080×1920, 24 fps, H.264 yuv420p)
├── public/
│   └── animation.mp4                 # Copie servie directement à côté de index.html
└── references/
    └── upstream/                     # Copies locales étudiées des 11 dépôts GitHub de référence
```
