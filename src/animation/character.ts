import { GROUND_CONTACT_Y } from './background';
import { CelSpecification, FootPose } from './exposureSheet';
import {
  drawOrganicInkStroke,
  drawPencilHatch,
  drawWatercolorWash,
} from './pen';
import { Point2D } from './prng';

export interface CharacterRenderOptions {
  /** Position horizontale de référence du personnage dans le cadre 1080x1920 */
  anchorX?: number;
  /** Si défini, dessine uniquement les traits dans cette teinte (pour l'Onion Skin bleu/rouge) */
  onionTint?: string;
  onionAlpha?: number;
}

export const CHARACTER_ANCHOR_X = 505;

/**
 * Dessine Grand-mère Colette en pied pour le dessin unique `cel` (CEL_001 .. CEL_072).
 */
export function drawGrandmotherColette(
  ctx: CanvasRenderingContext2D,
  cel: CelSpecification,
  options: CharacterRenderOptions = {}
): void {
  const baseX = options.anchorX ?? CHARACTER_ANCHOR_X;
  const groundY = GROUND_CONTACT_Y;
  const p = cel.pose;
  const seed = cel.celId;
  const isOnion = Boolean(options.onionTint);
  const inkColor = options.onionTint ?? '#3B2D26';

  ctx.save();
  if (isOnion) {
    ctx.globalAlpha = options.onionAlpha ?? 0.34;
  }

  // Mise à l'échelle harmonieuse (1.20x) ancrée exactement au point de contact du sol (baseX, groundY)
  // pour une lisibilité optimale en pied sur smartphone (hauteur ~740 px dans le cadre 1080x1920)
  ctx.translate(baseX, groundY);
  ctx.scale(1.2, 1.2);
  ctx.translate(-baseX, -groundY);

  // Coordonnées anatomiques principales pour ce dessin unique
  const pelvisX = baseX;
  const pelvisY = groundY - 315 + p.pelvisDy;
  const leanRad = ((p.torsoLeanDeg + p.smellFlowersLean * 3.2) * Math.PI) / 180;

  const shoulderX = pelvisX + Math.sin(leanRad) * 185;
  const shoulderY = pelvisY - Math.cos(leanRad) * 185;

  const neckX = shoulderX + 12;
  const neckY = shoulderY - 26;

  const headCenterX = neckX + 16 + p.smellFlowersLean * 8;
  const headCenterY = neckY - 58 + p.headBobDy;
  const headTiltRad = (p.headTiltDeg * Math.PI) / 180;

  // 1. Ombre portée douce sur les dalles du trottoir (uniquement en rendu normal)
  if (!isOnion) {
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(
      baseX + 16,
      groundY + 4,
      14,
      baseX + 16,
      groundY + 4,
      125
    );
    shadowGrad.addColorStop(0, 'rgba(92, 68, 48, 0.28)');
    shadowGrad.addColorStop(0.65, 'rgba(92, 68, 48, 0.12)');
    shadowGrad.addColorStop(1, 'rgba(92, 68, 48, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(baseX + 18, groundY + 4, 118, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Bras arrière (Bras gauche + Panier d'osier garni de lavande et baguette + Salut Acte II)
  drawLeftArmAndBasket(
    ctx,
    shoulderX - 6,
    shoulderY + 12,
    p,
    seed,
    inkColor,
    isOnion
  );

  // 3. Jambe arrière (Jambe gauche : bas de laine + bottine en cuir châtaigne)
  drawLegAndBoot(
    ctx,
    pelvisX - 10,
    pelvisY + 12,
    pelvisX + p.leftKneeDx,
    pelvisY + 152 + p.leftKneeDy,
    baseX + p.leftFoot.dx,
    groundY + p.leftFoot.liftY,
    p.leftFoot,
    true,
    `${seed}/left-leg`,
    inkColor,
    isOnion
  );

  // 4. Jambe avant (Jambe droite : bas de laine + bottine en cuir châtaigne)
  drawLegAndBoot(
    ctx,
    pelvisX + 8,
    pelvisY + 12,
    pelvisX + p.rightKneeDx,
    pelvisY + 152 + p.rightKneeDy,
    baseX + p.rightFoot.dx,
    groundY + p.rightFoot.liftY,
    p.rightFoot,
    false,
    `${seed}/right-leg`,
    inkColor,
    isOnion
  );

  // 5. Jupe plissée bleu lavande et tablier crème aux rubans flottants
  drawSkirtAndApron(
    ctx,
    pelvisX,
    pelvisY,
    shoulderX,
    shoulderY,
    p,
    seed,
    inkColor,
    isOnion
  );

  // 6. Buste, Cardigan vert sauge et Châle tricoté terracotta à franges (avec follow-through)
  drawTorsoAndShawl(
    ctx,
    pelvisX,
    pelvisY,
    shoulderX,
    shoulderY,
    neckX,
    neckY,
    p,
    seed,
    inkColor,
    isOnion
  );

  // 7. Tête, Chignon argenté, Lunettes rondes en laiton et Visage expressif
  drawHeadAndFace(
    ctx,
    headCenterX,
    headCenterY,
    headTiltRad,
    p,
    seed,
    inkColor,
    isOnion
  );

  // 8. Bras avant (Bras droit + Canne en bois sculpté qui prend appui sur le pavé)
  drawRightArmAndCane(
    ctx,
    shoulderX - 2,
    shoulderY + 18,
    baseX,
    groundY,
    p,
    seed,
    inkColor,
    isOnion
  );

  ctx.restore();
}

/**
 * Dessine une jambe (bas de laine beige chaud) et sa bottine de marche en cuir brun
 * avec articulation complète de la cheville et des orteils.
 */
function drawLegAndBoot(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  kneeX: number,
  kneeY: number,
  ankleX: number,
  soleContactY: number,
  foot: FootPose,
  isBackLeg: boolean,
  seed: string,
  inkColor: string,
  isOnion: boolean
): void {
  const ankleY = soleContactY - 26;

  // Mollet et bas de laine
  const calfPts: Point2D[] = [
    { x: hipX - 18, y: hipY },
    { x: kneeX - 16, y: kneeY },
    { x: ankleX - 12, y: ankleY },
    { x: ankleX + 11, y: ankleY },
    { x: kneeX + 15, y: kneeY },
    { x: hipX + 18, y: hipY },
  ];

  if (!isOnion) {
    drawWatercolorWash(
      ctx,
      calfPts,
      isBackLeg ? '#CDB89D' : '#DECBB1',
      `${seed}/stocking`,
      { passes: 2, spread: 1.2 }
    );
  }
  drawOrganicInkStroke(
    ctx,
    [
      { x: kneeX - 14, y: kneeY - 10 },
      { x: ankleX - 11, y: ankleY },
    ],
    `${seed}/calf-back`,
    { color: inkColor, width: 2.8 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: kneeX + 14, y: kneeY - 10 },
      { x: ankleX + 10, y: ankleY },
    ],
    `${seed}/calf-front`,
    { color: inkColor, width: 2.8 }
  );

  // Bottine de marche orientée selon l'angle du pied (attaque talon / à plat / poussée orteils)
  ctx.save();
  // Pivot au niveau du talon ou de la plante selon la phase
  const pivotX = ankleX;
  const pivotY = soleContactY - 6;
  ctx.translate(pivotX, pivotY);
  ctx.rotate((-foot.angleDeg * Math.PI) / 180);

  const bootPts: Point2D[] = [
    { x: -20, y: 6 }, // arrière talon
    { x: -18, y: -26 }, // haut tige arrière
    { x: 12, y: -26 }, // haut tige avant
    { x: 24, y: -10 }, // coup de pied
    { x: 46, y: -4 - foot.toeBendDeg * 0.15 }, // bout rond de la chaussure
    { x: 44, y: 6 }, // semelle avant
    { x: -20, y: 6 }, // retour talon
  ];

  if (!isOnion) {
    drawWatercolorWash(
      ctx,
      bootPts,
      isBackLeg ? '#4D2F20' : '#633D2A',
      `${seed}/boot-wash`,
      { passes: 2, spread: 1.2 }
    );
  }
  drawOrganicInkStroke(ctx, bootPts, `${seed}/boot-ink`, {
    color: inkColor,
    width: 3.1,
    closed: true,
  });

  // Semelle et petit talon bois
  drawOrganicInkStroke(
    ctx,
    [
      { x: -20, y: 3 },
      { x: 44, y: 3 },
    ],
    `${seed}/sole-line`,
    { color: inkColor, width: 2.4 }
  );

  ctx.restore();
}

