// Personnages dessinés image par image : Mamie Colette, Clara (5 ans) et Léo (7 ans)
// Articulations complètes (cinématique inverse 2-segments), mains à doigts articulés,
// expressions faciales vivantes, cycles de course et balancement des pieds sous les chaises.

import { PALETTE } from './config';
import {
  Point,
  clamp,
  drawHandEllipse,
  drawHandRect,
  drawHandShape,
  drawPencilLine,
  drawPencilPolyline,
  lerp,
} from './pencilEngine';

/**
 * Cinématique inverse analytique à 2 segments (épaule -> coude -> poignet ou hanche -> genou -> cheville)
 */
export function solveTwoBoneIK(
  root: Point,
  target: Point,
  len1: number,
  len2: number,
  bendDir: 1 | -1 = 1
): { joint: Point; end: Point } {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const maxReach = (len1 + len2) * 0.992;
  const minReach = Math.abs(len1 - len2) * 1.05;
  const dist = clamp(Math.hypot(dx, dy), minReach, maxReach);
  const baseAngle = Math.atan2(dy, dx);

  const cosA = clamp((len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist), -1, 1);
  const angleA = Math.acos(cosA);
  const jointAngle = baseAngle + bendDir * angleA;

  const jx = root[0] + Math.cos(jointAngle) * len1;
  const jy = root[1] + Math.sin(jointAngle) * len1;

  const endX = root[0] + (dx / (Math.hypot(dx, dy) || 1)) * dist;
  const endY = root[1] + (dy / (Math.hypot(dx, dy) || 1)) * dist;

  return {
    joint: [jx, jy],
    end: [endX, endY],
  };
}

export type MamieExpression = 'smile' | 'concentrate' | 'tender' | 'calling' | 'proud';
export type HandPose = 'open' | 'pinch' | 'grip' | 'potholder' | 'cup_call' | 'flat';

export interface MamiePose {
  x: number;
  y: number; // Position du bassin / taille (ex: y ≈ 980 derrière la table)
  scale?: number;
  bodyLean?: number; // Inclinaison douce du buste en radians
  headTilt?: number; // Inclinaison de la tête
  headTurn?: number; // -1 (regarde à gauche) .. 0 (face) .. +1 (regarde à droite / vers la porte)
  lookAt?: Point; // Cible du regard
  expression?: MamieExpression;
  mouthOpen?: number; // 0..1 (pour la synchronisation labiale de l'appel en Scène 7)
  sleeveRoll?: number; // 0 (manches longues) -> 1 (manches retroussées aux avant-bras)
  apronAdjust?: number; // 0..1 (pli du tablier en Scène 1)
  flourOnApron?: number; // 0..1 (traces de farine à partir de la Scène 2)
  leftHandTarget: Point;
  rightHandTarget: Point;
  leftElbowDir?: 1 | -1;
  rightElbowDir?: 1 | -1;
  leftHandPose?: HandPose;
  rightHandPose?: HandPose;
  frame: number;
  boilStep: number;
}

/**
 * Dessine le corps, la jupe, le tablier et la tête expressive de Mamie Colette
 * Les bras peuvent être dessinés séparément via drawMamieArms afin d'encadrer proprement le saladier ou le moule !
 */
