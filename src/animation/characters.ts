import { PALETTE } from './config';
import {
  Point2D,
  UnifiedLimbGeometry,
  drawHandColoredPolygon,
  drawPencilPolyline,
  drawUnifiedLimb,
  lerp,
  sampleEllipseArc,
  solveTwoBoneIK,
} from './pencilEngine';

/**
 * Dessine une main attachée de façon 100 % continue au bout de l'avant-bras (`limbGeom`),
 * SANS trait de séparation au poignet ni espace blanc.
 * Supporte un doigt pointé (ex: Léo qui goûte le gâteau ou Clara qui montre Léo),
 * une main ouverte, une prise sur un objet ou un gant de cuisine.
 */
export function drawSeamlessHand(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  limbGeom: UnifiedLimbGeometry,
  tag: string,
  opts: {
    scale?: number;
    skinColor?: string;
    mode?: 'grip' | 'open' | 'point' | 'cup-mouth' | 'mitt';
    pointTarget?: Point2D | null;
    hasCreamDab?: boolean;
  } = {}
): Point2D {
  const {
    scale = 1,
    skinColor = PALETTE.skinWarm,
    mode = 'grip',
    pointTarget = null,
    hasCreamDab = false,
  } = opts;

  const wristCenter = limbGeom.endCenter;
  const wristOut = limbGeom.outerEdge[limbGeom.outerEdge.length - 1];
  const wristIn = limbGeom.innerEdge[limbGeom.innerEdge.length - 1];

  const dir = pointTarget
    ? Math.atan2(pointTarget[1] - wristCenter[1], pointTarget[0] - wristCenter[0])
    : limbGeom.endDir;

  const ux = Math.cos(dir);
  const uy = Math.sin(dir);
  const nx = -uy;
  const ny = ux;

  const localPt = (along: number, perp: number): Point2D => [
    wristCenter[0] + (ux * along + nx * perp) * scale,
    wristCenter[1] + (uy * along + ny * perp) * scale,
  ];

  // Si Mamie porte une manique / gant de four (sortie du gâteau chaud)
  if (mode === 'mitt') {
    const mittContour: Point2D[] = [
      wristOut,
      localPt(12, -16),
      localPt(28, -14),
      localPt(34, -2),
      localPt(28, 13),
      localPt(14, 15),
      wristIn,
    ];
    const mittFillPoly: Point2D[] = [localPt(-5, -10), ...mittContour, localPt(-5, 10)];
    drawHandColoredPolygon(ctx, mittFillPoly, frameIndex, `${tag}:mitt-fill`, {
      fillColor: PALETTE.bunRibbon,
      hatchColor: '#9E422B',
      hatchAlpha: 0.28,
      strokeOutline: false,
      occludePaper: true,
    });
    // Contour ouvert depuis les bords du poignet (aucun trait coupant le poignet)
    drawPencilPolyline(ctx, mittContour, frameIndex, `${tag}:mitt-outline`, {
      color: PALETTE.graphiteDark,
      width: 3.4 * Math.max(0.75, scale),
      closed: false,
    });
    return localPt(24, 0);
  }

  // Mode avec l'index tendu (Léo qui trempe le doigt dans le glaçage du gâteau !)
  if (mode === 'point') {
    const tipPt: Point2D = pointTarget ? pointTarget : localPt(34, -3);
    const handOpenContour: Point2D[] = [
      wristOut,
      localPt(10, -13), // pouce relevé
      localPt(17, -9),
      localPt(14, -5),
      [lerp(wristCenter[0], tipPt[0], 0.65) + nx * (-4 * scale), lerp(wristCenter[1], tipPt[1], 0.65) + ny * (-4 * scale)],
      tipPt, // bout de l'index
      [lerp(wristCenter[0], tipPt[0], 0.65) + nx * (4 * scale), lerp(wristCenter[1], tipPt[1], 0.65) + ny * (4 * scale)],
      localPt(19, 6), // autres doigts repliés
      localPt(16, 12),
      localPt(8, 12),
      wristIn,
    ];
    const fillPoly: Point2D[] = [localPt(-6, -8), ...handOpenContour, localPt(-6, 8)];
    drawHandColoredPolygon(ctx, fillPoly, frameIndex, `${tag}:point-hand-fill`, {
      fillColor: skinColor,
      hatchColor: PALETTE.skinShadow,
      hatchAlpha: 0.16,
      strokeOutline: false,
      occludePaper: false,
    });
    drawPencilPolyline(ctx, handOpenContour, frameIndex, `${tag}:point-hand-stroke`, {
      color: PALETTE.graphiteDark,
      width: 3.3 * Math.max(0.75, scale),
      closed: false,
    });

    // Petite touche de crème chantilly au bout du doigt de Léo !
    if (hasCreamDab) {
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(tipPt[0], tipPt[1], 6.5 * scale, 5.5 * scale, 0, Math.PI * 2, 10),
        frameIndex,
        `${tag}:finger-cream-dab`,
        {
          fillColor: PALETTE.cakeIcing,
          strokeWidth: 2.2,
          colorOffsetScale: 1.5,
        }
      );
    }
    return tipPt;
  }

  // Main ouverte ou en prise naturelle, reliée directement aux bords du poignet (sans trait au poignet)
  const spread = mode === 'open' || mode === 'cup-mouth' ? 1.2 : 0.95;
  const handContour: Point2D[] = [
    wristOut,
    localPt(9, -13 * spread), // pouce
    localPt(19, -14 * spread),
    localPt(16, -7 * spread),
    localPt(26 * spread, -6 * spread), // index
    localPt(28 * spread, 1), // majeur
    localPt(24 * spread, 8 * spread), // annulaire/auriculaire
    localPt(12, 11 * spread),
    wristIn,
  ];
  const handFillPoly: Point2D[] = [localPt(-6, -8), ...handContour, localPt(-6, 8)];

  drawHandColoredPolygon(ctx, handFillPoly, frameIndex, `${tag}:hand-fill`, {
    fillColor: skinColor,
    hatchColor: PALETTE.skinShadow,
    hatchAlpha: 0.16,
    strokeOutline: false,
    occludePaper: false,
  });

  // Contour continu partant de wristOut et revenant à wristIn (zéro ligne traversante au poignet)
  drawPencilPolyline(ctx, handContour, frameIndex, `${tag}:hand-outline`, {
    color: PALETTE.graphiteDark,
    width: 3.4 * Math.max(0.75, scale),
    closed: false,
  });

  return localPt(16, 0);
}

