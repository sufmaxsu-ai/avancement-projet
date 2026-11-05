# SKILLS_USAGE_NOTES — Analyse des 11 Dépôts de Référence et Décisions Architecturales

Ce document synthétise l'étude approfondie des onze dépôts clonés dans `references/upstream/` (commits et licences relevés dans `references/upstream/REPOS_MANIFEST.txt`) ainsi que les choix techniques opérés pour créer le court-métrage **« Le Gâteau de Mamie »** (7,5 secondes, 180 frames à 24 fps, format vertical 9:16 `1080 × 1920`).

---

## 1. Synthèse des 11 Dépôts Étudiés

### A. Animation dessinée et contrôle du mouvement

#### 1. `alesha-pro/tools` — `hand-drawn-canvas-animation`
- **Commit :** `90e966201add3ff41dc4ebd1348165c0cb2d5eab` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `skills/hand-drawn-canvas-animation/SKILL.md`, `references/style.md`, `references/redrawn-animation.md`, `references/motion.md`, `references/studio.md`, `assets/core.js`, `assets/studio.js`, `assets/cels.js`.
- **Techniques analysées :**
  - Philosophie *whole-pose drawings* : un rig ou une cinématique inverse (IK) sert à construire la pose et garantir les contacts, mais le dessin final doit tracer des silhouettes complètes et organiques.
  - Hiérarchie des épaisseurs de trait : contour externe franc, plis internes fins, hachures douces.
  - Feuille d'exposition (*exposure sheet*) explicite distinguant poses clés, breakdowns, intervalles et tenues vibrantes (*boiling holds*).
- **Pertinence / Limites :** Excellente méthodologie pour éviter l'effet « marionnette rigide ». Repris pour la hiérarchie des traits et la feuille d'exposition.

