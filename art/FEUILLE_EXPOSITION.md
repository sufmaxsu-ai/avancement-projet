# FEUILLE D'EXPOSITION (X-SHEET) — *La Promenade de Grand-mère Colette*

## 1. Paramètres Techniques de la Feuille d'Exposition
- **Cadence de projection** : `24 images par seconde (fps)`
- **Cadence de dessin** : `12 dessins uniques par seconde` (animation traditionnelle *« sur 2 »* / *on twos* : chaque dessin est exposé exactement `2 frames`, soit `83,33 ms`).
- **Durée totale** : `6,00 secondes` = `144 frames` (`frameIndex` `0` à `143`) = **`72 dessins uniques` (`CEL_001` à `CEL_072`)**.
- **Structure du cycle de marche tranquille (1 cycle complet = 2 pas = 12 dessins uniques = 24 frames = 1,00 s)** :
  - **Pas 1 (Pied Gauche en avant → Appui Gauche)** : 6 dessins (`d = 0..5`, soit 12 frames = `0,50 s`)
    1. `d = 0` — **KEY (Pose Clé — Contact Gauche)** : Talon gauche touche le pavé à l'avant (`heel strike`, angle pied `+18°`), orteils droits quittent le sol à l'arrière (`toe-off`), canne posée à l'avant. Bassin à hauteur moyenne (`Δy = 0 px`).
    2. `d = 1` — **INB (Intervalle — Amorti / Recoil)** : Le pied gauche se pose à plat (`flat foot`), le genou gauche fléchit pour absorber le poids. Bassin descend (`Δy = +7 px`). Le châle commence à descendre avec léger retard.
    3. `d = 2` — **BRK (Breakdown — Pose Basse / Down)** : Flexion maximale de la jambe d'appui gauche (`Δy = +11 px`), le pied droit décolle franchement derrière. Le châle et les plis de la jupe atteignent leur point bas.
    4. `d = 3` — **BRK (Breakdown — Passage / Passing 1)** : La jambe droite passe devant la jambe gauche d'appui qui se redresse (`Δy = +2 px`). La cheville droite est souplement fléchie.
    5. `d = 4` — **BRK (Breakdown — Pose Haute / Up)** : Poussée souple sur la jambe gauche (`Δy = -8 px`, extension douce), le pied droit s'avance vers l'avant avant le contact.
    6. `d = 5` — **INB (Intervalle — Descente vers Contact Droit)** : La jambe droite s'allonge vers le pavé suivant (`Δy = -3 px`), le talon droit s'apprête à toucher le sol.
  - **Pas 2 (Pied Droit en avant → Appui Droit)** : 6 dessins (`d = 6..11`, soit 12 frames = `0,50 s`)
    7. `d = 6` — **KEY (Pose Clé — Contact Droit)** : Talon droit touche le pavé à l'avant (`heel strike`, angle pied `+18°`), orteils gauches à l'arrière. Bassin à hauteur moyenne (`Δy = 0 px`).
    8. `d = 7` — **INB (Intervalle — Amorti Droit)** : Pied droit à plat, transfert du poids sur la jambe droite (`Δy = +7 px`).
    9. `d = 8` — **BRK (Breakdown — Pose Basse / Down 2)** : Point bas de l'appui droit (`Δy = +11 px`), pied gauche quitte le sol à l'arrière.
    10. `d = 9` — **BRK (Breakdown — Passage / Passing 2)** : La jambe gauche croise la jambe droite verticale (`Δy = +2 px`), balancement inverse des bras et de la canne.
    11. `d = 10` — **BRK (Breakdown — Pose Haute / Up 2)** : Point haut sur l'appui droit (`Δy = -8 px`), le châle flotte légèrement vers le haut.
    12. `d = 11` — **INB (Intervalle — Descente vers Contact Gauche)** : Préparation du talon gauche pour le contact suivant (`Δy = -3 px`).

---

## 2. Table d'Exposition Complète (Frames `000` à `143` / Dessins `CEL_001` à `CEL_072`)