/**
 * Dessine la longue jupe plissée bleu lavande grisé et le tablier clair avec ses rubans flottants.
 */
function drawSkirtAndApron(
  ctx: CanvasRenderingContext2D,
  pelvisX: number,
  pelvisY: number,
  shoulderX: number,
  _shoulderY: number,
  p: CelSpecification['pose'],
  seed: string,
  inkColor: string,
  isOnion: boolean
): void {
  const waistX = pelvisX + (shoulderX - pelvisX) * 0.25;
  const waistY = pelvisY - 38;
  const hemY = pelvisY + 215;

  // L'ourlet de la jupe suit l'amplitude des jambes et l'ondulation retardée `skirtSwish`
  const frontSpread = Math.max(46, Math.max(p.leftFoot.dx, p.rightFoot.dx) + 34) + p.skirtSwish * 10;
  const backSpread = Math.max(54, -Math.min(p.leftFoot.dx, p.rightFoot.dx) + 38) - p.skirtSwish * 12;

  const skirtPts: Point2D[] = [
    { x: waistX - 42, y: waistY },
    { x: waistX + 44, y: waistY },
    { x: pelvisX + frontSpread * 0.82, y: waistY + 115 },
    { x: pelvisX + frontSpread, y: hemY - 4 },
    { x: pelvisX + frontSpread * 0.35, y: hemY + 10 },
    { x: pelvisX - backSpread * 0.35, y: hemY + 8 },
    { x: pelvisX - backSpread, y: hemY - 6 },
    { x: pelvisX - backSpread * 0.78, y: waistY + 110 },
  ];

  if (!isOnion) {
    drawWatercolorWash(ctx, skirtPts, '#6E7F99', `${seed}/skirt-wash`, {
      passes: 3,
      spread: 2.2,
      edgeColor: '#52627A',
    });
    // Ombre douce au bas de la jupe
    drawPencilHatch(
      ctx,
      pelvisX - 18,
      hemY - 35,
      65,
      26,
      0.1,
      '#4B5B73',
      `${seed}/skirt-hatch`,
      10,
      1.6,
      0.32
    );
  }

  drawOrganicInkStroke(ctx, skirtPts, `${seed}/skirt-outline`, {
    color: inkColor,
    width: 3.4,
    closed: true,
  });

  // Plis verticaux vivants de la jupe qui accompagnent le mouvement des genoux
  const pleatOffsets = [-0.45, -0.12, 0.22];
  for (let i = 0; i < pleatOffsets.length; i++) {
    const u = pleatOffsets[i];
    const topX = waistX + u * 52;
    const botX = pelvisX + u * (frontSpread + backSpread) * 0.65 + p.skirtSwish * 8;
    drawOrganicInkStroke(
      ctx,
      [
        { x: topX, y: waistY + 24, pressure: 0.6 },
        { x: (topX + botX) * 0.5 + p.skirtSwish * 5, y: waistY + 135, pressure: 1.0 },
        { x: botX, y: hemY + 4, pressure: 0.8 },
      ],
      `${seed}/pleat-${i}`,
      { color: isOnion ? inkColor : '#4A5970', width: 2.3 }
    );
  }

  // Tablier crème noué sur le devant de la jupe
  const apronPts: Point2D[] = [
    { x: waistX - 12, y: waistY + 2 },
    { x: waistX + 42, y: waistY + 4 },
    { x: pelvisX + frontSpread * 0.88, y: hemY - 32 },
    { x: pelvisX + 4, y: hemY - 24 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, apronPts, '#F7EFE2', `${seed}/apron-wash`, {
      passes: 2,
      spread: 1.6,
      edgeColor: '#D8C7AE',
    });
  }
  drawOrganicInkStroke(ctx, apronPts, `${seed}/apron-ink`, {
    color: inkColor,
    width: 2.8,
    closed: true,
  });

  // Rubans du tablier qui flottent à l'arrière de la taille (follow-through)
  const ribWave = p.apronRibbonWave * 14;
  const ribbon1: Point2D[] = [
    { x: waistX - 40, y: waistY + 8, pressure: 1.0 },
    { x: waistX - 78, y: waistY + 28 + ribWave * 0.5, pressure: 1.1 },
    { x: waistX - 108, y: waistY + 54 + ribWave, pressure: 0.7 },
  ];
  const ribbon2: Point2D[] = [
    { x: waistX - 40, y: waistY + 14, pressure: 1.0 },
    { x: waistX - 72, y: waistY + 46 - ribWave * 0.4, pressure: 1.0 },
    { x: waistX - 96, y: waistY + 78 + ribWave * 0.7, pressure: 0.7 },
  ];
  if (!isOnion) {
    drawOrganicInkStroke(ctx, ribbon1, `${seed}/rib1-fill`, {
      color: '#F5EBDC',
      width: 9,
      graphiteDouble: false,
    });
    drawOrganicInkStroke(ctx, ribbon2, `${seed}/rib2-fill`, {
      color: '#F5EBDC',
      width: 8,
      graphiteDouble: false,
    });
  }
  drawOrganicInkStroke(ctx, ribbon1, `${seed}/rib1-ink`, { color: inkColor, width: 2.2 });
  drawOrganicInkStroke(ctx, ribbon2, `${seed}/rib2-ink`, { color: inkColor, width: 2.2 });
}

