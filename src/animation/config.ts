export const FILM_CONFIG = {
  title: 'Le Gâteau de Mamie',
  width: 1080,
  height: 1920,
  fps: 24,
  durationSeconds: 7.5,
  totalFrames: 180, // 7.50s * 24fps = 180 frames (dans la cible stricte de 5 à 8 secondes)
  boilStepFrames: 1, // Chaque frame (24 Hz) possède un redessin unique feuille par feuille
} as const;

export const PALETTE = {
  // Papier & Crayon Graphite
  paperBase: '#F6EFE2',
  paperWarm: '#EFE5D4',
  paperShadow: '#E2D4BE',
  graphiteDark: '#261E18',
  graphiteMid: '#46382E',
  graphiteLight: '#756354',
  crayonHighlight: '#FFFDF8',

  // Cuisine & Architecture 3D
  wallCream: '#F2E6D0',
  wallWainscot: '#D7C3A5',
  woodBeam: '#8C623E',
  floorTileA: '#DFC7A7',
  floorTileB: '#C9AD88',
  counterWood: '#B58050',
  counterTop: '#E8DCC8',
  counterFront: '#9E6B3E',
  tileBacksplash: '#DCE6E2',
  ovenBody: '#48525A',
  ovenPanel: '#343C42',
  ovenGlassCold: '#697884',
  ovenGlowWarm: '#F6A842',
  ovenGlowHot: '#FFD470',
  ovenRack: '#C8C2B8',
  tableTop: '#C98E58',
  tableEdge: '#9E6838',
  tableLeg: '#825228',
  chairWood: '#B37844',

  // Jardin Ensoleillé (vu en profondeur par la porte-fenêtre)
  skyBlue: '#D6ECF6',
  sunGlow: '#FFF3C4',
  distantHills: '#B4CFA0',
  grassLight: '#A3C87D',
  grassMid: '#83B05C',
  grassDark: '#659142',
  treeTrunk: '#7E5638',
  foliageA: '#72A252',
  foliageB: '#8FBC68',
  flowerRed: '#DF6452',
  flowerYellow: '#F0C24B',

  // Mamie Colette
  skinWarm: '#FADBC8',
  skinShadow: '#E5B89E',
  cheeksRose: '#EA9486',
  hairSilver: '#ECE7DF',
  hairSilverShade: '#CBC2B5',
  bunRibbon: '#C96348',
  glassesGold: '#78583A',
  mamieDress: '#5B7894',
  mamieDressShade: '#455F78',
  apronCream: '#FAF4E8',
  apronShade: '#E4D9C5',
  slippersBurgundy: '#8E433D',

  // Léo (petit-fils)
  leoHair: '#6E462A',
  leoShirtAmber: '#E59A42',
  leoShirtStripe: '#FAF1E0',
  leoShortsBlue: '#4B6C8B',
  leoShoesRed: '#C84B38',

  // Clara (petite-fille)
  claraHair: '#593720',
  claraRibbon: '#E06858',
  claraDressSage: '#739C7B',
  claraShirtPink: '#F0ACA0',
  claraShoesYellow: '#DA9C36',

  // Pâtisserie & Accessoires
  bowlTerracotta: '#C86D4B',
  bowlInside: '#F2E5D2',
  batterGold: '#F4CE72',
  whiskMetal: '#7B848C',
  whiskHandle: '#8F5B34',
  panMetal: '#8B949C',
  panInside: '#6E7780',
  cakeSponge: '#E5A14B',
  cakeCrust: '#C47B2B',
  cakeIcing: '#FFF9F0',
  strawberryRed: '#D94436',
  strawberryLeaf: '#5C9448',
  platePorcelain: '#F7F4EE',
  plateRim: '#B9C8D2',
  ballRed: '#D84E3E',
  ballCream: '#F7EFE0',
} as const;

export interface ExposurePhase {
  id: string;
  phaseNumber: number;
  title: string;
  startFrame: number;
  endFrame: number;
  summary: string;
  details: string;
}

