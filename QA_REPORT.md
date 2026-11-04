# QA_REPORT.md — Rapport de Contrôle Qualité (« Le Gâteau de Mamie »)

Ce rapport documente l'ensemble des contrôles techniques et artistiques effectués sur le court-métrage **« Le Gâteau de Mamie »** (**45,0 secondes**, `1080 × 1920`, format vertical `9:16`, `24 fps`, `1080 frames`) à l'aide de `ffprobe`, OpenCV (`cv2`), Pillow (`PIL`), NumPy, des planches contact (`docs/qa/contact_sheet_10_scenes.jpg`), du contrôle de zone de sécurité (`docs/qa/safe_zone_9x16_verification.jpg`) et de l'inspection en pelure d'oignon (`docs/qa/swinging_feet_onion_skin.jpg`).

---

## 1. Synthèse de Conformité Technique (FFprobe)

Fichier contrôlé : `final/animation.mp4` (et sa copie identique `public/animation.mp4`).

| Critère exigé | Valeur attendue | Valeur mesurée (`ffprobe`) | Statut |
|---|---|---|---|
| Format conteneur | MP4 (`-movflags +faststart`) | `mov,mp4,m4a,3gp,3g2,mj2` | **VALIDÉ** |
| Codec vidéo | H.264 (`libx264`) | `h264 (High Profile, avc1)` | **VALIDÉ** |
| Résolution & Ratio | `1080 × 1920` (`9:16` vertical) | `1080 × 1920` (SAR `1:1`, DAR `9:16`) | **VALIDÉ** |
| Pixel Format | `yuv420p` | `yuv420p` | **VALIDÉ** |
| Cadence d'images | `24 fps` | `24/1 fps` (`24 tbr`) | **VALIDÉ** |
| Durée retenue | `45,0 secondes` (entre 10 et 70s) | `45.00 s` exactes (`1080 frames`) | **VALIDÉ** |
| Piste Audio | AAC `48 kHz` synchronisée | `aac (LC)`, `48000 Hz`, Stéréo | **VALIDÉ** |
| Taille du fichier | Non vide, lisible | `31 494,5 Ko` (~30,8 Mo) | **VALIDÉ** |

---

## 2. Contrôle des 10 Scènes Obligatoires et de l'Animation

L'inspection de la planche contact complète (`docs/qa/contact_sheet_10_scenes.jpg`) et des 24 poses clés (`docs/keyframes/`) confirme la présence et la lisibilité de toutes les étapes narratives :

1. **Scène 1 — Préparation (`0.0s – 4.5s`, `f0000–f0107`)** :
   - Découverte calme de la cuisine chaleureuse (table en bois, vieux placard vitré, ustensiles, four en fonte et laiton, fenêtre ouverte sur le jardin).
   - Mamie ajuste son tablier (`f0012`), retrousse progressivement sa manche gauche puis sa manche droite (`f0044`), déplace la cuillère en bois, rapproche les ingrédients et pose le grand saladier en céramique devant elle (`f0098`).
2. **Scène 2 — La pâte (`4.5s – 10.5s`, `f0108–f0251`)** :
   - Prise et cassage délicat du 1er puis du 2e œuf sur le rebord du saladier (`f0126`), ouverture des deux demi-coquilles et chute du jaune d'œuf.
   - Ajout du sucre, de la farine (avec apparition de traces blanches de farine sur le plateau en bois et sur le tablier de Mamie, `f0176`), du lait et du beurre fondu.
   - Prise du fouet et mélange circulaire articulant l'épaule, le coude, le poignet et la main (`f0226`) ; la pâte évolue visuellement jusqu'à devenir lisse et dorée.
3. **Scène 3 — Cuisson (`10.5s – 15.0s`, `f0252–f0359`)** :
   - Inclinaison du saladier et écoulement progressif de la pâte en ruban dans le moule cannelé (`f0270`), raclage à la spatule en bois.
   - Transport du moule à deux mains vers le four, ouverture de la porte battante, dépose du moule sur la grille intérieure (`f0332`), fermeture douce de la porte et réglage du bouton en laiton.