/**
 * Dessine le buste (cardigan vert sauge) et le châle tricoté terracotta avec ses franges
 * animées en action chevauchante (follow-through).
 */
function drawTorsoAndShawl(
  ctx: CanvasRenderingContext2D,
  pelvisX: number,
  pelvisY: number,
  shoulderX: number,
  shoulderY: number,
  neckX: number,
  neckY: number,
  p: CelSpecification['pose'],
  seed: string,
  inkColor: string,
  isOnion: boolean
): void {
  const waistX = pelvisX + (shoulderX - pelvisX) * 0.25;
  const waistY = pelvisY - 36;

  // 1. Cardigan vert sauge
  const torsoPts: Point2D[] = [
    { x: waistX - 42, y: waistY + 6 },
    { x: shoulderX - 48, y: shoulderY + 18 },
    { x: neckX - 18, y: neckY + 10 },
    { x: neckX + 22, y: neckY + 14 },
    { x: shoulderX + 46, y: shoulderY + 34 },
    { x: waistX + 44, y: waistY + 8 },
  ];

  if (!isOnion) {
    drawWatercolorWash(ctx, torsoPts, '#7B9A82', `${seed}/cardigan-wash`, {
      passes: 3,
      spread: 1.8,
      edgeColor: '#5D7B64',
    });
  }
  drawOrganicInkStroke(ctx, torsoPts, `${seed}/cardigan-ink`, {
    color: inkColor,
    width: 3.1,
    closed: true,
  });

  // 2. Châle tricoté terracotta drapé sur les épaules avec retard vertical `shawlLagDy`
  const lagY = p.shawlLagDy;
  const waveX = p.shawlTipWave * 10;

  const shawlPts: Point2D[] = [
    { x: neckX - 24, y: neckY + 8 },
    { x: neckX + 26, y: neckY + 14 },
    { x: shoulderX + 52, y: shoulderY + 46 + lagY * 0.4 },
    { x: shoulderX + 28 + waveX * 0.4, y: shoulderY + 118 + lagY },
    { x: shoulderX - 18 + waveX * 0.6, y: shoulderY + 138 + lagY * 1.15 },
    { x: shoulderX - 68 + waveX, y: shoulderY + 112 + lagY },
    { x: shoulderX - 58, y: shoulderY + 32 + lagY * 0.3 },
  ];

  if (!isOnion) {
    drawWatercolorWash(ctx, shawlPts, '#D9795D', `${seed}/shawl-wash`, {
      passes: 3,
      spread: 2.2,
      edgeColor: '#B3573D',
    });
    // Texture laine tricotée au crayon de couleur
    drawPencilHatch(
      ctx,
      shoulderX - 10,
      shoulderY + 72 + lagY * 0.5,
      46,
      28,
      0.35,
      '#A84B31',
      `${seed}/shawl-knit-1`,
      9,
      1.7,
      0.32
    );
    drawPencilHatch(
      ctx,
      shoulderX - 10,
      shoulderY + 72 + lagY * 0.5,
      46,
      28,
      -0.45,
      '#F2B89B',
      `${seed}/shawl-knit-2`,
      7,
      1.4,
      0.26
    );
  }

  drawOrganicInkStroke(ctx, shawlPts, `${seed}/shawl-outline`, {
    color: inkColor,
    width: 3.4,
    closed: true,
  });

  // Franges crème au bord inférieur du châle qui dansent avec le pas
  const fringeEdge: Point2D[] = [
    { x: shoulderX - 64 + waveX, y: shoulderY + 110 + lagY },
    { x: shoulderX - 18 + waveX * 0.6, y: shoulderY + 136 + lagY * 1.15 },
    { x: shoulderX + 26 + waveX * 0.4, y: shoulderY + 116 + lagY },
  ];
  for (let f = 0; f <= 8; f++) {
    const u = f / 8;
    const fx =
      (1 - u) * (1 - u) * fringeEdge[0].x +
      2 * (1 - u) * u * fringeEdge[1].x +
      u * u * fringeEdge[2].x;
    const fy =
      (1 - u) * (1 - u) * fringeEdge[0].y +
      2 * (1 - u) * u * fringeEdge[1].y +
      u * u * fringeEdge[2].y;
    drawOrganicInkStroke(
      ctx,
      [
        { x: fx, y: fy },
        { x: fx - 4 + p.shawlTipWave * 6, y: fy + 16 + lagY * 0.25 },
      ],
      `${seed}/fringe-${f}`,
      { color: isOnion ? inkColor : '#5C3D2E', width: 2.1, graphiteDouble: false }
    );
  }

  // Petit col Claudine crème en haut du châle
  const collarPts: Point2D[] = [
    { x: neckX - 10, y: neckY + 6 },
    { x: neckX + 24, y: neckY + 12 },
    { x: neckX + 14, y: neckY + 26 },
    { x: neckX - 6, y: neckY + 20 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, collarPts, '#FFF9EE', `${seed}/collar`, { passes: 2, spread: 0.8 });
  }
  drawOrganicInkStroke(ctx, collarPts, `${seed}/collar-ink`, {
    color: inkColor,
    width: 2.2,
    closed: true,
  });
}