export const EXPOSURE_SHEET: ExposurePhase[] = [
  {
    id: 'phase-1-whisking',
    phaseNumber: 1,
    title: '1. Mamie fouette la pâte à gâteau',
    startFrame: 0,
    endFrame: 31,
    summary: 'Mamie prépare la pâte au fouet dans le saladier pendant que Léo et Clara jouent au ballon dans le jardin.',
    details: 'Main gauche sur le rebord du saladier, main droite fouettant en ellipse 3D ; ballon parabolique au jardin.',
  },
  {
    id: 'phase-2-pouring',
    phaseNumber: 2,
    title: '2. Versement de la pâte dans le moule',
    startFrame: 32,
    endFrame: 47,
    summary: 'Mamie incline le saladier et verse un ruban de pâte dorée dans le moule posé sur la table.',
    details: 'Le niveau de pâte monte dans le moule ; le saladier est ensuite posé sur le comptoir arrière.',
  },
  {
    id: 'phase-3-oven-in',
    phaseNumber: 3,
    title: '3. Enfournement et cuisson au four 3D',
    startFrame: 48,
    endFrame: 71,
    summary: 'Mamie ouvre la porte du four 3D, glisse le moule sur la grille, referme la porte ; le gâteau gonfle et dore.',
    details: 'Rotation perspective 3D de la porte du four ; lueur chaude et montée du dôme à travers le hublot.',
  },
  {
    id: 'phase-4-oven-out-call',
    phaseNumber: 4,
    title: '4. Sortie du four & Appel des enfants',
    startFrame: 72,
    endFrame: 107,
    summary: 'Mamie sort le gâteau doré fumant du four, le pose sur la table et appelle les enfants : « À table ! ».',
    details: 'Vapeur parfumée, fraises et glaçage ; Mamie porte sa main en porte-voix vers la porte-fenêtre.',
  },
  {
    id: 'phase-5-kids-running',
    phaseNumber: 5,
    title: '5. Course des enfants & Installation sur les chaises',
    startFrame: 108,
    endFrame: 135,
    summary: 'Léo et Clara accourent du jardin, entrent dans la cuisine et grimpent s’asseoir sur leurs chaises.',
    details: 'Cycle de course naturel (genoux fléchis vers l’arrière), puis jambes pendantes qui commencent à se balancer.',
  },
  {
    id: 'phase-6-sneak-taste',
    phaseNumber: 6,
    title: '6. Bêtise gourmande quand Mamie a le dos tourné',
    startFrame: 136,
    endFrame: 153,
    summary: 'Mamie se tourne vers le comptoir ; Léo trempe son doigt dans le gâteau et goûte, Clara pouffe de rire.',
    details: 'Balancement rythmé des pieds sous les chaises ; index de Léo dans la chantilly + trace de crème sur la joue.',
  },
  {
    id: 'phase-7-serving-finale',
    phaseNumber: 7,
    title: '7. Service des parts & Tableau familial final',
    startFrame: 154,
    endFrame: 179,
    summary: 'Mamie se retourne, découpe le gâteau et sert une belle part dans l’assiette de chacun des enfants.',
    details: 'Encoche 3D dans le gâteau, parts servies, pieds des enfants qui se balancent joyeusement sous la table.',
  },
];

export const KEYFRAME_DOC_LIST = [
  { frame: 10, slug: '0010_phase1_fouet_et_jardin', label: 'Mamie fouette la pâte, enfants au jardin' },
  { frame: 38, slug: '0038_phase2_versement_moule', label: 'Versement du ruban de pâte dans le moule' },
  { frame: 56, slug: '0056_phase3_enfournement_3d', label: 'Porte du four 3D ouverte et enfournement' },
  { frame: 84, slug: '0084_phase4_sortie_four_vapeur', label: 'Sortie du gâteau doré et fumant du four 3D' },
  { frame: 100, slug: '0100_phase4_appel_mamie', label: 'Mamie appelle les enfants à venir à table' },
  { frame: 116, slug: '0116_phase5_course_enfants', label: 'Léo et Clara arrivent en courant du jardin' },
  { frame: 132, slug: '0132_phase5_assis_chaises', label: 'Installation sur les chaises et début du balancement' },
  { frame: 143, slug: '0143_phase6_doigt_dans_gateau', label: 'Mamie tournée : Léo met le doigt dans le gâteau, Clara rit' },
  { frame: 149, slug: '0149_phase6_goute_creme_pieds', label: 'Léo goûte la crème sur son doigt, pieds qui balancent' },
  { frame: 165, slug: '0165_phase7_decoupe_et_service', label: 'Mamie découpe et sert la première part à Clara' },
  { frame: 175, slug: '0175_phase7_parts_servies_final', label: 'Parts servies à chacun et bonheur familial' },
] as const;

export function getPhaseForFrame(frameIndex: number): ExposurePhase {
  const clamped = Math.max(0, Math.min(FILM_CONFIG.totalFrames - 1, Math.floor(frameIndex)));
  return (
    EXPOSURE_SHEET.find((p) => clamped >= p.startFrame && clamped <= p.endFrame) ||
    EXPOSURE_SHEET[EXPOSURE_SHEET.length - 1]
  );
}
