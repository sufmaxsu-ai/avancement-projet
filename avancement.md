# Suivi d'Avancement — Film d'Animation 2D « Le Gâteau de Mamie » (5 à 8s)

**Dernière mise à jour :** 2026-11-05 (Initialisation du projet et connexion au dépôt distant)

## 1. Objectif du Projet et État Actuel
- **Objectif :** Créer un court-métrage d'animation 2D dessiné image par image en JavaScript / Canvas 2D, au format vertical **9:16 (1080 × 1920)**, **24 fps constants**, d'une durée de **7,5 secondes (180 frames)** (dans la plage stricte de 5 à 8 secondes), rendu frame par frame via Chromium Headless (Playwright) et assemblé avec FFmpeg en MP4 H.264 (`yuv420p`, audio AAC 48 kHz, `+faststart`).
- **Histoire :** Mamie Colette prépare la pâte à gâteau au fouet dans sa cuisine chaleureuse pendant qu'on aperçoit Léo et Clara courir et jouer dans le jardin par la grande porte-fenêtre ouverte (profondeur 3D). Mamie enfourne puis sort le gâteau doré du four 3D en perspective, le pose sur la table et appelle les enfants. Les enfants accourent depuis le jardin et s'assoient à table en balançant joyeusement leurs pieds sous les chaises. Pendant que Mamie se tourne un instant pour prendre les assiettes et la pelle à tarte, Léo plonge malicieusement le doigt dans le glaçage du gâteau pour goûter sous le regard complice et amusé de Clara, puis Mamie sert une belle part à chacun.
- **Exigences artistiques critiques :**
  - Style livre jeunesse dessiné à la main au crayon graphite et crayons de couleur/aquarelle sur papier grainé chaud.
  - **Silhouettes anatomiques unifiées sans traits résiduels internes** : les bras (épaule → coude → poignet → main), les jambes (cuisse → genou → mollet → pied) et la tête/chevelure sont tracés avec des contours continus unifiés (aucun rectangle/capsule superposé laissant un trait de séparation interne ni d'écart blanc). La ligne supérieure du crâne sous les cheveux n'est jamais dessinée.
  - **Contours au crayon visibles et vivants (line boil feuille à feuille)** : chaque frame possède une graine déterministe propre faisant vibrer organiquement le trait de crayon et les hachures d'une image à l'autre.
  - **Coloriage humain imparfait** : léger décalage organique du remplissage coloré par rapport au contour (léger dépassement d'un côté, fin liseré papier de l'autre, texture de hachures au crayon).
  - **Permanence des objets, gravité et articulations naturelles** : aucun objet n'apparaît ou ne disparaît par magie ; les mains saisissent exactement les poignées/rebords (cinématique inverse / ancres partagées) ; les coudes et genoux plient toujours dans le sens anatomique naturel ; la perspective 3D (four, table, bol, gâteau, jardin en profondeur) reste cohérente.
- **État actuel :** Dépôt initialisé, structure de base en place, début de l'étape 1 (clonage et étude des 11 dépôts de référence) et de l'étape 2 (installation de l'environnement Chromium, FFmpeg, Python/OpenCV/Pillow).

## 2. Liste des Tâches
- [x] Connexion au dépôt distant `git@github.com:sufmaxsu-ai/avancement-projet.git` et vérification de l'historique.
- [x] Création initiale de `avancement.md` et `README.md`.
- [x] **Étape 1 :** Cloner et étudier les 11 dépôts dans `references/upstream/`, relever commits et licences (`references/upstream/REPOS_MANIFEST.txt`), rédiger `SKILLS_USAGE_NOTES.md`.
- [x] **Étape 2 :** Installer et tester FFmpeg (`5.1.9`), ffprobe (`5.1.9`), Playwright + Chromium headless (`156.0.8078.4`), Python 3 (`3.11.2`) + Pillow (`9.4.0`) + NumPy (`2.4.6`) + OpenCV headless (`5.0.0`). Rédiger `ANIMATION_ENVIRONMENT_GUIDE.md`.
- [x] **Étape 3 :** Rédiger la bible graphique (`docs/GRAPHIC_BIBLE.md`), le storyboard et la feuille d'exposition (`docs/EXPOSURE_SHEET.md`) pour les 180 frames (7,5 s à 24 fps).
- [x] **Étape 4 :** Développer le moteur de dessin organique unifié (`src/animation/`) :
  - Moteur de crayonné `pencilEngine.ts` (contours continus sans traits internes, remplissage décalé « fait main », hachures, grain papier, projection 3D perspective).
  - Anatomie continue et cinématique inverse `characters.ts` (Mamie Colette, Léo, Clara : bras/jambes unifiés `drawUnifiedLimb`, crâne masqué sous les cheveux, articulations anatomiques, balancement des pieds sous les chaises, doigt gourmand dans le gâteau).
  - Décors 3D et accessoires permanents `environment.ts` et `props.ts` (cuisine en perspective, porte de four 3D articulée, jardin visible par la baie vitrée, saladier, fouet, moule, gâteau 3D avec encoche de découpe, assiettes, parts).
  - Orchestration et timeline déterministe `scenes.ts` et `renderer.ts` (`drawFrame(frameIndex)`).
- [x] **Étape 5 :** Construire la prévisualisation interactive temps réel (`web/preview.html` et application React studio `src/App.tsx`).
- [ ] **Étape 6 :** Créer le script d'export autonome `scripts/export-video.sh` (support HTML/JS via Chromium, séquence PNG/JPEG, vidéo existante ; formats MP4, WebM, MOV) et le générateur audio synchronisé `scripts/generate-audio.mjs`.
- [ ] **Étape 7 :** Rendre les 180 frames en 1080×1920, inspecter **chaque image et séquence clé** (vérification anatomique, absence de traits parasites, contact mains-objets, continuité), exécuter le contrôle qualité Python/OpenCV (`scripts/qa-check.py`), produire `QA_REPORT.md`.
- [ ] **Étape 8 :** Assembler et valider `final/animation.mp4`, copier dans `web/animation.mp4` et `public/animation.mp4`, tester l'autonomie du dossier `web/` et rédiger `SKILL.md` final.

## 3. Historique des Commits et Push Réussis
- `1b23956` (`2026-11-05`) : Initialisation du projet d'animation 2D 'Le Gâteau de Mamie' (7.5s, 24fps) et suivi `avancement.md` (push confirmé sur `origin/main`).
- `dfc7888` (`2026-11-05`) : Étapes 1 à 3 complétées - étude des 11 dépôts, guide environnement, bible graphique et feuille d'exposition (push confirmé sur `origin/main`).
- Troisième commit en cours (`feat: étapes 4 et 5 - moteur d'animation 2D sans traits parasites, scène 3D et prévisualisation web/preview.html`).

## 4. Prochaine Action Précise
Créer les scripts d'export et de rendu (`scripts/generate-audio.mjs`, `scripts/render-frames.mjs`, `scripts/export-video.sh`, `scripts/qa-check.py`), rendre les 180 frames, inspecter visuellement les images et produire le MP4 final.
