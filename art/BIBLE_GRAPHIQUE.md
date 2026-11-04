# BIBLE GRAPHIQUE — *La Promenade de Grand-mère Colette*

## 1. Intention Artistique & Style Visuel
- **Format natif** : Vertical `9:16` (`1080 × 1920` pixels), conçu pour une lisibilité optimale sur smartphone (TikTok / Instagram Reels).
- **Cadence** : `24 fps` constants, animé image par image **sur 2 images ("on twos", soit 12 dessins uniques par seconde)** : **72 dessins uniques (`CEL_001` à `CEL_072`)** pour **144 frames (`6,00 secondes`)**.
- **Esthétique** : Illustration chaleureuse de livre jeunesse européen (inspirée de l'aquarelle douce, de la gouache légère et du crayon de couleur artisanal sur papier grain torchon).
- **Rendu des traits et matières (Canvas 2D déterministe)** :
  1. **Support papier** : Grain de papier aquarelle ivoire chaud (`#FAF3E6`), généré de façon déterministe par superposition de fibres multi-échelles (`tooth`) et vignettage doux.
  2. **Lavis aquarelle (`wash`)** : Remplissage en 3 passes translucides légèrement décalées avec accumulation subtile de pigment sur les bords.
  3. **Texture crayon (`pencil` / `crayon`)** : Hachures douces et grain crayeux sur les joues, le châle tricoté, les pierres des façades et les pavés.
  4. **Trait d'encre sépia/fusain (`stroke`)** : Contours organiques tracés par splines de Catmull-Rom avec variation d'épaisseur liée à la pression simulée et effilement (`taper`). La graine du trait est verrouillée sur l'identifiant du dessin (`celId`) afin d'obtenir un **boil artisanal à 12 Hz** sans scintillement parasite à 24 Hz.

---

## 2. Zone de Sécurité 9:16 (TikTok / Instagram Reels)
- **Résolution totale** : `1080 × 1920`
- **Zone de sécurité centrale (Action & Visage)** :
  - Horizontale : `x ∈ [80, 940]` (laisse 140 px à droite pour les icônes sociales TikTok/Reels).
  - Verticale : `y ∈ [220, 1560]` (laisse 220 px en haut pour la barre de statut et 360 px en bas pour la légende et la piste audio).
- **Positionnement de Grand-mère Colette** :
  - Visible **en pied** de la tête aux chaussures : `y ∈ [760, 1460]` (hauteur ~700 px, soit ~36,5 % de la hauteur d'écran, parfaitement lisible sur smartphone).
  - Son visage se situe autour de `y ≈ 840`, au cœur de la zone de sécurité dorée.

---

## 3. Charte du Personnage : Grand-mère Colette

### Proportions & Silhouette (4,5 têtes de haut — style livre jeunesse expressif)
- **Tête & Chignon (`y: 760..910`)** :
  - Visage doux et arrondi aux pommettes rosées (`#E8998D`).
  - Cheveux blanc argenté (`#F2EFE9`, ombres `#D5CFC4`) coiffés en un chignon souple à l'arrière avec des mèches frontales qui oscillent légèrement à chaque pas.
  - Lunettes rondes en laiton doré (`#B8863B`) posées sur le bout du nez, laissant voir des yeux pétillants et bienveillants (`#3B2D26`) et des sourcils expressifs.
- **Buste, Châle & Cardigan (`y: 900..1140`)** :
  - Légère courbure bienveillante du dos (posture naturelle de grand-mère).
  - **Châle tricoté** couleur terracotta doux (`#D9795D`, motifs tricotés `#B85A40`, franges `#F2DEC4`) drapé sur les épaules, doté d'une **action chevauchante (follow-through)** déphasée de 2 dessins par rapport au rebond vertical du bassin.
  - **Cardigan** vert sauge (`#7B9A82`) boutonné sur un chemisier crème à col Claudine (`#FFF9EE`).
- **Jupe Plissée & Tablier (`y: 1120..1360`)** :
  - Longue jupe ample bleu lavande grisé (`#6E7F99`, plis `#52627A`) qui accompagne le mouvement des genoux avec une ondulation souple de l'ourlet.
  - Tablier clair (`#F7EFE2`) noué à la taille avec deux pans de ruban flottant à l'arrière.
- **Jambes, Bas & Chaussures (`y: 1340..1460`)** :
  - Bas de laine beige chaud (`#DECBB1`).
  - Bottines de marche confortables en cuir brun châtaigne (`#5E3A28`, semelles `#3A2218`), avec déroulé complet du pied : **attaque talon (heel strike) → pied à plat (flat foot) → poussée orteils (toe-off) → passage (passing)**.
- **Accessoires & Mains** :
  - **Main droite (avant-plan)** : Tient une canne en bois de noyer sculpté (`#6E472B`, embout laiton `#C89D54`) qui touche le sol en rythme avec le pied opposé.
  - **Bras gauche (arrière/côté)** : Porte un petit panier d'osier tressé (`#C99A62`) garni de brins de lavande fraîche (`#8C73A8`), de marguerites et d'une baguette dorée, tout en balançant doucement ou en saluant le chat roux à l'Acte II.

---

## 4. Charte du Décor : *La Rue des Glycines* (Parallaxe Multi-Plans)

1. **Plan 0 — Ciel matinal & Lumière dorée** :
   - Dégradé aquarelle crème abricot (`#FCEFD8` → `#F7DEC0`) avec rayons de soleil obliques translucides.
2. **Plan 1 — Horizon du village (Parallaxe `0.18×`)** :
   - Silhouettes douces de toits en tuiles canal ocre-rose (`#D88B70`), petit clocher de pierre, collines bleu-vert tendre (`#A9BFA8`) et cyprès.
3. **Plan 2 — Façades de la jolie rue (Parallaxe `0.55×`)** :
   - **Maison 1 (Gauche)** : *Boulangerie « Au Blé d'Or »* aux murs ocre crème (`#F3DFC1`), store banne rayé rouge brique et crème (`#C85A48` / `#FAF0E1`), vitrine illuminée avec pains dorés.
   - **Maison 2 (Centre)** : Maison en pierre blonde (`#EAD6BA`) aux volets bleu lavande (`#7C92AB`), arche de glycine fleurie (`#9B82B8` et `#B89FD4`) retombant en grappes parfumées, jardinières de géraniums rouges (`#D95B4F`) et **un chat roux tigré (`#E08245`)** assis sur le rebord de fenêtre ensoleillé qui remue la queue et les oreilles au passage de Colette.
   - **Maison 3 (Droite)** : *Herboristerie & Fleurs* aux murs rose poudré (`#F2D6C9`), volets vert amande (`#88A68E`), lanterne ancienne en fer forgé (`#3E3532`) et bicyclette appuyée contre le mur.
4. **Plan 3 — Chaussée pavée & Trottoir (Parallaxe `1.00×` — Sol d'appui)** :
   - Trottoir en dalles de calcaire chaud et rue pavée en éventail (`#D6C3AC`, joints crayon `#9C8976`), garantissant **zéro glissement des pieds (no foot sliding)** : le recul horizontal des pavés (`Δx` par dessin) correspond exactement à la foulée de Grand-mère Colette.
5. **Plan 4 — Premier plan flou / Vignette botanique (Parallaxe `1.28×` & Vie secondaire)** :
   - Pots de terre cuite et touffes de lavande en bas de cadre (`y > 1620`), feuilles dorées portées par la brise et **un papillon citron-doré (`#F2C14E`)** dessiné image par image qui croise le regard de Colette.

---

## 5. Palette Chromatique Officielle

| Élément | Nom de la Teinte | Code Hex | Usage |
|---|---|---|---|
| Papier Torchon | Ivoire Aquarelle | `#FAF3E6` | Fond général et réserves de blanc |
| Encre Principale | Sépia Fusain Doux | `#3B2D26` | Contours organiques à pression variable |
| Encre Secondaire | Terre d'Ombre | `#6B5347` | Traits de décor, hachures crayon et pavés |
| Châle de Colette | Terracotta Doux | `#D9795D` | Châle tricoté (lavis + hachures laine) |
| Cardigan | Vert Sauge | `#7B9A82` | Gilet boutonné |
| Jupe Plissée | Bleu Lavande Grisé | `#6E7F99` | Jupe ample en mouvement |
| Cheveux | Argent Chaud | `#F2EFE9` | Chignon et mèches souples |
| Glycines | Mauve Aquarelle | `#9B82B8` | Grappes fleuries sur la façade centrale |
| Lumière du Matin | Or Solaire | `#F5C76B` | Halos lumineux, papillon et reflets |