#### 2. `anzal1/hand-drawn-film` — `hand-drawn-film`
- **Commit :** `c4e600c97c76c61123201285caa89fb260a992d6` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `SKILL.md`, `assets/core.js`, `assets/sketch.js`, `assets/cels.js`, `assets/studio.js`, `assets/paper3d.js`, `assets/materials.js`.
- **Techniques analysées :**
  - `assets/sketch.js` : échantillonnage de courbes Bézier/SVG, `boilCels` (variations de traits d'une frame à l'autre avec points d'ancrage fixés pour que les mains/pieds ne glissent pas tout en gardant un vrai *line boil* feuille par feuille).
  - `assets/paper3d.js` : caméra 3D (`cam3`, `proj3`), projection perspective d'éléments plans et volumiques sur Canvas 2D avec ombrage directionnel (`LIGHT3`).
  - Boucle de revue visuelle sans lecture temps réel : planches contact, *onion skinning* superposé et mesure du mouvement inter-frame.
- **Pertinence / Limites :** La séparation entre **ancres physiques fixes** (contact main-objet, pieds au sol/sur chaise) et **bruit de trait image par image** (*frame-seeded pencil boil*) est essentielle et directement intégrée dans notre moteur `pencilEngine.ts`. De même, l'approche `proj3` inspire notre projection 3D de la cuisine, de la porte du four articulée en 3D et du gâteau cylindrique.

---

### B. Production JavaScript et vidéo

#### 3. `kuhnhomeuk-cell/procedural-film` — `procedural-film`
- **Commit :** `f59413999ae24f6e1f9165b73a0eaa97a0b1c407` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `skills/procedural-film/SKILL.md`, `README.md`.
- **Techniques analysées :**
  - Architecture déterministe où chaque frame dépend exclusivement de `frameIndex` (aucun `Math.random()` non grainé ni dépendance à l'horloge système).
  - Synchronisation image/son par table d'événements horodatés au numéro de frame près.
- **Pertinence / Limites :** Retenu intégralement pour notre PRNG déterministe `Mulberry32` et notre générateur audio WAV `scripts/generate-audio.mjs`.

#### 4. `beriki770-ship-it/code-animations` — `code-animations`
- **Commit :** `46accf66e59975633250aa115cb30e8ccb3d7d8c` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `SKILL.md`, `README.md`, `review/README.md`.
- **Techniques analysées :**
  - Pipeline de capture Chromium Headless image par image et vérification automatisée post-rendu (détection de frames noires, figées ou sauts brusques de luminance).
- **Pertinence / Limites :** Retenu pour structurer `scripts/render-frames.mjs` et `scripts/qa-check.py`.

#### 5. `iart-ai/javascript-animation-skills` — `javascript-animation-skills`
- **Commit :** `f7d0882a313249cbd43f0e4e9e209b1622870253` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `README.md`, fichiers de skills d'interpolation.
- **Techniques analysées :**
  - Courbes d'accélération/décélération organiques (*ease-in-out cubic*, *overshoot*, *spring*, *anticipation*) et superposition d'actions secondaires (*overlapping action* : tablier, cheveux, vapeur, pieds qui balancent).
- **Pertinence / Limites :** Utilisé pour cadencer les gestes humains naturels (anticipation avant de soulever le moule, inertie de la course des enfants, balancement sinusoïdal déphasé des jambes sous la chaise).

#### 6. `illodev/drawn-by-code` — `drawn-by-code`
- **Commit :** `993968aba9dfb183ea04ecea256db85e0077fd09` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `engine/core.js`, `sandbox/2026-09-25-physics-history/figure.js`, `kit.js`, `hands-galileo.js`, `head-galileo.js`, `coil3d.js`.
- **Techniques analysées :**
  - Cinématique inverse à 2 os (`ik(shoulder, wrist, upperLen, foreLen, pole, face)`) garantissant que les segments de membres ne s'étirent jamais et que le coude ou le genou plie toujours du bon côté anatomique grâce à un vecteur pôle (`pole`).
  - Construction d'enveloppes tubulaires continues (`Ph.outline(pts, widthFn)`) autour d'une ligne médiane multi-points échantillonnée par spline Catmull-Rom (`Ph.sample`).
  - Positionnement des mains dans le repère local de l'objet tenu (`hands-galileo.js` et `holdApple` dans `figure.js`) : c'est la main qui s'enroule autour des coordonnées exactes de l'objet, garantissant une prise en main sans décalage.
- **Pertinence / Limites :** **Crucial pour répondre aux exigences du prompt.** Dans `figure.js`, dessiner deux segments séparés (`seg(sh, el)` puis `seg(el, wr)`) fonctionne en aplat Riso sans contour, mais produit un trait de coupure interne au coude si l'on trace le contour de chaque segment. Nous avons donc adapté l'algorithme `Ph.outline` sur la chaîne complète `[épaule, coude, poignet]` pour générer **un seul polygone continu de bras (ou de jambe)** et tracer uniquement les deux bords externes continus, supprimant 100 % des traits parasites internes et des écarts blancs aux articulations.

---

### C. Personnages et rendu dessiné

#### 7. `buildwithhanif/claude-animation-skill` — `claude-animation`
- **Commit :** `4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `README.md`, scripts d'animation et d'encodage.
- **Techniques analysées :**
  - Paramètres FFmpeg optimisés pour la diffusion mobile verticale (`-c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart`).

#### 8. `JohnHeibel/ClaudeAnimationBase`
- **Commit :** `0ac8bf2b31942376cb6b8c4074715595d512acd2` | **Licence :** MIT (`LICENSE`)
- **Fichiers inspectés :** `README.md`, `src/core.js`, `src/timeline.js`, `src/sheets.js`, `src/config.js`.
- **Techniques analysées :**
  - Découpage modulaire propre entre configuration, timeline déclarative par scènes et fonctions de dessin pures.
  - Exposition d'une interface globale `window.drawFrame(frameIndex)` et `window.seek(timeSeconds)` partagée entre le lecteur web temps réel (`requestAnimationFrame`) et le moteur de capture headless.

#### 9. `hoangkien1703/example-draw-javascript`
- **Commit :** `a31a4aaa8c20c9341f63e90ee18b38cbf6c37c98` | **Licence :** Usage éducatif (dépôt public)
- **Fichiers inspectés :** Exemples Canvas 2D de tracés organiques et de composition de scènes illustrées.
- **Techniques analysées :**
  - Superposition des plans de profondeur (arrière-plan jardin, plan moyen cuisine, avant-plan table) et détails narratifs chaleureux.

---

### D. Direction artistique et présentation

#### 10. `anthropics/skills` — `algorithmic-art` et `canvas-design`
- **Commit :** `ca45fc496a3436251f191354091d557da31c15b5` | **Licence :** Spécifique par skill / Apache-2.0 & propriétaire documenté
- **Fichiers inspectés :** `skills/algorithmic-art/SKILL.md`, `skills/canvas-design/SKILL.md`.
- **Techniques analysées :**
  - Bruit déterministe multi-échelle pour simuler le grain du papier aquarelle/crayon (`#F6EFE2`), la pression variable de la mine graphite et le **coloriage humain imparfait** (remplissage décalé de quelques pixels avec bords organiques dépassant légèrement du trait d'un côté et laissant respirer le papier de l'autre).
  - Composition verticale 9:16 respectant les zones de sécurité TikTok / Instagram Reels.

#### 11. `vercel-labs/agent-skills` — `web-design-guidelines`
- **Commit :** `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | **Licence :** MIT
- **Fichiers inspectés :** `skills/web-design-guidelines/SKILL.md`.
- **Techniques analysées :**
  - Conception de l'interface studio et de la page autonome `web/preview.html` : accessibilité clavier, barre de progression interactive frame par frame, contrôles Lecture/Pause/Reprise/Redémarrage, affichage du temps courant et de la durée, et lecteur MP4 juxtaposé.

---

## 2. Architecture Unifiée Retenue (Sans Pipelines Concurrents)

Au lieu de juxtaposer onze moteurs incompatibles, nous avons fusionné les meilleures techniques dans **une seule architecture cohérente** :

1. **Moteur de dessin au crayon et perspective 3D (`src/animation/pencilEngine.ts`)** :
   - PRNG déterministe `Mulberry32` indexé par `(frameIndex, elementId)` pour que chaque frame soit redessinée avec un véritable *line boil* feuille par feuille tout en étant 100 % reproductible.
   - **Remplissage « coloriage humain imparfait » (`imperfectFillAndStroke`)** : le polygone de couleur est légèrement décalé et déformé par rapport au contour graphite (léger dépassement organique de 2 à 5 px et hachures diagonales au crayon de couleur), suivi d'un double passage de mine graphite épaisse et texturée.
   - **Générateur de silhouettes de membres unifiées (`drawUnifiedLimb`)** : inspiré de `Ph.outline` (`drawn-by-code`), il calcule une enveloppe tubulaire continue de l'épaule au poignet (ou de la hanche à la cheville) sans aucun trait de séparation interne au coude/genou ni espace blanc.
   - **Projection 3D perspective (`project3D`, `draw3DBox`, `draw3DCylinder`)** : inspirée de `paper3d.js` (`hand-drawn-film`), utilisée pour le plan de travail 3D, le four dont la porte pivote réellement en 3D autour de sa charnière inférieure, le saladier, le moule et le gâteau cylindrique en 3D.

2. **Anatomie cohérente et permanence des objets (`src/animation/characters.ts`, `props.ts`, `environment.ts`)** :
   - **Suppression totale des traits sous les cheveux** : le contour du visage est tracé uniquement de la tempe gauche au menton puis à la tempe droite (l'arc supérieur du crâne sous la chevelure n'est jamais tracé, et la chevelure applique d'abord un cache papier opaque avant son coloriage et ses mèches).
   - **Cinématique inverse (IK) à pôle anatomique** : les coudes plient toujours vers le bas/arrière naturel et les genoux vers l'arrière (jamais d'inversion d'articulation).
   - **Contact exact main-objet** : les mains sont calculées à partir des points de préhension exacts des objets (rebord du saladier, manche du fouet, poignées du moule à gâteau, poignée de la porte du four, manche de la pelle à tarte, doigt de Léo touchant exactement le glaçage du gâteau).
   - **Permanence des objets dans l'espace** : le saladier, le fouet, le moule, le four, le gâteau et les assiettes demeurent présents de manière continue dans la cuisine sans jamais apparaître ou disparaître magiquement.
