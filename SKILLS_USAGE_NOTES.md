# SKILLS_USAGE_NOTES.md — Analyse des 11 Dépôts de Référence et Synthèse Architecturale

Ce document synthétise l'étude approfondie des **11 dépôts GitHub** clonés localement dans `references/upstream/`. Conformément aux directives de la mission, nous n'avons pas construit onze pipelines concurrents : nous avons inspecté les fichiers `SKILL.md`, `README.md`, les références techniques et les codes sources (`cels.js`, `pen.mjs`, `pencil.js`, `render.mjs`, `review.mjs`, `shoot.mjs`, etc.) afin d'extraire les meilleures techniques et de les assembler dans **une seule architecture cohérente, déterministe et authentiquement dessinée image par image**.

---

## 1. Inventaire des 11 Dépôts Clonés (`references/upstream/`)

| # | Dépôt GitHub | Dossier Local | Commit (`HEAD`) | Date du Commit | Licence | Domaine Principal |
|---|---|---|---|---|---|---|
| 1 | `alesha-pro/tools` (`hand-drawn-canvas-animation`) | `references/upstream/01-alesha-pro-tools` | `90e966201add3ff41dc4ebd1348165c0cb2d5eab` | 2026-09-28 | MIT (Alexey Fateev) | Animation 2D dessinée image par image (cels entiers, feuille d'exposition, traits expressifs) |
| 2 | `anzal1/hand-drawn-film` (`hand-drawn-film`) | `references/upstream/02-anzal1-hand-drawn-film` | `c4e600c97c76c61123201285caa89fb260a992d6` | 2026-09-25 | MIT (Alexey Fateev) | Moteur de cels (`cels.js`), feuille d'exposition (`exposureSheet`), inbetweens assistés, revue par onion-skin |
| 3 | `kuhnhomeuk-cell/procedural-film` (`procedural-film`) | `references/upstream/03-kuhnhomeuk-procedural-film` | `f59413999ae24f6e1f9165b73a0eaa97a0b1c407` | 2026-09-25 | MIT (Dean Kuhn) | Pipeline de production structuré : Bible graphique, Storyboard, Timeline, Zones de sécurité 9:16 |
| 4 | `beriki770-ship-it/code-animations` (`code-animations`) | `references/upstream/04-beriki770-code-animations` | `46accf66e59975633250aa115cb30e8ccb3d7d8c` | 2026-10-15 | MIT (Beri Kirsh) | Contrat déterministe `seek(t)`, générateur pseudo-aléatoire Mulberry32, synthèse audio 48 kHz, contrôle QA |
| 5 | `iart-ai/javascript-animation-skills` | `references/upstream/05-iart-ai-javascript-animation-skills` | `f7d0882a313249cbd43f0e4e9e209b1622870253` | 2026-09-30 | MIT (iart.ai) | Règles d'ordonnancement peintre (back-to-front), boil contrôlé sur 2/4 images, synchronisation audio/cues |
| 6 | `illodev/drawn-by-code` (`drawn-by-code`) | `references/upstream/06-illodev-drawn-by-code` | `3c9c949421e4aa86dba444dfe8cba46d000f9d87` | 2026-10-14 | MIT + SIL OFL 1.1 | Bibliothèque de styles matériels (`paper-cutout`, `line`, `risograph`), grain papier et revue automatique |
| 7 | `buildwithhanif/claude-animation-skill` (`claude-animation`) | `references/upstream/07-buildwithhanif-claude-animation-skill` | `4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b` | 2026-09-23 | MIT (Hanif) | Classe `Pen` (`lib/pen.mjs`) : lavis aquarelle multi-passes (`wash`), mine graphite à pression interrompue (`pencil`), plume encrée effilée (`stroke`), hachures de volume |
| 8 | `JohnHeibel/ClaudeAnimationBase` | `references/upstream/08-johnheibel-claude-animation-base` | `0ac8bf2b31942376cb6b8c4074715595d512acd2` | 2026-09-24 | MIT (John Heibel) | Principes d'animation 2D classique : anticipation, arcs, action chevauchante (follow-through), absence de symétrie rigide (anti-twinning), lisibilité des poses clés |
| 9 | `hoangkien1703/example-draw-javascript` | `references/upstream/09-hoangkien1703-example-draw-javascript` | `a31a4aaa8c20c9341f63e90ee18b38cbf6c37c98` | 2026-09-27 | Open Source (Étude) | Boîte à outils crayon de couleur `pencil.js` : masque de grain de papier (`tooth`), remplissage aux traits de crayon courts (`crayon`), trait graphite multi-passes (`pline`) |
| 10 | `anthropics/skills` (`algorithmic-art` & `canvas-design`) | `references/upstream/10-anthropics-skills` | `ca45fc496a3436251f191354091d557da31c15b5` | 2026-10-28 | Apache 2.0 / Source-available (`LICENSE.txt`) | Direction artistique : philosophie visuelle, harmonie chromatique chaleureuse, grain analogique, hiérarchie spatiale et exigence d'exécution artisanale |
| 11 | `vercel-labs/agent-skills` (`web-design-guidelines`) | `references/upstream/11-vercel-labs-agent-skills` | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | 2026-10-27 | Open Source (Vercel) | Ergonomie, accessibilité, contrôles clavier/lecteur, états visuels clairs et responsive design pour la page web de prévisualisation et de livraison |

---

## 2. Analyse Détaillée par Dépôt : Techniques Retenues vs Écartées

### Dépôts 1 & 2 : `alesha-pro/tools` (`hand-drawn-canvas-animation`) & `anzal1/hand-drawn-film`
* **Méthodes étudiées** :
  * `references/redrawn-animation.md` et `assets/cels.js` définissent le paradigme fondamental : **chaque pose clé et breakdown est un dessin complet (whole-pose cel)** composé de traits nommés sémantiquement (`id`), avec profil de pression (`pressure`), épaisseur (`width`) et ordre des peintres (les formes avant masquent les traits arrière grâce à un remplissage couleur papier ou gouache).
  * `exposureSheet(entries, drawings, fps)` associe chaque dessin unique (`cel`) à un nombre entier de frames à 24 fps (exposition sur 2 images = 12 dessins/s, ou sur 1 image lors des mouvements rapides).
  * **Invariance de la graine par dessin** : la graine aléatoire du grain de crayon et du tremblement du trait dépend de l'identifiant du dessin (`celId + '/' + strokeId`) et **jamais** du numéro de frame de sortie. Ainsi, lorsqu'un dessin est maintenu pendant 2 frames ("on twos"), ses traits et sa texture ne scintillent pas de manière chaotique entre deux frames consécutives partageant le même dessin.
* **Techniques retenues** :
  * Architecture de feuille d'exposition (`X-Sheet`) à 24 fps.
  * Dessins complets image par image avec correspondance sémantique des courbes de Bézier/Catmull-Rom et profils de pression.
  * Mode de revue **Onion Skin** (superposition bleu → rouge des poses successives avec trajectoire des contacts de pieds et du centre de gravité).
* **Éléments écartés** :
  * Les modes `sand.js` (animation sur sable), `paper3d.js` (pop-up 3D) et `roto.js` (rotoscopie sur photo), non pertinents pour une illustration jeunesse dessinée à la main.

### Dépôt 3 : `kuhnhomeuk-cell/procedural-film`
* **Méthodes étudiées** :
  * Organisation rigoureuse en étapes : Bible Graphique (`art-bible.md`) avec palette nommée et proportions verrouillées, Storyboard chiffré, et respect strict de la **zone de sécurité verticale 9:16** (`1080 × 1920`, zone sûre `x: 60..980`, `y: 200..1540` afin d'éviter les interfaces TikTok / Instagram Reels).
* **Techniques retenues** :
  * Structure de la Bible Graphique et du Storyboard.
  * Cadrage vertical `1080 × 1920` avec guides de zone de sécurité TikTok/Reels commutables dans le lecteur de prévisualisation.
* **Éléments écartés** :
  * Le mode `retro` (NES 320×180 pixel art) et le mode `photo-doodle` (`rembg` sur photos réelles).

### Dépôt 4 : `beriki770-ship-it/code-animations`
* **Méthodes étudiées** :
  * Contrat déterministe dans la page HTML (`seek(t)` / `drawFrame(frameIndex)`), réinitialisation complète de l'état du contexte Canvas 2D au début de chaque frame (`ctx.setTransform(1,0,0,1,0,0)`, `globalAlpha = 1`, `globalCompositeOperation = 'source-over'`).
  * Générateur pseudo-aléatoire déterministe `mulberry32(seed)` interdisant tout appel à `Math.random()` ou `Date.now()`.
  * Vérification de déterminisme (rendu dans l'ordre vs accès aléatoire `seek`).
* **Techniques retenues** :
  * Contrat universel `window.drawFrame(frameIndex)` + `window.seek(t)` + `window.__anim` pour garantir une compatibilité totale entre prévisualisation temps réel (`requestAnimationFrame`) et capture image par image via Chromium headless.
* **Éléments écartés** :
  * Le style diagramme technique / blueprint sombre qui ne correspond pas au livre jeunesse chaleureux.

### Dépôt 5 : `iart-ai/javascript-animation-skills`
* **Méthodes étudiées** :
  * Règle fondamentale : *"A hand-drawn line boils, it doesn't jitter"* — le grain du trait change uniquement lorsque le dessin (`cel`) change sur la feuille d'exposition (toutes les 2 frames à 24 fps, soit 12 dessins/s), et non à 24 Hz.
  * Construction explicite d'arrière en avant (ordre du peintre : ciel → toits lointains → façades de rue → pavés et fleurs → jambe arrière → jupe → châle → bras arrière → torse/tête/visage → chignon → bras avant et panier d'osier → fleurs au premier plan).
  * Compétence `soundtrack` : synthèse sonore douce synchronisée aux événements (`CUES`) sans saut brusque de volume (pas de startle > 6 dB).
* **Techniques retenues** :
  * Ordre du peintre strict pour le personnage et les plans de profondeur de la rue.
  * Piste sonore stéréo 48 kHz générée localement (pas feutrés synchronisés aux contacts des talons sur les pavés, oiseaux du matin, brise légère et boîte à musique acoustique douce).

### Dépôt 6 : `illodev/drawn-by-code`
* **Méthodes étudiées** :
  * Séparation propre entre le kit de rendu matériel (textures de papier, grain, encre, crayon) et la géométrie de la scène.
  * Revue automatique d'animation calculant la différence inter-frame pour détecter tout gel d'image (freeze) ou saut brutal (pop).
* **Techniques retenues** :
  * Métriques automatiques de différence inter-frame intégrées dans notre script Python OpenCV/NumPy (`scripts/qc_check.py`).
* **Éléments écartés** :
  * Les styles WebGL2 raymarched (`clay3d`, `felt3d`), car la mission interdit la 3D et impose Canvas 2D.

### Dépôt 7 : `buildwithhanif/claude-animation-skill`
* **Méthodes étudiées** :
  * `lib/pen.mjs` : implémentation remarquable d'un moteur de dessin artisanal sur Canvas 2D :
    * `wash(pts, color)` : lavis d'aquarelle en 3 passes translucides légèrement décalées en mode `multiply` avec contour doux d'accumulation de pigment (pooled edge) et grain de papier.
    * `pencil(pts, opts)` : trait de crayon graphite en 3 passes fines décalées avec interruptions naturelles là où la pression simulée par bruit cohérent (`noise1`) est faible.
    * `stroke(pts, opts)` : trait d'encre organique interpolé par spline de Catmull-Rom avec épaisseur variable selon une courbe de pression et effilement aux extrémités (`taper`).
* **Techniques retenues** :
  * Combinaison de ces trois primitives (`wash` aquarelle livre jeunesse + `pencil` crayon de couleur/graphite + `stroke` contour organique sépia/fusain doux) dans notre moteur `web/js/animation-engine.js`.

### Dépôt 8 : `JohnHeibel/ClaudeAnimationBase`
* **Méthodes étudiées** :
  * `ANIMATION_GUIDE.md` : application concrète des 12 principes de l'animation traditionnelle au dessin par code :
    * Transfert de poids (rebond vertical du bassin entre la pose de contact, la pose basse `down`, le passage `passing` et la pose haute `up`).
    * Action chevauchante et retard (follow-through & overlapping action) sur les vêtements souples (le châle tricoté, le bas de la jupe plissée, les rubans du tablier, le panier en osier et les mèches de cheveux argentés suivent avec un léger déphasage par rapport au bassin).
    * Anti-twinning : asymétrie naturelle entre le bras gauche (qui balance librement ou salue) et le bras droit (qui tient la canne en bois et le petit panier d'osier fleuri).
* **Techniques retenues** :
  * Cinématique complète et dessinée de la marche tranquille de Grand-mère Colette, incluant l'action secondaire expressive (regard vers le chat roux sur le rebord de fenêtre, sourire devant le papillon doré qui traverse la rue ensoleillée).

### Dépôt 9 : `hoangkien1703/example-draw-javascript`
* **Méthodes étudiées** :
  * `src/pencil.js` : algorithme `buildTooth()` qui pré-calcule une texture de grain de papier multi-échelle (cellules grossières `coarse` 2×2 + bruit fin + grandes fibres `big` 5×5) et l'utilise pour donner un grain crayeux authentique aux aplats de couleur (`crayon`) et aux traits (`pline`).
* **Techniques retenues** :
  * Texture de papier aquarelle ivoire chaud (`#FAF3E6`) et masque de grain de crayon déterministe pré-calculé au chargement avec graine fixe.

### Dépôt 10 : `anthropics/skills` (`algorithmic-art` & `canvas-design`)
* **Méthodes étudiées** :
  * Création préalable d'une philosophie visuelle cohérente : palette restreinte et harmonieuse, éclairage matinal doré, profondeur atmosphérique, composition équilibrée et soin artisanal apporté à chaque détail.
* **Techniques retenues** :
  * Direction artistique *"Promenade Matinale à l'Aquarelle et au Crayon"* documentée dans la Bible Graphique (`art/BIBLE_GRAPHIQUE.md`).

### Dépôt 11 : `vercel-labs/agent-skills` (`web-design-guidelines`)
* **Méthodes étudiées** :
  * Bonnes pratiques d'interface web : accessibilité (`aria-label`, contrastes, navigation clavier Espace / Flèches gauche-droite), mise en page responsive, contrôles de lecture intuitifs, indicateurs de temps et d'état sans dépendance externe.
* **Techniques retenues** :
  * Conception de `web/preview.html`, `web/index.html` et de l'interface studio interactive accessible dans le navigateur.

---

## 3. Décision Architecturale Unifiée

Plutôt que d'empiler plusieurs moteurs incompatibles, nous avons conçu **un moteur unique, autonome et zéro-dépendance externe** (`web/js/animation-engine.js`) qui alimente simultanément :
1. **La prévisualisation en direct dans le navigateur** (`web/preview.html`, `web/index.html` et l'application web principale) via `requestAnimationFrame`.
2. **Le pipeline de rendu image par image** (`scripts/render-frames.mjs` et `scripts/export-video.sh`) via Chromium headless (Playwright) appelant `window.drawFrame(frameIndex)` pour chaque image `0 .. 143` (144 frames = 6,00 secondes à 24 fps constants en 1080×1920 vertical).
3. **L'assemblage FFmpeg** avec piste sonore stéréo 48 kHz générée localement (`scripts/generate-audio.mjs`) et le contrôle qualité automatisé sous Python (`scripts/qc_check.py` avec OpenCV, Pillow, NumPy et `ffprobe`).
