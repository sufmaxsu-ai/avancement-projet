# Feuille d'Exposition (X-Sheet) — « Le Gâteau de Mamie »

- **Cadence de rendu** : `24 images/seconde` (fps)
- **Cadence de dessin (Exposition)** : Base sur **2s** (`12 dessins distincts/seconde`, `boilStep = Math.floor(frame / 2)`) avec passages sur **1s** (`24 dessins/s`) lors des actions rapides (cassage de l'œuf, fouettage énergique, course des enfants).
- **Durée totale retenue** : **45,0 secondes** (`1080 frames`, de `frame 0` à `frame 1079`).
- **Format & Zone sûre** : `1080 × 1920` (9:16), zone sûre `x ∈ [64, 950]`, `y ∈ [250, 1470]`.

---

## Tableau Récapitulatif des 10 Scènes Obligatoires

| Scène | Titre | Temps (s) | Frames (24 fps) | Durée | Dessins (2s) | Action Principale & Micro-Mouvements |
|---|---|---|---|---|---|---|
| **1** | **Préparation** | `0.0s – 4.5s` | `0 – 107` | `4.5s` (108f) | 54 | Découverte de la cuisine ensoleillée. Mamie ajuste son tablier, retrousse ses manches, déplace la cuillère en bois, rapproche farine/œufs/sucre/lait/beurre et pose le saladier devant elle. |
| **2** | **La pâte** | `4.5s – 10.5s` | `108 – 251` | `6.0s` (144f) | 72 | Mamie casse délicatement le 1er puis le 2e œuf sur le bord du saladier, ouvre les coquilles, verse sucre, farine (traces sur la table et le tablier), lait et beurre fondu, puis bat énergiquement au fouet (bras/poignet/main articulés). La pâte devient lisse et dorée. |
| **3** | **Cuisson** | `10.5s – 15.0s` | `252 – 359` | `4.5s` (108f) | 54 | Mamie incline le saladier, la pâte coule en ruban dans le moule, elle racle avec la spatule, porte le moule à deux mains vers le four, ouvre la porte battante, dépose le moule sur la grille, referme doucement et tourne le bouton en laiton. |
| **4** | **Les enfants au jardin** | `15.0s – 20.0s` | `360 – 479` | `5.0s` (120f) | 60 | Dans le jardin baigné de soleil, Léo et Clara courent, rient, se poursuivent, sautent, tournent sur eux-mêmes et jouent au ballon rayé. L'herbe, les marguerites et les feuilles du pommier ondulent au vent, les nuages glissent. |
| **5** | **Sortie du four** | `20.0s – 24.0s` | `480 – 575` | `4.0s` (96f) | 48 | Retour en cuisine : le four diffuse une lueur dorée. Mamie s'approche, ouvre la porte (volutes de vapeur tiède), saisit ses maniques/torchon, sort avec précaution le gâteau doré et gonflé, le pose sur la table et sourit avec satisfaction. |
| **6** | **Décoration** | `24.0s – 28.0s` | `576 – 671` | `4.0s` (96f) | 48 | Après un instant de repos, Mamie prend un petit bol et une cuillère-tamis, saupoudre progressivement le sucre glace en fine neige, puis dépose une à une les fraises rouges sur le dôme doré et ajuste la fraise centrale du bout des doigts. |
| **7** | **L'appel** | `28.0s – 31.5s` | `672 – 755` | `3.5s` (84f) | 42 | Mamie contemple le gâteau terminé, se tourne vers la porte-fenêtre ouverte sur le jardin, porte une main près de sa joue et appelle tendrement avec synchronisation labiale et sous-titre intégré dans la zone sûre : *« À table, les enfants ! Le gâteau est prêt ! »* |
| **8** | **La course** | `31.5s – 35.5s` | `756 – 851` | `4.0s` (96f) | 48 | Léo et Clara entendent l'appel, s'arrêtent net, échangent un regard illuminé, laissent le ballon sur l'herbe, pivotent et courent joyeusement vers la maison (foulées complètes avec contact des pieds au sol, bras et vêtements en mouvement) puis entrent dans la cuisine. |
| **9** | **Installation à table** | `35.5s – 40.0s` | `852 – 959` | `4.5s` (108f) | 54 | Les enfants découvrent le gâteau avec émerveillement, tirent leurs chaises en bois, grimpent et s'installent. **Leurs jambes trop courtes pendent sous les chaises (`y ≈ 1240..1370`) et ils balancent joyeusement leurs petits pieds d'avant en arrière** en regardant le gâteau. |
| **10** | **Le goûter** | `40.0s – 45.0s` | `960 – 1079` | `5.0s` (120f) | 60 | Mamie approche le gâteau, prend le couteau et découpe réellement les parts une par une. Elle dépose la 1re part sur une assiette et sert Clara, puis découpe et sert la 2e part à Léo (leurs pieds continuent de balancer). Échange de regards heureux et tableau familial final apaisé. |

---

## Détail des Poses Clés (Key Poses), Intermédiaires (Breakdowns) et Cycles

### Scène 1 — Préparation (`Frames 0–107`)
- `f000–f024` (Clé A → B) : Plan d'ensemble de la cuisine lumineuse, grains de poussière dorée dans le rayon de soleil. Mamie respire doucement, noue et lisse son tablier crème.
- `f025–f052` (Clé B → C) : Main droite sur la manche gauche, puis main gauche sur la manche droite pour retrousser les manches du cardigan ocre.
- `f053–f080` (Clé C → D) : Déplacement de la cuillère en bois, rapprochement du panier d'œufs et du pot de farine vers le centre de la table.
- `f081–f107` (Clé D → E) : Mamie saisit le grand saladier en céramique à deux mains, le pose bien au centre devant elle et sourit.

### Scène 2 — La pâte (`Frames 108–251`)
- `f108–f136` : Prise du 1er œuf, petit coup sec contre le rebord du saladier (`f120`, fissure dessinée), écartement des deux demi-coquilles avec les pouces (`f128`), chute du jaune et du blanc dans le saladier (`f132`).
- `f137–f160` : Cassage et ouverture du 2e œuf selon la même cinématique précise.
- `f161–f195` : Versement du sucre en pluie fine (`f161–f172`), de la farine (`f173–f184`, petit nuage et traces blanches persistantes sur le bois de la table et le bas du tablier), puis filet de lait et beurre fondu doré (`f185–f195`).
- `f196–f251` : Mamie prend le fouet. Cycle elliptique de l'avant-bras, rotation souple du poignet et inclinaison du fouet (`3.5 tours/seconde`). La pâte tourbillonne et passe progressivement d'un mélange hétérogène à une crème dorée homogène.

### Scène 3 — Cuisson (`Frames 252–359`)
- `f252–f288` : Mamie soulève le saladier, l'incline au-dessus du moule cannelé ; ruban continu de pâte dorée qui remplit progressivement le moule, raclage final à la spatule en bois.
- `f289–f324` : Mamie repose le saladier, prend le moule à deux mains, se tourne vers le four à droite (`x ≈ 760`), abaisse la porte vitrée du four.
- `f325–f359` : Dépose du moule sur la grille intérieure, retrait des mains, fermeture douce de la porte et rotation du bouton de thermostat en laiton.

### Scène 4 — Les enfants au jardin (`Frames 360–479`)
- `f360–f400` : Léo et Clara courent dans l'herbe fleurie, s'échangent le ballon rouge et crème (trajectoire parabolique avec léger écrasement/étirement au rebond).
- `f401–f445` : Clara fait un petit saut joyeux les bras levés puis tourne sur elle-même (sa robe rose poudré et ses couettes suivent avec retard d'inertie) ; Léo court autour d'elle en riant.
- `f446–f479` : Course complice entre le pommier et les marguerites ; vent doux continu dans le feuillage (`sin(t)`) et nuages lents.

### Scène 5 — Sortie du four (`Frames 480–575`)
- `f480–f508` : Le gâteau bien gonflé dore derrière la vitre du four. Mamie s'approche avec un sourire, prend ses maniques en tissu à carreaux.
- `f509–f542` : Ouverture de la porte du four, échappée de fines volutes de vapeur chaude, saisie prudente du moule chaud à deux mains.
- `f543–f575` : Mamie dépose le gâteau doré sur le dessous-de-plat au centre de la table, retire ses maniques et hume le parfum sucré les yeux mi-clos.

### Scène 6 — Décoration (`Frames 576–671`)
- `f576–f615` : Mamie prend un petit bol et une passoire fine ; elle tapote doucement du doigt pour faire tomber le sucre glace qui blanchit progressivement le dôme du gâteau (`progress 0 → 1`).
- `f616–f655` : Elle dépose délicatement une par une les fraises rouges sur le dessus du gâteau (apparition séquentielle fruit par fruit à chaque geste de la main).
- `f656–f671` : Elle ajuste avec tendresse la fraise centrale du bout de l'index et admire le résultat.

### Scène 7 — L'appel (`Frames 672–755`)
- `f672–f692` : Mamie regarde le gâteau décoré puis tourne la tête et le buste vers la porte-fenêtre ouverte sur le jardin.
- `f693–f755` : Elle place une main en porte-voix près de sa joue et appelle joyeusement (ouverture/fermeture labiale rythmée sur les syllabes) :
  - Texte calligraphié affiché dans la zone de sécurité (`x = 540, y = 410`) : **« À table, les enfants ! Le gâteau est prêt ! »**

### Scène 8 — La course (`Frames 756–851`)
- `f756–f776` : Au jardin, Léo et Clara s'immobilisent, dressent la tête avec surprise et joie, se regardent en souriant.
- `f777–f825` : Ils laissent le ballon rouler sur l'herbe, se retournent et courent à grandes foulées vers la maison (cycle de course complet à 8 poses : contact talon/plante, amorti genou fléchi, poussée pointe du pied, suspension, balancement opposé des bras).
- `f826–f851` : Franchissement fluide du seuil de la porte-fenêtre vers l'intérieur chaleureux de la cuisine.

### Scène 9 — Installation à table & Pieds qui balancent (`Frames 852–959`)
- `f852–f880` : Léo et Clara arrivent devant la table, s'extasient devant le gâteau aux fraises, tirent leurs chaises en bois et se hissent sur les assises.
- `f881–f959` (**MOMENT PHARE — Balancement des pieds sous les chaises**) :
  - Clara (à gauche, `x ≈ 310`) et Léo (à droite, `x ≈ 760`) sont assis face à la table.
  - Leurs cuisses reposent sur l'assise (`y ≈ 1175`), leurs genoux fléchissent au bord de la chaise et **leurs bas de jambes pendent dans le vide (`y ≈ 1185..1345`), bien au-dessus du plancher (`y = 1440`)**.
  - Chaque enfant balance joyeusement sa jambe gauche et sa jambe droite en opposition de phase (`θ_jambe = ±26° sin(ωt)`), avec flexion secondaire de la cheville et petits soubresauts d'impatience heureuse des épaules.

### Scène 10 — Le goûter (`Frames 960–1079`)
- `f960–f992` : Mamie au centre derrière la table saisit le couteau à gâteau, abaisse la lame et découpe réellement une première part triangulaire (mouvement de scie doux, séparation géométrique de la part laissant voir la mie dorée).
- `f993–f1022` : Mamie soulève la 1re part sur la pelle/couteau, la dépose dans la première assiette en faïence et la pose devant Clara (dont les pieds balancent de plus belle).
- `f1023–f1050` : Mamie découpe une 2e part du gâteau, la dépose dans la seconde assiette et la sert devant Léo.
- `f1051–f1079` : Les deux enfants contemplent leur part de gâteau et Mamie avec des yeux émerveillés ; Mamie pose ses mains avec tendresse et les regarde en souriant. Maintien final doux et lumineux sur ce souvenir d'enfance inoubliable.
