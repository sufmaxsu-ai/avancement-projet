/**
 * Feuille d'exposition (X-Sheet) et définition des 72 dessins uniques (CEL_001 à CEL_072)
 * exposés "sur 2" (12 dessins uniques/seconde) pour 144 frames à 24 fps (6,00 secondes).
 */

export type DrawingRole = 'KEY' | 'BRK' | 'INB';

export interface FootPose {
  /** Décalage horizontal par rapport à l'axe du bassin (en px, + vers la droite/avant) */
  dx: number;
  /** Hauteur au-dessus du sol pavé (0 = posé sur le pavé, < 0 = soulevé en l'air) */
  liftY: number;
  /** Angle de la chaussure en degrés (+ = pointe relevée / attaque talon, - = poussée orteils) */
  angleDeg: number;
  /** Flexion additionnelle de l'avant-pied lors du toe-off */
  toeBendDeg: number;
  /** État d'appui au sol */
  contactState: 'heel-strike' | 'flat-foot' | 'heel-off' | 'toe-off' | 'swing';
}

export interface WalkPhaseTemplate {
  phaseIndex: number; // 0..11
  role: DrawingRole;
  phaseName: string;
  pelvisDy: number; // + vers le bas (amorti Down), - vers le haut (poussée Up)
  torsoLeanDeg: number; // inclinaison douce du buste (autour de 7° vers l'avant)
  headBobDy: number; // léger mouvement vertical retardé de la tête
  shawlLagDy: number; // action chevauchante retardée du châle tricoté
  shawlTipWave: number; // ondulation des franges du châle (-1..+1)
  skirtSwish: number; // balancement avant/arrière des plis de la jupe (-1..+1)
  apronRibbonWave: number; // ondulation des rubans du tablier
  leftFoot: FootPose;
  rightFoot: FootPose;
  leftKneeDx: number;
  leftKneeDy: number;
  rightKneeDx: number;
  rightKneeDy: number;
  /** Bras droit et canne en bois */
  rightHandDx: number;
  rightHandDy: number;
  caneTipDx: number;
  caneTipLiftY: number; // 0 = embout laiton posé au sol
  /** Bras gauche et panier d'osier (base de marche avant modulation expressive) */
  leftHandDx: number;
  leftHandDy: number;
  basketTiltDeg: number;
}

export interface CelSpecification {
  celNumber: number; // 1..72
  celId: string; // 'CEL_001' .. 'CEL_072'
  startFrame: number; // 0, 2, 4 ... 142
  endFrame: number; // 1, 3, 5 ... 143
  durationFrames: number; // 2
  timeStartSec: number;
  timeEndSec: number;
  act: 1 | 2 | 3;
  actTitle: string;
  cycleNumber: number; // 1..6
  phaseIndex: number; // 0..11
  role: DrawingRole;
  phaseName: string;
  description: string;
  audioCue: string | null;
  /** Défilement cumulé du sol pavé en pixels (exactement verrouillé sur l'appui du pied au sol) */
  groundScrollPx: number;
  /** Pose complète calculée pour ce dessin unique */
  pose: WalkPhaseTemplate & {
    headTiltDeg: number;
    eyeOpen: number; // 1 = ouvert, 0.35 = mi-clos, 0 = fermé
    smileIntensity: number; // 0.5..1.0
    gazeOffsetY: number; // - = regarde en haut vers le chat, + = regarde les fleurs
    waveHandRaise: number; // 0..1 (salut de la main gauche à l'Acte II)
    waveWristAngleDeg: number;
    smellFlowersLean: number; // 0..1 (respire la lavande à l'Acte III)
  };
}

export const FPS = 24;
export const TOTAL_FRAMES = 144;
export const TOTAL_CELS = 72;
export const DURATION_SECONDS = TOTAL_FRAMES / FPS; // 6.00 s
/** Avancée par dessin unique (en px sur 1080x1920) : 16.0 px/cel => 96 px par pas de 6 cels */
export const STRIDE_PX_PER_CEL = 16.0;