/**
 * Dessine le bras arrière (gauche) qui tient le panier d'osier garni de lavande et d'une baguette,
 * et qui lève affectueusement la main pour saluer le chat roux à l'Acte II.
 */
function drawLeftArmAndBasket(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  p: CelSpecification['pose'],
  seed: string,
  inkColor: string,
  isOnion: boolean
): void {
  // Position du coude et de la main gauche (modulée par le salut `waveHandRaise` ou le parfum `smellFlowersLean`)
  const elbowX =
    shoulderX +
    18 +
    p.leftHandDx * 0.45 +
    p.waveHandRaise * 28 +
    p.smellFlowersLean * 22;
  const elbowY =
    shoulderY +
    68 +
    p.leftHandDy * 0.5 -
    p.waveHandRaise * 22 -
    p.smellFlowersLean * 18;

  const wristRad = (p.waveWristAngleDeg * Math.PI) / 180;
  const handX =
    elbowX +
    36 +
    p.leftHandDx * 0.55 +
    p.waveHandRaise * 32 +
    Math.sin(wristRad) * 14 +
    p.smellFlowersLean * 18;
  const handY =
    elbowY +
    16 +
    p.leftHandDy * 0.5 -
    p.waveHandRaise * 82 -
    p.smellFlowersLean * 38;

  // Panier d'osier suspendu à l'avant-bras gauche (reste stable au creux du coude même quand la main salue !)
  const basketAnchorX =
    elbowX + 22 + (1 - p.waveHandRaise) * 16 + p.smellFlowersLean * 14;
  const basketAnchorY =
    elbowY + 12 + (1 - p.waveHandRaise) * 8 - p.smellFlowersLean * 22;

  ctx.save();
  ctx.translate(basketAnchorX, basketAnchorY);
  ctx.rotate(((p.basketTiltDeg + p.smellFlowersLean * -8) * Math.PI) / 180);

  // Anse en osier tressé
  const handlePts: Point2D[] = [
    { x: -34, y: 34 },
    { x: -28, y: -12 },
    { x: 0, y: -22 },
    { x: 28, y: -12 },
    { x: 34, y: 34 },
  ];
  drawOrganicInkStroke(ctx, handlePts, `${seed}/basket-handle`, {
    color: isOnion ? inkColor : '#7A5230',
    width: 4.5,
  });

  // Bouquet de lavande fraîche et baguette dorée dépassant du panier
  if (!isOnion) {
    // Baguette croustillante à gauche du panier
    const bagPts: Point2D[] = [
      { x: -32, y: 38 },
      { x: -54, y: -8 },
      { x: -36, y: -16 },
      { x: -12, y: 34 },
    ];
    drawWatercolorWash(ctx, bagPts, '#DDA04B', `${seed}/baguette`, {
      passes: 2,
      spread: 1.0,
    });
    drawOrganicInkStroke(ctx, bagPts, `${seed}/baguette-ink`, {
      color: inkColor,
      width: 2.2,
      closed: true,
    });

    // Brins de lavande à droite du panier
    for (let l = 0; l < 5; l++) {
      const lx = -6 + l * 10;
      const ly = -8 - (l % 2) * 10;
      drawOrganicInkStroke(
        ctx,
        [
          { x: lx - 4, y: 36 },
          { x: lx, y: ly },
        ],
        `${seed}/lav-stem-${l}`,
        { color: '#58785A', width: 2.0, graphiteDouble: false }
      );
      drawWatercolorWash(
        ctx,
        [
          { x: lx - 7, y: ly + 18 },
          { x: lx, y: ly - 8 },
          { x: lx + 7, y: ly + 18 },
        ],
        l % 2 === 0 ? '#8B6FA8' : '#A489C2',
        `${seed}/lav-bloom-${l}`,
        { passes: 2, spread: 1.2 }
      );
    }
  }

  // Corps du panier d'osier
  const basketPts: Point2D[] = [
    { x: -44, y: 32 },
    { x: 44, y: 32 },
    { x: 34, y: 92 },
    { x: -34, y: 92 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, basketPts, '#C9965B', `${seed}/basket-body`, {
      passes: 3,
      spread: 1.6,
      edgeColor: '#9E6E3B',
    });
    drawPencilHatch(
      ctx,
      0,
      62,
      32,
      22,
      0.2,
      '#8C5D2E',
      `${seed}/basket-weave-1`,
      7,
      1.6,
      0.38
    );
    drawPencilHatch(
      ctx,
      0,
      62,
      32,
      22,
      -0.2,
      '#8C5D2E',
      `${seed}/basket-weave-2`,
      7,
      1.6,
      0.38
    );
  }
  drawOrganicInkStroke(ctx, basketPts, `${seed}/basket-outline`, {
    color: inkColor,
    width: 3.0,
    closed: true,
  });
  ctx.restore();

  // Manche vert sauge et main gauche expressive
  const armSpine: Point2D[] = [
    { x: shoulderX, y: shoulderY },
    { x: elbowX, y: elbowY },
    { x: handX, y: handY },
  ];
  if (!isOnion) {
    drawOrganicInkStroke(ctx, armSpine, `${seed}/left-sleeve-fill`, {
      color: '#6A8770',
      width: 22,
      taperStart: 0.05,
      taperEnd: 0.15,
      graphiteDouble: false,
    });
  }
  drawOrganicInkStroke(ctx, armSpine, `${seed}/left-sleeve-ink`, {
    color: inkColor,
    width: 2.8,
  });

  // Main gauche (ouverte en salut amical à l'Acte II ou posée sur l'anse)
  const handPts: Point2D[] = [
    { x: handX - 8, y: handY + 6 },
    { x: handX - 4, y: handY - 12 - p.waveHandRaise * 6 },
    { x: handX + 10, y: handY - 10 - p.waveHandRaise * 4 },
    { x: handX + 14, y: handY + 4 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, handPts, '#F5D2BA', `${seed}/left-hand-wash`, {
      passes: 2,
      spread: 0.8,
    });
  }
  drawOrganicInkStroke(ctx, handPts, `${seed}/left-hand-ink`, {
    color: inkColor,
    width: 2.4,
    closed: true,
  });
}