/**
 * Dessine une chaussure / chausson relié continuellement à la cheville (sans espace blanc).
 */
function drawSeamlessShoe(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  ankle: Point2D,
  toeDirFacing: number, // +1 droite, -1 gauche
  footAngleRad: number,
  shoeColor: string,
  soleColor: string,
  scale: number,
  tag: string
): void {
  const cosA = Math.cos(footAngleRad);
  const sinA = Math.sin(footAngleRad);
  const pt = (lx: number, ly: number): Point2D => {
    const fx = lx * toeDirFacing * scale;
    const fy = ly * scale;
    return [ankle[0] + fx * cosA - fy * sinA, ankle[1] + fx * sinA + fy * cosA];
  };

  const shoePoly: Point2D[] = [
    pt(-13, -6),
    pt(14, -8),
    pt(34, 1),
    pt(36, 12),
    pt(-14, 13),
  ];

  drawHandColoredPolygon(ctx, shoePoly, frameIndex, `${tag}:shoe`, {
    fillColor: shoeColor,
    hatchColor: soleColor,
    hatchAlpha: 0.24,
    strokeWidth: 3.4 * Math.max(0.75, scale),
  });

  // Semelle fine
  drawPencilPolyline(
    ctx,
    [pt(-14, 11), pt(35, 11)],
    frameIndex,
    `${tag}:sole-line`,
    {
      color: soleColor,
      width: 2.5 * Math.max(0.75, scale),
      doublePass: false,
    }
  );
}

export interface MamiePoseConfig {
  footCenter: Point2D; // Position au sol entre les deux pieds (ex: [755, 1565])
  facing: number; // -1 = regarde vers la gauche (table/jardin), +1 = regarde vers la droite (four/comptoir)
  bodyLeanRad?: number;
  headPitchRad?: number;
  leftHandTarget: Point2D;
  rightHandTarget: Point2D;
  leftHandMode?: 'grip' | 'open' | 'cup-mouth' | 'mitt';
  rightHandMode?: 'grip' | 'open' | 'cup-mouth' | 'mitt';
  expression?: 'smile' | 'concentrated' | 'calling' | 'joyful';
  stepPhase?: number; // 0 = stable, sinon cycle de pas doux
}

/**
 * Dessine Mamie Colette en pied avec :
 * - Bras + avant-bras + mains 100 % unifiés (aucun trait interne au coude ni au poignet)
 * - Tête + chignon argenté sans AUCUN trait de crâne sous les cheveux
 * - Lunettes rondes, tablier crème par-dessus la robe bleu ardoise, chaussons bordeaux.
 */
