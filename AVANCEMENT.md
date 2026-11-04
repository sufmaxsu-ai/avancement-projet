# Suivi d'Avancement du Projet — *La Promenade de Grand-mère Colette*

- **Date et heure de la dernière mise à jour** : `2026-11-04 17:58 UTC`
- **État actuel du projet** : **TERMINÉ ET VALIDÉ À 100 %** (Animation 2D dessinée image par image sur Canvas 2D, prévisualisation temps réel via l'`index.html` racine, script d'export autonome `./scripts/export-video.sh`, vidéo finale `final/animation.mp4` et `public/animation.mp4` validées par `ffprobe` et contrôle qualité Python OpenCV/Pillow/NumPy).

---

## 1. Objectif du Projet
Créer un film d'animation 2D traditionnel de **6,00 secondes** (`144 frames` à `24 fps` constants, **72 dessins uniques** exposés *« sur 2 »* soit 12 dessins/s) au format vertical **9:16 (`1080 × 1920`)**, mettant en scène **une grand-mère (Grand-mère Colette) qui marche tranquillement dans une jolie rue (*La Rue des Glycines*)**, dans un style chaleureux d'illustration de livre jeunesse (lavis d'aquarelle, hachures au crayon de couleur, trait d'encre sépia organique et texture de papier grain torchon), avec :
- Un unique `index.html` à la racine du projet Vite + TypeScript assurant à la fois la prévisualisation en direct en temps réel (`requestAnimationFrame` + contrôles complets) et la page de livraison autonome.
- Un pipeline déterministe **JavaScript (`window.drawFrame(frameIndex)`) → Chromium Headless (Playwright) → FFmpeg**.
- Un script d'export autonome `./scripts/export-video.sh` prenant en charge les sources HTML/JS (Mode A), les séquences d'images PNG/JPG (Mode B) et les vidéos existantes (Mode C) vers MP4, WebM et MOV.

---

## 2. Historique et Liste des Tâches (Cases à Cocher)

- [x] **Étape 0 — Vérification du dépôt de suivi (`git@github.com:sufmaxsu-ai/avancement-projet.git`)** :
  - Récupération de l'historique initial (`commit 7cb3c94`) et poursuite du travail dans l'architecture **Vite + TypeScript** avec l'unique `index.html` à la racine.
- [x] **Étape 1 — Clonage et étude approfondie des 11 dépôts GitHub dans `references/upstream/`** :
  - Analyse des commits `HEAD`, licences, `SKILL.md`, `README.md` et codes sources (`cels.js`, `pen.mjs`, `pencil.js`).
  - Rédaction et mise à jour de `SKILLS_USAGE_NOTES.md`.
- [x] **Étape 2 — Installation et validation de l'environnement** :
  - Node.js `v20.20.2`, npm `10.8.2`, Vite `7.3.2`, TypeScript `5.9.3`, Git `2.39.5`.
  - Chromium `156.0.8078.79` headless + Playwright `1.64.1`.
  - FFmpeg & ffprobe `5.1.9-0+deb12u1`.
  - Python `3.11.2`, Pillow `9.4.0`, NumPy `1.24.2`, OpenCV headless `4.6.0`.
- [x] **Étape 3 — Préparation artistique et méthode de dessin image par image** :
  - Rédaction de la Bible Graphique (`art/BIBLE_GRAPHIQUE.md`), du Storyboard en 3 actes (`art/STORYBOARD.md`) et de la Feuille d'Exposition complète (`art/FEUILLE_EXPOSITION.md` & `art/exposure_sheet.json`).
  - Implémentation modulaire en TypeScript du moteur de dessin artisanal sur Canvas 2D (`src/animation/prng.ts`, `src/animation/pen.ts`, `src/animation/exposureSheet.ts`, `src/animation/background.ts`, `src/animation/character.ts`, `src/animation/engine.ts`).