4. **Scène 4 — Les enfants au jardin (`15.0s – 20.0s`, `f0360–f0479`)** :
   - Dans le jardin baigné de soleil, Clara (5 ans) et Léo (7 ans) courent, rient, se lancent le ballon rayé rouge et crème (`f0390`), font de petits sauts (`f0430`) et tournent sur eux-mêmes.
   - Mouvements secondaires vérifiés : feuilles du pommier, brins d'herbe et marguerites qui oscillent avec le vent, nuages qui traversent le ciel, couettes et vêtements qui suivent l'inertie.
5. **Scène 5 — Sortie du four (`20.0s – 24.0s`, `f0480–f0575`)** :
   - Retour en cuisine : lueur dorée dans le four, Mamie ouvre la porte d'où s'échappent de fines volutes de vapeur tiède (`f0516`), saisit le moule avec ses maniques à carreaux, sort le gâteau bien gonflé et doré et le pose sur la table (`f0562`) avec un sourire satisfait.
6. **Scène 6 — Décoration (`24.0s – 28.0s`, `f0576–f0671`)** :
   - Après un court instant, Mamie saupoudre progressivement le sucre glace à l'aide d'une petite cuillère-tamis (`f0604`), puis dépose une par une les 6 fraises en couronne et ajuste la 7e fraise au centre du bout des doigts (`f0662`).
7. **Scène 7 — L'appel (`28.0s – 31.5s`, `f0672–f0755`)** :
   - Mamie se tourne vers la porte-fenêtre du jardin, place sa main près de sa joue et appelle tendrement avec synchronisation labiale et affichage du texte calligraphié dans la zone sûre (`f0712`) :
     **« À table, les enfants ! Le gâteau est prêt ! »**
8. **Scène 8 — La course (`31.5s – 35.5s`, `f0756–f0851`)** :
   - Les enfants entendent Mamie, interrompent immédiatement leur jeu, se regardent avec enthousiasme (`f0766`), laissent le ballon sur l'herbe, se retournent et courent vers la maison (`f0804`, contact réel des pieds au sol à chaque foulée) avant d'entrer joyeusement dans la cuisine (`f0842`).
9. **Scène 9 — Installation à table & Balancement des pieds (`35.5s – 40.0s`, `f0852–f0959`)** :
   - Les enfants tirent leurs chaises et s'assoient autour de la table en admirant le gâteau.
   - **DÉTAIL ESSENTIEL VÉRIFIÉ (`docs/qa/swinging_feet_strip.jpg` & `docs/qa/swinging_feet_onion_skin.jpg`)** : Leurs jambes sont trop courtes pour toucher le plancher (`y = 1435`). Elles pendent sous l'assise des chaises (`y = 1185..1345`) et se balancent joyeusement d'avant en arrière en opposition de phase, avec flexion des genoux, mouvement des chevilles, chaussettes blanches et petites chaussures bien visibles.
10. **Scène 10 — Le goûter (`40.0s – 45.0s`, `f0960–f1079`)** :
    - Mamie prend le couteau et découpe réellement le gâteau en parts (`f0974`, séparation progressive de la part laissant apparaître la mie jaune tendre).
    - Elle dépose une première part sur une assiette et sert Clara (`f1006`), puis découpe et sert une deuxième part à Léo (`f1038`).
    - Le film se conclut sur un tableau familial chaleureux et paisible (`f1068`) où les enfants regardent Mamie et leur part de gâteau avec bonheur.

---

## 3. Vérification de la Marge de Sécurité 9:16 (`1080 × 1920`)

Les marges de sécurité TikTok / Instagram Reels / YouTube Shorts sont définies dans `src/animation/config.ts` :
- **Haut** : `250 px` (`yMin = 250`)
- **Bas** : `450 px` (`yMax = 1470`)
- **Gauche** : `64 px` (`xMin = 64`)
- **Droite** : `130 px` (`xMax = 950`)