export function drawMamieColette(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  pose: MamiePoseConfig
): { leftPalm: Point2D; rightPalm: Point2D; headCenter: Point2D } {
  const {
    footCenter,
    facing,
    bodyLeanRad = 0,
    headPitchRad = 0,
    leftHandTarget,
    rightHandTarget,
    leftHandMode = 'grip',
    rightHandMode = 'grip',
    expression = 'smile',
    stepPhase = 0,
  } = pose;

  const f = facing >= 0 ? 1 : -1;
  const baseX = footCenter[0];
  const groundY = footCenter[1];
  const bobY = Math.abs(Math.sin(stepPhase)) * 6;

  // Positions anatomiques de référence (hauteur totale ~ 840 px)
  const pelvis: Point2D = [baseX, groundY - 340 - bobY];
  const chest: Point2D = [
    pelvis[0] + Math.sin(bodyLeanRad) * 185,
    pelvis[1] - Math.cos(bodyLeanRad) * 185,
  ];
  const neckBase: Point2D = [
    chest[0] + Math.sin(bodyLeanRad) * 62,
    chest[1] - Math.cos(bodyLeanRad) * 62,
  ];
  const headCenter: Point2D = [
    neckBase[0] + f * 6,
    neckBase[1] - 66,
  ];

  // Épaules et hanches
  const backShoulder: Point2D = [chest[0] - f * 32, chest[1] - 26];
  const frontShoulder: Point2D = [chest[0] + f * 26, chest[1] - 22];

  const upperArmLen = 116;
  const foreArmLen = 112;

  // Pôles anatomiques des coudes : toujours vers le bas et légèrement vers l'arrière du buste
  const backElbowPole: Point2D = [backShoulder[0] - f * 75, backShoulder[1] + 135];
  const frontElbowPole: Point2D = [frontShoulder[0] - f * 85, frontShoulder[1] + 140];

  // Associe main gauche / main droite au bras arrière / bras avant selon l'orientation `facing`
  const backHandTarget = f === -1 ? rightHandTarget : leftHandTarget;
  const frontHandTarget = f === -1 ? leftHandTarget : rightHandTarget;
  const backHandMode = f === -1 ? rightHandMode : leftHandMode;
  const frontHandMode = f === -1 ? leftHandMode : rightHandMode;

  const backIK = solveTwoBoneIK(backShoulder, backHandTarget, upperArmLen, foreArmLen, backElbowPole);
  const frontIK = solveTwoBoneIK(frontShoulder, frontHandTarget, upperArmLen, foreArmLen, frontElbowPole);

  // 1. Ombre portée au sol sous Mamie
  const shadowPts = sampleEllipseArc(baseX, groundY + 12, 82, 20, 0, Math.PI * 2, 18);
  ctx.save();
  ctx.fillStyle = 'rgba(78, 58, 38, 0.16)';
  ctx.beginPath();
  shadowPts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Jambes inférieures et chaussons bordeaux sous l'ourlet de la robe
  const stepSwing = Math.sin(stepPhase) * 18;
  const backAnkle: Point2D = [baseX - f * 22 - stepSwing, groundY - 12];
  const frontAnkle: Point2D = [baseX + f * 20 + stepSwing, groundY - 8];

  drawUnifiedLimb(
    ctx,
    [backAnkle[0], groundY - 135],
    [backAnkle[0], groundY - 70],
    backAnkle,
    30,
    26,
    22,
    frameIndex,
    'mamie-back-ankle',
    { skinColor: PALETTE.skinShadow, strokeWidth: 3.4 }
  );
  drawSeamlessShoe(
    ctx,
    frameIndex,
    backAnkle,
    f,
    0,
    PALETTE.slippersBurgundy,
    '#5C2824',
    1.05,
    'mamie-back-slipper'
  );

  drawUnifiedLimb(
    ctx,
    [frontAnkle[0], groundY - 135],
    [frontAnkle[0], groundY - 70],
    frontAnkle,
    30,
    26,
    22,
    frameIndex,
    'mamie-front-ankle',
    { skinColor: PALETTE.skinWarm, strokeWidth: 3.4 }
  );
  drawSeamlessShoe(
    ctx,
    frameIndex,
    frontAnkle,
    f,
    0,
    PALETTE.slippersBurgundy,
    '#5C2824',
    1.05,
    'mamie-front-slipper'
  );

  // 3. BRAS ARRIÈRE UNIFIÉ (derrière le buste) : épaule -> coude -> poignet -> main sans aucun trait interne
  const backArmGeom = drawUnifiedLimb(
    ctx,
    backShoulder,
    backIK.mid,
    backIK.end,
    44,
    37,
    27,
    frameIndex,
    'mamie-back-arm',
    {
      skinColor: PALETTE.skinShadow,
      garmentColor: PALETTE.mamieDressShade,
      garmentSplitRatio: 0.56,
      cuffColor: '#7A96B0',
      strokeWidth: 3.8,
    }
  );
  const backPalm = drawSeamlessHand(ctx, frameIndex, backArmGeom, 'mamie-back-hand', {
    scale: 1.0,
    skinColor: PALETTE.skinShadow,
    mode: backHandMode,
  });

  // 4. ROBE BLEU ARDOISE CONTINUE (buste + jupe trapèze en une seule silhouette continue)
  const skirtBottomY = groundY - 96 - bobY * 0.5;
  const dressPoly: Point2D[] = [
    [neckBase[0] - 28, neckBase[1] + 6],
    [neckBase[0] + 28, neckBase[1] + 6],
    [chest[0] + 54, chest[1] + 15],
    [pelvis[0] + 66, pelvis[1] + 10],
    [baseX + 94, skirtBottomY],
    [baseX - 94, skirtBottomY],
    [pelvis[0] - 66, pelvis[1] + 10],
    [chest[0] - 54, chest[1] + 15],
  ];
  drawHandColoredPolygon(ctx, dressPoly, frameIndex, 'mamie-dress-body', {
    fillColor: PALETTE.mamieDress,
    hatchColor: PALETTE.mamieDressShade,
    hatchAlpha: 0.24,
    hatchSpacing: 13,
    strokeWidth: 4.0,
  });

  // 5. TABLIER CRÈME DE PÂTISSIÈRE (bavette + jupe du tablier unifiées, sans coupure à la taille)
  const apronPoly: Point2D[] = [
    [chest[0] + f * 10 - 24, chest[1] - 12],
    [chest[0] + f * 10 + 28, chest[1] - 12],
    [pelvis[0] + f * 12 + 54, pelvis[1] + 8],
    [baseX + f * 12 + 72, skirtBottomY - 22],
    [baseX + f * 12 - 64, skirtBottomY - 22],
    [pelvis[0] + f * 12 - 48, pelvis[1] + 8],
  ];
  drawHandColoredPolygon(ctx, apronPoly, frameIndex, 'mamie-apron-unified', {
    fillColor: PALETTE.apronCream,
    hatchColor: PALETTE.apronShade,
    hatchAlpha: 0.2,
    strokeWidth: 3.6,
  });

  // Cordon du tablier autour du cou et poche avant
  drawPencilPolyline(
    ctx,
    [
      [chest[0] + f * 10 - 18, chest[1] - 12],
      [neckBase[0] - f * 8, neckBase[1] + 8],
    ],
    frameIndex,
    'mamie-apron-neck-strap',
    { width: 3.2 }
  );
  // Noeud du tablier dans le dos
  const bowX = pelvis[0] - f * 58;
  const bowY = pelvis[1] + 6;
  drawPencilPolyline(
    ctx,
    [
      [bowX, bowY],
      [bowX - f * 24, bowY + 34],
      [bowX - f * 12, bowY + 56],
    ],
    frameIndex,
    'mamie-apron-tie',
    { width: 3.2 }
  );

  // 6. COU ET TÊTE DE MAMIE (SANS AUCUN TRAIT DE CRÂNE SOUS LES CHEVEUX !)
  // Cou continu (rempli peau, tracé uniquement sur les 2 bords verticaux)
  const neckPoly: Point2D[] = [
    [neckBase[0] - 17, neckBase[1] - 28],
    [neckBase[0] + 17, neckBase[1] - 28],
    [neckBase[0] + 20, neckBase[1] + 14],
    [neckBase[0] - 20, neckBase[1] + 14],
  ];
  drawHandColoredPolygon(ctx, neckPoly, frameIndex, 'mamie-neck', {
    fillColor: PALETTE.skinWarm,
    strokeOutline: false,
    occludePaper: true,
  });
  drawPencilPolyline(
    ctx,
    [
      [neckBase[0] - 17, neckBase[1] - 20],
      [neckBase[0] - 19, neckBase[1] + 10],
    ],
    frameIndex,
    'mamie-neck-left',
    { width: 3.4 }
  );
  drawPencilPolyline(
    ctx,
    [
      [neckBase[0] + 17, neckBase[1] - 20],
      [neckBase[0] + 19, neckBase[1] + 10],
    ],
    frameIndex,
    'mamie-neck-right',
    { width: 3.4 }
  );

  // Col claudine blanc à la base du cou
  drawHandColoredPolygon(
    ctx,
    [
      [neckBase[0] - 28, neckBase[1] + 6],
      [neckBase[0], neckBase[1] + 18],
      [neckBase[0] + 28, neckBase[1] + 6],
      [neckBase[0] + 18, neckBase[1] + 22],
      [neckBase[0] - 18, neckBase[1] + 22],
    ],
    frameIndex,
    'mamie-collar',
    {
      fillColor: PALETTE.apronCream,
      strokeWidth: 3.0,
    }
  );

  const hx = headCenter[0];
  const hy = headCenter[1];
  const headRx = 50;
  const headRy = 56;

  // Remplissage du visage (sans tracer le contour supérieur du crâne sous les cheveux !)
  const fullHeadEllipse = sampleEllipseArc(hx, hy, headRx, headRy, 0, Math.PI * 2, 28, headPitchRad);
  drawHandColoredPolygon(ctx, fullHeadEllipse, frameIndex, 'mamie-face-fill', {
    fillColor: PALETTE.skinWarm,
    hatchColor: PALETTE.skinShadow,
    hatchAlpha: 0.14,
    strokeOutline: false, // IMPORTANT : pas de contour complet pour ne laisser aucun trait sous les cheveux
    occludePaper: true,
  });

  // Contour graphite UNIQUEMENT sur l'arc inférieur du visage (tempe droite -> menton -> tempe gauche)
  const jawArc = sampleEllipseArc(
    hx,
    hy,
    headRx,
    headRy,
    0.06 * Math.PI,
    0.94 * Math.PI,
    20,
    headPitchRad
  );
  drawPencilPolyline(ctx, jawArc, frameIndex, 'mamie-jawline-only', {
    color: PALETTE.graphiteDark,
    width: 3.8,
    closed: false,
  });

  // Chevelure argentée et chignon par-dessus le haut de la tête (avec cache papier opaque)
  const bunCenter: Point2D = [hx - f * 38, hy - 48];
  const bunPts = sampleEllipseArc(bunCenter[0], bunCenter[1], 29, 27, 0, Math.PI * 2, 18);
  drawHandColoredPolygon(ctx, bunPts, frameIndex, 'mamie-silver-bun', {
    fillColor: PALETTE.hairSilver,
    hatchColor: PALETTE.hairSilverShade,
    hatchAlpha: 0.28,
    strokeWidth: 3.6,
    occludePaper: true,
  });

  // Ruban terracotta à la base du chignon
  drawPencilPolyline(
    ctx,
    [
      [bunCenter[0] - 12, bunCenter[1] + 18],
      [bunCenter[0] + 18, bunCenter[1] - 12],
    ],
    frameIndex,
    'mamie-bun-ribbon',
    { color: PALETTE.bunRibbon, width: 5.5, doublePass: false }
  );

  // Calotte de cheveux argentés ondulés encadrant le front et les tempes (un seul polygone continu)
  const hairCapPoly: Point2D[] = [
    [hx - headRx * 1.04, hy + 4], // tempe gauche
    [hx - headRx * 1.08, hy - 28],
    [hx - headRx * 0.65, hy - headRy * 1.08],
    [hx, hy - headRy * 1.14],
    [hx + headRx * 0.68, hy - headRy * 1.06],
    [hx + headRx * 1.06, hy - 24],
    [hx + headRx * 1.02, hy + 4], // tempe droite
    // Frange souple sur le front (ondulation douce sans jamais croiser un trait de crâne)
    [hx + headRx * 0.55, hy - 14],
    [hx + f * 6, hy - 22],
    [hx - headRx * 0.55, hy - 12],
  ];
  drawHandColoredPolygon(ctx, hairCapPoly, frameIndex, 'mamie-hair-crown', {
    fillColor: PALETTE.hairSilver,
    hatchColor: PALETTE.hairSilverShade,
    hatchAlpha: 0.28,
    strokeWidth: 3.8,
    occludePaper: true,
  });

  // Mèches de cheveux internes au crayon
  drawPencilPolyline(
    ctx,
    [
      [hx - 28, hy - 34],
      [hx, hy - 44],
      [hx + 28, hy - 32],
    ],
    frameIndex,
    'mamie-hair-strand-1',
    { color: PALETTE.graphiteMid, width: 2.2, doublePass: false }
  );

  // Joues rosées chaleureuses
  const cheekL = sampleEllipseArc(hx + f * 24, hy + 14, 11, 7, 0, Math.PI * 2, 10);
  drawHandColoredPolygon(ctx, cheekL, frameIndex, 'mamie-cheek-front', {
    fillColor: PALETTE.cheeksRose,
    strokeOutline: false,
    occludePaper: false,
    colorOffsetScale: 2.0,
  });

  // Lunettes rondes dorées et yeux expressifs
  const eyeFrontX = hx + f * 21;
  const eyeBackX = hx - f * 5;
  const eyeY = hy + 1;

  for (const [ex, tagEye] of [
    [eyeBackX, 'back'],
    [eyeFrontX, 'front'],
  ] as const) {
    // Monture de lunettes ronde
    const glassPts = sampleEllipseArc(ex, eyeY, 11.5, 10.5, 0, Math.PI * 2, 14);
    drawPencilPolyline(ctx, glassPts, frameIndex, `mamie-glasses-${tagEye}`, {
      color: PALETTE.glassesGold,
      width: 2.6,
      closed: true,
      doublePass: false,
    });
    // Pupille douce
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(ex + f * 2, eyeY, 3.2, 3.6, 0, Math.PI * 2, 8),
      frameIndex,
      `mamie-pupil-${tagEye}`,
      {
        fillColor: PALETTE.graphiteDark,
        strokeOutline: false,
        occludePaper: false,
        colorOffsetScale: 0.5,
      }
    );
    // Sourcil bienveillant
    drawPencilPolyline(
      ctx,
      [
        [ex - 8, eyeY - 14],
        [ex, eyeY - 17],
        [ex + 8, eyeY - 13],
      ],
      frameIndex,
      `mamie-brow-${tagEye}`,
      { width: 2.4, doublePass: false }
    );
  }
  // Pont des lunettes et petit nez doux
  drawPencilPolyline(
    ctx,
    [
      [eyeBackX + f * 9, eyeY - 1],
      [eyeFrontX - f * 9, eyeY - 1],
    ],
    frameIndex,
    'mamie-glasses-bridge',
    { color: PALETTE.glassesGold, width: 2.5, doublePass: false }
  );
  drawPencilPolyline(
    ctx,
    [
      [hx + f * 12, eyeY + 3],
      [hx + f * 21, eyeY + 11],
      [hx + f * 12, eyeY + 14],
    ],
    frameIndex,
    'mamie-nose',
    { width: 2.8, doublePass: false }
  );

  // Bouche selon l'expression (sourire tendre ou appel « À table ! »)
  if (expression === 'calling') {
    const openMouth = sampleEllipseArc(hx + f * 14, hy + 28, 9, 11, 0, Math.PI * 2, 12);
    drawHandColoredPolygon(ctx, openMouth, frameIndex, 'mamie-mouth-calling', {
      fillColor: '#A6463C',
      strokeWidth: 3.0,
    });
    // Petites ondes vocales dessinées au crayon devant Mamie quand elle appelle les enfants
    for (let w = 1; w <= 2; w++) {
      const rWave = 22 + w * 16 + ((frameIndex % 6) * 2);
      const waveArc = sampleEllipseArc(
        hx + f * 34,
        hy + 22,
        rWave,
        rWave,
        f === -1 ? Math.PI * 0.72 : -Math.PI * 0.28,
        f === -1 ? Math.PI * 1.28 : Math.PI * 0.28,
        10
      );
      drawPencilPolyline(ctx, waveArc, frameIndex, `mamie-voice-wave-${w}`, {
        color: PALETTE.bunRibbon,
        width: 2.8,
        doublePass: false,
      });
    }
  } else {
    drawPencilPolyline(
      ctx,
      [
        [hx + f * 2, hy + 26],
        [hx + f * 13, hy + 33],
        [hx + f * 24, hy + 25],
      ],
      frameIndex,
      'mamie-smile',
      { width: 3.1, doublePass: false }
    );
  }

  // 7. BRAS AVANT UNIFIÉ (épaule -> coude -> poignet -> main en une seule silhouette continue !)
  const frontArmGeom = drawUnifiedLimb(
    ctx,
    frontShoulder,
    frontIK.mid,
    frontIK.end,
    46,
    38,
    28,
    frameIndex,
    'mamie-front-arm',
    {
      skinColor: PALETTE.skinWarm,
      garmentColor: PALETTE.mamieDress,
      garmentHatchColor: PALETTE.mamieDressShade,
      garmentSplitRatio: 0.56,
      cuffColor: '#7A96B0',
      strokeWidth: 4.0,
    }
  );
  const frontPalm = drawSeamlessHand(ctx, frameIndex, frontArmGeom, 'mamie-front-hand', {
    scale: 1.04,
    skinColor: PALETTE.skinWarm,
    mode: frontHandMode,
  });

  return {
    leftPalm: f === -1 ? frontPalm : backPalm,
    rightPalm: f === -1 ? backPalm : frontPalm,
    headCenter,
  };
}