- [x] **Étape 4 — Pipeline déterministe JavaScript → Chromium → FFmpeg** :
  - Exposition globale de `window.drawFrame(frameIndex)`, `window.seek(t)` et `window.__anim` depuis l'`index.html` racine.
  - Rendu individuel des 144 frames (`build/frames/00000.png` à `00143.png`) et des 16 planches de poses clés, breakdowns et études (`art/poses/`).
  - Synthèse locale de la piste sonore stéréo 48 kHz (`build/audio/soundtrack.wav` via `scripts/generate-audio.mjs`).
- [x] **Étape 5 — Prévisualisation en direct dans le navigateur & Page de livraison autonome** :
  - Mise à jour de `index.html` et `src/App.tsx` (lecteur Canvas 2D 9:16 temps réel, lecture/pause/reprise/redémarrage, barre de progression, pas-à-pas par frame ou par cel, Onion Skin, Zone de sécurité TikTok/Reels, son Web Audio temps réel, feuille d'exposition interactive des 72 dessins, lecteur MP4 et bouton de téléchargement).
- [x] **Étape 6 — Script d'export autonome `./scripts/export-video.sh`** :
  - Testé et validé en Mode A (`./scripts/export-video.sh index.html final/animation.mp4`), Mode B (`./scripts/export-video.sh build/frames ...`) et Mode C (`./scripts/export-video.sh final/animation.mp4 ...` en `.mp4`, `.webm` et `.mov`).
- [x] **Étape 7 — Contrôle Qualité (OpenCV, Pillow, NumPy, ffprobe)** :
  - Inspection visuelle des planches contact (`qc/contact_sheet_walk_cycle_12.png`, `qc/contact_sheet_36_cels_overview.png`) et de l'étude Onion Skin (`art/poses/study_15_onion_skin_arcs.png`).
  - Correction de l'interpolation des polygones architecturaux fermés dans `src/animation/prng.ts` et affinement de l'échelle (`1.20×`) et de la foulée (`96 px`) de Grand-mère Colette.
  - Validation 100 % réussie par `scripts/qc_check.py` et génération de `QC_REPORT.md` + `qc/qc_metrics.json`.

---

## 3. Fichiers et Dossiers Créés ou Modifiés

| Chemin | Rôle dans le Projet |
|---|---|
| `index.html` | Unique point d'entrée HTML à la racine (prévisualisation en direct + page de livraison) |
| `src/App.tsx` | Interface studio interactive (lecteur Canvas 2D 9:16, contrôles, X-Sheet, lecteur MP4) |
| `src/animation/prng.ts` | Générateur déterministe `mulberry32`, bruit 1D/2D et splines de Catmull-Rom |
| `src/animation/pen.ts` | Papier grain torchon, lavis aquarelle 3 passes, hachures crayon et trait d'encre sépia |
| `src/animation/exposureSheet.ts` | Définition des 12 poses du cycle de marche et des 72 dessins uniques (`CEL_001..072`) |
| `src/animation/background.ts` | Décor multi-plans (*La Rue des Glycines*), pavés verrouillés, chat roux et papillon doré |
| `src/animation/character.ts` | Dessin complet image par image de Grand-mère Colette selon l'ordre du peintre |
| `src/animation/engine.ts` | Moteur déterministe `renderAnimationFrame`, mode Onion Skin, zone sûre 9:16 et Web Audio |
| `art/BIBLE_GRAPHIQUE.md` | Bible graphique complète du personnage, des vêtements, du décor et de la palette |
| `art/STORYBOARD.md` | Storyboard détaillé des 3 actes sur 6,00 secondes (144 frames) |
| `art/FEUILLE_EXPOSITION.md` | Feuille d'exposition traditionnelle à 24 fps (72 cels sur 2 images) |
| `art/exposure_sheet.json` | Feuille d'exposition exportée au format JSON |
| `art/poses/*.png` | 16 planches `1080 × 1920` des poses clés (`KEY`), breakdowns (`BRK`), intervalles (`INB`) et études |
| `scripts/export-video.sh` | Script autonome d'export vidéo (Modes A : HTML/JS, B : Séquence PNG, C : Vidéo) |
| `scripts/render-frames.mjs` | Script Playwright de rendu individuel des 144 frames via Chromium headless |
| `scripts/generate-audio.mjs` | Générateur local de la piste sonore stéréo 48 kHz (`build/audio/soundtrack.wav`) |
| `scripts/qc_check.py` | Script Python de contrôle qualité (OpenCV, Pillow, NumPy, ffprobe) |
| `qc/*.png` & `qc/qc_metrics.json` | Planches contact annotées, superposition Onion Skin et métriques JSON |
| `final/animation.mp4` | Vidéo MP4 finale (`1080 × 1920`, `24 fps`, `H.264 yuv420p`, `AAC 48 kHz`, `6,00 s`) |
| `public/animation.mp4` | Copie relative servie par Vite pour lecture et téléchargement depuis `index.html` |
| `ANIMATION_ENVIRONMENT_GUIDE.md` | Guide complet de l'environnement, des versions et des commandes reproductibles |
| `SKILLS_USAGE_NOTES.md` | Analyse comparative des 11 dépôts GitHub étudiés et décisions architecturales |
| `QC_REPORT.md` | Rapport complet du contrôle qualité |
| `README.md` | Guide rapide d'installation, d'exécution et d'arborescence |

---

## 4. Programmes, Outils et Commandes d'Installation / Lancement

- **Installation système & npm** :
  ```bash
  sudo apt-get update && sudo apt-get install -y ffmpeg chromium python3-pil python3-numpy python3-opencv
  npm install
  ```
- **Prévisualisation en direct dans le navigateur** :
  ```bash
  npm run dev -- --host
  ```
- **Export vidéo complet depuis l'`index.html` racine** :
  ```bash
  ./scripts/export-video.sh index.html final/animation.mp4
  ```
- **Contrôle qualité automatisé** :
  ```bash
  python3 scripts/qc_check.py
  ```

---

## 5. Décisions Techniques, Problèmes Rencontrés et Solutions

1. **Architecture unifiée autour de l'`index.html` racine** :
   - Un seul moteur TypeScript (`src/animation/engine.ts`) alimente à la fois la prévisualisation interactive dans le navigateur (`requestAnimationFrame`) et la capture image par image dans Chromium headless (`window.drawFrame(frameIndex)`).
2. **Invariance de la graine par dessin (`celId`)** :
   - Les graines aléatoires du trait d'encre et du grain de crayon dépendent de `cel.celId` (`CEL_001` à `CEL_072`) et non de `frameIndex`. Ainsi, chaque dessin maintenu pendant 2 frames reste stable (`MAD = 0.0`) tout en conservant le frémissement artisanal à 12 Hz.
3. **Correction géométrique des polygones fermés après inspection des planches contact** :
   - Lors de la première passe QC, les polygones à 4 sommets passés à `sampleCatmullRom(..., closed=true)` s'arrondissaient excessivement. L'ajout de points d'ancrage à `10 %`, `50 %` et `90 %` des arêtes dans `src/animation/prng.ts` a permis d'obtenir des façades, volets et fenêtres nets au charme dessiné à la main.

---

## 6. Prochaine Action Précise (En Cas de Reprise Ultérieure)
Toutes les exigences de la mission sont terminées, testées et validées. Pour visualiser ou modifier l'animation :
1. Cloner le dépôt et exécuter `npm install`.
2. Lancer `npm run dev -- --host` pour ouvrir la prévisualisation en direct dans le navigateur.
3. Exécuter `./scripts/export-video.sh index.html final/animation.mp4` après toute modification de dessin pour régénérer les 144 frames et le MP4 final.