/**
 * Les 12 dessins de base d'un cycle complet de marche tranquille (2 pas = 12 cels = 24 frames = 1.00 s).
 * Note : pendant qu'un pied est à plat au sol (contact -> down -> passing -> up),
 * son dx recule exactement de 16.0 px par dessin pour garantir ZÉRO glissement sur les pavés !
 */
export const WALK_CYCLE_12_POSES: WalkPhaseTemplate[] = [
  // d = 0 : KEY - Contact Gauche (Talon gauche touche à +48 px, orteils droits quittent à -48 px)
  {
    phaseIndex: 0,
    role: 'KEY',
    phaseName: 'Contact Gauche (Clé)',
    pelvisDy: 0,
    torsoLeanDeg: 6.8,
    headBobDy: -1.5,
    shawlLagDy: -4.0,
    shawlTipWave: -0.6,
    skirtSwish: 0.75,
    apronRibbonWave: -0.5,
    leftFoot: { dx: 48.0, liftY: 0, angleDeg: 18, toeBendDeg: 0, contactState: 'heel-strike' },
    rightFoot: { dx: -48.0, liftY: -2, angleDeg: -24, toeBendDeg: 18, contactState: 'toe-off' },
    leftKneeDx: 30,
    leftKneeDy: -2,
    rightKneeDx: -18,
    rightKneeDy: 6,
    rightHandDx: 64,
    rightHandDy: 4,
    caneTipDx: 98,
    caneTipLiftY: 0,
    leftHandDx: -22,
    leftHandDy: 4,
    basketTiltDeg: -5,
  },
  // d = 1 : INB - Amorti Gauche (Pied gauche se pose à plat à +32.0 px)
  {
    phaseIndex: 1,
    role: 'INB',
    phaseName: 'Amorti Gauche (Intervalle)',
    pelvisDy: 7,
    torsoLeanDeg: 7.4,
    headBobDy: 2.5,
    shawlLagDy: -1.0,
    shawlTipWave: -0.2,
    skirtSwish: 0.52,
    apronRibbonWave: -0.1,
    leftFoot: { dx: 32.0, liftY: 0, angleDeg: 0, toeBendDeg: 0, contactState: 'flat-foot' },
    rightFoot: { dx: -38.0, liftY: -20, angleDeg: -28, toeBendDeg: 12, contactState: 'swing' },
    leftKneeDx: 26,
    leftKneeDy: 8,
    rightKneeDx: -6,
    rightKneeDy: 2,
    rightHandDx: 54,
    rightHandDy: 8,
    caneTipDx: 82,
    caneTipLiftY: 0,
    leftHandDx: -12,
    leftHandDy: 7,
    basketTiltDeg: -3,
  },
  // d = 2 : BRK - Pose Basse / Down Gauche (Pied gauche à +16.0 px, flexion maximale d'appui)
  {
    phaseIndex: 2,
    role: 'BRK',
    phaseName: 'Pose Basse Gauche (Breakdown Down)',
    pelvisDy: 11,
    torsoLeanDeg: 7.8,
    headBobDy: 8.5,
    shawlLagDy: 6.5,
    shawlTipWave: 0.45,
    skirtSwish: 0.2,
    apronRibbonWave: 0.55,
    leftFoot: { dx: 16.0, liftY: 0, angleDeg: 0, toeBendDeg: 0, contactState: 'flat-foot' },
    rightFoot: { dx: -18.0, liftY: -36, angleDeg: -18, toeBendDeg: 6, contactState: 'swing' },
    leftKneeDx: 18,
    leftKneeDy: 12,
    rightKneeDx: 14,
    rightKneeDy: -10,
    rightHandDx: 44,
    rightHandDy: 10,
    caneTipDx: 66,
    caneTipLiftY: 0,
    leftHandDx: -2,
    leftHandDy: 9,
    basketTiltDeg: 0,
  },
  // d = 3 : BRK - Passage / Passing Droit (Pied gauche sous le bassin à 0.0 px, jambe droite croise)
  {
    phaseIndex: 3,
    role: 'BRK',
    phaseName: 'Passage Jambe Droite (Breakdown Passing)',
    pelvisDy: 2,
    torsoLeanDeg: 7.0,
    headBobDy: 5.0,
    shawlLagDy: 9.0,
    shawlTipWave: 0.85,
    skirtSwish: -0.15,
    apronRibbonWave: 0.8,
    leftFoot: { dx: 0.0, liftY: 0, angleDeg: 0, toeBendDeg: 0, contactState: 'flat-foot' },
    rightFoot: { dx: 10.0, liftY: -32, angleDeg: -5, toeBendDeg: 0, contactState: 'swing' },
    leftKneeDx: 8,
    leftKneeDy: 4,
    rightKneeDx: 30,
    rightKneeDy: -16,
    rightHandDx: 34,
    rightHandDy: 6,
    caneTipDx: 50,
    caneTipLiftY: 0,
    leftHandDx: 8,
    leftHandDy: 5,
    basketTiltDeg: 3,
  },
  // d = 4 : BRK - Pose Haute / Up Gauche (Pied gauche à -16.0 px, impulsion douce)
  {
    phaseIndex: 4,
    role: 'BRK',
    phaseName: 'Pose Haute Gauche (Breakdown Up)',
    pelvisDy: -8,
    torsoLeanDeg: 6.2,
    headBobDy: -4.5,
    shawlLagDy: 1.5,
    shawlTipWave: 0.3,
    skirtSwish: -0.5,
    apronRibbonWave: 0.25,
    leftFoot: { dx: -16.0, liftY: 0, angleDeg: -9, toeBendDeg: 8, contactState: 'heel-off' },
    rightFoot: { dx: 30.0, liftY: -18, angleDeg: 10, toeBendDeg: 0, contactState: 'swing' },
    leftKneeDx: -4,
    leftKneeDy: -4,
    rightKneeDx: 36,
    rightKneeDy: -8,
    rightHandDx: 28,
    rightHandDy: -2,
    caneTipDx: 34,
    caneTipLiftY: 0,
    leftHandDx: 18,
    leftHandDy: 0,
    basketTiltDeg: 6,
  },
  // d = 5 : INB - Approche Contact Droit (Pied gauche à -32.0 px, jambe droite s'allonge)
  {
    phaseIndex: 5,
    role: 'INB',
    phaseName: 'Approche Contact Droit (Intervalle)',
    pelvisDy: -3,
    torsoLeanDeg: 6.5,
    headBobDy: -5.5,
    shawlLagDy: -5.5,
    shawlTipWave: -0.35,
    skirtSwish: -0.72,
    apronRibbonWave: -0.3,
    leftFoot: { dx: -32.0, liftY: -1, angleDeg: -17, toeBendDeg: 14, contactState: 'heel-off' },
    rightFoot: { dx: 42.0, liftY: -7, angleDeg: 15, toeBendDeg: 0, contactState: 'swing' },
    leftKneeDx: -10,
    leftKneeDy: 2,
    rightKneeDx: 34,
    rightKneeDy: -4,
    rightHandDx: 26,
    rightHandDy: -4,
    caneTipDx: 26,
    caneTipLiftY: -6,
    leftHandDx: 22,
    leftHandDy: 2,
    basketTiltDeg: 5,
  },
  // d = 6 : KEY - Contact Droit (Talon droit touche à +48 px, orteils gauches quittent à -48 px)
  {
    phaseIndex: 6,
    role: 'KEY',
    phaseName: 'Contact Droit (Clé)',
    pelvisDy: 0,
    torsoLeanDeg: 6.8,
    headBobDy: -1.5,
    shawlLagDy: -4.0,
    shawlTipWave: -0.6,
    skirtSwish: -0.75,
    apronRibbonWave: -0.5,
    leftFoot: { dx: -48.0, liftY: -2, angleDeg: -24, toeBendDeg: 18, contactState: 'toe-off' },
    rightFoot: { dx: 48.0, liftY: 0, angleDeg: 18, toeBendDeg: 0, contactState: 'heel-strike' },
    leftKneeDx: -18,
    leftKneeDy: 6,
    rightKneeDx: 30,
    rightKneeDy: -2,
    rightHandDx: 28,
    rightHandDy: -6,
    caneTipDx: 34,
    caneTipLiftY: -16,
    leftHandDx: 20,
    leftHandDy: 4,
    basketTiltDeg: 4,
  },
  // d = 7 : INB - Amorti Droit (Pied droit à plat à +32.0 px, la canne remonte vers l'avant)
  {
    phaseIndex: 7,
    role: 'INB',
    phaseName: 'Amorti Droit (Intervalle)',
    pelvisDy: 7,
    torsoLeanDeg: 7.4,
    headBobDy: 2.5,
    shawlLagDy: -1.0,
    shawlTipWave: -0.2,
    skirtSwish: -0.52,
    apronRibbonWave: -0.1,
    leftFoot: { dx: -38.0, liftY: -20, angleDeg: -28, toeBendDeg: 12, contactState: 'swing' },
    rightFoot: { dx: 32.0, liftY: 0, angleDeg: 0, toeBendDeg: 0, contactState: 'flat-foot' },
    leftKneeDx: -6,
    leftKneeDy: 2,
    rightKneeDx: 26,
    rightKneeDy: 8,
    rightHandDx: 34,
    rightHandDy: -8,
    caneTipDx: 48,
    caneTipLiftY: -22,
    leftHandDx: 12,
    leftHandDy: 7,
    basketTiltDeg: 2,
  },
  // d = 8 : BRK - Pose Basse / Down Droit (Pied droit à +16.0 px)
  {
    phaseIndex: 8,
    role: 'BRK',
    phaseName: 'Pose Basse Droite (Breakdown Down)',
    pelvisDy: 11,
    torsoLeanDeg: 7.8,
    headBobDy: 8.5,
    shawlLagDy: 6.5,
    shawlTipWave: 0.45,
    skirtSwish: -0.2,
    apronRibbonWave: 0.55,
    leftFoot: { dx: -18.0, liftY: -36, angleDeg: -18, toeBendDeg: 6, contactState: 'swing' },
    rightFoot: { dx: 16.0, liftY: 0, angleDeg: 0, toeBendDeg: 0, contactState: 'flat-foot' },
    leftKneeDx: 14,
    leftKneeDy: -10,
    rightKneeDx: 18,
    rightKneeDy: 12,
    rightHandDx: 42,
    rightHandDy: -6,
    caneTipDx: 64,
    caneTipLiftY: -24,
    leftHandDx: 2,
    leftHandDy: 9,
    basketTiltDeg: 0,
  },
  // d = 9 : BRK - Passage / Passing Gauche (Pied droit à 0.0 px, jambe gauche croise)
  {
    phaseIndex: 9,
    role: 'BRK',
    phaseName: 'Passage Jambe Gauche (Breakdown Passing)',
    pelvisDy: 2,
    torsoLeanDeg: 7.0,
    headBobDy: 5.0,
    shawlLagDy: 9.0,
    shawlTipWave: 0.85,
    skirtSwish: 0.15,
    apronRibbonWave: 0.8,
    leftFoot: { dx: 10.0, liftY: -32, angleDeg: -5, toeBendDeg: 0, contactState: 'swing' },
    rightFoot: { dx: 0.0, liftY: 0, angleDeg: 0, toeBendDeg: 0, contactState: 'flat-foot' },
    leftKneeDx: 30,
    leftKneeDy: -16,
    rightKneeDx: 8,
    rightKneeDy: 4,
    rightHandDx: 50,
    rightHandDy: -4,
    caneTipDx: 78,
    caneTipLiftY: -16,
    leftHandDx: -8,
    leftHandDy: 6,
    basketTiltDeg: -2,
  },
  // d = 10 : BRK - Pose Haute / Up Droit (Pied droit à -16.0 px)
  {
    phaseIndex: 10,
    role: 'BRK',
    phaseName: 'Pose Haute Droite (Breakdown Up)',
    pelvisDy: -8,
    torsoLeanDeg: 6.2,
    headBobDy: -4.5,
    shawlLagDy: 1.5,
    shawlTipWave: 0.3,
    skirtSwish: 0.5,
    apronRibbonWave: 0.25,
    leftFoot: { dx: 30.0, liftY: -18, angleDeg: 10, toeBendDeg: 0, contactState: 'swing' },
    rightFoot: { dx: -16.0, liftY: 0, angleDeg: -9, toeBendDeg: 8, contactState: 'heel-off' },
    leftKneeDx: 36,
    leftKneeDy: -8,
    rightKneeDx: -4,
    rightKneeDy: -4,
    rightHandDx: 56,
    rightHandDy: 0,
    caneTipDx: 88,
    caneTipLiftY: -9,
    leftHandDx: -16,
    leftHandDy: 2,
    basketTiltDeg: -4,
  },
  // d = 11 : INB - Approche Contact Gauche (Pied droit à -32.0 px, canne prête à toucher le sol)
  {
    phaseIndex: 11,
    role: 'INB',
    phaseName: 'Approche Contact Gauche (Intervalle)',
    pelvisDy: -3,
    torsoLeanDeg: 6.5,
    headBobDy: -5.5,
    shawlLagDy: -5.5,
    shawlTipWave: -0.35,
    skirtSwish: 0.72,
    apronRibbonWave: -0.3,
    leftFoot: { dx: 42.0, liftY: -7, angleDeg: 15, toeBendDeg: 0, contactState: 'swing' },
    rightFoot: { dx: -32.0, liftY: -1, angleDeg: -17, toeBendDeg: 14, contactState: 'heel-off' },
    leftKneeDx: 34,
    leftKneeDy: -4,
    rightKneeDx: -10,
    rightKneeDy: 2,
    rightHandDx: 61,
    rightHandDy: 2,
    caneTipDx: 94,
    caneTipLiftY: -3,
    leftHandDx: -19,
    leftHandDy: 3,
    basketTiltDeg: -5,
  },
];

