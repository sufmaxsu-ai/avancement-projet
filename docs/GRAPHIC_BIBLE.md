# BIBLE GRAPHIQUE — « Le Gâteau de Mamie »

## 1. Direction Artistique : Illustration Livre Jeunesse Dessinée Feuille par Feuille

Le court-métrage adopte l'esthétique chaleureuse d'un album jeunesse illustré à la main au **crayon graphite gras (2B/4B)** et coloré aux **crayons de couleur aquarellables** sur un papier grainé ivoire chaud (`#F6EFE2`).

### Règles Graphiques Fondamentales (Vérifiées Image par Image)

1. **Silhouettes Anatomiques Continues (Zéro Trait de Séparation Interne)** :
   - **Problème banni :** Ne jamais dessiner un bras ou une jambe comme deux rectangles ou capsules superposés dont les contours se croisent au coude/genou ou laissent un interstice blanc.
   - **Solution technique (`drawUnifiedLimb`) :** Pour chaque membre, la chaîne cinématique `[épaule, coude, poignet]` (ou `[hanche, genou, cheville]`) est convertie en une enveloppe tubulaire continue unique. Le remplissage coloré couvre l'intégralité du membre en un seul polygone fermé, et le trait de crayon graphite ne trace que le bord extérieur supérieur et le bord extérieur inférieur continus. Un simple petit pli anatomique ouvert (3 à 6 px) marque le creux du coude lorsque le bras est fléchi.

2. **Masquage Complet du Crâne sous les Cheveux (Zéro Trait Résiduel)** :
   - **Problème banni :** Ne jamais tracer le cercle complet de la tête puis dessiner la coupe de cheveux par-dessus, ce qui laisserait apparaître le trait supérieur du crâne à travers les cheveux.
   - **Solution technique :** Le contour graphite du visage est tracé uniquement sur l'arc inférieur visible (`tempe gauche → joue gauche → menton → joue droite → tempe droite`). La chevelure est ensuite dessinée par-dessus avec d'abord un cache papier opaque (`#F6EFE2`), puis son remplissage coloré décalé, ses mèches internes et son contour extérieur au crayon.

3. **Trait de Crayon Visible et Aléatoire d'une Frame à l'Autre (*Line Boil* Feuille à Feuille)** :
   - Les contours au crayon sont francs et bien lisibles sur smartphone (`épaisseur 3.4 px à 4.8 px` pour les silhouettes principales, `2.0 px à 2.8 px` pour les détails internes).
   - Chaque frame utilise une graine déterministe unique qui redessine les courbes avec une oscillation basse fréquence (imperfection du geste humain) et un grain haute fréquence (rugosité du papier sous la mine graphite), accompagné d'un second passage de trait léger (*sketch double-pass*). Ainsi, même pour un objet immobile sur la table, le dessin de la frame `N` diffère subtilement de la frame `N+1`, comme sur de vraies feuilles de papier calque.

4. **Coloriage Humain Imparfait (Décalage et Léger Dépassement)** :
   - Pour chaque forme colorée, le polygone de remplissage est calculé avec un léger décalage directionnel (`+2.5 px à +4.5 px`) et une ondulation organique indépendante du trait de contour. La couleur dépasse ainsi très légèrement du trait d'un côté et laisse parfois un fin filet de papier ivoire de l'autre, complété par des hachures obliques au crayon de couleur.

5. **Articulations Humaines Naturelles et Cinématique Inverse (IK)** :
   - Coudes et genoux sont résolus par cinématique inverse à 2 segments de longueur fixe (`solveTwoBoneIK`) avec vecteur pôle anatomique :
     - Les **coudes** plient toujours vers le bas/arrière anatomique.
     - Les **genoux** plient toujours vers l'avant (le pied recule derrière l'axe du genou pendant la course et le balancement sous la chaise).
   - Lorsqu'un personnage tient un objet (saladier, fouet, moule, porte du four, assiette, pelle à tarte) ou lorsque Léo trempe son doigt dans le gâteau, la cible IK de la main est mathématiquement liée au point d'ancrage exact de l'objet.

---

## 2. Charte des Personnages