/**
 * Dessine la tête de Grand-mère Colette, son chignon blanc argenté, ses lunettes rondes dorées
 * et ses expressions faciales dessinées image par image.
 */
function drawHeadAndFace(
  ctx: CanvasRenderingContext2D,
  headX: number,
  headY: number,
  headTiltRad: number,
  p: CelSpecification['pose'],
  seed: string,
  inkColor: string,
  isOnion: boolean
): void {
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headTiltRad);

  // Cou doux
  const neckPts: Point2D[] = [
    { x: -16, y: 34 },
    { x: -12, y: 64 },
    { x: 10, y: 66 },
    { x: 12, y: 36 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, neckPts, '#F2CEB6', `${seed}/neck`, {
      passes: 2,
      spread: 1.0,
    });
  }
  drawOrganicInkStroke(ctx, neckPts, `${seed}/neck-ink`, {
    color: inkColor,
    width: 2.5,
  });

  // Chignon arrière souple en cheveux blanc argenté (avec léger rebond retardé)
  const bunBounce = p.shawlLagDy * 0.35;
  const bunPts: Point2D[] = [
    { x: -42, y: -14 + bunBounce },
    { x: -74, y: -26 + bunBounce },
    { x: -80, y: 4 + bunBounce },
    { x: -64, y: 26 + bunBounce },
    { x: -36, y: 18 + bunBounce },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, bunPts, '#EFECE6', `${seed}/bun-wash`, {
      passes: 3,
      spread: 1.6,
      edgeColor: '#CEC7BA',
    });
  }
  drawOrganicInkStroke(ctx, bunPts, `${seed}/bun-ink`, {
    color: inkColor,
    width: 3.1,
    closed: true,
  });

  // Épingle à chignon en bois
  drawOrganicInkStroke(
    ctx,
    [
      { x: -72, y: -24 + bunBounce },
      { x: -44, y: 14 + bunBounce },
    ],
    `${seed}/hairpin`,
    { color: isOnion ? inkColor : '#8A563B', width: 3.2 }
  );

  // Visage chaleureux de trois-quarts profil tourné vers la droite
  const facePts: Point2D[] = [
    { x: -32, y: -32 },
    { x: 24, y: -34 },
    { x: 38, y: -8 },
    { x: 48, y: 6 }, // bout du nez doux
    { x: 36, y: 14 },
    { x: 34, y: 36 }, // menton rond et bienveillant
    { x: 6, y: 44 },
    { x: -28, y: 32 },
    { x: -38, y: 4 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, facePts, '#F7D7C0', `${seed}/face-wash`, {
      passes: 3,
      spread: 1.4,
      edgeColor: '#E3B99E',
    });
    // Pommette rosée au crayon de couleur
    drawWatercolorWash(
      ctx,
      [
        { x: 6, y: 10 },
        { x: 26, y: 10 },
        { x: 26, y: 26 },
        { x: 6, y: 26 },
      ],
      'rgba(232, 138, 125, 0.45)',
      `${seed}/cheek-blush`,
      { passes: 2, spread: 2.0 }
    );
    drawPencilHatch(
      ctx,
      16,
      18,
      12,
      8,
      -0.2,
      '#DE7C70',
      `${seed}/cheek-hatch`,
      6,
      1.3,
      0.35
    );
  }
  drawOrganicInkStroke(ctx, facePts, `${seed}/face-outline`, {
    color: inkColor,
    width: 3.0,
    closed: true,
  });

  // Chevelure blanc argenté encadrant le front et la tempe
  const hairPts: Point2D[] = [
    { x: -42, y: 18 },
    { x: -46, y: -16 },
    { x: -24, y: -46 },
    { x: 16, y: -48 },
    { x: 36, y: -28 },
    { x: 12, y: -22 },
    { x: -12, y: -14 },
    { x: -24, y: 14 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, hairPts, '#F4F1EB', `${seed}/hair-wash`, {
      passes: 3,
      spread: 1.6,
      edgeColor: '#D1C9BC',
    });
  }
  drawOrganicInkStroke(ctx, hairPts, `${seed}/hair-outline`, {
    color: inkColor,
    width: 3.1,
    closed: true,
  });
  // Lignes de mèches argentées souples
  drawOrganicInkStroke(
    ctx,
    [
      { x: -26, y: -32 },
      { x: -4, y: -34 },
      { x: 18, y: -26 },
    ],
    `${seed}/hair-strand-1`,
    { color: isOnion ? inkColor : '#B8B0A2', width: 2.0 }
  );

  // Sourcil expressif
  const browLift = p.waveHandRaise * -3.5;
  drawOrganicInkStroke(
    ctx,
    [
      { x: 12, y: -16 + browLift },
      { x: 22, y: -20 + browLift },
      { x: 31, y: -16 + browLift },
    ],
    `${seed}/eyebrow`,
    { color: isOnion ? inkColor : '#7A6E65', width: 2.4 }
  );

  // Yeux (ouverts, mi-clos ou fermés paisiblement)
  const eyeX = 23;
  const eyeY = -5 + p.gazeOffsetY * 0.4;
  if (p.eyeOpen > 0.6) {
    ctx.fillStyle = inkColor;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3.6, 0, Math.PI * 2);
    ctx.fill();
    if (!isOnion) {
      // Éclat de vie dans l'œil
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX + 1.2, eyeY - 1.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (p.eyeOpen > 0.2) {
    // Paupière mi-close
    drawOrganicInkStroke(
      ctx,
      [
        { x: eyeX - 6, y: eyeY },
        { x: eyeX, y: eyeY + 2 },
        { x: eyeX + 6, y: eyeY },
      ],
      `${seed}/eye-half`,
      { color: inkColor, width: 2.4 }
    );
  } else {
    // Paupière close heureuse (clignement ou respiration du parfum de lavande)
    drawOrganicInkStroke(
      ctx,
      [
        { x: eyeX - 6, y: eyeY + 1 },
        { x: eyeX, y: eyeY + 4 },
        { x: eyeX + 6, y: eyeY + 1 },
      ],
      `${seed}/eye-closed`,
      { color: inkColor, width: 2.4 }
    );
  }

  // Lunettes rondes en laiton doré posées sur le nez
  const glassX = 25;
  const glassY = -4;
  const glassPts: Point2D[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    glassPts.push({
      x: glassX + Math.cos(a) * 11.5,
      y: glassY + Math.sin(a) * 11.5,
    });
  }
  if (!isOnion) {
    drawWatercolorWash(
      ctx,
      glassPts,
      'rgba(255, 250, 232, 0.32)',
      `${seed}/lens-wash`,
      { passes: 1, spread: 0.4 }
    );
  }
  drawOrganicInkStroke(ctx, glassPts, `${seed}/glasses-rim`, {
    color: isOnion ? inkColor : '#A6752E',
    width: 2.3,
    closed: true,
    graphiteDouble: false,
  });
  // Branche des lunettes vers l'oreille
  drawOrganicInkStroke(
    ctx,
    [
      { x: glassX - 11, y: glassY - 2 },
      { x: -16, y: -2 },
    ],
    `${seed}/glasses-arm`,
    { color: isOnion ? inkColor : '#A6752E', width: 2.0, graphiteDouble: false }
  );

  // Sourire tendre et rides d'expression bienveillantes
  const smileLift = p.smileIntensity * 4.5;
  drawOrganicInkStroke(
    ctx,
    [
      { x: 18, y: 22 - smileLift * 0.3 },
      { x: 26, y: 25 },
      { x: 34, y: 21 - smileLift * 0.5 },
    ],
    `${seed}/mouth-smile`,
    { color: inkColor, width: 2.4 }
  );

  ctx.restore();
}