function buildCelSpecifications(): CelSpecification[] {
  const cels: CelSpecification[] = [];

  for (let c = 0; c < TOTAL_CELS; c++) {
    const celNumber = c + 1;
    const celId = `CEL_${String(celNumber).padStart(3, '0')}`;
    const startFrame = c * 2;
    const endFrame = startFrame + 1;
    const timeStartSec = Number((startFrame / FPS).toFixed(3));
    const timeEndSec = Number(((endFrame + 1) / FPS).toFixed(3));

    const cycleNumber = Math.floor(c / 12) + 1; // 1..6
    const phaseIndex = c % 12; // 0..11
    const base = WALK_CYCLE_12_POSES[phaseIndex];

    const act: 1 | 2 | 3 = c < 24 ? 1 : c < 48 ? 2 : 3;
    const actTitle =
      act === 1
        ? 'Acte I — Pas paisible devant la Boulangerie'
        : act === 2
        ? 'Acte II — Salut au Chat Roux & Papillon Doré'
        : 'Acte III — Parfum de Lavande & Rue Ensoleillée';

    // Modulations expressives et jeu d'actrice dessin par dessin
    let headTiltDeg = Math.sin((phaseIndex / 12) * Math.PI * 2) * 1.4;
    let eyeOpen = 1.0;
    let smileIntensity = 0.65;
    let gazeOffsetY = 0;
    let waveHandRaise = 0;
    let waveWristAngleDeg = 0;
    let smellFlowersLean = 0;

    // Clignements naturels des paupières
    if (celNumber === 8 || celNumber === 38) {
      eyeOpen = 0.35;
    } else if (celNumber === 9) {
      eyeOpen = 0.0;
    }

    // Acte II (CEL_025..CEL_038) : Regard vers le chat roux en haut et salut affectueux de la main gauche
    if (celNumber >= 22 && celNumber <= 40) {
      const u =
        celNumber < 26
          ? (celNumber - 22) / 4
          : celNumber <= 34
          ? 1.0
          : 1.0 - (celNumber - 34) / 6;
      headTiltDeg -= u * 6.5; // relève doucement le menton vers le rebord de fenêtre
      gazeOffsetY = -u * 3.2;
      smileIntensity = 0.65 + u * 0.35;
    }

    if (celNumber >= 26 && celNumber <= 35) {
      const wEnv =
        celNumber < 28
          ? (celNumber - 25) / 3
          : celNumber <= 33
          ? 1.0
          : 1.0 - (celNumber - 33) / 3;
      waveHandRaise = Math.max(0, Math.min(1, wEnv));
      // Oscillation douce du poignet pour le petit signe de la main
      waveWristAngleDeg = Math.sin((celNumber - 26) * 1.35) * 18 * waveHandRaise;
    }

    // Acte III (CEL_050..CEL_058) : Respire le parfum du bouquet de lavande les yeux mi-clos
    if (celNumber >= 50 && celNumber <= 58) {
      const sEnv =
        celNumber < 53
          ? (celNumber - 49) / 4
          : celNumber <= 55
          ? 1.0
          : 1.0 - (celNumber - 55) / 4;
      smellFlowersLean = Math.max(0, Math.min(1, sEnv));
      headTiltDeg += smellFlowersLean * 5.8; // incline doucement le visage vers le panier fleuri
      gazeOffsetY = smellFlowersLean * 2.5;
      smileIntensity = 0.72 + smellFlowersLean * 0.28;
      if (celNumber === 52 || celNumber === 56) {
        eyeOpen = 0.35;
      } else if (celNumber >= 53 && celNumber <= 55) {
        eyeOpen = 0.0; // paupières closes de sérénité
      }
    }

    // Cues sonores synchronisés aux poses clés
    let audioCue: string | null = null;
    if (phaseIndex === 0) {
      audioCue = 'Pas Gauche feutré + Appui boisé de la canne';
    } else if (phaseIndex === 6) {
      audioCue =
        celNumber === 31
          ? 'Pas Droit feutré + Note cristalline (Salut au chat)'
          : celNumber === 67
          ? 'Pas Droit feutré + Accord final apaisant'
          : 'Pas Droit feutré sur pavé';
    } else if (celNumber === 11 || celNumber === 59) {
      audioCue = 'Chant matinal du merle';
    } else if (celNumber === 52) {
      audioCue = 'Souffle doux de la brise dans les glycines';
    }

    // Description narrative du dessin
    let description = `${base.phaseName} (Cycle ${cycleNumber})`;
    if (waveHandRaise > 0.2) {
      description += ' — Colette sourit et salue de la main le chat roux sous les glycines';
    } else if (smellFlowersLean > 0.2) {
      description += ' — Colette incline la tête et hume paisiblement son bouquet de lavande';
    } else if (eyeOpen < 0.5) {
      description += ' — Clignement doux des paupières';
    }

    cels.push({
      celNumber,
      celId,
      startFrame,
      endFrame,
      durationFrames: 2,
      timeStartSec,
      timeEndSec,
      act,
      actTitle,
      cycleNumber,
      phaseIndex,
      role: base.role,
      phaseName: base.phaseName,
      description,
      audioCue,
      groundScrollPx: c * STRIDE_PX_PER_CEL,
      pose: {
        ...base,
        leftFoot: { ...base.leftFoot },
        rightFoot: { ...base.rightFoot },
        headTiltDeg,
        eyeOpen,
        smileIntensity,
        gazeOffsetY,
        waveHandRaise,
        waveWristAngleDeg,
        smellFlowersLean,
      },
    });
  }

  return cels;
}

export const ALL_CELS: CelSpecification[] = buildCelSpecifications();

/**
 * Retourne le dessin unique (CelSpecification) correspondant à un numéro de frame (0..143).
 */
export function getCelForFrame(frameIndex: number): CelSpecification {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameIndex)));
  const celIdx = Math.floor(clamped / 2);
  return ALL_CELS[celIdx];
}
