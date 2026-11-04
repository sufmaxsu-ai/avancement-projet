// Configuration centrale et constantes du court-métrage « Le Gâteau de Mamie »

export const FILM_CONFIG = {
  title: 'Le Gâteau de Mamie',
  subtitle: 'Un souvenir d’enfance dessiné image par image',
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  fps: 24,
  drawingFps: 12, // Animation traditionnelle sur 2s (12 dessins/s) + 1s sur actions rapides
  durationSeconds: 45.0,
  totalFrames: 1080, // 45.0 * 24
} as const;

/**
 * Marge de sécurité 9:16 (TikTok, Instagram Reels, YouTube Shorts)
 * Haut : 250 px | Bas : 450 px | Gauche : 64 px | Droite : 130 px
 * Zone sûre : x de 64 à 950 (largeur 886 px) et y de 250 à 1470 (hauteur 1220 px)
 */
export const SAFE_ZONE = {
  top: 250,
  bottom: 450,
  left: 64,
  right: 130,
  xMin: 64,
  xMax: 1080 - 130, // 950
  yMin: 250,
  yMax: 1920 - 450, // 1470
  width: 1080 - 64 - 130, // 886
  height: 1920 - 250 - 450, // 1220
} as const;

/**
 * Palette livre d'histoires illustré au crayon graphite et aquarelle douce
 */
export const PALETTE = {
  // Papiers & traits
  paperBase: '#F7EFE1',
  paperWarm: '#EFE3CE',
  paperShadow: '#DFCEB4',
  pencilDark: '#3D2B1F',
  pencilSoft: '#634A38',
  pencilLight: '#8C705B',

  // Cuisine & boiseries
  wallCream: '#F2E6D0',
  wainscotBeige: '#DCC7AA',
  woodLight: '#CFA06B',
  woodMedium: '#B57D47',
  woodDark: '#7C4F2B',
  floorPlank: '#C49260',
  tileSage: '#A3B59B',
  tileCream: '#F4EBDC',
  ovenBody: '#E5D8C1',
  ovenIron: '#54473E',
  ovenBrass: '#C89646',
  ovenGlow: '#F7B955',

  // Personnages — Mamie Colette
  skinWarm: '#F6D7C1',
  skinBlush: '#E49B8C',
  skinShadow: '#D9B096',
  hairSilver: '#DDD8CE',
  hairSilverShade: '#B7B0A4',
  cardiganOchre: '#D49B54',
  cardiganShade: '#B37B38',
  apronCream: '#FAF3E6',
  apronShade: '#E2D6C1',
  skirtSage: '#7C9678',
  skirtSageDark: '#5E785A',
  goldGlasses: '#BA8B43',

  // Personnages — Léo (7 ans) & Clara (5 ans)
  leoHair: '#6E4930',
  leoStripeBlue: '#5B758A',
  leoShirtCream: '#F6EFE2',
  leoShortsBeige: '#C6AC85',
  leoShoeOchre: '#B97D40',
  claraHair: '#5A3B26',
  claraDressRose: '#D9968C',
  claraDressShade: '#BA766C',
  claraBlouseCream: '#FAF3E6',
  claraSocksWhite: '#FDFBF7',
  claraShoesBrown: '#5C3B28',

  // Ingrédients, ustensiles & gâteau
  bowlCeramic: '#F3EADF',
  bowlStripeSage: '#7C9678',
  eggShell: '#F0DEC6',
  eggYolk: '#EE9E34',
  flourWhite: '#FCF9F2',
  butterYellow: '#F4D47C',
  batterRaw: '#F3D179',
  batterSmooth: '#EBBF5B',
  moldCopper: '#B87B4B',
  cakeCrust: '#D8913B',
  cakeCrustDeep: '#AE6B22',
  cakeCrumb: '#F5DA8A',
  sugarPowder: '#FFFDF9',
  berryRed: '#C84B44',
  berryHighlight: '#E67A72',
  berryLeaf: '#6A8E5E',
  plateCeramic: '#F9F3E8',
  plateRimBlue: '#7A93A4',

  // Jardin d'été
  skySoft: '#E5EFEA',
  skyWarm: '#F6ECD9',
  cloudCream: '#FCF8F0',
  grassLight: '#A8BE86',
  grassMedium: '#84A065',
  grassDeep: '#627E48',
  foliageSage: '#759462',
  foliageWarm: '#96AE6E',
  trunkBrown: '#7B583B',
  pathStone: '#DFD1B8',
  ballRed: '#CE594E',
  ballCream: '#F7EFE0',
  sunbeamGold: 'rgba(249, 218, 139, 0.24)',
} as const;

