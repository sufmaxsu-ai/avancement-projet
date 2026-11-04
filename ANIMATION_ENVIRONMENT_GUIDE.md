# ANIMATION_ENVIRONMENT_GUIDE.md — Guide d'Environnement et Pipeline Reproductible

Ce document détaille l'ensemble des outils, versions exactes, commandes d'installation, étapes du pipeline **JavaScript (Canvas 2D) → Chromium Headless (Playwright) → FFmpeg**, ainsi que les problèmes rencontrés et leurs solutions validées.

---

## 1. Outils et Versions Validés dans l'Environnement

| Outil / Bibliothèque | Version Installée | Rôle dans le Pipeline |
|---|---|---|
| **Node.js** | `v20.20.2` | Exécution de Vite, des scripts de rendu Playwright et de la synthèse audio |
| **npm** | `10.8.2` | Gestionnaire de dépendances JavaScript / TypeScript |
| **Vite** | `7.3.2` | Serveur de développement et de build pour l'`index.html` racine |
| **TypeScript** | `5.9.3` | Typage strict du moteur de dessin image par image (`src/animation/*.ts`) |
| **Git** | `2.39.5` | Gestion de versions et suivi continu sur `sufmaxsu-ai/avancement-projet.git` |
| **Chromium** | `156.0.8078.79` (Debian Bookworm) | Navigateur headless exécutant le moteur Canvas 2D |
| **Playwright** | `1.64.1` | Pilotage déterministe de Chromium (`window.drawFrame(frameIndex)`) |
| **FFmpeg & ffprobe** | `5.1.9-0+deb12u1` | Assemblage des 144 frames PNG + audio WAV en MP4 H.264 `yuv420p` et inspection |
| **Python 3** | `3.11.2` | Exécution du contrôle qualité automatisé (`scripts/qc_check.py`) |
| **Pillow (PIL)** | `9.4.0` | Génération des planches contact annotées (`qc/contact_sheet_*.png`) |
| **NumPy** | `1.24.2` | Calculs matriciels de luminance et de différence inter-frames (`MAD`) |
| **OpenCV Headless (`cv2`)** | `4.6.0` | Détection de contours Canny et génération de la planche Onion Skin composite |

---

## 2. Commandes d'Installation Complètes (Depuis Zéro)

```bash
# 1. Installation des paquets système (Debian / Ubuntu)
sudo apt-get update
sudo apt-get install -y ffmpeg chromium python3-pil python3-numpy python3-opencv

# 2. Installation des dépendances Node.js du projet (depuis la racine)
npm install
```

---

## 3. Architecture Unique (Règle Critique : Un Seul `index.html` à la Racine)

Le projet respecte strictement la structure **Vite + TypeScript** avec **un seul `index.html` à la racine** :
- `index.html` : Unique point d'entrée web (prévisualisation en direct sur Canvas 2D + page de livraison autonome).
- `src/animation/prng.ts` : Générateur déterministe `mulberry32`, hachage de graines par dessin (`celId/strokeId`), bruit cohérent 1D/2D et splines de Catmull-Rom stabilisées.
- `src/animation/pen.ts` : Primitives d'illustration livre jeunesse (papier grain torchon `#FAF3E6`, lavis d'aquarelle en 3 passes `drawWatercolorWash`, hachures au crayon de couleur `drawPencilHatch`, contour d'encre sépia à pression variable `drawOrganicInkStroke`).
- `src/animation/exposureSheet.ts` : Feuille d'exposition complète (`144 frames` à `24 fps` = `6,00 s`, `72 dessins uniques` `CEL_001` à `CEL_072` exposés sur 2 frames, `12 poses` par cycle de marche).
- `src/animation/background.ts` : Décor multi-plans en parallaxe (*La Rue des Glycines* : Boulangerie, Maison aux Glycines avec chat roux animé, Herboristerie, pavés verrouillés sans glissement, papillon doré).
- `src/animation/character.ts` : Dessin complet image par image de Grand-mère Colette selon l'algorithme du peintre.
- `src/animation/engine.ts` : Fonction déterministe `renderAnimationFrame` et exposition globale de `window.drawFrame(frameIndex)`, `window.seek(t)` et `window.__anim`.

