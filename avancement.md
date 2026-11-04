# Suivi d'Avancement du Projet — « Le Gâteau de Mamie »

**Dernière mise à jour :** 2026-11-04 19:05 UTC  
**Objectif :** Créer un court-métrage d'animation 2D dessiné image par image en JavaScript/TypeScript sur Canvas 2D (`1080×1920`, format vertical 9:16, `24 fps`, durée retenue : **45,0 secondes** soit **1080 frames**), rendu individuellement image par image via Chromium headless (Playwright) et assemblé avec FFmpeg (`libx264`, `yuv420p`, `-movflags +faststart`, audio AAC 48 kHz), accompagné d'une prévisualisation live interactive dans l'`index.html` racine.

---

## 1. État Actuel du Projet

- **Statut global :** **TERMINÉ ET VALIDÉ (100 %)** — Toutes les scènes, le lecteur live, le pipeline d'export Chromium + FFmpeg, le fichier MP4 final, les planches de contrôle qualité et les livrables documentaires sont produits, testés et poussés sur le dépôt distant.
- **Durée retenue :** **45,0 secondes** (`1080 frames` à `24 fps`, base 12 dessins/s sur la feuille d'exposition).

### Liste des tâches (Bilan Final)

- [x] **Étape 0 — Continuité & Dépôt de suivi** : Liaison avec `git@github.com:sufmaxsu-ai/avancement-projet.git` et suivi continu.
- [x] **Étape 1 — Environnement & Outils** : Installation et vérification de Node.js (`v20.20.2`), npm (`10.8.2`), Vite (`7.3.2`), TypeScript (`5.9.3`), Chromium (`156.0.8078.79`), Playwright (`1.64.1`), FFmpeg (`5.1.9`), FFprobe (`5.1.9`), Python (`3.11.2`), Pillow (`9.4.0`), NumPy (`1.24.2`), OpenCV (`4.6.0`).
- [x] **Étape 2 — Étude des 11 dépôts GitHub** : Clonage dans `references/upstream/`, relevé des commits SHA et licences (`references/upstream/REPOS_MANIFEST.txt`), rédaction de `SKILLS_USAGE_NOTES.md`.
- [x] **Étape 3 — Bible Graphique & Feuille d'Exposition** : Création de `docs/GRAPHIC_BIBLE.md`, `docs/EXPOSURE_SHEET.md` et `src/animation/characterBible.ts`.
- [x] **Étape 4 — Moteur de dessin 2D traditionnel (`src/animation/`)** :
  - `src/animation/config.ts` (format 9:16 `1080×1920`, `24 fps`, `45.0s`, `SAFE_ZONE` `x ∈ [64, 950], y ∈ [250, 1470]`, `PALETTE`, `SCENES`)
  - `src/animation/pencilEngine.ts` (générateur déterministe `mulberry32`, grain papier aquarelle, traits de crayon graphite à double passage, hachures croisées, maintien du grain sur 2 frames = 12 dessins/s)
  - `src/animation/characters.ts` (Mamie Colette, Clara 5 ans, Léo 7 ans : cinématique inverse 2-segments, mains articulées, expressions faciales, course avec contact au sol, et **jambes trop courtes qui pendent et balancent joyeusement sous les chaises en Scènes 9 et 10**)
  - `src/animation/environment.ts` & `src/animation/props.ts` (cuisine familiale en bois, four articulé, jardin d'été, saladier, œufs cassés, fouet, pâte évolutive, moule, gâteau doré immuable avec décoration progressive au sucre glace et 7 fraises, couteau, assiettes et parts découpées)
  - `src/animation/scenes.ts` & `src/animation/renderer.ts` (les 10 scènes obligatoires + contrat déterministe `window.drawFrame(frame)` / `window.seek(t)`)
  - `src/animation/soundtrack.ts` (synthèse musicale et bruitages doux Web Audio API)
- [x] **Étape 5 — Application de prévisualisation live (`index.html`, `src/App.tsx`, `src/main.tsx`)** : Lecteur Canvas 9:16 temps réel (`requestAnimationFrame`), lecture/pause/reprise/redémarrage, barre de progression, superposition zone de sécurité 9:16, pelure d'oignon (*onion skinning*), feuille d'exposition interactive, bible graphique, lecteur et téléchargement MP4.
- [x] **Étape 6 — Pipeline d'export Chromium + FFmpeg (`scripts/export-video.sh`, `scripts/render-frames.mjs`, `scripts/generate-audio.mjs`)** : Rendu individuel des 1080 frames dans Chromium headless, synthèse WAV 48 kHz, assemblage FFmpeg H.264 `yuv420p` `-movflags +faststart` dans `final/animation.mp4` et `public/animation.mp4`, et validation FFprobe.
- [x] **Étape 7 — Contrôle Qualité & Livrables (`scripts/qa-check.py`, `scripts/verify-preview.mjs`, `QA_REPORT.md`, `ANIMATION_ENVIRONMENT_GUIDE.md`)** : Vérification OpenCV/Pillow/NumPy/FFprobe, planches contact (`docs/qa/`), poses clés (`docs/keyframes/`), et validation `npm run build` + `npm run preview`.

---

## 2. Fichiers et Dossiers Créés / Modifiés

| Chemin | Rôle |
|---|---|
| `index.html` | Point d'entrée unique à la racine (prévisualisation live + livraison) |
| `avancement.md` | Document de suivi continu du projet |
| `README.md` | Guide rapide d'installation, lancement, export et arborescence |
| `ANIMATION_ENVIRONMENT_GUIDE.md` | Documentation complète des outils, versions et commandes de reproduction |
| `SKILLS_USAGE_NOTES.md` | Analyse comparative des 11 dépôts GitHub étudiés, adaptés et intégrés |
| `QA_REPORT.md` | Rapport détaillé du contrôle qualité (FFprobe, OpenCV, zone sûre 9:16, corrections) |
| `docs/GRAPHIC_BIBLE.md` | Bible graphique des personnages, couleurs, accessoires et décors |
| `docs/EXPOSURE_SHEET.md` | Feuille d'exposition image par image des 10 scènes (1080 frames) |
| `docs/keyframes/*.jpg` | 24 poses clés et intermédiaires extraites des 10 scènes |
| `docs/qa/*` | Planche contact 20 poses, planche zone sûre 9:16, strip & onion-skin des pieds sous la table, capture live browser, `qa_metrics.json` |
| `src/animation/*.ts` | Moteur complet d'animation 2D dessiné image par image sur Canvas 2D |
| `src/App.tsx`, `src/main.tsx` | Interface du studio de prévisualisation live et exposition de `window.drawFrame` |
| `scripts/export-video.sh` | Script d'export reproductible Chromium → FFmpeg → FFprobe |
| `scripts/render-frames.mjs` | Script Playwright/Chromium de capture individuelle des 1080 frames |
| `scripts/generate-audio.mjs` | Générateur de la bande-son synchronisée WAV 48 kHz (45,0s) |
| `scripts/qa-check.py` | Script Python (OpenCV, Pillow, NumPy, FFprobe) de contrôle qualité |
| `scripts/verify-preview.mjs` | Script Playwright de test automatisé de l'interface live et du téléchargement MP4 |
| `final/animation.mp4` & `public/animation.mp4` | Court-métrage final encodé en H.264 `1080×1920`, `24 fps`, `yuv420p`, `45.0s` |

---

## 3. Résultats des Tests Effectués

1. **Test du pipeline d'export complet (`./scripts/export-video.sh index.html final/animation.mp4`)** :
   - `1080 / 1080` frames rendues individuellement par Chromium headless (`1080×1920`).
   - Encodage FFmpeg réussi : `codec=h264 (High)`, `1080x1920 (9:16)`, `pix_fmt=yuv420p`, `fps=24`, `durée=45.00s`, `audio=aac 48000 Hz stereo`, `taille=31 494,5 Ko`.
2. **Contrôle Qualité Python (`python3 scripts/qa-check.py`)** :
   - Statut : `PASS`.
   - Mouvement inter-dessins moyen : `3.334`.
   - Mouvement mesuré dans la région sous la table en Scènes 9–10 (balancement des pieds) : `10.986`.
   - Respect de la zone de sécurité 9:16 (`x ∈ [64, 950], y ∈ [250, 1470]`) vérifié visuellement sur `docs/qa/safe_zone_9x16_verification.jpg`.
3. **Test de build et prévisualisation live (`npm run build` + `node scripts/verify-preview.mjs`)** :
   - Compilation Vite + TypeScript réussie (`dist/index.html` + `dist/animation.mp4`).
   - Vérification Playwright sur `vite preview` : Canvas `1080×1920` actif, `window.drawFrame` et `window.seek` opérationnels, téléchargement `./animation.mp4` en `HTTP 200 OK`.

---

## 4. Prochaine Action Précise

Le projet est intégralement terminé. Pour relancer la prévisualisation live à tout moment : `npm run dev -- --host` (ou `npm run preview -- --host`), et pour relancer l'export vidéo complet : `./scripts/export-video.sh index.html final/animation.mp4`.
