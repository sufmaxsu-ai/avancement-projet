# ANIMATION_ENVIRONMENT_GUIDE — Environnement, Outils et Pipeline Reproductible

Ce document consigne l'environnement validé, les versions exactes des outils, les commandes d'installation et le pipeline complet permettant de reproduire le film d'animation **« Le Gâteau de Mamie »** (`1080 × 1920`, `24 fps`, `7,50 secondes` / `180 frames`).

---

## 1. Versions des Outils Validées dans le Sandbox

| Outil / Bibliothèque | Version installée | Rôle dans le pipeline |
| :--- | :--- | :--- |
| **Node.js** | `v20.20.2` | Exécution des scripts de rendu, génération audio et serveur de prévisualisation |
| **npm** | `10.8.2` | Gestionnaire de dépendances JavaScript |
| **Git** | `2.39.5` | Clonage des 11 dépôts de référence et suivi continu sur `origin/main` |
| **Playwright + Chromium** | Chromium `156.0.8078.4` | Rendu déterministe frame par frame du Canvas 2D (`1080 × 1920`) |
| **FFmpeg / ffprobe** | `5.1.9-0+deb12u1` | Assemblage des frames PNG et de la piste WAV en MP4 H.264 / WebM / MOV et inspection |
| **Python 3** | `3.11.2` | Exécution du contrôle qualité automatisé (`scripts/qa-check.py`) |
| **Pillow (PIL)** | `9.4.0` | Génération des planches contact, strips d'animation et *onion skinning* |
| **NumPy** | `2.4.6` | Calculs matriciels de luminance, contraste, couverture trait et différence inter-frame |
| **OpenCV Headless (`cv2`)** | `5.0.0` | Analyse optique inter-frame, détection d'anomalies, continuité et netteté |

---

## 2. Commandes d'Installation Reproductibles

```bash
# 1. Outils système (FFmpeg, ffprobe)
sudo apt-get update -y && sudo apt-get install -y ffmpeg python3-pil python3-numpy python3-opencv

# 2. Bibliothèques Python de contrôle qualité (si installation via pip)
python3 -m pip install --user --break-system-packages pillow numpy opencv-python-headless

# 3. Dépendances Node.js et navigateur Chromium Headless
npm install
npx playwright install chromium
```

---

## 3. Choix du Moteur de Rendu Principal

Après l'analyse des 11 dépôts dans `SKILLS_USAGE_NOTES.md`, nous avons retenu **un moteur unique en HTML5 Canvas 2D pur piloté par Playwright Chromium Headless** :
- **Zéro dépendance externe lourde** (pas de WebGL/Three.js, pas de Blender, pas d'API externe).
- **Déterminisme absolu** : `window.drawFrame(frameIndex)` utilise un générateur pseudo-aléatoire `Mulberry32` initialisé par le numéro de frame et l'identifiant de chaque trait. Appeler `drawFrame(42)` produit au pixel près la même image à chaque exécution.
- **Moteur unique pour le direct et l'export** : la prévisualisation dans le navigateur (`web/preview.html` et l'application studio `src/App.tsx`) et l'export vidéo (`scripts/export-video.sh`) appellent exactement le même code de dessin.

---

## 4. Pipeline Complet : JavaScript → Chromium → FFmpeg → QA

### Étape A : Synthèse Audio Locale Synchronisée
```bash
node scripts/generate-audio.mjs final/soundtrack.wav
```
Génère localement une piste WAV stéréo 48 kHz de 7,50 s contenant uniquement des bruitages discrets synchronisés à la frame près (coups de fouet dans le saladier, grincement doux et cliquetis de la porte du four, petits pas rapides des enfants, rire discret complice pendant que Léo goûte le glaçage du doigt, tintement des assiettes en porcelaine).

### Étape B : Rendu Image par Image via Chromium Headless
```bash
node scripts/render-frames.mjs --input web/preview.html --out-dir frames_raw_tmp --fps 24 --frames 180
```
Ouvre `web/preview.html` en `1080 × 1920`, appelle `window.drawFrame(i)` pour `i = 0 .. 179`, et enregistre chaque image numérotée `00001.png` à `00180.png`.

### Étape C : Encodage FFmpeg en MP4 Vertical (9:16)
```bash
ffmpeg -y -framerate 24 -i frames_raw_tmp/%05d.png -i final/soundtrack.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -shortest -movflags +faststart final/animation.mp4
```

### Étape D : Script d'Export Universel Autonome
```bash
# Depuis une source HTML/JS :
./scripts/export-video.sh web/preview.html final/animation.mp4

# Depuis une séquence d'images PNG :
./scripts/export-video.sh frames_raw_tmp/%05d.png final/animation.mp4

# Depuis une vidéo existante (conversion WebM ou MOV) :
./scripts/export-video.sh final/animation.mp4 final/animation.webm
```

### Étape E : Contrôle Qualité Automatisé (OpenCV + Pillow + ffprobe)
```bash
python3 scripts/qa-check.py
```

---

## 5. Problèmes Rencontrés et Solutions Mises en Œuvre

1. **Traits parasites internes aux articulations (bras/avant-bras, cuisse/mollet)** :
   - *Problème :* Dessiner deux formes géométriques fermées superposées pour le bras et l'avant-bras laisse apparaître un trait de séparation au coude ou un écart blanc lors des rotations.
   - *Solution :* Implémentation de `drawUnifiedLimb()` dans `pencilEngine.ts` qui calcule l'enveloppe tubulaire continue le long de la spline `[épaule, coude, poignet]` en un seul polygone fermé et ne trace le crayon graphite que sur les deux bords extérieurs continus.
2. **Trait résiduel du haut du crâne sous la chevelure** :
   - *Problème :* Tracer un cercle complet pour la tête avant de dessiner les cheveux par-dessus laisse transparaître l'arc supérieur du crâne à travers le coloriage texturé des cheveux.
   - *Solution :* Le contour du visage est tracé uniquement sur l'arc inférieur visible (tempe gauche → joue → menton → joue → tempe droite). De plus, la chevelure applique d'abord un cache opaque couleur papier (`#F6EFE2`) avant son remplissage crayonné décalé et ses mèches.
3. **Politique PEP 668 de Python sur Debian Bookworm** :
   - *Problème :* `pip install` direct est bloqué sans environnement virtuel.
   - *Solution :* Installation via `apt-get install python3-pil python3-numpy python3-opencv` complétée par `--break-system-packages` pour les versions récentes.