---

## 4. Commandes Validées du Pipeline de Production

### A. Lancer la prévisualisation interactive en direct dans le navigateur
```bash
# Mode développement (serveur Vite avec rechargement à chaud)
npm run dev -- --host

# Mode production construit et prévisualisé (teste dist/index.html + dist/animation.mp4)
npm run build && npm run preview -- --host
```

### B. Exécuter le pipeline complet d'export vidéo (HTML/JS → Chromium → FFmpeg)
```bash
# Mode A : Depuis l'index.html racine (démarre Vite si besoin, capture les 144 frames PNG via Chromium, génère l'audio 48 kHz et encode le MP4)
./scripts/export-video.sh index.html final/animation.mp4

# Copier le MP4 validé dans public/ pour la livraison web autonome
cp final/animation.mp4 public/animation.mp4
```

### C. Autres modes supportés par `./scripts/export-video.sh`
```bash
# Mode B : Encoder directement une séquence d'images PNG numérotées
./scripts/export-video.sh build/frames final/animation.mp4

# Mode C : Convertir ou réencoder une vidéo existante (vers WebM VP9/Opus ou MOV)
./scripts/export-video.sh final/animation.mp4 final/animation.webm
./scripts/export-video.sh final/animation.mp4 final/animation.mov

# Commande FFmpeg directe équivalente sur la séquence PNG :
ffmpeg -y -framerate 24 -i build/frames/%05d.png -i build/audio/soundtrack.wav \
  -c:v libx264 -pix_fmt yuv420p -crf 18 \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart -shortest final/animation.mp4
```

### D. Lancer le contrôle qualité automatisé (OpenCV, Pillow, NumPy, ffprobe)
```bash
python3 scripts/qc_check.py
```

---

## 5. Problèmes Rencontrés et Solutions Appliquées

1. **Concurrence potentielle entre `requestAnimationFrame` et `window.drawFrame(frameIndex)` lors de la capture headless** :
   - *Problème* : Si la boucle temps réel `requestAnimationFrame` tourne pendant que Playwright capture les frames, une frame pourrait être écrasée.
   - *Solution* : Ajout du paramètre `?render=1` (utilisé par `scripts/export-video.sh` et `scripts/render-frames.mjs`) qui démarre directement en mode capture sans boucle RAF, ET arrêt automatique de `isPlaying` dès que `window.drawFrame(frameIndex)` est appelé depuis l'extérieur.
2. **Arrondi excessif ("effet ballon") des polygones architecturaux avec Catmull-Rom fermé** :
   - *Problème* : Lors de la première passe de contrôle qualité sur `qc/contact_sheet_walk_cycle_12.png`, les rectangles à 4 sommets (fenêtres, volets, façades) passés à `sampleCatmullRom(..., closed=true)` prenaient une forme trop ovoïde.
   - *Solution* : Insertion automatique de points d'ancrage à `10 %`, `50 %` et `90 %` de chaque arête pour les polygones fermés dans `src/animation/prng.ts`, préservant des lignes architecturales droites aux coins légèrement adoucis à la main.
3. **Scintillement du grain de trait sur les dessins maintenus 2 frames ("on twos")** :
   - *Problème* : Si la graine aléatoire dépend de `frameIndex` (`0..143`), un dessin maintenu pendant 2 frames vibre à 24 Hz au lieu de 12 Hz.
   - *Solution* : Verrouillage strict de toutes les graines de bruit et de texture sur `cel.celId` (`CEL_001` .. `CEL_072`). Le contrôle qualité OpenCV confirme `MAD max = 0.0` entre toutes les paires `(2k, 2k+1)`.