### A. Mamie Colette (Grand-mère bienveillante)
- **Échelle :** Visible en pied dans la cuisine (`hauteur ~ 880 px` sur le canevas `1080 × 1920`).
- **Proportions :** Silhouette douce et chaleureuse (env. 5,5 têtes de haut), épaules arrondies.
- **Visage & Cheveux :** Chignon argenté/blanc cassé (`#ECE6DC`, ombres `#CEC5B6`) maintenu par un ruban terracotta doux (`#C86446`), lunettes rondes dorées (`#7A5B3E`) posées sur le nez, joues rosées (`#E89B8C`), sourire expressif.
- **Tenue :** Robe bleu ardoise doux (`#5C7893`), tablier crème (`#F9F4EA`) noué à la taille avec poche frontale et lanières souples, manches retroussées aux avant-bras, chaussons bordeaux (`#8E433D`).

### B. Léo (Petit-fils espiègle et gourmand, 7 ans)
- **Échelle :** `~ 540 px` debout dans la cuisine (et échelle perspective `~ 240 px` lorsqu'il court au fond du jardin).
- **Visage & Cheveux :** Chevelure châtain ébouriffée (`#6E472B`) couvrant le front sans trait de crâne visible en dessous, yeux vifs, petite tache de crème blanche sur la joue/doigt à partir de la frame 145.
- **Tenue :** T-shirt rayé ocre/ambre (`#E29842`) et crème, short en jean bleu (`#4A6B88`), chaussettes blanches et baskets rouges (`#C84B39`).

### C. Clara (Petite-fille joyeuse et complice, 6 ans)
- **Échelle :** `~ 510 px` debout dans la cuisine (`~ 225 px` au fond du jardin).
- **Visage & Cheveux :** Cheveux bruns dorés (`#5A3822`) coiffés en deux couettes dynamiques qui rebondissent avec l'inertie du mouvement, rubans corail.
- **Tenue :** Robe salopette vert sauge (`#739B7B`) sur t-shirt rose poudré (`#ECA89E`), chaussures Mary-Jane jaunes (`#D99B38`).

---

## 3. Décor en Perspective 3D et Permanence des Objets (`1080 × 1920`)

Le film se déroule dans un espace architectural unique en **perspective 3D à un point de fuite doux**, permettant de voir simultanément la cuisine chaleureuse et le jardin ensoleillé sans aucune coupure faisant disparaître les objets :

1. **Plan d'arrière-plan profond (`y = 220 .. 850`, `x = 80 .. 640`) — La Porte-Fenêtre Ouverte sur le Jardin :**
   - Grande baie vitrée à battants bois ouverts donnant sur la pelouse verte (`#9CC178`), un pommier, des fleurs, une clôture en bois et un ciel lumineux (`#DCEBF2`).
   - Les enfants y courent et jouent au ballon rouge et crème (soumis à une gravité parabolique réelle), puis franchissent le seuil de cette porte-fenêtre pour entrer dans la cuisine. Le ballon roule et s'arrête sur l'herbe où il reste visible jusqu'à la fin.

2. **Plan moyen droit (`x = 640 .. 1030`, `y = 560 .. 1220`) — Plan de Travail 3D et Four 3D :**
   - Meuble de cuisine en bois et crédence en carreaux artisanaux.
   - Sur le plan de travail : pot à farine, boîte à sucre, pile d'assiettes en porcelaine, pelle à tarte, et emplacement où Mamie repose le saladier et le fouet après avoir versé la pâte.
   - Sous le plan de travail : **Four 3D en perspective** avec hublot vitré lumineux, grille intérieure et **porte articulée en 3D** pivotant autour de sa charnière inférieure (`0°` fermée → `78°` ouverte).

3. **Premier plan / Plan moyen central (`x = 110 .. 940`, `y = 1080 .. 1660`) — La Grande Table Familiale et les Chaises en 3D :**
   - Table en chêne massif dessinée en volume 3D (plateau supérieur en perspective `y = 1135 .. 1255`, chant épais et 4 pieds reposant au sol `y = 1620`).
   - Deux chaises en bois pour les enfants (`Clara à x = 250`, `Léo à x = 445`) dont l'assise est à `y = 1325` et dont l'espace sous l'assise (`y = 1345 .. 1610`) est entièrement dégagé pour **voir clairement les jambes et les pieds des enfants se balancer d'avant en arrière**.
   - Emplacement du saladier, du moule puis du gâteau doré aux fraises et des assiettes servies sur le plateau de la table.

4. **Zones de Sécurité Verticales 9:16 (TikTok / Reels) :**
   - Marges haut (`y < 180`), bas (`y > 1680`) et bord droit (`x > 960`) préservées de toute action critique ; tous les visages, gestes de pâtisserie, balancement des pieds et bêtise gourmande de Léo sont cadrés dans la zone centrale de sécurité (`x = 120 .. 940`, `y = 220 .. 1640`).
