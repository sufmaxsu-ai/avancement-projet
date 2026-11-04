# Suivi d'Avancement — Film d'Animation 2D "La Promenade de Grand-mère Colette"

## Étapes Terminées
1. **Vérification du dépôt de suivi** (`sufmaxsu-ai/avancement-projet.git`) : dépôt initialement vierge, initialisé avec le journal de suivi.
2. **Clonage et étude des 11 dépôts de référence** dans `references/upstream/` :
   - Relevé des commits HEAD, dates et licences.
   - Lecture des `SKILL.md`, `README.md`, références (`redrawn-animation.md`, `ANIMATION_GUIDE.md`) et codes sources (`cels.js`, `pen.mjs`, `pencil.js`).
   - Rédaction de `SKILLS_USAGE_NOTES.md`.
3. **Installation et validation de l'environnement** :
   - Node.js v22.23.4, npm 10.9.9, Git 2.39.5.
   - Chromium 156.0.8078.79 headless + Playwright 1.64.1.
   - FFmpeg & ffprobe 5.1.9-0+deb12u1.
   - Python 3.11.2, Pillow 9.4.0, NumPy 1.24.2, OpenCV headless 4.6.0.

## Prochaines Étapes
4. Création de la Bible Graphique (`art/BIBLE_GRAPHIQUE.md`), du Storyboard (`art/STORYBOARD.md`) et de la Feuille d'Exposition (`art/FEUILLE_EXPOSITION.md` & `art/exposure_sheet.json`).
5. Implémentation du moteur de dessin image par image en JavaScript & Canvas 2D (`web/js/animation-engine.js`) avec les poses clés, breakdowns et intervalles de marche.
6. Création de la page de prévisualisation temps réel (`web/preview.html` et `web/index.html`) + intégration Next.js.
7. Création du script autonome `./scripts/export-video.sh`, rendu image par image via Chromium + assemblage FFmpeg avec audio 48 kHz.
8. Contrôle qualité (planches contact, onion skinning, OpenCV, Pillow, ffprobe) et rapport final.
