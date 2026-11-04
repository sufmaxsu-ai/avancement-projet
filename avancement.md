# Suivi d'Avancement du Projet — « Le Gâteau de Mamie »

**Dernière mise à jour :** 2026-11-04 18:22 UTC  
**Objectif :** Créer un court-métrage d'animation 2D dessiné image par image en JavaScript/TypeScript sur Canvas 2D (`1080×1920`, format vertical 9:16, `24 fps`, durée retenue : **45,0 secondes** soit **1080 frames**), rendu image par image via Chromium headless (Playwright) et assemblé avec FFmpeg (`libx264`, `yuv420p`, `-movflags +faststart`), accompagné d'une prévisualisation live interactive dans l'`index.html` racine.

---

## 1. État Actuel du Projet

- **Statut global :** En cours de réalisation — Étapes 1, 2 et 3 terminées ; développement du moteur d'animation 2D et des 10 scènes en cours.
- **Durée retenue :** **45,0 secondes** (`1080 frames` à `24 fps`, base 12 dessins/s sur la feuille d'exposition avec actions rapides à 24 fps).

### Liste des tâches

- [x] **Étape 0 — Continuité & Dépôt de suivi** : Vérification du dépôt distant `git@github.com:sufmaxsu-ai/avancement-projet.git`, initialisation Git locale.
- [x] **Étape 1 — Environnement & Outils** : Vérification et installation de Node.js (`v20.20.2`), npm (`10.8.2`), Vite (`7.3.2`), TypeScript (`5.9.3`), Chromium (`156.0.8078.79`), Playwright (`1.64.1`), FFmpeg (`5.1.9`), FFprobe (`5.1.9`), Python (`3.11.2`), Pillow (`9.4.0`), NumPy (`1.24.2`), OpenCV (`4.6.0`).
- [x] **Étape 2 — Étude des 11 dépôts GitHub** : Clonage dans `references/upstream/`, analyse des licences, commits et techniques, rédaction de `SKILLS_USAGE_NOTES.md`.
- [ ] **Étape 3 — Bible Graphique & Feuille d'Exposition** : Création de `docs/GRAPHIC_BIBLE.md`, `docs/EXPOSURE_SHEET.md` et `src/animation/characterBible.ts`.
- [ ] **Étape 4 — Moteur de dessin 2D traditionnel (`src/animation/`)** :
  - `config.ts` (constantes 9:16, zone de sécurité `x: 64..950, y: 250..1470`, palette aquarelle/crayon)
  - `pencilEngine.ts` (`mulberry32`, grain papier, traits graphite à pression variable, hachures croisées, lavis doux, maintien du trait à 12 dessins/s)
  - `characters.ts` (Mamie Colette, Léo, Clara avec cinématique inverse 2-segments, mains articulées, expressions faciales, course et balancement des pieds sous la table)
  - `environment.ts` & `props.ts` (cuisine familiale, jardin ensoleillé, saladier, œufs, fouet, pâte évolutive, moule, four, gâteau doré, décoration progressive, couteau, parts découpées et servies)
  - `scenes.ts` & `renderer.ts` (les 10 scènes obligatoires + contrat déterministe `window.drawFrame(frame)` / `window.seek(t)`)
  - `soundtrack.ts` (synthèse audio douce Web Audio API + générateur WAV 48 kHz hors-ligne)
- [ ] **Étape 5 — Application de prévisualisation live (`index.html`, `src/App.tsx`)** : Lecteur Canvas 9:16 temps réel, lecture/pause/reprise/redémarrage, barre de progression, affichage zone de sécurité 9:16, pelure d'oignon (onion skinning), explorateur des 10 scènes et de la bible graphique, lecteur et téléchargement MP4.
- [ ] **Étape 6 — Pipeline d'export Chromium + FFmpeg (`scripts/export-video.sh`, `scripts/render-frames.mjs`, `scripts/generate-audio.mjs`)** : Capture individuelle des 1080 frames et encodage H.264 `final/animation.mp4` + copie dans `public/animation.mp4`.
- [ ] **Étape 7 — Contrôle Qualité (`scripts/qa-check.py`, `QA_REPORT.md`, `ANIMATION_ENVIRONMENT_GUIDE.md`)** : Vérification OpenCV/Pillow/FFprobe, planches contact, vérification de la zone de sécurité 9:16, validation `npm run build`.

---

## 2. Outils, Versions et Commandes d'Installation

| Outil | Version | Commande de vérification / d'installation |
|---|---|---|
| Node.js | `v20.20.2` | `node -v` |
| npm | `10.8.2` | `npm -v` |
| Vite | `7.3.2` | `npx vite --version` |
| TypeScript | `5.9.3` | `npx tsc -v` |
| Chromium | `156.0.8078.79` | `sudo apt-get install -y chromium` |
| Playwright | `1.64.1` | `npm install -D playwright` |
| FFmpeg / FFprobe | `5.1.9-0+deb12u1` | `sudo apt-get install -y ffmpeg` |
| Python 3 | `3.11.2` | `python3 --version` |
| Pillow / NumPy / OpenCV | `9.4.0` / `1.24.2` / `4.6.0` | `sudo apt-get install -y python3-pil python3-numpy python3-opencv` |

---

## 3. Décisions Techniques et Artistiques

1. **Durée de 45,0 secondes (1080 frames à 24 fps)** : Permet de raconter les 10 scènes obligatoires sans précipitation, en laissant respirer la préparation de la pâte (6,0s), les jeux au jardin (5,0s), le balancement des petits pieds sous les chaises (Scène 9 : 4,5s) et le découpage/service des parts de gâteau (Scène 10 : 5,0s).
2. **Esthétique livre d'histoires illustré au crayon et aquarelle** : Utilisation d'un générateur pseudo-aléatoire déterministe (`mulberry32`) indexé sur le numéro de dessin (`Math.floor(frame / 2)` pour une cadence de 12 dessins/s sur une vidéo à 24 fps). Le trait vit subtilement comme un vrai dessin animé sur papier grainé sans scintiller numériquement.
3. **Zone de sécurité 9:16 stricte (`1080×1920`)** : Toutes les actions clés, les visages, les mains, le gâteau, le texte de la scène 7 (« À table, les enfants ! Le gâteau est prêt ! ») et les pieds des enfants qui se balancent sous la table sont composés à l'intérieur du rectangle sûr `x ∈ [64, 950]`, `y ∈ [250, 1470]`.

---

## 4. Prochaine Action Précise

Créer `README.md`, `docs/GRAPHIC_BIBLE.md` et les modules du moteur d'animation dans `src/animation/`, puis pousser l'étape sur `origin/main`.