/**
 * Dessine le bras droit au premier plan et la canne en bois sculpté
 * dont l'embout en laiton se pose sur les dalles du trottoir sans glisser.
 */
function drawRightArmAndCane(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  baseX: number,
  groundY: number,
  p: CelSpecification['pose'],
  seed: string,
  inkColor: string,
  isOnion: boolean
): void {
  const handX = baseX + p.rightHandDx;
  const handY = shoulderY + 115 + p.rightHandDy;

  const elbowX = (shoulderX + handX) * 0.5 - 16;
  const elbowY = (shoulderY + handY) * 0.5 + 14;

  const caneTipX = baseX + p.caneTipDx;
  const caneTipY = groundY + p.caneTipLiftY;

  // 1. Fût de la canne en bois de noyer sculpté + poignée courbée
  const caneShaftPts: Point2D[] = [
    { x: handX - 12, y: handY + 2, pressure: 1.1 },
    { x: handX - 2, y: handY - 8, pressure: 1.2 },
    { x: handX + 8, y: handY + 2, pressure: 1.15 },
    { x: (handX + caneTipX) * 0.5 + 4, y: (handY + caneTipY) * 0.5, pressure: 1.0 },
    { x: caneTipX, y: caneTipY, pressure: 0.85 },
  ];
  drawOrganicInkStroke(ctx, caneShaftPts, `${seed}/cane-wood`, {
    color: isOnion ? inkColor : '#6B4226',
    width: 6.8,
    taperStart: 0.08,
    taperEnd: 0.12,
    graphiteDouble: false,
  });
  drawOrganicInkStroke(ctx, caneShaftPts, `${seed}/cane-ink`, {
    color: inkColor,
    width: 2.3,
  });

  // Embout en laiton doré au bout de la canne
  if (!isOnion) {
    drawOrganicInkStroke(
      ctx,
      [
        { x: caneTipX - 1, y: caneTipY - 14 },
        { x: caneTipX, y: caneTipY },
      ],
      `${seed}/cane-ferrule`,
      { color: '#C89B4B', width: 6.2, graphiteDouble: false }
    );
  }

  // 2. Manche droite en laine vert sauge
  const sleevePts: Point2D[] = [
    { x: shoulderX - 14, y: shoulderY + 4 },
    { x: elbowX - 16, y: elbowY + 6 },
    { x: handX - 10, y: handY - 2 },
    { x: handX + 8, y: handY - 12 },
    { x: elbowX + 12, y: elbowY - 8 },
    { x: shoulderX + 14, y: shoulderY + 2 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, sleevePts, '#7B9A82', `${seed}/right-sleeve`, {
      passes: 2,
      spread: 1.4,
      edgeColor: '#5B7861',
    });
  }
  drawOrganicInkStroke(ctx, sleevePts, `${seed}/right-sleeve-ink`, {
    color: inkColor,
    width: 2.9,
    closed: true,
  });

  // 3. Main droite posée sur le pommeau de la canne
  const handPts: Point2D[] = [
    { x: handX - 8, y: handY - 8 },
    { x: handX + 10, y: handY - 10 },
    { x: handX + 12, y: handY + 6 },
    { x: handX - 6, y: handY + 6 },
  ];
  if (!isOnion) {
    drawWatercolorWash(ctx, handPts, '#F7D7C0', `${seed}/right-hand`, {
      passes: 2,
      spread: 0.8,
    });
  }
  drawOrganicInkStroke(ctx, handPts, `${seed}/right-hand-ink`, {
    color: inkColor,
    width: 2.4,
    closed: true,
  });
}