La planche `docs/qa/safe_zone_9x16_verification.jpg` superpose ce cadre vert sur 6 images clés :
- **Visages et regards** de Mamie, Clara et Léo : situés entre `x = 260..810` et `y = 660..980` → **100 % dans la zone sûre**.
- **Mains et gestes clés** (cassage des œufs, fouettage, décoration, découpe et service) : situés entre `x = 340..840` et `y = 730..1030` → **100 % dans la zone sûre**.
- **Texte de la Scène 7** (*« À table, les enfants ! Le gâteau est prêt ! »*) : encadré à `x ∈ [125, 895]`, `y ∈ [320, 438]` → **100 % dans la zone sûre**.
- **Pieds des enfants qui se balancent sous la table (Scènes 9 & 10)** : situés à `x ∈ [245, 835]`, `y ∈ [1185, 1355]` (soit plus de `115 px` au-dessus de la limite basse `yMax = 1470`) → **100 % dans la zone sûre**.

---

## 4. Métriques Quantitatives OpenCV / NumPy (`docs/qa/qa_metrics.json`)

- **Luminosité moyenne des frames** : `min = 179.0`, `max = 217.2` (sur 255) — confirme l'absence totale de frame noire ou surexposée et la constance de l'éclairage papier crème ensoleillé.
- **Différence inter-dessins moyenne globale** : `3.334` — mouvement organique fluide et continu à 12 dessins/s sur un rendu à 24 fps.
- **Mouvement mesuré dans la ROI sous la table en Scènes 9–10 (`x: 220..850, y: 1185..1375`)** : `10.986` — prouve mathématiquement l'amplitude et la continuité du balancement des jambes et des petits pieds sous les chaises.

---

## 5. Problèmes Rencontrés lors du Contrôle Qualité et Corrections Apportées

1. **Hauteur des bustes des enfants assis à table (Scènes 9 & 10)** :
   - *Constat lors de la 1re passe d'inspection des planches QA* : L'assise de la chaise étant à `y = 1185` et le plateau de la table à `y = 1040`, le bas du visage de Clara et Léo était légèrement mordu par le bord arrière du plateau de la table.
   - *Correction apportée dans `src/animation/characters.ts`* : Réhaussement anatomique du buste assis (`-198 px` / `-206 px`) et de la tête (`-242 px`) de sorte que les visages souriants, les épaules et les mains posées sur le rebord de la table soient intégralement dégagés au-dessus du plateau (`y ≈ 920..1035`) tout en conservant les cuisses sur l'assise (`y = 1185`) et les bas de jambes qui pendent sous la chaise (`y = 1190..1345`).
2. **Longueur de la jupe de Mamie sous la table** :
   - *Constat* : Le bas de la jupe et les chaussons de Mamie sous la table s'arrêtaient trop haut au-dessus du plancher (`y = 1435`).
   - *Correction apportée dans `src/animation/characters.ts`* : Prolongement de la jupe plissée vert sauge et placement des chaussons bruns de Mamie sur le plancher (`y = 1427`), ce qui renforce visuellement le contraste avec les jambes trop courtes des petits-enfants qui pendent dans le vide à `100 px` du sol !
3. **Position de la main d'appel de Mamie en Scène 7** :
   - *Constat* : En Scène 7 (`f0712`), l'avant-bras gauche de Mamie passait trop près de sa bouche ouverte.
   - *Correction apportée dans `src/animation/scenes.ts`* : Décalage de la main en porte-voix à `[434, 764]` avec orientation externe du coude (`leftElbowDir = -1`), dégageant totalement le sourire et le mouvement des lèvres de Mamie.
4. **Fermeture du sous-processus `esbuild` de Vite dans `scripts/export-video.sh`** :
   - *Constat* : À la fin du rendu Chromium, le service enfant `esbuild --ping` lancé par Vite maintenait le descripteur de sortie ouvert.
   - *Correction apportée dans `scripts/export-video.sh`* : Redirection d'entrée `</dev/null` et nettoyage explicite de l'arbre de processus (`pkill -9 -P "$VITE_PID"`) permettant au script de se terminer immédiatement avec le code `0`.
