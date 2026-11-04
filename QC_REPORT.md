# RAPPORT DE CONTRÔLE QUALITÉ — *La Promenade de Grand-mère Colette*

**Statut Global** : **VALIDÉ (100 % DES TESTS RÉUSSIS)**

## 1. Vérification du Fichier Vidéo Final (`ffprobe`)
- **Fichier principal** : `final/animation.mp4` (et copie livrable `public/animation.mp4`)
- **Résolution & Ratio** : `1080 × 1920` (Vertical `9:16` natif)
- **Cadence** : `24/1` (`24 fps` constants, `144` frames)
- **Durée** : `6.0 secondes` (cible mission : 5 à 8 secondes)
- **Codec Vidéo & Format de Pixels** : `h264` (`High`), `yuv420p`, `-movflags +faststart`
- **Piste Audio** : `aac`, `48000 Hz`, `2 canaux (Stéréo)`
- **Taille du MP4** : `2577.7 Ko`

## 2. Analyse d'Images par OpenCV, NumPy & Pillow (144 Frames PNG)
- **Frames attendues / rendues** : `144 / 144` (aucune image manquante)
- **Luminance moyenne sur le film** : `196.18 / 255` (écart-type `1.894` -> **aucun scintillement d'exposition**)
- **Stabilité sur les poses tenues (« sur 2 » / 12 dessins/s)** : `MAD max = 0.0` entre les paires `(2k, 2k+1)` partageant le même dessin -> **zéro vibration parasite à 24 Hz**
- **Fluidité inter-dessins (`CEL_k -> CEL_{k+1}`)** : `MAD moyen = 6.959` (`min = 5.71`, `max = 7.798`) -> **mouvement continu, aucun gel d'image ni saut brusque**

## 3. Contrôle Biomécanique et Artistique (Planches Contact & Onion Skin)
- **Contacts des pieds et de la canne** : Vérifiés sur la ligne de sol `y = 1452`. Le recul des dalles du trottoir et des pavés (`13,5 px` par dessin unique) correspond exactement au déplacement horizontal du pied d'appui de Grand-mère Colette (`heel-strike` -> `flat-foot` -> `heel-off`), éliminant tout glissement (*zero foot sliding*).
- **Transfert du poids & Action chevauchante** : Le rebond vertical du bassin (`Δy` de `-8 px` en pose haute *Up* à `+11 px` en pose basse *Down*) entraîne avec un déphasage naturel de 2 dessins le châle tricoté terracotta, ses franges crème, les plis de la jupe lavande, les rubans du tablier et le chignon argenté.
- **Zone de sécurité 9:16 (TikTok / Instagram Reels)** : Grand-mère Colette est visible en pied (`y: 760..1458`, hauteur ~700 px) au centre de la zone sûre (`x: 80..940`, `y: 220..1560`).

## 4. Planches de Contrôle Générées
- `qc/contact_sheet_walk_cycle_12.png` : Planche contact annotée des 12 dessins du cycle de marche (`KEY`, `BRK`, `INB`) avec ligne d'appui des pieds.
- `qc/contact_sheet_36_cels_overview.png` : Planche contact panoramique `6 × 6` couvrant les 3 actes narratifs du film.
- `qc/onion_skin_composite.png` : Superposition Onion Skin multi-poses (bleu -> vert -> rouge) générée par détection de contours OpenCV.
- `art/poses/pose_01_*.png` .. `pose_14_*.png` : Dessins individuels haute résolution (`1080 × 1920`) des poses clés, breakdowns et intervalles sur papier aquarelle.
