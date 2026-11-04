// Accessoires, ingrédients et gâteau avec continuité stricte d'une scène à l'autre

import { PALETTE } from './config';
import {
  Point,
  clamp,
  drawHandEllipse,
  drawHandRect,
  drawHandShape,
  drawPencilLine,
  drawPencilPolyline,
  drawSteamWisp,
  lerp,
  mulberry32,
} from './pencilEngine';

/**
 * Traces de farine sur la table en bois (apparaissent dès la Scène 2)
 */
export function drawTableFlourTraces(
  ctx: CanvasRenderingContext2D,
  tableX: number,
  tableY: number,
  intensity: number,
  boilStep: number
): void {
  if (intensity <= 0.01) return;
  const alpha = clamp(intensity, 0, 1) * 0.78;
  drawHandEllipse(ctx, tableX - 115, tableY + 18, 34, 9, {
    fill: PALETTE.flourWhite,
    fillOpacity: alpha,
    stroke: false,
    seed: 801,
    boilStep,
  });
  drawHandEllipse(ctx, tableX + 95, tableY + 24, 26, 7, {
    fill: PALETTE.flourWhite,
    fillOpacity: alpha * 0.85,
    stroke: false,
    seed: 802,
    boilStep,
  });
  const rand = mulberry32(9912);
  ctx.save();
  ctx.fillStyle = PALETTE.flourWhite;
  ctx.globalAlpha = alpha * 0.9;
  for (let i = 0; i < 28; i++) {
    const px = tableX - 160 + rand() * 320;
    const py = tableY + 6 + rand() * 28;
    const r = 1.2 + rand() * 2.6;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Ensemble des ingrédients disposés sur la table (pot de farine, panier d'œufs, sucre, lait, beurre, torchon)
 */
export function drawIngredientsOnTable(
  ctx: CanvasRenderingContext2D,
  opts: {
    tableY: number;
    gatherProgress?: number; // 0 = écartés au début de Scène 1, 1 = rapprochés
    eggsRemaining?: number;
    spoonOffset?: number;
    showTowel?: boolean;
    boilStep: number;
  }
): void {
  const {
    tableY,
    gatherProgress = 1,
    eggsRemaining = 3,
    spoonOffset = 0,
    showTowel = true,
    boilStep,
  } = opts;

  const shiftLeft = lerp(-36, 0, gatherProgress);
  const shiftRight = lerp(38, 0, gatherProgress);

  // 1. Pot de FARINE en grès (à gauche de la table)
  const fx = 185 + shiftLeft;
  const fy = tableY - 82;
  drawHandRect(ctx, fx, fy, 74, 86, {
    fill: '#EFE4D0',
    hatch: true,
    hatchOpacity: 0.14,
    radius: 10,
    seed: 201,
    boilStep,
  });
  // Couvercle en bois
  drawHandRect(ctx, fx - 4, fy - 12, 82, 14, {
    fill: PALETTE.woodMedium,
    radius: 5,
    seed: 202,
    boilStep,
  });
  // Étiquette "FARINE"
  drawHandRect(ctx, fx + 10, fy + 26, 54, 24, {
    fill: '#FAF5EB',
    radius: 3,
    width: 1.6,
    seed: 203,
    boilStep,
  });
  ctx.save();
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillStyle = PALETTE.pencilDark;
  ctx.textAlign = 'center';
  ctx.fillText('FARINE', fx + 37, fy + 42);
  ctx.restore();

  // 2. Sucrier ocre (à côté de la farine)
  const sx = 278 + shiftLeft * 0.7;
  const sy = tableY - 58;
  drawHandEllipse(ctx, sx, sy + 26, 30, 26, {
    fill: '#E5B976',
    hatch: true,
    hatchOpacity: 0.15,
    seed: 205,
    boilStep,
  });
  drawHandEllipse(ctx, sx, sy + 2, 22, 7, {
    fill: '#D49B54',
    seed: 206,
    boilStep,
  });

  // 3. Panier d'œufs tressé
  const bx = 352 + shiftLeft * 0.4;
  const by = tableY - 22;
  // Œufs visibles dans le panier
  for (let i = 0; i < eggsRemaining; i++) {
    const ex = bx - 16 + i * 16;
    const ey = by - 10 - (i % 2) * 4;
    drawHandEllipse(ctx, ex, ey, 11, 14, {
      fill: PALETTE.eggShell,
      rotation: (i - 1) * 0.18,
      seed: 210 + i,
      boilStep,
    });
  }
  // Corbeille en osier
  drawHandShape(
    ctx,
    [
      [bx - 36, by - 8],
      [bx + 36, by - 8],
      [bx + 26, by + 22],
      [bx - 26, by + 22],
    ],
    {
      fill: '#C6935B',
      hatch: true,
      crossHatch: true,
      hatchSpacing: 6,
      hatchOpacity: 0.24,
      seed: 215,
      boilStep,
    }
  );

  // 4. Pichet de lait en émail crème (à droite)
  const mx = 740 + shiftRight * 0.6;
  const my = tableY - 76;
  drawHandShape(
    ctx,
    [
      [mx - 24, my],
      [mx + 22, my - 4],
      [mx + 28, my + 74],
      [mx - 28, my + 74],
    ],
    {
      fill: '#F8F2E6',
      hatch: true,
      hatchOpacity: 0.12,
      seed: 220,
      boilStep,
    }
  );
  // Anse du pichet
  drawPencilPolyline(
    ctx,
    [
      [mx + 23, my + 12],
      [mx + 42, my + 20],
      [mx + 40, my + 52],
      [mx + 25, my + 58],
    ],
    { width: 3.2, seed: 221, boilStep }
  );
  // Filet bleu sur le pichet
  drawPencilLine(ctx, mx - 24, my + 14, mx + 23, my + 12, {
    color: PALETTE.leoStripeBlue,
    width: 2.4,
    seed: 222,
    boilStep,
  });

  // 5. Beurrier avec motte de beurre doré
  const bux = 825 + shiftRight;
  const buy = tableY - 16;
  drawHandEllipse(ctx, bux, buy + 12, 36, 9, {
    fill: PALETTE.plateCeramic,
    seed: 225,
    boilStep,
  });
  drawHandRect(ctx, bux - 20, buy - 8, 40, 18, {
    fill: PALETTE.butterYellow,
    radius: 3,
    seed: 226,
    boilStep,
  });

  // 6. Cuillère en bois posée sur la table (déplacée par Mamie en Scène 1)
  const spx = 430 + spoonOffset;
  const spy = tableY + 18;
  drawPencilLine(ctx, spx - 35, spy + 4, spx + 22, spy - 3, {
    color: PALETTE.woodDark,
    width: 4.2,
    seed: 230,
    boilStep,
  });
  drawHandEllipse(ctx, spx - 42, spy + 5, 13, 8, {
    fill: PALETTE.woodLight,
    rotation: -0.1,
    seed: 231,
    boilStep,
  });

  // 7. Torchon à carreaux rouge et crème posé au bord droit de la table
  if (showTowel) {
    const tx = 885;
    const ty = tableY + 8;
    drawHandShape(
      ctx,
      [
        [tx - 32, ty - 6],
        [tx + 28, ty - 2],
        [tx + 36, ty + 34],
        [tx - 24, ty + 38],
      ],
      {
        fill: '#F7EFE2',
        hatch: true,
        crossHatch: true,
        hatchSpacing: 7,
        hatchOpacity: 0.28,
        color: PALETTE.berryRed,
        seed: 235,
        boilStep,
      }
    );
  }
}

/**
 * Grand saladier en céramique avec évolution visuelle de la pâte
 */
export function drawMixingBowl(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: {
    tiltAngle?: number;
    batterStage?: number; // 0 = vide, 0.2 = œufs, 0.5 = farine/sucre/lait, 1.0 = pâte lisse dorée
    swirlPhase?: number;
    boilStep: number;
  }
): void {
  const { tiltAngle = 0, batterStage = 0, swirlPhase = 0, boilStep } = opts;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltAngle);

  // Ouverture arrière du saladier
  drawHandEllipse(ctx, 0, -34, 76, 20, {
    fill: '#DFD3C0',
    seed: 301,
    boilStep,
  });

  // Contenu de la pâte visible à l'intérieur
  if (batterStage > 0.02) {
    const fillY = lerp(-22, -31, clamp(batterStage, 0, 1));
    const batterColor =
      batterStage < 0.45
        ? '#F4D47C'
        : batterStage < 0.75
        ? PALETTE.batterRaw
        : PALETTE.batterSmooth;
    drawHandEllipse(ctx, 0, fillY, 68, 15, {
      fill: batterColor,
      stroke: false,
      seed: 302,
      boilStep,
    });

    // Jaunes d'œufs visibles au début de la Scène 2
    if (batterStage > 0.05 && batterStage < 0.55) {
      drawHandEllipse(ctx, -18, fillY + 2, 11, 7, {
        fill: PALETTE.eggYolk,
        stroke: false,
        seed: 303,
        boilStep,
      });
      if (batterStage > 0.22) {
        drawHandEllipse(ctx, 16, fillY + 1, 11, 7, {
          fill: PALETTE.eggYolk,
          stroke: false,
          seed: 304,
          boilStep,
        });
      }
    }

    // Traces de farine en cours d'incorporation
    if (batterStage >= 0.4 && batterStage < 0.82) {
      drawHandEllipse(ctx, 8 * Math.cos(swirlPhase), fillY, 28, 7, {
        fill: PALETTE.flourWhite,
        fillOpacity: 0.75 * (1 - (batterStage - 0.4) / 0.45),
        stroke: false,
        seed: 305,
        boilStep,
      });
    }

    // Ondulations et tourbillons créés par le fouet
    if (batterStage >= 0.35) {
      for (let r = 0; r < 2; r++) {
        const ang = swirlPhase * 4 + r * Math.PI;
        const sx = Math.cos(ang) * 26;
        const sy = fillY + Math.sin(ang) * 5;
        drawPencilPolyline(
          ctx,
          [
            [sx - 18, sy - 2],
            [sx, sy + 4],
            [sx + 20, sy - 1],
          ],
          {
            color: '#C98A2C',
            width: 2.2,
            opacity: 0.65,
            seed: 306 + r,
            boilStep,
          }
        );
      }
    }
  }

  // Corps ventru du saladier en céramique crème
  drawHandShape(
    ctx,
    [
      [-76, -34],
      [76, -34],
      [68, 12],
      [46, 38],
      [-46, 38],
      [-68, 12],
    ],
    {
      fill: PALETTE.bowlCeramic,
      hatch: true,
      hatchAngle: -0.45,
      hatchSpacing: 9,
      hatchOpacity: 0.16,
      seed: 310,
      boilStep,
    }
  );

  // Double liseré vert sauge caractéristique du saladier de Mamie
  drawPencilPolyline(
    ctx,
    [
      [-71, -14],
      [0, -8],
      [71, -14],
    ],
    { color: PALETTE.bowlStripeSage, width: 4.0, seed: 311, boilStep }
  );
  drawPencilPolyline(
    ctx,
    [
      [-68, -4],
      [0, 2],
      [68, -4],
    ],
    { color: PALETTE.bowlStripeSage, width: 2.2, seed: 312, boilStep }
  );

  // Pied du saladier
  drawHandRect(ctx, -38, 36, 76, 8, {
    fill: '#DFD2BE',
    radius: 3,
    seed: 313,
    boilStep,
  });

  ctx.restore();
}

/**
 * Animation détaillée d'un œuf cassé sur le bord du saladier puis ouvert en deux coquilles
 */
export function drawCrackingEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  stage: 'whole' | 'cracked' | 'opening',
  openProgress: number, // 0..1
  boilStep: number
): void {
  if (stage === 'whole' || stage === 'cracked') {
    drawHandEllipse(ctx, x, y, 13, 17, {
      fill: PALETTE.eggShell,
      rotation: 0.25,
      seed: 330,
      boilStep,
    });
    if (stage === 'cracked') {
      // Fissure en zigzag au milieu de la coquille
      drawPencilPolyline(
        ctx,
        [
          [x - 11, y - 2],
          [x - 4, y + 3],
          [x + 2, y - 3],
          [x + 10, y + 2],
        ],
        { color: PALETTE.pencilDark, width: 2.2, seed: 331, boilStep }
      );
    }
    return;
  }

  // Ouverture des deux demi-coquilles et chute du jaune d'œuf
  const sep = lerp(3, 16, clamp(openProgress, 0, 1));
  const dropY = y + lerp(4, 48, easeDrop(clamp(openProgress, 0, 1)));

  // Blanc d'œuf filant et jaune doré qui tombe dans le saladier
  drawPencilLine(ctx, x, y + 4, x, dropY, {
    color: '#FFFDF5',
    width: 5.5,
    opacity: 0.75,
    seed: 332,
    boilStep,
  });
  drawHandEllipse(ctx, x, dropY, 10, 9, {
    fill: PALETTE.eggYolk,
    seed: 333,
    boilStep,
  });

  // Demi-coquille gauche
  drawHandShape(
    ctx,
    [
      [x - sep - 14, y - 6],
      [x - sep, y - 14],
      [x - sep + 2, y + 4],
      [x - sep - 12, y + 6],
    ],
    { fill: PALETTE.eggShell, seed: 334, boilStep }
  );
  // Demi-coquille droite
  drawHandShape(
    ctx,
    [
      [x + sep - 2, y + 4],
      [x + sep, y - 14],
      [x + sep + 14, y - 6],
      [x + sep + 12, y + 6],
    ],
    { fill: PALETTE.eggShell, seed: 335, boilStep }
  );
}

function easeDrop(t: number): number {
  return t * t;
}

/**
 * Fouet pâtissier tenu par Mamie et interagissant avec la pâte
 */
export function drawWhisk(
  ctx: CanvasRenderingContext2D,
  handX: number,
  handY: number,
  tipX: number,
  tipY: number,
  swirlPhase: number,
  boilStep: number
): void {
  const angle = Math.atan2(tipY - handY, tipX - handX);
  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(angle);
  const len = Math.hypot(tipX - handX, tipY - handY);
  const handleLen = Math.min(42, len * 0.45);

  // Manche en bois tourné
  drawHandRect(ctx, -6, -5, handleLen, 10, {
    fill: PALETTE.woodMedium,
    radius: 4,
    seed: 350,
    boilStep,
  });

  // Boucles métalliques du fouet
  for (let i = -1; i <= 1; i++) {
    const spread = i * 9 + Math.sin(swirlPhase * 5 + i) * 2.5;
    drawPencilPolyline(
      ctx,
      [
        [handleLen - 2, 0],
        [len * 0.72, spread * 1.3],
        [len, spread * 0.35],
        [len * 0.72, -spread * 0.6],
        [handleLen - 2, 0],
      ],
      {
        color: '#5A524C',
        width: 1.9,
        seed: 351 + i,
        boilStep,
      }
    );
  }
  ctx.restore();
}

/**
 * Moule à gâteau rond cannelé (cuivre étamé)
 */
export function drawCakeMold(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: {
    batterLevel?: number; // 0..1
    bakedRise?: number; // 0..1 (dôme doré quand il cuit / sort du four)
    boilStep: number;
  }
): void {
  const { batterLevel = 0, bakedRise = 0, boilStep } = opts;
  const rx = 56;

  // Intérieur du moule
  drawHandEllipse(ctx, cx, cy - 14, rx, 14, {
    fill: '#8E5A34',
    seed: 370,
    boilStep,
  });

  // Pâte coulée dans le moule
  if (batterLevel > 0.02 && bakedRise <= 0.05) {
    const fillR = lerp(24, rx - 4, clamp(batterLevel, 0, 1));
    const fillY = cy - lerp(8, 14, clamp(batterLevel, 0, 1));
    drawHandEllipse(ctx, cx, fillY, fillR, 11, {
      fill: PALETTE.batterSmooth,
      stroke: false,
      seed: 371,
      boilStep,
    });
  }

  // Dôme doré du gâteau cuit dans le moule (Scène 5)
  if (bakedRise > 0.05) {
    const domeH = 26 * clamp(bakedRise, 0, 1);
    drawHandShape(
      ctx,
      [
        [cx - rx + 3, cy - 14],
        [cx - rx * 0.65, cy - 14 - domeH * 0.85],
        [cx, cy - 14 - domeH],
        [cx + rx * 0.65, cy - 14 - domeH * 0.85],
        [cx + rx - 3, cy - 14],
      ],
      {
        fill: PALETTE.cakeCrust,
        hatch: true,
        hatchOpacity: 0.18,
        seed: 372,
        boilStep,
      }
    );
  }

  // Paroi extérieure cannelée du moule
  drawHandShape(
    ctx,
    [
      [cx - rx, cy - 14],
      [cx + rx, cy - 14],
      [cx + rx - 7, cy + 16],
      [cx - rx + 7, cy + 16],
    ],
    {
      fill: PALETTE.moldCopper,
      hatch: true,
      hatchAngle: 1.45,
      hatchSpacing: 8,
      hatchOpacity: 0.25,
      seed: 373,
      boilStep,
    }
  );

  // Cannelures verticales dessinées à la main
  for (let i = -4; i <= 4; i++) {
    const lx = cx + i * 11;
    drawPencilLine(ctx, lx, cy - 12, lx - i * 1.1, cy + 15, {
      color: PALETTE.pencilSoft,
      width: 1.5,
      opacity: 0.55,
      seed: 380 + i,
      boilStep,
    });
  }
}

/**
 * LE GÂTEAU DE MAMIE — Continuité stricte de la Scène 5 à la Scène 10
 * Même forme bombée, même couleur dorée-miellée, même décoration progressive (sucre glace + 7 fraises),
 * et ouverture réelle des parts lors de la découpe en Scène 10.
 */
export function drawGoldenCake(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: {
    scale?: number;
    inMold?: boolean;
    sugarProgress?: number; // 0..1 (apparaît progressivement en Scène 6)
    berriesCount?: number; // 0..7 (posées une à une en Scène 6, puis 7 en Scènes 7, 9, 10)
    slicesRemoved?: number; // 0, 1 ou 2 en Scène 10
    cutProgress?: number; // 0..1 progression de l'entaille du couteau
    steamAmount?: number; // 0..1 vapeur tiède
    boilStep: number;
  }
): void {
  const {
    scale = 1,
    inMold = false,
    sugarProgress = 0,
    berriesCount = 0,
    slicesRemoved = 0,
    cutProgress = 0,
    steamAmount = 0,
    boilStep,
  } = opts;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const rx = 68;
  const baseH = 28;
  const domeH = 34;

  // Plat de service en faïence crème sous le gâteau
  drawHandEllipse(ctx, 0, baseH + 5, rx + 20, 16, {
    fill: PALETTE.plateCeramic,
    seed: 401,
    boilStep,
  });
  drawHandEllipse(ctx, 0, baseH + 3, rx + 12, 11, {
    fill: '#EFE5D4',
    stroke: true,
    width: 1.4,
    color: PALETTE.plateRimBlue,
    seed: 402,
    boilStep,
  });

  // Corps cylindrique doré du gâteau (ou moule si encore dedans)
  drawHandShape(
    ctx,
    [
      [-rx, -4],
      [rx, -4],
      [rx - 5, baseH],
      [-rx + 5, baseH],
    ],
    {
      fill: inMold ? PALETTE.moldCopper : PALETTE.cakeCrustDeep,
      hatch: true,
      hatchAngle: inMold ? 1.5 : -0.5,
      hatchSpacing: 7,
      hatchOpacity: 0.22,
      seed: 403,
      boilStep,
    }
  );

  // Dôme supérieur doré et moelleux du gâteau
  drawHandShape(
    ctx,
    [
      [-rx, -4],
      [-rx * 0.78, -domeH * 0.72],
      [-rx * 0.32, -domeH],
      [rx * 0.32, -domeH],
      [rx * 0.78, -domeH * 0.72],
      [rx, -4],
      [rx * 0.55, 8],
      [-rx * 0.55, 8],
    ],
    {
      fill: PALETTE.cakeCrust,
      hatch: true,
      hatchAngle: -0.35,
      hatchSpacing: 9,
      hatchOpacity: 0.16,
      seed: 404,
      boilStep,
    }
  );

  // Voile progressif de sucre glace sur le dôme (Scène 6 -> 10)
  if (sugarProgress > 0.02) {
    const sp = clamp(sugarProgress, 0, 1);
    const srx = rx * 0.86 * (0.4 + 0.6 * sp);
    drawHandShape(
      ctx,
      [
        [-srx, -7],
        [-srx * 0.72, -domeH * 0.76],
        [0, -domeH + 2],
        [srx * 0.72, -domeH * 0.76],
        [srx, -7],
        [srx * 0.45, 2],
        [-srx * 0.45, 2],
      ],
      {
        fill: PALETTE.sugarPowder,
        fillOpacity: 0.84 * sp,
        stroke: false,
        seed: 405,
        boilStep,
      }
    );

    // Petits grains de sucre glace autour de la couronne
    const rand = mulberry32(4060);
    ctx.save();
    ctx.fillStyle = PALETTE.sugarPowder;
    ctx.globalAlpha = 0.85 * sp;
    const count = Math.floor(34 * sp);
    for (let i = 0; i < count; i++) {
      const gx = (rand() - 0.5) * rx * 1.5;
      const gy = -domeH * 0.75 + rand() * (domeH * 0.78);
      ctx.beginPath();
      ctx.arc(gx, gy, 1.3 + rand() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Entaille et découpe réelle des parts en Scène 10 (laisse voir la mie jaune tendre !)
  if (slicesRemoved > 0 || cutProgress > 0.05) {
    const wedgeWidth = slicesRemoved >= 2 ? 44 : slicesRemoved === 1 ? 26 : 18 * cutProgress;
    drawHandShape(
      ctx,
      [
        [4, -domeH * 0.55],
        [14 + wedgeWidth, -6],
        [12 + wedgeWidth, baseH - 2],
        [4, baseH - 4],
      ],
      {
        fill: PALETTE.cakeCrumb,
        hatch: true,
        hatchSpacing: 6,
        hatchOpacity: 0.18,
        seed: 407,
        boilStep,
      }
    );
  }

  // Couronne de fraises rouges posées une par une (jusqu'à 7 fraises)
  const berryPositions: Point[] = [
    [-38, -14],
    [-20, -24],
    [18, -24],
    [38, -14],
    [22, -6],
    [-22, -6],
    [0, -17], // 7e fraise centrale ajustée par Mamie à la fin de la Scène 6
  ];

  const totalToDraw = Math.min(berryPositions.length, Math.floor(berriesCount));
  for (let i = 0; i < totalToDraw; i++) {
    // Si une part a été servie, la fraise correspondante est partie sur l'assiette de l'enfant
    if (slicesRemoved >= 1 && i === 4) continue;
    if (slicesRemoved >= 2 && i === 3) continue;

    const [bx, by] = berryPositions[i];
    drawHandEllipse(ctx, bx, by, 9.5, 11, {
      fill: PALETTE.berryRed,
      rotation: (i - 3) * 0.1,
      seed: 410 + i,
      boilStep,
    });
    // Petite feuille verte (calice)
    drawPencilPolyline(
      ctx,
      [
        [bx - 5, by - 9],
        [bx, by - 6],
        [bx + 5, by - 9],
      ],
      { color: PALETTE.berryLeaf, width: 2.3, seed: 420 + i, boilStep }
    );
    // Reflet et akènes
    ctx.save();
    ctx.fillStyle = PALETTE.sugarPowder;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(bx - 2.5, by - 2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Volutes de vapeur parfumée (Scène 5 & début Scène 6)
  if (steamAmount > 0.02) {
    for (let s = -1; s <= 1; s++) {
      drawSteamWisp(
        ctx,
        s * 26,
        -domeH - 8,
        46,
        boilStep * 0.15 + s,
        boilStep,
        440 + s,
        0.48 * steamAmount
      );
    }
  }

  ctx.restore();
}

/**
 * Assiette en faïence avec une part triangulaire du gâteau de Mamie (Scène 10)
 */
export function drawPlateWithCakeSlice(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hasSlice: boolean,
  boilStep: number,
  seed = 500
): void {
  // Assiette en faïence crème
  drawHandEllipse(ctx, cx, cy, 42, 13, {
    fill: PALETTE.plateCeramic,
    seed,
    boilStep,
  });
  drawHandEllipse(ctx, cx, cy, 31, 8.5, {
    fill: '#F1E8D8',
    color: PALETTE.plateRimBlue,
    width: 1.5,
    seed: seed + 1,
    boilStep,
  });

  if (!hasSlice) return;

  // Part triangulaire dorée à la mie jaune tendre, sucre glace et fraise sur le dessus
  // Mie intérieure (flanc triangulaire)
  drawHandShape(
    ctx,
    [
      [cx - 22, cy - 2],
      [cx + 18, cy - 14],
      [cx + 18, cy + 3],
    ],
    {
      fill: PALETTE.cakeCrumb,
      hatch: true,
      hatchSpacing: 5,
      hatchOpacity: 0.15,
      seed: seed + 2,
      boilStep,
    }
  );
  // Croûte dorée supérieure avec voile de sucre glace
  drawHandShape(
    ctx,
    [
      [cx - 22, cy - 2],
      [cx + 6, cy - 24],
      [cx + 22, cy - 14],
      [cx - 6, cy - 2],
    ],
    {
      fill: PALETTE.cakeCrust,
      seed: seed + 3,
      boilStep,
    }
  );
  drawHandShape(
    ctx,
    [
      [cx - 16, cy - 4],
      [cx + 6, cy - 22],
      [cx + 18, cy - 15],
    ],
    {
      fill: PALETTE.sugarPowder,
      fillOpacity: 0.82,
      stroke: false,
      seed: seed + 4,
      boilStep,
    }
  );
  // Fraise rouge posée sur la part de l'enfant
  drawHandEllipse(ctx, cx + 4, cy - 21, 7.5, 8.5, {
    fill: PALETTE.berryRed,
    seed: seed + 5,
    boilStep,
  });
  drawPencilLine(ctx, cx, cy - 28, cx + 7, cy - 27, {
    color: PALETTE.berryLeaf,
    width: 2.2,
    seed: seed + 6,
    boilStep,
  });
}

/**
 * Ballon de jardin rayé rouge et crème (Scènes 4 & 8)
 */
export function drawGardenBall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  squashX = 1,
  squashY = 1,
  boilStep = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(squashX, squashY);
  ctx.rotate(rotation);

  drawHandEllipse(ctx, 0, 0, radius, radius, {
    fill: PALETTE.ballRed,
    hatch: true,
    hatchOpacity: 0.18,
    seed: 610,
    boilStep,
  });

  // Bande centrale crème
  drawHandShape(
    ctx,
    [
      [-radius * 0.92, -radius * 0.28],
      [radius * 0.92, -radius * 0.28],
      [radius * 0.92, radius * 0.28],
      [-radius * 0.92, radius * 0.28],
    ],
    {
      fill: PALETTE.ballCream,
      seed: 611,
      boilStep,
    }
  );

  ctx.restore();
}