export function drawMamieTorsoAndHead(ctx: CanvasRenderingContext2D, pose: MamiePose): void {
  const {
    x,
    y,
    scale = 1,
    bodyLean = 0,
    headTilt = 0,
    headTurn = 0,
    lookAt = [x, y - 40],
    expression = 'smile',
    mouthOpen = 0,
    apronAdjust = 0,
    flourOnApron = 0,
    frame,
    boilStep,
  } = pose;

  // Respiration subtile et vivante
  const breath = Math.sin(frame * 0.1) * 2.5;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 1. Jupe vert sauge longue et chaussons posés au sol (y_waist=985 -> sol à +442 = 1427)
  drawHandShape(
    ctx,
    [
      [-64, -10],
      [64, -10],
      [88, 412],
      [-88, 412],
    ],
    {
      fill: PALETTE.skirtSage,
      hatch: true,
      hatchAngle: 1.52,
      hatchSpacing: 12,
      hatchOpacity: 0.18,
      seed: 1001,
      boilStep,
    }
  );
  // Plis dessinés de la jupe
  for (let p = -2; p <= 2; p++) {
    drawPencilLine(ctx, p * 22, 10, p * 29, 408, {
      color: PALETTE.skirtSageDark,
      width: 1.8,
      opacity: 0.55,
      seed: 1005 + p,
      boilStep,
    });
  }

  // Chevilles et petits chaussons bruns souples posés sur le plancher (y = 1427)
  drawHandRect(ctx, -44, 410, 18, 24, {
    fill: PALETTE.skinWarm,
    radius: 3,
    seed: 1006,
    boilStep,
  });
  drawHandRect(ctx, 26, 410, 18, 24, {
    fill: PALETTE.skinWarm,
    radius: 3,
    seed: 1007,
    boilStep,
  });
  drawHandEllipse(ctx, -35, 438, 24, 11, {
    fill: '#6B4832',
    seed: 1008,
    boilStep,
  });
  drawHandEllipse(ctx, 35, 438, 24, 11, {
    fill: '#6B4832',
    seed: 1009,
    boilStep,
  });

  // 2. Buste articulé (Cardigan ocre + Tablier en lin crème)
  ctx.save();
  ctx.rotate(bodyLean);

  const shoulderY = -175 + breath;

  // Cardigan beige-ocre doux
  drawHandShape(
    ctx,
    [
      [-68, shoulderY + 12],
      [-42, shoulderY - 6],
      [42, shoulderY - 6],
      [68, shoulderY + 12],
      [62, 12],
      [-62, 12],
    ],
    {
      fill: PALETTE.cardiganOchre,
      hatch: true,
      hatchAngle: -0.45,
      hatchSpacing: 10,
      hatchOpacity: 0.16,
      seed: 1010,
      boilStep,
    }
  );

  // Col claudine crème sous l'encolure
  drawHandShape(
    ctx,
    [
      [-28, shoulderY - 6],
      [0, shoulderY + 14],
      [-18, shoulderY + 22],
    ],
    { fill: PALETTE.apronCream, seed: 1011, boilStep }
  );
  drawHandShape(
    ctx,
    [
      [28, shoulderY - 6],
      [18, shoulderY + 22],
      [0, shoulderY + 14],
    ],
    { fill: PALETTE.apronCream, seed: 1012, boilStep }
  );

  // Bretelles et bavette du grand tablier en lin crème
  const apronShift = Math.sin(apronAdjust * Math.PI) * 5;
  drawHandShape(
    ctx,
    [
      [-45, shoulderY + 18 + apronShift],
      [45, shoulderY + 18 - apronShift],
      [56, 8],
      [68, 175],
      [-68, 175],
      [-56, 8],
    ],
    {
      fill: PALETTE.apronCream,
      hatch: true,
      hatchAngle: 0.65,
      hatchSpacing: 13,
      hatchOpacity: 0.11,
      seed: 1015,
      boilStep,
    }
  );

  // Bretelles du tablier montant sur les épaules
  drawHandRect(ctx, -38, shoulderY - 4, 14, 28, {
    fill: PALETTE.apronCream,
    radius: 3,
    seed: 1016,
    boilStep,
  });
  drawHandRect(ctx, 24, shoulderY - 4, 14, 28, {
    fill: PALETTE.apronCream,
    radius: 3,
    seed: 1017,
    boilStep,
  });

  // Ceinture nouée à la taille et grande poche ventrale du tablier
  drawHandRect(ctx, -58, -6, 116, 12, {
    fill: PALETTE.apronShade,
    radius: 4,
    seed: 1018,
    boilStep,
  });
  drawHandRect(ctx, -34, 24, 68, 46, {
    fill: PALETTE.apronCream,
    radius: 6,
    seed: 1019,
    boilStep,
  });

  // Traces de farine sur le tablier (Scène 2 -> Scène 10)
  if (flourOnApron > 0.02) {
    drawHandEllipse(ctx, -18, -32, 16, 9, {
      fill: '#FFFFFF',
      fillOpacity: 0.72 * flourOnApron,
      stroke: false,
      seed: 1020,
      boilStep,
    });
    drawHandEllipse(ctx, 22, 36, 19, 10, {
      fill: '#FFFFFF',
      fillOpacity: 0.68 * flourOnApron,
      stroke: false,
      seed: 1021,
      boilStep,
    });
  }

  // 3. Cou et Tête de Mamie Colette
  const neckY = shoulderY - 12;
  drawHandRect(ctx, -13, neckY - 18, 26, 26, {
    fill: PALETTE.skinWarm,
    radius: 6,
    seed: 1025,
    boilStep,
  });

  ctx.save();
  ctx.translate(headTurn * 10, neckY - 62);
  ctx.rotate(headTilt);

  // Chignon rond gris-argenté sur le haut/arrière de la tête + épingle en bois
  const bunX = -headTurn * 18;
  const bunY = -58;
  drawHandEllipse(ctx, bunX, bunY, 34, 30, {
    fill: PALETTE.hairSilver,
    hatch: true,
    hatchOpacity: 0.18,
    seed: 1030,
    boilStep,
  });
  // Épingle à chignon en bois tourné
  drawPencilLine(ctx, bunX - 38, bunY - 8, bunX + 38, bunY + 6, {
    color: PALETTE.woodDark,
    width: 3.4,
    seed: 1031,
    boilStep,
  });
  drawHandEllipse(ctx, bunX - 40, bunY - 9, 5, 5, {
    fill: PALETTE.berryRed,
    seed: 1032,
    boilStep,
  });

  // Couronne de cheveux argentés encadrant les tempes
  drawHandEllipse(ctx, 0, -14, 56, 52, {
    fill: PALETTE.hairSilver,
    seed: 1033,
    boilStep,
  });

  // Oreilles douces
  drawHandEllipse(ctx, -50, 4, 9, 14, {
    fill: PALETTE.skinWarm,
    seed: 1034,
    boilStep,
  });
  drawHandEllipse(ctx, 50, 4, 9, 14, {
    fill: PALETTE.skinWarm,
    seed: 1035,
    boilStep,
  });

  // Visage chaleureux et doux de Mamie
  drawHandEllipse(ctx, 0, 4, 48, 52, {
    fill: PALETTE.skinWarm,
    seed: 1036,
    boilStep,
  });

  // Bandeaux souples de cheveux gris-argenté sur le front
  drawHandShape(
    ctx,
    [
      [-48, -8],
      [-36, -42],
      [0, -48],
      [36, -42],
      [48, -8],
      [22, -24],
      [0, -18],
      [-22, -24],
    ],
    {
      fill: PALETTE.hairSilver,
      hatch: true,
      hatchOpacity: 0.15,
      seed: 1037,
      boilStep,
    }
  );

  // Décalage des traits du visage selon l'orientation de la tête (headTurn)
  const faceX = headTurn * 11;

  // Pommettes rosées bienveillantes
  drawHandEllipse(ctx, faceX - 24, 14, 11, 7, {
    fill: PALETTE.skinBlush,
    fillOpacity: 0.52,
    stroke: false,
    seed: 1038,
    boilStep,
  });
  drawHandEllipse(ctx, faceX + 24, 14, 11, 7, {
    fill: PALETTE.skinBlush,
    fillOpacity: 0.52,
    stroke: false,
    seed: 1039,
    boilStep,
  });

  // Clignement naturel des paupières (toutes les ~3,5 secondes)
  const isBlinking = frame % 86 >= 82 || expression === 'proud';
  const lookDX = clamp((lookAt[0] - x) * 0.015, -3.5, 3.5);
  const lookDY = clamp((lookAt[1] - (y - 240)) * 0.012, -2.5, 3.5);

  // Sourcils doux et expressifs
  const browLift = expression === 'calling' || expression === 'proud' ? -4 : 0;
  drawPencilPolyline(
    ctx,
    [
      [faceX - 28, -14 + browLift],
      [faceX - 18, -18 + browLift],
      [faceX - 9, -14 + browLift],
    ],
    { color: PALETTE.pencilSoft, width: 2.2, seed: 1040, boilStep }
  );
  drawPencilPolyline(
    ctx,
    [
      [faceX + 9, -14 + browLift],
      [faceX + 18, -18 + browLift],
      [faceX + 28, -14 + browLift],
    ],
    { color: PALETTE.pencilSoft, width: 2.2, seed: 1041, boilStep }
  );

  // Yeux derrière les lunettes rondes
  for (const side of [-1, 1]) {
    const ex = faceX + side * 18;
    const ey = -2;
    if (isBlinking) {
      drawPencilPolyline(
        ctx,
        [
          [ex - 7, ey],
          [ex, ey + 3],
          [ex + 7, ey],
        ],
        { color: PALETTE.pencilDark, width: 2.3, seed: 1042 + side, boilStep }
      );
    } else {
      drawHandEllipse(ctx, ex, ey, 6.5, 6.5, {
        fill: '#FFFDF9',
        width: 1.6,
        seed: 1044 + side,
        boilStep,
      });
      ctx.save();
      ctx.fillStyle = PALETTE.pencilDark;
      ctx.beginPath();
      ctx.arc(ex + lookDX, ey + lookDY, 3.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex + lookDX - 1, ey + lookDY - 1, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Lunettes rondes à monture dorée caractéristiques de Mamie
  drawHandEllipse(ctx, faceX - 18, -2, 13, 12, {
    fill: 'rgba(255, 252, 242, 0.18)',
    color: PALETTE.goldGlasses,
    width: 2.4,
    seed: 1047,
    boilStep,
  });
  drawHandEllipse(ctx, faceX + 18, -2, 13, 12, {
    fill: 'rgba(255, 252, 242, 0.18)',
    color: PALETTE.goldGlasses,
    width: 2.4,
    seed: 1048,
    boilStep,
  });
  // Pont des lunettes
  drawPencilLine(ctx, faceX - 5, -3, faceX + 5, -3, {
    color: PALETTE.goldGlasses,
    width: 2.2,
    seed: 1049,
    boilStep,
  });

  // Petit nez doux dessiné au crayon
  drawPencilPolyline(
    ctx,
    [
      [faceX + 1, -1],
      [faceX + 4 + headTurn * 3, 9],
      [faceX - 2, 11],
    ],
    { color: PALETTE.pencilSoft, width: 2.1, seed: 1050, boilStep }
  );

  // Bouche et sourire (ou appel synchronisé en Scène 7)
  const my = 24;
  if (expression === 'calling' || mouthOpen > 0.12) {
    const openH = lerp(4, 13, clamp(mouthOpen, 0.15, 1));
    const openW = lerp(10, 15, clamp(mouthOpen, 0.15, 1));
    drawHandEllipse(ctx, faceX, my + 2, openW, openH, {
      fill: '#A34842',
      color: PALETTE.pencilDark,
      width: 2.2,
      seed: 1051,
      boilStep,
    });
  } else if (expression === 'concentrate') {
    drawPencilPolyline(
      ctx,
      [
        [faceX - 10, my + 2],
        [faceX, my + 4],
        [faceX + 11, my + 1],
      ],
      { color: PALETTE.pencilDark, width: 2.4, seed: 1052, boilStep }
    );
  } else {
    // Sourire tendre et lumineux de grand-mère
    drawPencilPolyline(
      ctx,
      [
        [faceX - 14, my - 1],
        [faceX - 5, my + 6],
        [faceX + 5, my + 6],
        [faceX + 14, my - 1],
      ],
      { color: PALETTE.pencilDark, width: 2.5, seed: 1053, boilStep }
    );
    // Petites fossettes de sourire
    drawPencilLine(ctx, faceX - 16, my - 3, faceX - 14, my + 2, {
      color: PALETTE.pencilLight,
      width: 1.6,
      seed: 1054,
      boilStep,
    });
    drawPencilLine(ctx, faceX + 16, my - 3, faceX + 14, my + 2, {
      color: PALETTE.pencilLight,
      width: 1.6,
      seed: 1055,
      boilStep,
    });
  }

  ctx.restore(); // Fin tête
  ctx.restore(); // Fin buste
  ctx.restore(); // Fin Mamie
}

/**
 * Dessine les deux bras articulés (épaule -> coude -> poignet -> main + doigts) de Mamie
 * Permet de placer les bras et les mains devant le saladier, le fouet, le moule ou le couteau
 */
export function drawMamieArms(
  ctx: CanvasRenderingContext2D,
  pose: MamiePose,
  which: 'both' | 'left' | 'right' = 'both'
): { leftWrist: Point; rightWrist: Point } {
  const {
    x,
    y,
    scale = 1,
    bodyLean = 0,
    sleeveRoll = 1,
    leftHandTarget,
    rightHandTarget,
    leftElbowDir = 1,
    rightElbowDir = -1,
    leftHandPose = 'open',
    rightHandPose = 'open',
    frame,
    boilStep,
  } = pose;

  const breath = Math.sin(frame * 0.1) * 2.5;
  const shoulderY = y + (-162 + breath) * scale;
  const leftShoulder: Point = [
    x - 54 * scale + Math.sin(bodyLean) * 18,
    shoulderY - Math.sin(bodyLean) * 8,
  ];
  const rightShoulder: Point = [
    x + 54 * scale + Math.sin(bodyLean) * 18,
    shoulderY + Math.sin(bodyLean) * 8,
  ];

  const upperLen = 84 * scale;
  const foreLen = 78 * scale;

  const leftIK = solveTwoBoneIK(leftShoulder, leftHandTarget, upperLen, foreLen, leftElbowDir);
  const rightIK = solveTwoBoneIK(rightShoulder, rightHandTarget, upperLen, foreLen, rightElbowDir);

  if (which === 'both' || which === 'left') {
    drawSingleMamieArm(
      ctx,
      leftShoulder,
      leftIK.joint,
      leftIK.end,
      sleeveRoll,
      leftHandPose,
      'left',
      boilStep,
      1100
    );
  }
  if (which === 'both' || which === 'right') {
    drawSingleMamieArm(
      ctx,
      rightShoulder,
      rightIK.joint,
      rightIK.end,
      sleeveRoll,
      rightHandPose,
      'right',
      boilStep,
      1150
    );
  }

  return { leftWrist: leftIK.end, rightWrist: rightIK.end };
}

function drawSingleMamieArm(
  ctx: CanvasRenderingContext2D,
  shoulder: Point,
  elbow: Point,
  wrist: Point,
  sleeveRoll: number,
  handPose: HandPose,
  side: 'left' | 'right',
  boilStep: number,
  seed: number
): void {
  // 1. Haut du bras (manche du cardigan ocre)
  drawThickLimbSegment(ctx, shoulder, elbow, 24, 20, PALETTE.cardiganOchre, seed, boilStep);

  // 2. Avant-bras : manche retroussée progressivement en Scène 1 (sleeveRoll: 0 -> 1)
  const cuffRatio = lerp(0.88, 0.34, clamp(sleeveRoll, 0, 1));
  const cuffPt: Point = [
    lerp(elbow[0], wrist[0], cuffRatio),
    lerp(elbow[1], wrist[1], cuffRatio),
  ];

  // Partie couverte par la manche ocre
  drawThickLimbSegment(ctx, elbow, cuffPt, 20, 18, PALETTE.cardiganOchre, seed + 2, boilStep);

  // Partie avant-bras découverte (peau)
  drawThickLimbSegment(ctx, cuffPt, wrist, 15, 12, PALETTE.skinWarm, seed + 3, boilStep);

  // Revers retroussé de la manche en laine ocre
  const foreAng = Math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0]);
  drawHandEllipse(ctx, cuffPt[0], cuffPt[1], 8, 12, {
    fill: PALETTE.cardiganShade,
    rotation: foreAng,
    seed: seed + 4,
    boilStep,
  });

  // 3. Main et doigts articulés au bout du poignet
  drawArticulatedHand(ctx, wrist, foreAng, handPose, side, boilStep, seed + 10);
}

function drawThickLimbSegment(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  w1: number,
  w2: number,
  fill: string,
  seed: number,
  boilStep: number
): void {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const r1 = w1 * 0.5;
  const r2 = w2 * 0.5;
  drawHandShape(
    ctx,
    [
      [p1[0] + nx * r1, p1[1] + ny * r1],
      [p2[0] + nx * r2, p2[1] + ny * r2],
      [p2[0] - nx * r2, p2[1] - ny * r2],
      [p1[0] - nx * r1, p1[1] - ny * r1],
    ],
    {
      fill,
      hatch: true,
      hatchOpacity: 0.12,
      seed,
      boilStep,
    }
  );
}

function drawArticulatedHand(
  ctx: CanvasRenderingContext2D,
  wrist: Point,
  armAngle: number,
  pose: HandPose,
  side: 'left' | 'right',
  boilStep: number,
  seed: number
): void {
  ctx.save();
  ctx.translate(wrist[0], wrist[1]);
  ctx.rotate(armAngle);

  const flip = side === 'left' ? 1 : -1;

  if (pose === 'potholder') {
    // Manique matelassée à carreaux rouge et crème (Scène 5)
    drawHandShape(
      ctx,
      [
        [-4, -14],
        [24, -16],
        [28, 14],
        [-4, 14],
      ],
      {
        fill: '#F7EFE2',
        hatch: true,
        crossHatch: true,
        hatchSpacing: 6,
        hatchOpacity: 0.32,
        color: PALETTE.berryRed,
        seed,
        boilStep,
      }
    );
    ctx.restore();
    return;
  }

  // Paume de la main
  drawHandEllipse(ctx, 9, 0, 11, 8.5, {
    fill: PALETTE.skinWarm,
    seed,
    boilStep,
  });

  // Pouce articulé
  const thumbOffset = (pose === 'pinch' ? 0.35 : 0.65) * flip;
  drawPencilPolyline(
    ctx,
    [
      [5, -5 * flip],
      [14, (-11 + (pose === 'pinch' ? 4 : 0)) * flip + thumbOffset * 2],
      [19, (-8 + (pose === 'pinch' ? 5 : 0)) * flip + thumbOffset * 2],
    ],
    {
      color: PALETTE.pencilDark,
      width: 4.2,
      seed: seed + 1,
      boilStep,
    }
  );

  // Doigts selon la prise (ouvert, pincement d'œuf/fraise, prise de manche de fouet/couteau)
  const fingerCurl = pose === 'grip' ? 0.55 : pose === 'pinch' ? 0.78 : 1.0;
  for (let f = -1; f <= 1; f++) {
    const fy = f * 4.2;
    const fxEnd = 14 + 10 * fingerCurl;
    drawPencilPolyline(
      ctx,
      [
        [15, fy],
        [fxEnd, fy + (pose === 'grip' ? 3 * flip : 0)],
      ],
      {
        color: PALETTE.pencilDark,
        width: 3.4,
        seed: seed + 2 + f,
        boilStep,
      }
    );
  }

  ctx.restore();
}

// ============================================================================
// LES PETITS-ENFANTS : CLARA (5 ANS) ET LÉO (7 ANS)
// ============================================================================

export interface ChildStandingPose {
  who: 'clara' | 'leo';
  x: number;
  groundY: number; // Niveau du sol où les pieds prennent appui
  scale?: number;
  facing: 'right' | 'left';
  mode: 'run' | 'play_idle' | 'jump' | 'spin' | 'surprised_look';
  cyclePhase: number; // Phase du cycle de course ou de jeu
  jumpOffset?: number;
  armReachTarget?: Point; // Si l'enfant tend les bras vers le ballon
  frame: number;
  boilStep: number;
}

/**
 * Dessine Clara (5 ans) ou Léo (7 ans) debout, en train de courir, sauter ou jouer au jardin (Scènes 4 & 8)
 * Les pieds touchent réellement le sol à chaque foulée !
 */
export function drawChildStandingOrRunning(
  ctx: CanvasRenderingContext2D,
  pose: ChildStandingPose
): void {
  const {
    who,
    x,
    groundY,
    scale = 1,
    facing,
    mode,
    cyclePhase,
    jumpOffset = 0,
    frame,
    boilStep,
  } = pose;

  const isClara = who === 'clara';
  const dir = facing === 'right' ? 1 : -1;
  const childScale = (isClara ? 0.88 : 1.0) * scale;
  const seedBase = isClara ? 2000 : 3000;

  // Calcul cinématique de la foulée et du rebond du bassin
  const isRunning = mode === 'run';
  const bounce = isRunning
    ? Math.abs(Math.sin(cyclePhase)) * 14
    : mode === 'jump'
    ? jumpOffset
    : Math.sin(cyclePhase) * 4;

  const hipY = groundY - 122 * childScale - bounce;
  const hipX = x;
  const torsoLean = isRunning ? dir * 0.18 : mode === 'spin' ? Math.sin(cyclePhase) * 0.12 : 0;

  // Positions des deux pieds avec contact réel au sol pendant l'appui !
  const strideLen = isRunning ? 46 * childScale : 16 * childScale;
  const liftHeight = isRunning ? 28 * childScale : mode === 'jump' ? 22 * childScale : 0;

  const s1 = Math.sin(cyclePhase);
  const c1 = Math.cos(cyclePhase);

  const foot1X = hipX + dir * s1 * strideLen;
  const foot1Y =
    groundY - (mode === 'jump' ? jumpOffset : Math.max(0, c1) * liftHeight);

  const foot2X = hipX - dir * s1 * strideLen;
  const foot2Y =
    groundY - (mode === 'jump' ? jumpOffset : Math.max(0, -c1) * liftHeight);

  const legUpper = 58 * childScale;
  const legLower = 58 * childScale;

  // Le genou plie toujours vers l'avant de la marche (dir)
  const legBack = solveTwoBoneIK([hipX - dir * 6, hipY], [foot2X, foot2Y - 8], legUpper, legLower, dir);
  const legFront = solveTwoBoneIK([hipX + dir * 6, hipY], [foot1X, foot1Y - 8], legUpper, legLower, dir);

  // Ombre au sol sous les pieds
  drawHandEllipse(ctx, x, groundY + 4, 42 * childScale, 10 * childScale, {
    fill: 'rgba(82, 62, 42, 0.16)',
    stroke: false,
    seed: seedBase + 1,
    boilStep,
  });

  // 1. Jambe arrière (cuisse -> genou -> cheville -> chaussette -> chaussure)
  drawChildLegAndShoe(
    ctx,
    [hipX - dir * 6, hipY],
    legBack.joint,
    legBack.end,
    isClara,
    dir,
    childScale,
    boilStep,
    seedBase + 10
  );

  // 2. Bras arrière en balancement opposé à la jambe
  const shoulderY = hipY - 96 * childScale;
  const shoulderX = hipX + Math.sin(torsoLean) * 28;
  const armSwing = isRunning ? -s1 * 38 * childScale : Math.sin(cyclePhase + 1) * 18 * childScale;
  const backHand: Point = [
    shoulderX - dir * armSwing,
    shoulderY + 48 * childScale - (mode === 'jump' ? 65 * childScale : 0),
  ];
  drawChildArm(
    ctx,
    [shoulderX, shoulderY],
    backHand,
    isClara,
    -dir as 1 | -1,
    childScale,
    boilStep,
    seedBase + 30
  );

  // 3. Jambe avant
  drawChildLegAndShoe(
    ctx,
    [hipX + dir * 6, hipY],
    legFront.joint,
    legFront.end,
    isClara,
    dir,
    childScale,
    boilStep,
    seedBase + 20
  );

  // 4. Buste et vêtements (robe rose poudré pour Clara / marinière et short beige pour Léo)
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(torsoLean);
  ctx.scale(childScale, childScale);

  const windFlutter = isRunning ? -dir * 12 : Math.sin(frame * 0.14) * 6;

  if (isClara) {
    // Robe chasuble rose poudré de Clara qui réagit au mouvement
    drawHandShape(
      ctx,
      [
        [-28, -98],
        [28, -98],
        [44 + windFlutter, 12],
        [-44 + windFlutter, 12],
      ],
      {
        fill: PALETTE.claraDressRose,
        hatch: true,
        hatchOpacity: 0.16,
        seed: seedBase + 40,
        boilStep,
      }
    );
    // Col claudine crème
    drawHandEllipse(ctx, 0, -96, 20, 8, {
      fill: PALETTE.claraBlouseCream,
      seed: seedBase + 41,
      boilStep,
    });
  } else {
    // Short en toile beige de Léo
    drawHandShape(
      ctx,
      [
        [-30, -18],
        [30, -18],
        [34, 18],
        [4, 18],
        [0, 4],
        [-4, 18],
        [-34, 18],
      ],
      {
        fill: PALETTE.leoShortsBeige,
        hatch: true,
        hatchOpacity: 0.15,
        seed: seedBase + 42,
        boilStep,
      }
    );
    // T-shirt marinière crème à rayures bleu ardoise
    drawHandShape(
      ctx,
      [
        [-32, -102],
        [32, -102],
        [32 + windFlutter * 0.4, -14],
        [-32 + windFlutter * 0.4, -14],
      ],
      {
        fill: PALETTE.leoShirtCream,
        seed: seedBase + 43,
        boilStep,
      }
    );
    for (let ry = -84; ry <= -28; ry += 18) {
      drawPencilLine(ctx, -29, ry, 29, ry, {
        color: PALETTE.leoStripeBlue,
        width: 4.2,
        seed: seedBase + 50 + ry,
        boilStep,
      });
    }
  }

  // 5. Tête enfantine expressive
  drawChildHead(
    ctx,
    0,
    -142,
    isClara,
    dir,
    mode === 'surprised_look' ? 'excited' : 'joy',
    windFlutter,
    frame,
    boilStep,
    seedBase + 70
  );

  ctx.restore();

  // 6. Bras avant
  const frontHand: Point = [
    shoulderX + dir * (isRunning ? s1 * 42 * childScale : 24 * childScale),
    shoulderY + 42 * childScale - (mode === 'jump' || mode === 'surprised_look' ? 58 * childScale : 0),
  ];
  drawChildArm(
    ctx,
    [shoulderX, shoulderY],
    frontHand,
    isClara,
    -dir as 1 | -1,
    childScale,
    boilStep,
    seedBase + 90
  );
}

function drawChildLegAndShoe(
  ctx: CanvasRenderingContext2D,
  hip: Point,
  knee: Point,
  ankle: Point,
  isClara: boolean,
  dir: 1 | -1,
  scale: number,
  boilStep: number,
  seed: number
): void {
  // Cuisse
  drawThickLimbSegment(
    ctx,
    hip,
    knee,
    18 * scale,
    15 * scale,
    isClara ? PALETTE.skinWarm : PALETTE.leoShortsBeige,
    seed,
    boilStep
  );
  // Mollet (peau)
  const sockTop: Point = [lerp(knee[0], ankle[0], 0.58), lerp(knee[1], ankle[1], 0.58)];
  drawThickLimbSegment(
    ctx,
    knee,
    sockTop,
    14 * scale,
    12 * scale,
    PALETTE.skinWarm,
    seed + 1,
    boilStep
  );
  // Chaussette blanche / crème bien lisible
  drawThickLimbSegment(
    ctx,
    sockTop,
    ankle,
    13 * scale,
    11 * scale,
    isClara ? PALETTE.claraSocksWhite : '#F4ECE0',
    seed + 2,
    boilStep
  );

  // Petite chaussure orientée dans le sens de la marche
  const footCenter: Point = [ankle[0] + dir * 10 * scale, ankle[1] + 4 * scale];
  drawHandEllipse(ctx, footCenter[0], footCenter[1], 17 * scale, 9 * scale, {
    fill: isClara ? PALETTE.claraShoesBrown : PALETTE.leoShoeOchre,
    seed: seed + 3,
    boilStep,
  });
  // Bride Mary Jane pour Clara / lacets crèmes pour Léo
  if (isClara) {
    drawPencilLine(
      ctx,
      ankle[0],
      ankle[1] - 2 * scale,
      ankle[0] + dir * 6 * scale,
      ankle[1] + 6 * scale,
      { color: PALETTE.pencilDark, width: 2.2, seed: seed + 4, boilStep }
    );
  } else {
    drawPencilLine(
      ctx,
      ankle[0] + dir * 4 * scale,
      ankle[1] - 3 * scale,
      ankle[0] + dir * 11 * scale,
      ankle[1] - 1 * scale,
      { color: '#FAF5EB', width: 2.2, seed: seed + 4, boilStep }
    );
  }
}

function drawChildArm(
  ctx: CanvasRenderingContext2D,
  shoulder: Point,
  hand: Point,
  isClara: boolean,
  bendDir: 1 | -1,
  scale: number,
  boilStep: number,
  seed: number
): void {
  const ik = solveTwoBoneIK(shoulder, hand, 42 * scale, 40 * scale, bendDir);
  drawThickLimbSegment(
    ctx,
    shoulder,
    ik.joint,
    14 * scale,
    12 * scale,
    isClara ? PALETTE.claraBlouseCream : PALETTE.leoShirtCream,
    seed,
    boilStep
  );
  drawThickLimbSegment(
    ctx,
    ik.joint,
    ik.end,
    11 * scale,
    9.5 * scale,
    PALETTE.skinWarm,
    seed + 1,
    boilStep
  );
  drawHandEllipse(ctx, ik.end[0], ik.end[1], 7.5 * scale, 6.5 * scale, {
    fill: PALETTE.skinWarm,
    seed: seed + 2,
    boilStep,
  });
}

function drawChildHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  isClara: boolean,
  dir: 1 | -1,
  emotion: 'joy' | 'excited' | 'wonder',
  hairSway: number,
  frame: number,
  boilStep: number,
  seed: number
): void {
  ctx.save();
  ctx.translate(cx, cy);

  if (isClara) {
    // Deux petites couettes brunes de Clara qui rebondissent avec l'inertie !
    const pigtailBounce = Math.sin(frame * 0.22) * 5;
    for (const s of [-1, 1]) {
      const px = s * 38 + hairSway * 0.4;
      const py = 6 + pigtailBounce * s;
      // Ruban ocre
      drawHandEllipse(ctx, s * 32, -2, 6, 6, {
        fill: PALETTE.cardiganOchre,
        seed: seed + 1 + s,
        boilStep,
      });
      // Couette souple
      drawHandEllipse(ctx, px, py, 14, 20, {
        fill: PALETTE.claraHair,
        rotation: s * 0.35 + hairSway * 0.02,
        seed: seed + 3 + s,
        boilStep,
      });
    }
  }

  // Visage rond d'enfant
  drawHandEllipse(ctx, 0, 0, 34, 36, {
    fill: PALETTE.skinWarm,
    seed: seed + 6,
    boilStep,
  });

  // Chevelure supérieure
  if (isClara) {
    drawHandShape(
      ctx,
      [
        [-35, -4],
        [-28, -34],
        [0, -39],
        [28, -34],
        [35, -4],
        [16, -16],
        [0, -14],
        [-16, -16],
      ],
      { fill: PALETTE.claraHair, seed: seed + 7, boilStep }
    );
  } else {
    // Cheveux châtains ébouriffés de Léo avec mèche vive
    drawHandShape(
      ctx,
      [
        [-36, -4],
        [-32, -32],
        [-10 + hairSway * 0.3, -44],
        [12 + hairSway * 0.3, -42],
        [34, -30],
        [36, -4],
        [18, -18],
        [-4, -14],
        [-20, -18],
      ],
      { fill: PALETTE.leoHair, seed: seed + 8, boilStep }
    );
  }

  const faceOffset = dir * 6;
  // Joues rosées
  drawHandEllipse(ctx, faceOffset - 16, 8, 8, 5, {
    fill: PALETTE.skinBlush,
    fillOpacity: 0.58,
    stroke: false,
    seed: seed + 9,
    boilStep,
  });
  drawHandEllipse(ctx, faceOffset + 16, 8, 8, 5, {
    fill: PALETTE.skinBlush,
    fillOpacity: 0.58,
    stroke: false,
    seed: seed + 10,
    boilStep,
  });

  // Yeux pétillants
  const blink = frame % 78 >= 75;
  for (const s of [-1, 1]) {
    const ex = faceOffset + s * 12;
    const ey = -3;
    if (blink) {
      drawPencilLine(ctx, ex - 5, ey, ex + 5, ey, {
        color: PALETTE.pencilDark,
        width: 2.2,
        seed: seed + 12 + s,
        boilStep,
      });
    } else {
      ctx.save();
      ctx.fillStyle = PALETTE.pencilDark;
      ctx.beginPath();
      ctx.arc(ex, ey, emotion === 'excited' ? 4.2 : 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex - 1.2, ey - 1.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Grand sourire enfantin
  if (emotion === 'excited') {
    drawHandEllipse(ctx, faceOffset, 15, 9, 7, {
      fill: '#B84B44',
      seed: seed + 15,
      boilStep,
    });
  } else {
    drawPencilPolyline(
      ctx,
      [
        [faceOffset - 10, 12],
        [faceOffset, 19],
        [faceOffset + 10, 12],
      ],
      { color: PALETTE.pencilDark, width: 2.4, seed: seed + 16, boilStep }
    );
  }

  ctx.restore();
}

// ============================================================================
// SCÈNES 9 & 10 — ENFANTS ASSIS À TABLE AVEC LES PETITS PIEDS QUI BALANCENT
// ============================================================================

export interface ChildSeatedPose {
  who: 'clara' | 'leo';
  chairX: number;
  seatY: number; // ex: 1185 (le sol est à y = 1435, soit 250 px plus bas !)
  facingCenter: 'right' | 'left';
  swingPhase: number; // Phase du balancement joyeux des pieds sous la chaise
  swingAmplitude?: number; // Amplitude en radians (ex: 0.48 rad)
  excitementBounce?: number; // Petit mouvement joyeux sur l'assise
  lookingAtCake?: boolean;
  frame: number;
  boilStep: number;
}

/**
 * DÉTAIL ESSENTIEL DU FILM (Scènes 9 & 10) :
 * Dessine Clara ou Léo assis sur sa chaise en bois :
 * - Leurs jambes sont trop courtes pour toucher le sol (plancher à y = 1435, pieds à y ≈ 1310..1345).
 * - Leurs jambes pendent sous l'assise (y = 1185) et leurs petits pieds se balancent joyeusement
 *   en opposition de phase (jambe gauche avant / jambe droite arrière, puis inversement),
 *   avec flexion des genoux, mouvement des chevilles, chaussettes et petites chaussures bien lisibles
 *   à l'intérieur de la zone de sécurité 9:16 (yMax = 1470).
 */
export function drawChildSeatedUpperBody(
  ctx: CanvasRenderingContext2D,
  pose: ChildSeatedPose
): void {
  const {
    who,
    chairX,
    seatY,
    facingCenter,
    swingPhase,
    excitementBounce = 1,
    frame,
    boilStep,
  } = pose;

  const isClara = who === 'clara';
  const dir = facingCenter === 'right' ? 1 : -1;
  const seedBase = isClara ? 4000 : 5000;
  const scale = isClara ? 0.92 : 1.0;

  // Petit rebond joyeux des épaules synchronisé avec le balancement des pieds
  const happyBob = Math.abs(Math.sin(swingPhase)) * 5 * excitementBounce;
  const hipX = chairX - dir * 8;
  const hipY = seatY - 8 - happyBob;

  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.scale(scale, scale);

  // Légère inclinaison gourmande vers le gâteau au centre de la table
  ctx.rotate(dir * 0.08);

  if (isClara) {
    // Buste de Clara en robe chasuble rose poudré et blouse crème (épaules bien au-dessus de la table)
    drawHandShape(
      ctx,
      [
        [-30, -198],
        [30, -198],
        [38, 6],
        [-38, 6],
      ],
      {
        fill: PALETTE.claraDressRose,
        hatch: true,
        hatchOpacity: 0.16,
        seed: seedBase + 1,
        boilStep,
      }
    );
    drawHandEllipse(ctx, 0, -196, 21, 8, {
      fill: PALETTE.claraBlouseCream,
      seed: seedBase + 2,
      boilStep,
    });
  } else {
    // Buste de Léo en marinière crème et rayures bleu ardoise
    drawHandShape(
      ctx,
      [
        [-33, -206],
        [33, -206],
        [35, 6],
        [-35, 6],
      ],
      {
        fill: PALETTE.leoShirtCream,
        seed: seedBase + 3,
        boilStep,
      }
    );
    for (let ry = -186; ry <= -36; ry += 20) {
      drawPencilLine(ctx, -31, ry, 31, ry, {
        color: PALETTE.leoStripeBlue,
        width: 4.2,
        seed: seedBase + 10 + ry,
        boilStep,
      });
    }
  }

  // Tête tournée avec bonheur vers Mamie et le gâteau (bien visible au-dessus de la table !)
  drawChildHead(
    ctx,
    dir * 6,
    -242,
    isClara,
    dir,
    'joy',
    Math.sin(swingPhase) * 3,
    frame,
    boilStep,
    seedBase + 30
  );

  // Avant-bras et petites mains posées avec impatience sur le rebord de la table
  const handReachX = dir * 52;
  const handReachY = -165 + Math.sin(swingPhase * 2) * 4;
  drawChildArm(
    ctx,
    [dir * 14, -186],
    [handReachX, handReachY],
    isClara,
    dir,
    1.0,
    boilStep,
    seedBase + 50
  );

  ctx.restore();
}

/**
 * Dessine les cuisses, les genoux qui fléchissent et les bas de jambes + petits pieds
 * qui pendent et se balancent joyeusement SOUS la chaise et SOUS la table !
 * Appelé APRÈS le plateau de table pour que rien ne masque les jambes sous l'assise.
 */
export function drawChildSwingingLegsUnderChair(
  ctx: CanvasRenderingContext2D,
  pose: ChildSeatedPose
): void {
  const {
    who,
    chairX,
    seatY,
    facingCenter,
    swingPhase,
    swingAmplitude = 0.48,
    boilStep,
  } = pose;

  const isClara = who === 'clara';
  const dir = facingCenter === 'right' ? 1 : -1;
  const seedBase = isClara ? 4500 : 5500;

  // Les enfants sont trop petits pour toucher le sol (floorY = 1435) :
  // Longueur du tibia calibrée pour que les pieds oscillent autour de y = 1310..1345,
  // soit ~100 px AU-DESSUS du plancher et bien dans la zone sûre (yMax = 1470) !
  const shinLength = isClara ? 104 : 114;

  // Deux genoux posés près du rebord avant de la chaise (décalés de 22 px pour voir clairement les 2 jambes)
  const kneeBack: Point = [chairX + dir * 20, seatY + 8];
  const kneeFront: Point = [chairX + dir * 40, seatY + 10];
  const hipAnchor: Point = [chairX - dir * 14, seatY - 4];

  // Angles de balancement opposés pour la jambe gauche et la jambe droite
  const swing1 = Math.sin(swingPhase) * swingAmplitude;
  const swing2 = Math.sin(swingPhase + Math.PI) * swingAmplitude;

  // Légère flexion naturelle du genou et rebond de la cheville avec retard de phase
  const ankleFlex1 = Math.cos(swingPhase) * 0.25;
  const ankleFlex2 = Math.cos(swingPhase + Math.PI) * 0.25;

  // 1. Cuisse et jambe arrière qui balance
  drawSingleDanglingLeg(
    ctx,
    hipAnchor,
    kneeBack,
    shinLength,
    swing2,
    ankleFlex2,
    isClara,
    dir,
    boilStep,
    seedBase + 10
  );

  // 2. Cuisse et jambe avant qui balance en opposition
  drawSingleDanglingLeg(
    ctx,
    [hipAnchor[0] + dir * 10, hipAnchor[1] + 2],
    kneeFront,
    shinLength,
    swing1,
    ankleFlex1,
    isClara,
    dir,
    boilStep,
    seedBase + 30
  );

  // Petits traits de mouvement crayonnés discrets illustrant la gaieté du balancement des pieds
  const activeFootX = kneeFront[0] + Math.sin(swing1) * (shinLength + 14);
  const activeFootY = kneeFront[1] + Math.cos(swing1) * (shinLength + 10);
  drawPencilPolyline(
    ctx,
    [
      [activeFootX - 18, activeFootY + 14],
      [activeFootX, activeFootY + 20],
      [activeFootX + 18, activeFootY + 13],
    ],
    {
      color: PALETTE.pencilLight,
      width: 1.7,
      opacity: 0.55,
      seed: seedBase + 60,
      boilStep,
    }
  );
}

function drawSingleDanglingLeg(
  ctx: CanvasRenderingContext2D,
  hip: Point,
  knee: Point,
  shinLen: number,
  swingAngle: number,
  ankleFlex: number,
  isClara: boolean,
  dir: 1 | -1,
  boilStep: number,
  seed: number
): void {
  // Cuisse posée sur l'assise de la chaise (jupe rose de Clara ou short beige de Léo)
  drawThickLimbSegment(
    ctx,
    hip,
    knee,
    22,
    18,
    isClara ? PALETTE.claraDressRose : PALETTE.leoShortsBeige,
    seed,
    boilStep
  );

  // Rotule / genou qui fléchit au bord de la chaise
  drawHandEllipse(ctx, knee[0], knee[1], 9, 8, {
    fill: PALETTE.skinWarm,
    seed: seed + 1,
    boilStep,
  });

  // Cheville au bout du tibia qui pend et oscille sous la chaise
  const ankleX = knee[0] + Math.sin(swingAngle) * shinLen;
  const ankleY = knee[1] + Math.cos(swingAngle) * shinLen;
  const ankle: Point = [ankleX, ankleY];

  // Haut du mollet (peau)
  const sockTop: Point = [lerp(knee[0], ankle[0], 0.52), lerp(knee[1], ankle[1], 0.52)];
  drawThickLimbSegment(ctx, knee, sockTop, 16, 13.5, PALETTE.skinWarm, seed + 2, boilStep);

  // Chaussette blanche à revers (Clara) ou chaussette crème (Léo)
  drawThickLimbSegment(
    ctx,
    sockTop,
    ankle,
    15,
    12.5,
    isClara ? PALETTE.claraSocksWhite : '#F5EDE0',
    seed + 3,
    boilStep
  );
  // Petit revers de chaussette bien visible
  drawHandEllipse(ctx, sockTop[0], sockTop[1], 8.5, 4.5, {
    fill: isClara ? '#FFFFFF' : '#E8DEC8',
    rotation: -swingAngle,
    seed: seed + 4,
    boilStep,
  });

  // Petit pied chaussé qui oscille avec sa cheville
  ctx.save();
  ctx.translate(ankleX, ankleY);
  ctx.rotate(-swingAngle * 0.85 + ankleFlex * 0.4);

  const shoeCenterX = dir * 11;
  const shoeCenterY = 5;
  drawHandEllipse(ctx, shoeCenterX, shoeCenterY, 19, 10, {
    fill: isClara ? PALETTE.claraShoesBrown : PALETTE.leoShoeOchre,
    seed: seed + 5,
    boilStep,
  });
  // Semelle claire et bride / lacets
  drawPencilLine(ctx, shoeCenterX - 16, shoeCenterY + 7, shoeCenterX + 16, shoeCenterY + 7, {
    color: PALETTE.pencilDark,
    width: 2.3,
    seed: seed + 6,
    boilStep,
  });
  if (isClara) {
    // Bride Mary Jane brune + petit bouton
    drawPencilLine(ctx, 0, -2, dir * 5, 7, {
      color: PALETTE.pencilDark,
      width: 2.4,
      seed: seed + 7,
      boilStep,
    });
  } else {
    // Lacets crèmes sur la basket ocre de Léo
    drawPencilLine(ctx, dir * 4, -3, dir * 12, 0, {
      color: '#FFFDF8',
      width: 2.4,
      seed: seed + 8,
      boilStep,
    });
  }

  ctx.restore();
}
