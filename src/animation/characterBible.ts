// Bible graphique immuable des personnages, accessoires et lieux du film « Le Gâteau de Mamie »

import { PALETTE } from './config';

export interface CharacterSheetSpec {
  id: 'mamie' | 'leo' | 'clara';
  name: string;
  age: string;
  role: string;
  heightDescription: string;
  hairStyle: string;
  faceFeatures: string;
  outfit: string[];
  colors: { label: string; hex: string }[];
  signatureAnimations: string[];
}

export const CHARACTER_BIBLE: CharacterSheetSpec[] = [
  {
    id: 'mamie',
    name: 'Mamie Colette',
    age: '68 ans',
    role: 'La grand-mère aimante et pâtissière',
    heightDescription: 'Silhouette douce et chaleureuse (~3,8 têtes, épaules arrondies)',
    hairStyle: 'Cheveux gris-argenté (#DDD8CE) relevés en chignon rond maintenu par une épingle en bois',
    faceFeatures:
      'Lunettes rondes à monture dorée (#BA8B43), pommettes rosées (#E49B8C), rides d’expression bienveillantes, sourire tendre',
    outfit: [
      'Cardigan beige-ocre (#D49B54) aux manches retroussées au-dessus des poignets',
      'Col claudine crème sous le cardigan',
      'Grand tablier en lin crème (#FAF3E6) à bavette, poche ventrale et cordons noués au dos',
      'Jupe mi-longue plissée vert sauge (#7C9678) et chaussons souples bruns',
    ],
    colors: [
      { label: 'Chignon argenté', hex: PALETTE.hairSilver },
      { label: 'Cardigan ocre', hex: PALETTE.cardiganOchre },
      { label: 'Tablier lin crème', hex: PALETTE.apronCream },
      { label: 'Jupe vert sauge', hex: PALETTE.skirtSage },
      { label: 'Lunettes dorées', hex: PALETTE.goldGlasses },
    ],
    signatureAnimations: [
      'Ajustement du tablier et retroussage des manches (Scène 1)',
      'Cassage des œufs et fouettage articulé bras/poignet/main (Scène 2)',
      'Décoration progressive au sucre glace et aux fraises (Scène 6)',
      'Appel affectueux à la porte du jardin (Scène 7)',
      'Découpe réelle au couteau et service des parts (Scène 10)',
    ],
  },
  {
    id: 'clara',
    name: 'Clara',
    age: '5 ans',
    role: 'La petite-fille cadette joyeuse et gourmande',
    heightDescription:
      'Petite taille (~1,06 m) : assise sur sa chaise, ses jambes pendent à 130 px au-dessus du sol',
    hairStyle: 'Cheveux brun doux (#5A3B26) en deux petites couettes basses tenues par des rubans ocre',
    faceFeatures: 'Visage rond enfantin, grands yeux expressifs, joues rosées et rire spontané',
    outfit: [
      'Blouse crème (#FAF3E6) à manches courtes bouffantes',
      'Robe chasuble rose poudré (#D9968C)',
      'Chaussettes blanches à revers (#FDFBF7) bien visibles sous la chaise',
      'Petites chaussures Mary Jane brunes à bride (#5C3B28)',
    ],
    colors: [
      { label: 'Couettes brunes', hex: PALETTE.claraHair },
      { label: 'Robe rose poudré', hex: PALETTE.claraDressRose },
      { label: 'Blouse crème', hex: PALETTE.claraBlouseCream },
      { label: 'Chaussettes blanches', hex: PALETTE.claraSocksWhite },
      { label: 'Chaussures brunes', hex: PALETTE.claraShoesBrown },
    ],
    signatureAnimations: [
      'Sauts, pirouettes et jeu de ballon dans le jardin (Scène 4)',
      'Course enthousiaste vers la maison (Scène 8)',
      'Balancement alterné des petits pieds sous la chaise (Scènes 9 & 10)',
    ],
  },
  {
    id: 'leo',
    name: 'Léo',
    age: '7 ans',
    role: 'Le petit-fils aîné vif et curieux',
    heightDescription:
      'Taille enfantine (~1,18 m) : assis sur sa chaise, ses pieds pendent à 110 px au-dessus du sol',
    hairStyle: 'Cheveux châtains ébouriffés (#6E4930) avec une mèche souple sur le front',
    faceFeatures: 'Grands yeux noisette curieux, sourire franc, joues rougies par la course au jardin',
    outfit: [
      'T-shirt marinière crème (#F6EFE2) à rayures horizontales bleu ardoise doux (#5B758A)',
      'Short en toile beige (#C6AC85) au-dessus des genoux',
      'Chaussettes crème et petites chaussures de toile ocre et brun (#B97D40)',
    ],
    colors: [
      { label: 'Cheveux châtains', hex: PALETTE.leoHair },
      { label: 'Rayures bleu ardoise', hex: PALETTE.leoStripeBlue },
      { label: 'Short beige', hex: PALETTE.leoShortsBeige },
      { label: 'Baskets ocre', hex: PALETTE.leoShoeOchre },
    ],
    signatureAnimations: [
      'Passes de ballon, course et sauts au jardin (Scène 4)',
      'Arrêt net à l’appel de Mamie et sprint vers la cuisine (Scène 8)',
      'Balancement joyeux des jambes et des pieds sous la table (Scènes 9 & 10)',
    ],
  },
];

export interface PropBibleSpec {
  id: string;
  name: string;
  description: string;
  scenesUsed: number[];
}

export const PROP_BIBLE: PropBibleSpec[] = [
  {
    id: 'saladier',
    name: 'Grand saladier en faïence',
    description: 'Céramique crème (#F3EADF) à rebord arrondi et double filet vert sauge (#7C9678).',
    scenesUsed: [1, 2, 3],
  },
  {
    id: 'fouet',
    name: 'Fouet pâtissier traditionnel',
    description: 'Manche en bois tourné ocre et fils d’acier courbés qui brassent réellement la pâte.',
    scenesUsed: [1, 2],
  },
  {
    id: 'moule',
    name: 'Moule à gâteau rond cannelé',
    description: 'Moule en cuivre étamé (#B87B4B) de diamètre constant, allant de la table au four.',
    scenesUsed: [1, 3, 5],
  },
  {
    id: 'gateau',
    name: 'Le Gâteau de Mamie (Continuité stricte)',
    description:
      'Gâteau rond bien bombé à la croûte dorée-miellée (#D8913B), saupoudré d’un voile de sucre glace (#FFFDF9) et couronné de 7 fraises rouges (#C84B44). Mie intérieure jaune tendre (#F5DA8A).',
    scenesUsed: [5, 6, 7, 9, 10],
  },
  {
    id: 'couteau-et-parts',
    name: 'Couteau à gâteau, assiettes et parts',
    description:
      'Couteau à lame argentée et manche en bois ; assiettes en faïence crème à filet bleu doux recevant chacune une part triangulaire dorée surmontée d’une fraise.',
    scenesUsed: [10],
  },
];