export interface ChildCharacterPose {
  character: 'leo' | 'clara';
  mode: 'running' | 'seated';
  pos: Point2D; // Si running : position au sol entre les pieds ; si seated : position sur l'assise de la chaise
  scale?: number;
  facing: number; // +1 vers la droite, -1 vers la gauche
  runCycleRad?: number;
  feetSwingRad?: number; // Angle de balancement des pieds quand assis sur la chaise
  torsoLeanRad?: number;
  leftHandTarget?: Point2D | null;
  rightHandTarget?: Point2D | null;
  leftHandMode?: 'grip' | 'open' | 'point' | 'cup-mouth';
  rightHandMode?: 'grip' | 'open' | 'point' | 'cup-mouth';
  hasCreamOnFinger?: boolean;
  hasCreamOnCheek?: boolean;
  isGiggling?: boolean;
  layerPart?: 'all' | 'lower' | 'upper';
}

/**
 * Dessine Léo ou Clara avec :
 * - Silhouettes de bras et jambes 100 % continues (`drawUnifiedLimb`) sans trait de séparation aux coudes/genoux/poignets
 * - Genoux pliant toujours dans le sens anatomique naturel (vers l'arrière pendant la course et sous la chaise)
 * - En mode `seated`, les cuisses reposent sur l'assise de la chaise et les jambes/pieds pendent et se balancent
 *   librement sous la chaise (`y = 1285 .. 1435`), bien visibles sous la table !
 * - Aucun trait de crâne résiduel sous la chevelure.
 */