export interface SceneSpec {
  id: number;
  slug: string;
  title: string;
  startTime: number;
  endTime: number;
  startFrame: number;
  endFrame: number;
  location: 'kitchen' | 'garden' | 'transition';
  summary: string;
  keyDetails: string[];
}

export const SCENES: SceneSpec[] = [
  {
    id: 1,
    slug: 'preparation',
    title: 'Scène 1 — Préparation',
    startTime: 0.0,
    endTime: 4.5,
    startFrame: 0,
    endFrame: 107,
    location: 'kitchen',
    summary:
      'Cuisine familiale baignée de soleil. Mamie ajuste son tablier, retrousse ses manches, déplace la cuillère en bois, rapproche les ingrédients et pose le saladier devant elle.',
    keyDetails: [
      'Découverte calme de la cuisine (table en bois, vieux placards, four, ingrédients)',
      'Ajustement du tablier et manches retroussées progressivement',
      'Mise en place du grand saladier en céramique au centre',
    ],
  },
  {
    id: 2,
    slug: 'la-pate',
    title: 'Scène 2 — La pâte',
    startTime: 4.5,
    endTime: 10.5,
    startFrame: 108,
    endFrame: 251,
    location: 'kitchen',
    summary:
      'Mamie casse les œufs un à un sur le bord du saladier, verse le sucre, la farine, le lait et le beurre fondu, puis fouette la pâte jusqu’à obtenir une crème dorée.',
    keyDetails: [
      'Cassage délicat des œufs contre le rebord et ouverture des coquilles',
      'Traces de farine sur la table en bois et le tablier',
      'Articulation complète bras-poignet-main avec le fouet et pâte qui évolue visuellement',
    ],
  },
  {
    id: 3,
    slug: 'cuisson',
    title: 'Scène 3 — Cuisson',
    startTime: 10.5,
    endTime: 15.0,
    startFrame: 252,
    endFrame: 359,
    location: 'kitchen',
    summary:
      'Elle verse la pâte onctueuse dans le moule, racle avec la spatule, porte le moule avec précaution vers le four, ouvre la porte, enfourne le gâteau et règle le thermostat.',
    keyDetails: [
      'Écoulement progressif de la pâte du saladier vers le moule cannelé',
      'Ouverture et fermeture articulées de la porte du four',
      'Réglage final du bouton en laiton du four',
    ],
  },
  {
    id: 4,
    slug: 'jardin',
    title: 'Scène 4 — Les enfants au jardin',
    startTime: 15.0,
    endTime: 20.0,
    startFrame: 360,
    endFrame: 479,
    location: 'garden',
    summary:
      'Pendant la cuisson, Léo et Clara courent, rient, sautent, tournent sur eux-mêmes et jouent au ballon dans le jardin ensoleillé.',
    keyDetails: [
      'Mouvements spontanés : course, sauts, pirouette et passes de ballon',
      'Vent doux dans les feuilles du pommier, l’herbe et les marguerites',
      'Nuages lents et réaction secondaire des vêtements et cheveux',
    ],
  },
  {
    id: 5,
    slug: 'sortie-du-four',
    title: 'Scène 5 — Sortie du four',
    startTime: 20.0,
    endTime: 24.0,
    startFrame: 480,
    endFrame: 575,
    location: 'kitchen',
    summary:
      'Retour en cuisine. Mamie ouvre le four d’où s’échappe une légère vapeur dorée, saisit le moule avec ses maniques, sort le gâteau gonflé et doré et le pose sur la table.',
    keyDetails: [
      'Vapeur subtile et chaleur dorée à l’ouverture du four',
      'Prise prudente du moule avec les maniques à carreaux',
      'Sourire satisfait et tendre de Mamie devant le gâteau doré',
    ],
  },
  {
    id: 6,
    slug: 'decoration',
    title: 'Scène 6 — Décoration',
    startTime: 24.0,
    endTime: 28.0,
    startFrame: 576,
    endFrame: 671,
    location: 'kitchen',
    summary:
      'Après un instant de repos, Mamie saupoudre délicatement le gâteau de sucre glace puis dispose les fraises rouges une par une et ajuste le détail central.',
    keyDetails: [
      'Apparition progressive du voile de sucre glace à la cuillère-tamis',
      'Dépose séquentielle des fraises rouges une par une',
      'Ajustement final délicat du bout des doigts',
    ],
  },
  {
    id: 7,
    slug: 'appel',
    title: 'Scène 7 — L’appel',
    startTime: 28.0,
    endTime: 31.5,
    startFrame: 672,
    endFrame: 755,
    location: 'kitchen',
    summary:
      'Mamie regarde le gâteau terminé, se tourne vers la porte du jardin et appelle joyeusement : « À table, les enfants ! Le gâteau est prêt ! »',
    keyDetails: [
      'Geste chaleureux de la main près de la joue et synchronisation labiale douce',
      'Phrase intégrée dans la zone de sécurité 9:16 : « À table, les enfants ! Le gâteau est prêt ! »',
      'Expression affectueuse et lumineuse de Mamie',
    ],
  },
  {
    id: 8,
    slug: 'la-course',
    title: 'Scène 8 — La course',
    startTime: 31.5,
    endTime: 35.5,
    startFrame: 756,
    endFrame: 851,
    location: 'transition',
    summary:
      'Les enfants entendent Mamie, interrompent immédiatement leur jeu, se regardent avec enthousiasme, laissent le ballon et courent vers la maison jusque dans la cuisine.',
    keyDetails: [
      'Arrêt net du jeu et échange de regards complices',
      'Cycle de course complet : contact des pieds au sol, bras et vêtements animés',
      'Transition fluide du jardin ensoleillé vers la cuisine',
    ],
  },
  {
    id: 9,
    slug: 'installation-a-table',
    title: 'Scène 9 — Installation à table',
    startTime: 35.5,
    endTime: 40.0,
    startFrame: 852,
    endFrame: 959,
    location: 'kitchen',
    summary:
      'Émerveillés devant le gâteau, Léo et Clara tirent leurs chaises et s’assoient. Leurs jambes trop courtes pendent et ils balancent joyeusement leurs petits pieds sous la table.',
    keyDetails: [
      'Installation sur les chaises en bois autour de la table',
      'DÉTAIL ESSENTIEL : jambes trop courtes pour toucher le sol qui pendent sous les chaises',
      'Balancement alterné et joyeux des petits pieds, chaussettes et chaussures avec flexion des genoux',
    ],
  },
  {
    id: 10,
    slug: 'le-gouter',
    title: 'Scène 10 — Le goûter',
    startTime: 40.0,
    endTime: 45.0,
    startFrame: 960,
    endFrame: 1079,
    location: 'kitchen',
    summary:
      'Mamie découpe réellement le gâteau au couteau, dépose une part dans chaque assiette et sert Clara puis Léo. Toute la famille savoure ce moment tendre et paisible.',
    keyDetails: [
      'Mouvement réel du couteau et séparation progressive des parts dorées',
      'Service individuel de chaque part dans l’assiette de chaque enfant',
      'Tableau final chaleureux et apaisé comme un souvenir précieux (pieds qui balancent doucement)',
    ],
  },
];

export function getSceneForFrame(frame: number): {
  scene: SceneSpec;
  localFrame: number;
  sceneFrames: number;
  progress: number;
} {
  const clamped = Math.max(0, Math.min(FILM_CONFIG.totalFrames - 1, Math.floor(frame)));
  const found =
    SCENES.find((s) => clamped >= s.startFrame && clamped <= s.endFrame) ||
    SCENES[SCENES.length - 1];
  const localFrame = clamped - found.startFrame;
  const sceneFrames = found.endFrame - found.startFrame + 1;
  const progress = sceneFrames > 1 ? localFrame / (sceneFrames - 1) : 1;
  return { scene: found, localFrame, sceneFrames, progress };
}
