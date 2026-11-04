# ANIMATION_ENVIRONMENT_GUIDE.md — Guide de l'Environnement et de Reproduction

Ce document présente l'ensemble des outils, versions, configurations et commandes utilisés pour produire, prévisualiser en direct et exporter en vidéo le court-métrage d'animation 2D dessiné image par image **« Le Gâteau de Mamie »** (**45,0 secondes**, `1080 × 1920`, format vertical `9:16`, `24 fps`).

---

## 1. Inventaire des Outils et Versions Vérifiées

Tous les outils utilisés sont gratuits, locaux, automatisables et ne nécessitent **aucune clé API externe** :

| Outil / Bibliothèque | Version | Rôle dans le pipeline | Commande de vérification |
|---|---|---|---|
| **Node.js** | `v20.20.2` | Exécution des scripts de rendu (`render-frames.mjs`), de synthèse audio (`generate-audio.mjs`) et de Vite | `node -v` |
| **npm** | `10.8.2` | Gestionnaire de paquets JavaScript/TypeScript | `npm -v` |
| **Vite** | `7.3.2` | Serveur de développement et bundler de production (`vite-plugin-singlefile` activé) | `npx vite --version` |
| **TypeScript** | `5.9.3` | Typage statique du moteur d'animation 2D (`src/animation/*.ts`) | `npx tsc -v` |
| **Canvas 2D (HTML5)** | Natif | Moteur de dessin traditionnel au crayon graphite, hachures croisées, aquarelle et grain papier | Via navigateur / Chromium |
| **Chromium** | `156.0.8078.79` | Navigateur headless exécutant `window.drawFrame(frame)` pour capturer chaque image en `1080×1920` | `chromium --version` |
| **Playwright** | `1.64.1` | Orchestration multi-workers de Chromium headless dans `scripts/render-frames.mjs` | `npx playwright --version` |
| **FFmpeg** | `5.1.9-0+deb12u1` | Assemblage des 1080 frames et de la piste audio WAV en vidéo H.264 (`libx264`, `yuv420p`, `-movflags +faststart`, AAC 48 kHz) | `ffmpeg -version` |
| **FFprobe** | `5.1.9-0+deb12u1` | Inspection et validation de conformité du flux vidéo/audio généré | `ffprobe -version` |
| **Python 3** | `3.11.2` | Exécution du contrôle qualité automatisé (`scripts/qa-check.py`) | `python3 --version` |
| **Pillow (PIL)** | `9.4.0` | Assemblage des planches contact, strips et superpositions de la zone de sécurité 9:16 | `python3 -c "import PIL; print(PIL.__version__)"` |
| **NumPy** | `1.24.2` | Calculs matriciels de luminosité, continuité et pelure d'oignon (*onion skin*) | `python3 -c "import numpy; print(numpy.__version__)"` |
| **OpenCV (`cv2`)** | `4.6.0` | Analyse du mouvement inter-images et mesure du balancement des pieds sous les chaises | `python3 -c "import cv2; print(cv2.__version__)"` |
| **Git** | `2.39.5` | Suivi de version et synchronisation continue avec `git@github.com:sufmaxsu-ai/avancement-projet.git` | `git --version` |

---

## 2. Installation de l'Environnement depuis Zéro

Sur un système Debian / Ubuntu :

```bash
# 1. Installer les dépendances système (FFmpeg, Chromium, Python + Pillow/NumPy/OpenCV)
sudo apt-get update
sudo apt-get install -y ffmpeg chromium python3-pil python3-numpy python3-opencv

# 2. Installer les dépendances Node.js du projet (à la racine du dépôt)
npm install
```

---

## 3. Lancement de la Prévisualisation Live dans le Navigateur

Conformément aux règles d'architecture, **le seul fichier `index.html` se trouve à la racine du projet**. Il contient à la fois la prévisualisation live temps réel sur Canvas 2D (`requestAnimationFrame`) et la page de livraison complète :

```bash
# Mode développement live (accessible sur http://localhost:5173/)
npm run dev -- --host

# Compilation de production et serveur de prévisualisation (accessible sur http://localhost:4173/)
npm run build
npm run preview -- --host
```

### Fonctionnalités disponibles dans le navigateur (`index.html`)
- **Lecture temps réel sur Canvas 2D (`1080 × 1920`, 9:16)** indépendante du fichier MP4.
- **Contrôles de transport** : Lecture, Pause, Reprendre, Redémarrer (`Début`), navigation image par image (`-1 frame` / `+1 frame` ou touches `←` / `→`), barre de progression interactive et accès direct aux 10 scènes.
- **Outils d'inspection** :
  - Bouton **« Zone sûre 9:16 »** : affiche en temps réel les marges TikTok/Reels/Shorts (`Haut: 250 px`, `Bas: 450 px`, `Gauche: 64 px`, `Droite: 130 px`, zone utile `x ∈ [64, 950], y ∈ [250, 1470]`).
  - Bouton **« Pelure d'oignon (f±2) »** : superpose le dessin précédent (`f-2`) et le dessin suivant (`f+2`) pour inspecter les intervalles d'animation.
- **Lecteur vidéo MP4 intégré et bouton de téléchargement direct** (`./animation.mp4`).

---

## 4. Reproduction Complète de l'Export Vidéo (`scripts/export-video.sh`)

Le script `scripts/export-video.sh` automatise toutes les étapes (synthèse audio, lancement du serveur Vite, capture individuelle des 1080 frames dans Chromium headless via `window.drawFrame(frame)`, encodage FFmpeg, copie dans `public/animation.mp4` et validation FFprobe) :

```bash
# Commande standard (recommandée) :
./scripts/export-video.sh index.html final/animation.mp4
```

### Variantes supportées par `scripts/export-video.sh`
```bash
# Exporter en forçant des images intermédiaires PNG sans perte :
./scripts/export-video.sh --ext png index.html final/animation.mp4

# Ré-encoder directement une séquence d'images numérotées existante :
./scripts/export-video.sh frames_raw_tmp/%05d.jpg final/animation.mp4

# Exporter au format WebM (VP9 + Opus) ou MOV :
./scripts/export-video.sh index.html final/animation.webm
./scripts/export-video.sh index.html final/animation.mov
```

### Commande FFmpeg directe équivalente
Une fois les 1080 images générées dans `frames_raw_tmp/` et la piste audio dans `final/soundtrack.wav` :
```bash
ffmpeg -y -framerate 24 -i frames_raw_tmp/%05d.jpg -i final/soundtrack.wav \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset medium \
  -vf "scale=1080:1920:flags=lanczos" -r 24 \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart -t 45.0 final/animation.mp4
```

---

## 5. Exécution du Contrôle Qualité Automatisé

```bash
python3 scripts/qa-check.py
```

Ce script vérifie le fichier `final/animation.mp4` avec `ffprobe`, inspecte les frames avec OpenCV/Pillow/NumPy et régénère dans `docs/qa/` :
- `docs/qa/contact_sheet_10_scenes.jpg` (planche contact de 20 poses couvrant les 10 scènes)
- `docs/qa/safe_zone_9x16_verification.jpg` (contrôle de la marge de sécurité 9:16)
- `docs/qa/swinging_feet_strip.jpg` et `docs/qa/swinging_feet_onion_skin.jpg` (analyse du balancement des pieds sous les chaises en Scène 9)
- `docs/qa/qa_metrics.json` (rapport chiffré de validation).