export function drawChildCharacter(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  pose: ChildCharacterPose
): { rightFingertip: Point2D; headCenter: Point2D } {
  const {
    character,
    mode,
    pos,
    scale = 1,
    facing,
    runCycleRad = 0,
    feetSwingRad = 0,
    torsoLeanRad = 0,
    leftHandTarget = null,
    rightHandTarget = null,
    leftHandMode = 'open',
    rightHandMode = 'open',
    hasCreamOnFinger = false,
    hasCreamOnCheek = false,
    isGiggling = false,
    layerPart = 'all',
  } = pose;

  const isLeo = character === 'leo';
  const f = facing >= 0 ? 1 : -1;
  const tagPrefix = `${character}-${mode}`;

  // Couleurs propres à Léo ou Clara
  const shirtColor = isLeo ? PALETTE.leoShirtAmber : PALETTE.claraShirtPink;
  const bottomColor = isLeo ? PALETTE.leoShortsBlue : PALETTE.claraDressSage;
  const shoeColor = isLeo ? PALETTE.leoShoesRed : PALETTE.claraShoesYellow;
  const hairColor = isLeo ? PALETTE.leoHair : PALETTE.claraHair;

  // Calcul du bassin et du buste selon que l'enfant court ou est assis sur sa chaise
  const bounceY =
    mode === 'running'
      ? Math.abs(Math.sin(runCycleRad)) * 14 * scale
      : isGiggling
      ? Math.abs(Math.sin(frameIndex * 0.65)) * 4 * scale
      : 0;

  // En mode assis, la taille/bassin supérieur affleure au niveau du plateau de table (y ~ 1198)
  // tandis que les cuisses reposent sur l'assise de la chaise (pos[1] ~ 1286)
  const pelvis: Point2D =
    mode === 'running'
      ? [pos[0], pos[1] - 195 * scale - bounceY]
      : [pos[0], pos[1] - 88 * scale];

  const torsoH = 116 * scale;
  const chest: Point2D = [
    pelvis[0] + Math.sin(torsoLeanRad) * torsoH,
    pelvis[1] - Math.cos(torsoLeanRad) * torsoH - bounceY * 0.3,
  ];
  const neckBase: Point2D = [
    chest[0] + Math.sin(torsoLeanRad) * 32 * scale,
    chest[1] - Math.cos(torsoLeanRad) * 32 * scale,
  ];
  const headCenter: Point2D = [
    neckBase[0] + f * 5 * scale,
    neckBase[1] - 46 * scale,
  ];

  // 1. JAMBES ET PIEDS (AVEC BALANCEMENT SOUS LA CHAISE OU CYCLE DE COURSE ANATOMIQUE)
  if (layerPart !== 'upper') {
    if (mode === 'seated') {
      // En position assise sur la chaise (assise à pos[1] ~ 1286) :
      // Les deux genoux sont au bord avant de la chaise, et les tibias + chaussures pendent
      // et se balancent d'avant en arrière en opposition de phase !
      const leftHip: Point2D = [pos[0] - 20 * scale, pos[1] - 22 * scale];
      const rightHip: Point2D = [pos[0] + 18 * scale, pos[1] - 22 * scale];
      const leftKnee: Point2D = [pos[0] - 22 * scale, pos[1] + 6 * scale];
      const rightKnee: Point2D = [pos[0] + 20 * scale, pos[1] + 6 * scale];

      const shinLen = 112 * scale;
      const swingL = feetSwingRad;
      const swingR = -feetSwingRad;

      const leftAnkle: Point2D = [
        leftKnee[0] + Math.sin(swingL) * shinLen * 0.85,
        leftKnee[1] + Math.cos(swingL) * shinLen,
      ];
      const rightAnkle: Point2D = [
        rightKnee[0] + Math.sin(swingR) * shinLen * 0.85,
        rightKnee[1] + Math.cos(swingR) * shinLen,
      ];

      // Jambe gauche unifiée (cuisse -> genou -> cheville sans trait interne)
      drawUnifiedLimb(
        ctx,
        leftHip,
        leftKnee,
        leftAnkle,
        30 * scale,
        25 * scale,
        19 * scale,
        frameIndex,
        `${tagPrefix}-seated-leg-L`,
        {
          skinColor: PALETTE.skinShadow,
          garmentColor: bottomColor,
          garmentSplitRatio: 0.36,
          cuffColor: '#FFFFFF',
          strokeWidth: 3.5 * Math.max(0.75, scale),
        }
      );
      drawSeamlessShoe(
        ctx,
        frameIndex,
        leftAnkle,
        1,
        swingL * 0.45,
        shoeColor,
        '#4A3528',
        0.86 * scale,
        `${tagPrefix}-shoe-L`
      );

      // Jambe droite unifiée (cuisse -> genou -> cheville sans trait interne)
      drawUnifiedLimb(
        ctx,
        rightHip,
        rightKnee,
        rightAnkle,
        30 * scale,
        25 * scale,
        19 * scale,
        frameIndex,
        `${tagPrefix}-seated-leg-R`,
        {
          skinColor: PALETTE.skinWarm,
          garmentColor: bottomColor,
          garmentSplitRatio: 0.36,
          cuffColor: '#FFFFFF',
          strokeWidth: 3.5 * Math.max(0.75, scale),
        }
      );
      drawSeamlessShoe(
        ctx,
        frameIndex,
        rightAnkle,
        1,
        swingR * 0.45,
        shoeColor,
        '#4A3528',
        0.86 * scale,
        `${tagPrefix}-shoe-R`
      );
    } else {
    // Mode course ('running') avec cinématique inverse anatomique (le genou pointe TOUJOURS vers l'avant `f`)
    const shadowPts = sampleEllipseArc(pos[0], pos[1] + 6 * scale, 48 * scale, 12 * scale, 0, Math.PI * 2, 14);
    ctx.save();
    ctx.fillStyle = 'rgba(65, 82, 42, 0.18)';
    ctx.beginPath();
    shadowPts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const thighLen = 96 * scale;
    const shinLen = 96 * scale;
    const strideX = 56 * scale;
    const liftY = 38 * scale;

    for (const [isFrontLeg, phaseOffset, legSuffix] of [
      [false, Math.PI, 'back'],
      [true, 0, 'front'],
    ] as const) {
      const a = runCycleRad + phaseOffset;
      const hipPt: Point2D = [pelvis[0] + (isFrontLeg ? f * 6 : -f * 6) * scale, pelvis[1]];
      const targetAnkle: Point2D = [
        pos[0] + Math.sin(a) * strideX * f,
        pos[1] - 12 * scale - Math.max(0, -Math.cos(a)) * liftY,
      ];
      // Pôle anatomique du genou : TOUJOURS devant la hanche (`+f * 120`) pour que le tibia plie vers l'arrière !
      const kneePole: Point2D = [hipPt[0] + f * 130 * scale, hipPt[1] + 20 * scale];
      const legIK = solveTwoBoneIK(hipPt, targetAnkle, thighLen, shinLen, kneePole);

      drawUnifiedLimb(
        ctx,
        hipPt,
        legIK.mid,
        legIK.end,
        30 * scale,
        24 * scale,
        18 * scale,
        frameIndex,
        `${tagPrefix}-run-leg-${legSuffix}`,
        {
          skinColor: isFrontLeg ? PALETTE.skinWarm : PALETTE.skinShadow,
          garmentColor: bottomColor,
          garmentSplitRatio: 0.44,
          strokeWidth: 3.4 * Math.max(0.7, scale),
        }
      );
      drawSeamlessShoe(
        ctx,
        frameIndex,
        legIK.end,
        f,
        Math.sin(a) * 0.25,
        shoeColor,
        '#4A3528',
        0.84 * scale,
        `${tagPrefix}-run-shoe-${legSuffix}`
      );
    }
    }
  }

  if (layerPart === 'lower') {
    return { rightFingertip: headCenter, headCenter };
  }

  // Épaules et cibles des mains
  const backShoulder: Point2D = [chest[0] - f * 22 * scale, chest[1] - 10 * scale];
  const frontShoulder: Point2D = [chest[0] + f * 20 * scale, chest[1] - 8 * scale];

  const defaultSwing = mode === 'running' ? Math.sin(runCycleRad) * 42 * scale : 0;
  const resolvedLeftTarget: Point2D =
    leftHandTarget || [
      chest[0] - 32 * scale - defaultSwing,
      chest[1] + 54 * scale,
    ];
  const resolvedRightTarget: Point2D =
    rightHandTarget || [
      chest[0] + 34 * scale + defaultSwing,
      chest[1] + 54 * scale,
    ];

  const uArm = 76 * scale;
  const fArm = 74 * scale;

  const leftElbowPole: Point2D = [backShoulder[0] - 55 * scale, backShoulder[1] + 90 * scale];
  const rightElbowPole: Point2D = [frontShoulder[0] - f * 50 * scale, frontShoulder[1] + 95 * scale];

  const leftIK = solveTwoBoneIK(backShoulder, resolvedLeftTarget, uArm, fArm, leftElbowPole);
  const rightIK = solveTwoBoneIK(frontShoulder, resolvedRightTarget, uArm, fArm, rightElbowPole);

  // 2. BRAS GAUCHE (ARRIÈRE) UNIFIÉ
  const leftArmGeom = drawUnifiedLimb(
    ctx,
    backShoulder,
    leftIK.mid,
    leftIK.end,
    29 * scale,
    24 * scale,
    19 * scale,
    frameIndex,
    `${tagPrefix}-arm-L`,
    {
      skinColor: PALETTE.skinShadow,
      garmentColor: shirtColor,
      garmentSplitRatio: 0.38,
      strokeWidth: 3.4 * Math.max(0.7, scale),
    }
  );
  drawSeamlessHand(ctx, frameIndex, leftArmGeom, `${tagPrefix}-hand-L`, {
    scale: 0.82 * scale,
    skinColor: PALETTE.skinShadow,
    mode: leftHandMode,
  });

  // 3. TORSE CONTINU (T-SHIRT DE LÉO OU ROBE SALOPETTE DE CLARA)
  const torsoPoly: Point2D[] = [
    [neckBase[0] - 20 * scale, neckBase[1] + 4 * scale],
    [neckBase[0] + 20 * scale, neckBase[1] + 4 * scale],
    [chest[0] + 38 * scale, chest[1] + 10 * scale],
    [pelvis[0] + 42 * scale, pelvis[1] + 12 * scale],
    [pelvis[0] - 42 * scale, pelvis[1] + 12 * scale],
    [chest[0] - 38 * scale, chest[1] + 10 * scale],
  ];
  drawHandColoredPolygon(ctx, torsoPoly, frameIndex, `${tagPrefix}-torso`, {
    fillColor: isLeo ? shirtColor : bottomColor,
    hatchColor: isLeo ? '#C47B28' : '#567B5E',
    hatchAlpha: 0.24,
    strokeWidth: 3.6 * Math.max(0.7, scale),
  });

  // Rayures marinière sur le t-shirt de Léo
  if (isLeo) {
    for (const ry of [0.32, 0.56, 0.78]) {
      const sy = lerp(neckBase[1] + 10 * scale, pelvis[1], ry);
      drawPencilPolyline(
        ctx,
        [
          [chest[0] - 32 * scale, sy],
          [chest[0] + 32 * scale, sy],
        ],
        frameIndex,
        `${tagPrefix}-stripe-${ry}`,
        {
          color: PALETTE.leoShirtStripe,
          width: 4.2 * scale,
          doublePass: false,
        }
      );
    }
  } else {
    // Bretelles de la salopette de Clara
    drawPencilPolyline(
      ctx,
      [
        [neckBase[0] - 14 * scale, neckBase[1] + 8 * scale],
        [chest[0] - 16 * scale, chest[1] + 34 * scale],
      ],
      frameIndex,
      `${tagPrefix}-strap-L`,
      { color: PALETTE.graphiteDark, width: 2.8 * scale }
    );
    drawPencilPolyline(
      ctx,
      [
        [neckBase[0] + 14 * scale, neckBase[1] + 8 * scale],
        [chest[0] + 16 * scale, chest[1] + 34 * scale],
      ],
      frameIndex,
      `${tagPrefix}-strap-R`,
      { color: PALETTE.graphiteDark, width: 2.8 * scale }
    );
  }

  // 4. COU, VISAGE ET CHEVELURE (ZÉRO TRAIT DE CRÂNE SOUS LES CHEVEUX !)
  const neckPoly: Point2D[] = [
    [neckBase[0] - 12 * scale, neckBase[1] - 18 * scale],
    [neckBase[0] + 12 * scale, neckBase[1] - 18 * scale],
    [neckBase[0] + 14 * scale, neckBase[1] + 8 * scale],
    [neckBase[0] - 14 * scale, neckBase[1] + 8 * scale],
  ];
  drawHandColoredPolygon(ctx, neckPoly, frameIndex, `${tagPrefix}-neck`, {
    fillColor: PALETTE.skinWarm,
    strokeOutline: false,
    occludePaper: true,
  });

  const hx = headCenter[0];
  const hy = headCenter[1];
  const hrx = 40 * scale;
  const hry = 43 * scale;

  // Remplissage du visage sans contour supérieur
  const headFull = sampleEllipseArc(hx, hy, hrx, hry, 0, Math.PI * 2, 24);
  drawHandColoredPolygon(ctx, headFull, frameIndex, `${tagPrefix}-face-fill`, {
    fillColor: PALETTE.skinWarm,
    hatchColor: PALETTE.skinShadow,
    hatchAlpha: 0.14,
    strokeOutline: false,
    occludePaper: true,
  });

  // Contour graphite UNIQUEMENT sur le bas du visage (tempe -> menton -> tempe)
  const childJawArc = sampleEllipseArc(hx, hy, hrx, hry, 0.07 * Math.PI, 0.93 * Math.PI, 18);
  drawPencilPolyline(ctx, childJawArc, frameIndex, `${tagPrefix}-jawline-only`, {
    color: PALETTE.graphiteDark,
    width: 3.5 * Math.max(0.7, scale),
    closed: false,
  });

  // Chevelure par-dessus la tête (avec cache papier opaque pour qu'aucun trait interne n'existe)
  if (isLeo) {
    const leoHairPoly: Point2D[] = [
      [hx - hrx * 1.04, hy + 2 * scale],
      [hx - hrx * 1.1, hy - 22 * scale],
      [hx - hrx * 0.72, hy - hry * 1.16],
      [hx - 4 * scale, hy - hry * 1.24],
      [hx + hrx * 0.45, hy - hry * 1.18],
      [hx + hrx * 0.95, hy - hry * 0.92],
      [hx + hrx * 1.06, hy - 14 * scale],
      [hx + hrx * 1.0, hy + 2 * scale],
      // Frange ébouriffée sur le front
      [hx + hrx * 0.45, hy - 12 * scale],
      [hx + 4 * scale, hy - 8 * scale],
      [hx - hrx * 0.45, hy - 14 * scale],
    ];
    drawHandColoredPolygon(ctx, leoHairPoly, frameIndex, `${tagPrefix}-leo-hair`, {
      fillColor: hairColor,
      hatchColor: '#482B16',
      hatchAlpha: 0.28,
      strokeWidth: 3.5 * Math.max(0.7, scale),
      occludePaper: true,
    });
  } else {
    // Clara : couettes joyeuses qui rebondissent + calotte de cheveux
    const pigtailBounce = Math.sin(frameIndex * 0.45) * 6 * scale;
    for (const side of [-1, 1]) {
      const px = hx + side * (hrx + 15 * scale);
      const py = hy - 14 * scale + pigtailBounce * side;
      const tailPts = sampleEllipseArc(px, py, 18 * scale, 24 * scale, 0, Math.PI * 2, 14, side * 0.35);
      drawHandColoredPolygon(ctx, tailPts, frameIndex, `${tagPrefix}-pigtail-${side}`, {
        fillColor: hairColor,
        hatchColor: '#3B2212',
        strokeWidth: 3.2 * Math.max(0.7, scale),
        occludePaper: true,
      });
      // Petit chouchou corail
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(hx + side * (hrx - 2 * scale), hy - 18 * scale, 7 * scale, 7 * scale, 0, Math.PI * 2, 10),
        frameIndex,
        `${tagPrefix}-ribbon-${side}`,
        { fillColor: PALETTE.claraRibbon, strokeWidth: 2.4 * scale }
      );
    }

    const claraHairCap: Point2D[] = [
      [hx - hrx * 1.02, hy + 2 * scale],
      [hx - hrx * 1.05, hy - 24 * scale],
      [hx - hrx * 0.6, hy - hry * 1.1],
      [hx, hy - hry * 1.15],
      [hx + hrx * 0.6, hy - hry * 1.1],
      [hx + hrx * 1.05, hy - 24 * scale],
      [hx + hrx * 1.02, hy + 2 * scale],
      [hx + hrx * 0.45, hy - 12 * scale],
      [hx, hy - 18 * scale],
      [hx - hrx * 0.45, hy - 12 * scale],
    ];
    drawHandColoredPolygon(ctx, claraHairCap, frameIndex, `${tagPrefix}-clara-hair-cap`, {
      fillColor: hairColor,
      hatchColor: '#3B2212',
      hatchAlpha: 0.28,
      strokeWidth: 3.5 * Math.max(0.7, scale),
      occludePaper: true,
    });
  }

  // Yeux vifs, joues rosées, sourire (et petite trace de crème sur la joue de Léo après avoir goûté !)
  const eyeY = hy + 2 * scale;
  for (const ex of [hx - 12 * scale, hx + 14 * scale]) {
    if (isGiggling) {
      // Yeux plissés de rire joyeux pour Clara
      drawPencilPolyline(
        ctx,
        [
          [ex - 6 * scale, eyeY + 2 * scale],
          [ex, eyeY - 4 * scale],
          [ex + 6 * scale, eyeY + 2 * scale],
        ],
        frameIndex,
        `${tagPrefix}-laugh-eye-${ex}`,
        { width: 2.8 * scale, doublePass: false }
      );
    } else {
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(ex, eyeY, 3.4 * scale, 4.0 * scale, 0, Math.PI * 2, 8),
        frameIndex,
        `${tagPrefix}-eye-${ex}`,
        {
          fillColor: PALETTE.graphiteDark,
          strokeOutline: false,
          occludePaper: false,
          colorOffsetScale: 0.4,
        }
      );
    }
  }

  // Joues rosées
  drawHandColoredPolygon(
    ctx,
    sampleEllipseArc(hx + 20 * scale, hy + 13 * scale, 8 * scale, 5 * scale, 0, Math.PI * 2, 8),
    frameIndex,
    `${tagPrefix}-cheek-R`,
    { fillColor: PALETTE.cheeksRose, strokeOutline: false, occludePaper: false }
  );

  // Petite tache de crème blanche sur la joue de Léo après son larcin gourmand !
  if (hasCreamOnCheek) {
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(hx + 22 * scale, hy + 19 * scale, 6.5 * scale, 5.0 * scale, 0, Math.PI * 2, 10),
      frameIndex,
      `${tagPrefix}-cheek-cream-spot`,
      {
        fillColor: PALETTE.cakeIcing,
        strokeWidth: 2.0 * scale,
        colorOffsetScale: 1.2,
      }
    );
  }

  // Sourire gourmand ou rire
  drawPencilPolyline(
    ctx,
    [
      [hx - 9 * scale, hy + 19 * scale],
      [hx + 2 * scale, hy + 26 * scale],
      [hx + 13 * scale, hy + 18 * scale],
    ],
    frameIndex,
    `${tagPrefix}-smile`,
    { width: 2.9 * Math.max(0.7, scale), doublePass: false }
  );

  // 5. BRAS DROIT (AVANT) UNIFIÉ (épaule -> coude -> poignet -> main sans aucun trait interne !)
  const rightArmGeom = drawUnifiedLimb(
    ctx,
    frontShoulder,
    rightIK.mid,
    rightIK.end,
    30 * scale,
    25 * scale,
    19 * scale,
    frameIndex,
    `${tagPrefix}-arm-R`,
    {
      skinColor: PALETTE.skinWarm,
      garmentColor: shirtColor,
      garmentSplitRatio: 0.38,
      strokeWidth: 3.6 * Math.max(0.7, scale),
    }
  );
  const rightFingertip = drawSeamlessHand(ctx, frameIndex, rightArmGeom, `${tagPrefix}-hand-R`, {
    scale: 0.86 * scale,
    skinColor: PALETTE.skinWarm,
    mode: rightHandMode,
    pointTarget: rightHandMode === 'point' ? resolvedRightTarget : null,
    hasCreamDab: hasCreamOnFinger,
  });

  return { rightFingertip, headCenter };
}