| Dessin (Cel) | Frames (24 fps) | Temps (s) | Type | Phase de Marche | Bassin Δy | Action Personnage, Vêtements & Décor | Cue Audio |
|---|---|---|---|---|---|---|---|
| `CEL_001` | `000–001` | `0.00–0.08` | **KEY** | Contact Gauche (Cyc 1) | `0 px` | Talon G touche le pavé, appui canne, sourire paisible devant la Boulangerie | Pas G + Canne |
| `CEL_002` | `002–003` | `0.08–0.17` | INB | Amorti Gauche | `+7 px` | Pied G à plat, flexion genou G, châle en retard haut | — |
| `CEL_003` | `004–005` | `0.17–0.25` | **BRK** | Down Gauche | `+11 px` | Transfert complet du poids sur G, franges du châle s'abaissent | — |
| `CEL_004` | `006–007` | `0.25–0.33` | **BRK** | Passage Droit | `+2 px` | Jambe D croise la jambe G, plis de la jupe rassemblés | — |
| `CEL_005` | `008–009` | `0.33–0.42` | **BRK** | Up Gauche | `-8 px` | Sommet de la foulée G, panier d'osier oscille doucement | — |
| `CEL_006` | `010–011` | `0.42–0.50` | INB | Approche Contact D | `-3 px` | Jambe D tendue vers l'avant, préparation talon D | — |
| `CEL_007` | `012–013` | `0.50–0.58` | **KEY** | Contact Droit (Cyc 1) | `0 px` | Talon D touche le pavé, bras G légèrement avancé avec le panier | Pas D |
| `CEL_008` | `014–015` | `0.58–0.67` | INB | Amorti Droit | `+7 px` | Pied D à plat, début de clignement doux des yeux | — |
| `CEL_009` | `016–017` | `0.67–0.75` | **BRK** | Down Droit | `+11 px` | Paupières mi-closes/closes (clignement naturel), poids bas sur D | — |
| `CEL_010` | `018–019` | `0.75–0.83` | **BRK** | Passage Gauche | `+2 px` | Réouverture des yeux, jambe G croise, canne se prépare vers l'avant | — |
| `CEL_011` | `020–021` | `0.83–0.92` | **BRK** | Up Droit | `-8 px` | Impulsion souple sur D, mèches argentées soulevées | Chant d'oiseau |
| `CEL_012` | `022–023` | `0.92–1.00` | INB | Approche Contact G | `-3 px` | Fin du Cycle 1, talon G prêt au contact | — |
| `CEL_013` | `024–025` | `1.00–1.08` | **KEY** | Contact Gauche (Cyc 2) | `0 px` | Talon G au sol + appui de la canne, passage entre Boulangerie et Glycines | Pas G + Canne |
| `CEL_014` | `026–027` | `1.08–1.17` | INB | Amorti Gauche | `+7 px` | Pied G à plat, ondulation ample de l'ourlet de la jupe | — |
| `CEL_015` | `028–029` | `1.17–1.25` | **BRK** | Down Gauche | `+11 px` | Flexion souple, rubans du tablier flottent dans la brise | — |
| `CEL_016` | `030–031` | `1.25–1.33` | **BRK** | Passage Droit | `+2 px` | Jambe D passe au niveau de la cheville G | — |
| `CEL_017` | `032–033` | `1.33–1.42` | **BRK** | Up Gauche | `-8 px` | Élévation douce, les rayons du matin traversent les glycines | — |
| `CEL_018` | `034–035` | `1.42–1.50` | INB | Approche Contact D | `-3 px` | Le regard de Colette commence à se porter vers la fenêtre fleurie | — |
| `CEL_019` | `036–037` | `1.50–1.58` | **KEY** | Contact Droit (Cyc 2) | `0 px` | Talon D au sol, le chat roux dresse les oreilles sur le rebord | Pas D |
| `CEL_020` | `038–039` | `1.58–1.67` | INB | Amorti Droit | `+7 px` | Pied D à plat, sourire de Colette qui s'élargit | — |
| `CEL_021` | `040–041` | `1.67–1.75` | **BRK** | Down Droit | `+11 px` | Flexion sur D, le papillon doré entre dans le champ à droite | — |
| `CEL_022` | `042–043` | `1.75–1.83` | **BRK** | Passage Gauche | `+2 px` | Passage jambe G, tête de Colette commence à s'incliner vers le haut | — |
| `CEL_023` | `044–045` | `1.83–1.92` | **BRK** | Up Droit | `-8 px` | Élévation souple, préparation de l'Acte II | — |
| `CEL_024` | `046–047` | `1.92–2.00` | INB | Approche Contact G | `-3 px` | Transition fluide vers l'Acte II sous l'arche de glycines | — |
| `CEL_025` | `048–049` | `2.00–2.08` | **KEY** | Contact Gauche (Cyc 3) | `0 px` | Début Acte II : Contact G + Canne, regard tourné vers le chat roux | Pas G + Canne |
| `CEL_026` | `050–051` | `2.08–2.17` | INB | Amorti Gauche | `+7 px` | La main gauche de Colette commence à se soulever pour saluer | — |
| `CEL_027` | `052–053` | `2.17–2.25` | **BRK** | Down Gauche | `+11 px` | Sourcils relevés avec tendresse, pommettes rosées | — |
| `CEL_028` | `054–055` | `2.25–2.33` | **BRK** | Passage Droit | `+2 px` | Main gauche levée en petit signe amical (salut 1 vers la gauche) | — |
| `CEL_029` | `056–057` | `2.33–2.42` | **BRK** | Up Gauche | `-8 px` | Main gauche oscille (salut 2 vers la droite), le chat roux remue la queue | — |
| `CEL_030` | `058–059` | `2.42–2.50` | INB | Approche Contact D | `-3 px` | Le papillon doré voltige juste devant le bouquet de lavande | — |
| `CEL_031` | `060–061` | `2.50–2.58` | **KEY** | Contact Droit (Cyc 3) | `0 px` | Talon D au sol, apogée du sourire et du salut au chat roux | Pas D + Note douce |
| `CEL_032` | `062–063` | `2.58–2.67` | INB | Amorti Droit | `+7 px` | Salut de la main (oscillation 3), les lunettes dorées captent un reflet | — |
| `CEL_033` | `064–065` | `2.67–2.75` | **BRK** | Down Droit | `+11 px` | Le chat roux incline la tête en réponse, battement d'ailes du papillon | — |
| `CEL_034` | `066–067` | `2.75–2.83` | **BRK** | Passage Gauche | `+2 px` | La main gauche redescend doucement vers l'anse du panier | — |
| `CEL_035` | `068–069` | `2.83–2.92` | **BRK** | Up Droit | `-8 px` | Poussée souple, le châle terracotta ondule gracieusement | — |
| `CEL_036` | `070–071` | `2.92–3.00` | INB | Approche Contact G | `-3 px` | Colette suit des yeux le papillon doré qui monte vers les fleurs | — |
| `CEL_037` | `072–073` | `3.00–3.08` | **KEY** | Contact Gauche (Cyc 4) | `0 px` | Talon G au sol + appui canne, passage sous la grande grappe de glycine | Pas G + Canne |
| `CEL_038` | `074–075` | `3.08–3.17` | INB | Amorti Gauche | `+7 px` | Pied G à plat, clignement rapide et joyeux des paupières | — |
| `CEL_039` | `076–077` | `3.17–3.25` | **BRK** | Down Gauche | `+11 px` | Poids sur G, pétales mauves de glycine tombent lentement dans l'air | — |
| `CEL_040` | `078–079` | `3.25–3.33` | **BRK** | Passage Droit | `+2 px` | Jambe D passe, balancement régulier et apaisé du panier | — |
| `CEL_041` | `080–081` | `3.33–3.42` | **BRK** | Up Gauche | `-8 px` | Élévation souple, le papillon décrit une arabesque au-dessus du chignon | — |
| `CEL_042` | `082–083` | `3.42–3.50` | INB | Approche Contact D | `-3 px` | La tête de Colette revient progressivement à l'horizontale | — |
| `CEL_043` | `084–085` | `3.50–3.58` | **KEY** | Contact Droit (Cyc 4) | `0 px` | Talon D au sol, démarche fluide et ancrée sur les pavés | Pas D |
| `CEL_044` | `086–087` | `3.58–3.67` | INB | Amorti Droit | `+7 px` | Pied D à plat, plis de la jupe s'ouvrent en éventail | — |
| `CEL_045` | `088–089` | `3.67–3.75` | **BRK** | Down Droit | `+11 px` | Point bas souple, les franges du châle suivent avec retard | — |
| `CEL_046` | `090–091` | `3.75–3.83` | **BRK** | Passage Gauche | `+2 px` | Jambe G croise la jambe D, la lanterne ancienne apparaît à droite | — |
| `CEL_047` | `092–093` | `3.83–3.92` | **BRK** | Up Droit | `-8 px` | Élévation douce sur D | — |
| `CEL_048` | `094–095` | `3.92–4.00` | INB | Approche Contact G | `-3 px` | Transition vers l'Acte III | — |
| `CEL_049` | `096–097` | `4.00–4.08` | **KEY** | Contact Gauche (Cyc 5) | `0 px` | Début Acte III : Contact G + Canne devant l'Herboristerie rose poudré | Pas G + Canne |
| `CEL_050` | `098–099` | `4.08–4.17` | INB | Amorti Gauche | `+7 px` | Colette rapproche légèrement son panier fleuri de son buste | — |
| `CEL_051` | `100–101` | `4.17–4.25` | **BRK** | Down Gauche | `+11 px` | Légère inclinaison de la tête vers le bouquet de lavande (`-5°`) | — |
| `CEL_052` | `102–103` | `4.25–4.33` | **BRK** | Passage Droit | `+2 px` | Elle inspire doucement le parfum des fleurs, sourire serein | Brise légère |
| `CEL_053` | `104–105` | `4.33–4.42` | **BRK** | Up Gauche | `-8 px` | Paupières closes de bien-être (expression paisible 1/3) | — |
| `CEL_054` | `106–107` | `4.42–4.50` | INB | Approche Contact D | `-3 px` | Paupières closes de bien-être (expression paisible 2/3) | — |
| `CEL_055` | `108–109` | `4.50–4.58` | **KEY** | Contact Droit (Cyc 5) | `0 px` | Talon D au sol, paupières closes (3/3), respiration calme du buste | Pas D |
| `CEL_056` | `110–111` | `4.58–4.67` | INB | Amorti Droit | `+7 px` | Réouverture douce des yeux, regard lumineux vers l'avant de la rue | — |
| `CEL_057` | `112–113` | `4.67–4.75` | **BRK** | Down Droit | `+11 px` | Le panier reprend son balancement naturel | — |
| `CEL_058` | `114–115` | `4.75–4.83` | **BRK** | Passage Gauche | `+2 px` | Passage jambe G, les rubans du tablier flottent avec grâce | — |
| `CEL_059` | `116–117` | `4.83–4.92` | **BRK** | Up Droit | `-8 px` | Impulsion souple sur D, reflet doré sur les lunettes | Chant d'oiseau |
| `CEL_060` | `118–119` | `4.92–5.00` | INB | Approche Contact G | `-3 px` | Fin du Cycle 5 | — |
| `CEL_061` | `120–121` | `5.00–5.08` | **KEY** | Contact Gauche (Cyc 6) | `0 px` | Dernier cycle : Talon G au sol + Canne, démarche assurée et sereine | Pas G + Canne |
| `CEL_062` | `122–123` | `5.08–5.17` | INB | Amorti Gauche | `+7 px` | Pied G à plat, transfert du poids | — |
| `CEL_063` | `124–125` | `5.17–5.25` | **BRK** | Down Gauche | `+11 px` | Point bas sur G, ondulation du châle | — |
| `CEL_064` | `126–127` | `5.25–5.33` | **BRK** | Passage Droit | `+2 px` | Jambe D croise la jambe G | — |
| `CEL_065` | `128–129` | `5.33–5.42` | **BRK** | Up Gauche | `-8 px` | Point haut sur G, le papillon doré s'élève vers les toits ensoleillés | — |
| `CEL_066` | `130–131` | `5.42–5.50` | INB | Approche Contact D | `-3 px` | Approche du dernier appui droit | — |
| `CEL_067` | `132–133` | `5.50–5.58` | **KEY** | Contact Droit (Cyc 6) | `0 px` | Talon D au sol, sourire chaleureux | Pas D + Accord final |
| `CEL_068` | `134–135` | `5.58–5.67` | INB | Amorti Droit | `+7 px` | Pied D à plat | — |
| `CEL_069` | `136–137` | `5.67–5.75` | **BRK** | Down Droit | `+11 px` | Flexion douce sur D | — |
| `CEL_070` | `138–139` | `5.75–5.83` | **BRK** | Passage Gauche | `+2 px` | Jambe G passe vers l'avant | — |
| `CEL_071` | `140–141` | `5.83–5.92` | **BRK** | Up Droit | `-8 px` | Élévation finale souple | — |
| `CEL_072` | `142–143` | `5.92–6.00` | INB | Boucle vers Contact G | `-3 px` | Raccord parfait de foulée avec `CEL_001` | — |
