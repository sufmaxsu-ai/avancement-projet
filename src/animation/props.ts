import { PALETTE } from './config';
import {
  Point2D,
  clamp,
  drawHandColoredPolygon,
  drawPencilPolyline,
  lerp,
  sampleEllipseArc,
} from './pencilEngine';

export interface MixingBowlAnchors {
  leftRim: Point2D;
  rightRim: Point2D;
  pourSpout: Point2D;
  batterCenter: Point2D;
}

/**
 * Calcule les points d'ancrage exacts du saladier pour que les mains de Mamie
 * tiennent toujours parfaitement ses rebords.
 */
export function getMixingBowlAnchors(
  cx: number,
  cy: number,
  scale = 1,
  tiltRad = 0
): MixingBowlAnchors {
  const rx = 56 * scale;
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);
  const rot = (x: number, y: number): Point2D => [
    cx + x * cosT - y * sinT,
    cy + x * sinT + y * cosT,
  ];
  return {
    leftRim: rot(-rx, -8 * scale),
    rightRim: rot(rx, -8 * scale),
    pourSpout: rot(rx * 0.95, 2 * scale),
    batterCenter: rot(0, -4 * scale),
  };
}

/**
 * Dessine le saladier 3D en terre cuite, la pâte dorée à l'intérieur et le ruban de pâte
 * lorsqu'il est incliné au-dessus du moule.
 */
export function drawMixingBowl3D(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  cx: number,
  cy: number,
  opts: {
    scale?: number;
    tiltRad?: number;
    batterFill?: number; // 0..1
    pouringTo?: Point2D | null;
    pouringStrength?: number;
  } = {}
): MixingBowlAnchors {
  const {
    scale = 1,
    tiltRad = 0,
    batterFill = 0.8,
    pouringTo = null,
    pouringStrength = 0,
  } = opts;

  const rx = 56 * scale;
  const ryRim = 17 * scale;
  const depth = 52 * scale;
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);
  const rot = (x: number, y: number): Point2D => [
    cx + x * cosT - y * sinT,
    cy + x * sinT + y * cosT,
  ];

  // Corps inférieur hémisphérique du saladier (un seul polygone continu)
  const lowerArc = sampleEllipseArc(0, -6 * scale, rx, depth, 0, Math.PI, 20);
  const upperBackArc = sampleEllipseArc(0, -6 * scale, rx, ryRim, Math.PI, Math.PI * 2, 16);
  const bowlBodyPts = [...lowerArc, ...upperBackArc].map(([x, y]) => rot(x, y));

  drawHandColoredPolygon(ctx, bowlBodyPts, frameIndex, 'mixing-bowl-body', {
    fillColor: PALETTE.bowlTerracotta,
    hatchColor: '#9E4D30',
    hatchAlpha: 0.25,
    strokeWidth: 3.6 * Math.max(0.75, scale),
  });

  // Ouverture elliptique 3D du saladier
  const rimPts = sampleEllipseArc(0, -6 * scale, rx, ryRim, 0, Math.PI * 2, 24).map(([x, y]) =>
    rot(x, y)
  );
  drawHandColoredPolygon(ctx, rimPts, frameIndex, 'mixing-bowl-inside', {
    fillColor: PALETTE.bowlInside,
    hatchColor: '#DECBB2',
    hatchAlpha: 0.2,
    strokeWidth: 3.4 * Math.max(0.75, scale),
  });

  // Pâte dorée à l'intérieur du saladier
  if (batterFill > 0.08) {
    const bScale = 0.78 * clamp(batterFill, 0.25, 1);
    const batterPts = sampleEllipseArc(
      0,
      -4 * scale,
      rx * bScale,
      ryRim * bScale,
      0,
      Math.PI * 2,
      20
    ).map(([x, y]) => rot(x, y));
    drawHandColoredPolygon(ctx, batterPts, frameIndex, 'mixing-bowl-batter', {
      fillColor: PALETTE.batterGold,
      hatchColor: '#DFA93E',
      hatchAlpha: 0.25,
      strokeWidth: 2.4 * Math.max(0.75, scale),
    });
  }

  const anchors = getMixingBowlAnchors(cx, cy, scale, tiltRad);

  // Ruban continu de pâte dorée qui coule du bec du saladier jusque dans le moule (soumis à la gravité)
  if (pouringTo && pouringStrength > 0.05) {
    const sp = anchors.pourSpout;
    const tp = pouringTo;
    const midY = lerp(sp[1], tp[1], 0.5);
    const wTop = 11 * pouringStrength;
    const wBot = 7 * pouringStrength;
    const ribbonPoly: Point2D[] = [
      [sp[0] - wTop, sp[1]],
      [lerp(sp[0], tp[0], 0.55) - wBot * 1.1, midY],
      [tp[0] - wBot, tp[1]],
      [tp[0] + wBot, tp[1]],
      [lerp(sp[0], tp[0], 0.55) + wBot * 1.1, midY],
      [sp[0] + wTop, sp[1]],
    ];
    drawHandColoredPolygon(ctx, ribbonPoly, frameIndex, 'pouring-batter-ribbon', {
      fillColor: PALETTE.batterGold,
      hatchColor: '#E5B248',
      strokeWidth: 2.8,
      colorOffsetScale: 2.2,
    });
  }

  return anchors;
}

/**
 * Dessine le fouet de pâtisserie tenu par la main droite de Mamie (ou posé dans le saladier).
 * Le point `gripPoint` correspond exactement au centre de la main qui tient le manche.
 */
export function drawWhiskProp(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  gripPoint: Point2D,
  tipPoint: Point2D,
  scale = 1
): void {
  const dx = tipPoint[0] - gripPoint[0];
  const dy = tipPoint[1] - gripPoint[1];
  const angle = Math.atan2(dy, dx);
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);

  // Manche en bois tourné (du haut du manche jusqu'au col)
  const handleStart: Point2D = [
    gripPoint[0] - Math.cos(angle) * 20 * scale,
    gripPoint[1] - Math.sin(angle) * 20 * scale,
  ];
  const handleEnd: Point2D = [
    gripPoint[0] + Math.cos(angle) * 18 * scale,
    gripPoint[1] + Math.sin(angle) * 18 * scale,
  ];
  const hw = 6.5 * scale;
  const handlePoly: Point2D[] = [
    [handleStart[0] - nx * hw, handleStart[1] - ny * hw],
    [handleEnd[0] - nx * hw * 0.8, handleEnd[1] - ny * hw * 0.8],
    [handleEnd[0] + nx * hw * 0.8, handleEnd[1] + ny * hw * 0.8],
    [handleStart[0] + nx * hw, handleStart[1] + ny * hw],
  ];
  drawHandColoredPolygon(ctx, handlePoly, frameIndex, 'whisk-handle', {
    fillColor: PALETTE.whiskHandle,
    strokeWidth: 3.0 * Math.max(0.75, scale),
  });

  // Boucles métalliques du fouet
  for (const spread of [-11, -4, 4, 11]) {
    const mid: Point2D = [
      lerp(handleEnd[0], tipPoint[0], 0.58) + nx * spread * scale,
      lerp(handleEnd[1], tipPoint[1], 0.58) + ny * spread * scale,
    ];
    drawPencilPolyline(
      ctx,
      [handleEnd, mid, tipPoint],
      frameIndex,
      `whisk-wire-${spread}`,
      {
        color: PALETTE.whiskMetal,
        width: 2.3 * Math.max(0.75, scale),
        wobble: 1.2,
        doublePass: false,
      }
    );
  }
}

export interface CakePanAnchors {
  leftHandle: Point2D;
  rightHandle: Point2D;
  centerTop: Point2D;
  leoTasteSpot: Point2D; // Point précis où l'index de Léo touche le glaçage
}

export function getCakePanAnchors(cx: number, cy: number, scale = 1): CakePanAnchors {
  const rx = 54 * scale;
  return {
    leftHandle: [cx - rx - 10 * scale, cy - 4 * scale],
    rightHandle: [cx + rx + 10 * scale, cy - 4 * scale],
    centerTop: [cx, cy - 16 * scale],
    leoTasteSpot: [cx - 34 * scale, cy - 28 * scale],
  };
}

/**
 * Dessine le moule à gâteau en 3D et le gâteau doré aux fraises (avec son évolution :
 * pâte crue -> dôme doré qui gonfle au four -> gâteau glacé fumant -> encoche 3D quand les parts sont coupées).
 */
export function drawCakeAndPan3D(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  cx: number,
  cy: number,
  opts: {
    scale?: number;
    batterLevel?: number; // 0..1
    bakeDome?: number; // 0 = cru/plat, 1 = dôme doré gonflé
    decorated?: boolean; // Glaçage chantilly + fraises
    steamAmount?: number; // 0..1
    slicesRemoved?: number; // 0, 1 ou 2 parts découpées (affiche l'encoche 3D dans le gâteau)
  } = {}
): CakePanAnchors {
  const {
    scale = 1,
    batterLevel = 0.2,
    bakeDome = 0,
    decorated = false,
    steamAmount = 0,
    slicesRemoved = 0,
  } = opts;

  const rx = 54 * scale;
  const ry = 17 * scale;
  const panH = 28 * scale;

  // Anses latérales du moule
  drawHandColoredPolygon(
    ctx,
    [
      [cx - rx - 14 * scale, cy - 8 * scale],
      [cx - rx + 2 * scale, cy - 8 * scale],
      [cx - rx + 2 * scale, cy + 4 * scale],
      [cx - rx - 14 * scale, cy + 4 * scale],
    ],
    frameIndex,
    'cake-pan-left-ear',
    { fillColor: PALETTE.panMetal, strokeWidth: 2.8 }
  );
  drawHandColoredPolygon(
    ctx,
    [
      [cx + rx - 2 * scale, cy - 8 * scale],
      [cx + rx + 14 * scale, cy - 8 * scale],
      [cx + rx + 14 * scale, cy + 4 * scale],
      [cx + rx - 2 * scale, cy + 4 * scale],
    ],
    frameIndex,
    'cake-pan-right-ear',
    { fillColor: PALETTE.panMetal, strokeWidth: 2.8 }
  );

  // Paroi cylindrique 3D du moule
  const bottomArc = sampleEllipseArc(cx, cy + panH, rx * 0.94, ry * 0.92, 0, Math.PI, 18);
  const topBackArc = sampleEllipseArc(cx, cy, rx, ry, Math.PI, Math.PI * 2, 18);
  drawHandColoredPolygon(
    ctx,
    [...bottomArc, ...topBackArc],
    frameIndex,
    'cake-pan-cylinder',
    {
      fillColor: PALETTE.panMetal,
      hatchColor: PALETTE.panInside,
      hatchAlpha: 0.25,
      strokeWidth: 3.4 * Math.max(0.75, scale),
    }
  );

  // Intérieur du moule
  const rimPts = sampleEllipseArc(cx, cy, rx, ry, 0, Math.PI * 2, 22);
  drawHandColoredPolygon(ctx, rimPts, frameIndex, 'cake-pan-rim', {
    fillColor: PALETTE.panInside,
    strokeWidth: 3.0 * Math.max(0.75, scale),
  });

  // Remplissage de pâte ou dôme de gâteau cuit en 3D
  if (batterLevel > 0.05 || bakeDome > 0.05) {
    const domeH = bakeDome * 30 * scale;
    const topY = cy - domeH * 0.65;
    const domeCrownPts = sampleEllipseArc(
      cx,
      cy - 2 * scale,
      rx * 0.93,
      ry * 0.85 + domeH,
      Math.PI,
      Math.PI * 2,
      20
    );
    const frontRimPts = sampleEllipseArc(cx, cy - 2 * scale, rx * 0.93, ry * 0.88, 0, Math.PI, 18);

    const spongeColor = bakeDome > 0.35 ? PALETTE.cakeSponge : PALETTE.batterGold;
    const crustColor = bakeDome > 0.35 ? PALETTE.cakeCrust : '#DFB24C';

    drawHandColoredPolygon(
      ctx,
      [...frontRimPts, ...domeCrownPts],
      frameIndex,
      'cake-sponge-dome',
      {
        fillColor: spongeColor,
        hatchColor: crustColor,
        hatchAlpha: 0.28,
        strokeWidth: 3.4 * Math.max(0.75, scale),
      }
    );

    // Glaçage chantilly festonné et fraises sur le dessus du gâteau cuit
    if (decorated && bakeDome > 0.6) {
      const icingPts: Point2D[] = [];
      const steps = 18;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = lerp(0, Math.PI * 2, t);
        const scallop = Math.sin(i * 2.4) * 3.5 * scale;
        icingPts.push([
          cx + Math.cos(a) * rx * 0.84,
          topY + Math.sin(a) * (ry * 0.72) + scallop,
        ]);
      }
      drawHandColoredPolygon(ctx, icingPts, frameIndex, 'cake-icing-top', {
        fillColor: PALETTE.cakeIcing,
        hatchColor: '#E5D8C5',
        hatchAlpha: 0.18,
        strokeWidth: 3.0 * Math.max(0.75, scale),
      });

      // Encoche 3D réaliste lorsque Mamie a découpé 1 ou 2 parts du gâteau !
      if (slicesRemoved > 0) {
        const wedgeWidth = slicesRemoved === 1 ? 22 * scale : 38 * scale;
        const wedgePoly: Point2D[] = [
          [cx, topY - 2 * scale],
          [cx - wedgeWidth, cy - 4 * scale],
          [cx - wedgeWidth, cy + 14 * scale],
          [cx + 6 * scale, cy + 16 * scale],
          [cx + 6 * scale, cy - 2 * scale],
        ];
        drawHandColoredPolygon(ctx, wedgePoly, frameIndex, 'cake-cut-wedge-interior', {
          fillColor: '#F3C77E',
          hatchColor: PALETTE.strawberryRed, // couche de confiture de fraises interne
          hatchAlpha: 0.35,
          strokeWidth: 3.0,
        });
      }

      // Fraises rouges disposées en couronne sur le gâteau
      const berryAngles = [0.3, 1.2, 2.1, 3.0, 4.1, 5.2];
      berryAngles.forEach((ang, idx) => {
        // Si une part est coupée à l'avant-gauche, la fraise correspondante est partie sur l'assiette !
        if (slicesRemoved >= 1 && idx === 2) return;
        if (slicesRemoved >= 2 && idx === 1) return;

        const bx = cx + Math.cos(ang) * rx * 0.56;
        const by = topY + Math.sin(ang) * ry * 0.48 - 5 * scale;
        const berryPts = sampleEllipseArc(bx, by, 8.5 * scale, 9.5 * scale, 0, Math.PI * 2, 10);
        drawHandColoredPolygon(ctx, berryPts, frameIndex, `cake-strawberry-${idx}`, {
          fillColor: PALETTE.strawberryRed,
          strokeWidth: 2.5,
          colorOffsetScale: 1.8,
        });
      });
    }
  }

  // Volutes de vapeur chaude dessinées au crayon au-dessus du gâteau sorti du four
  if (steamAmount > 0.05) {
    const steamXOffsets = [-26, 0, 26];
    steamXOffsets.forEach((ox, idx) => {
      const phase = frameIndex * 0.16 + idx * 1.8;
      const baseX = cx + ox * scale;
      const baseY = cy - 36 * scale;
      const pts: Point2D[] = [
        [baseX, baseY],
        [baseX + Math.sin(phase) * 9, baseY - 22 * scale],
        [baseX - Math.sin(phase + 1.1) * 10, baseY - 46 * scale],
        [baseX + Math.cos(phase) * 8, baseY - 68 * scale],
      ];
      drawPencilPolyline(ctx, pts, frameIndex, `cake-steam-${idx}`, {
        color: '#8C7A68',
        width: 2.4,
        wobble: 1.8,
        alpha: 0.55 * steamAmount,
        doublePass: false,
      });
    });
  }

  return getCakePanAnchors(cx, cy, scale);
}

/**
 * Dessine une assiette à dessert en porcelaine (avec ou sans une part de gâteau aux fraises).
 */
export function drawDessertPlateWithSlice(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  cx: number,
  cy: number,
  hasSlice: boolean,
  tag: string,
  scale = 1
): void {
  const outerPts = sampleEllipseArc(cx, cy, 38 * scale, 13 * scale, 0, Math.PI * 2, 20);
  drawHandColoredPolygon(ctx, outerPts, frameIndex, `${tag}-plate-outer`, {
    fillColor: PALETTE.platePorcelain,
    hatchColor: PALETTE.plateRim,
    hatchAlpha: 0.2,
    strokeWidth: 3.2 * Math.max(0.8, scale),
  });

  if (hasSlice) {
    // Part triangulaire 3D de gâteau doré avec ligne de confiture et fraise sur le dessus
    const slicePoly: Point2D[] = [
      [cx - 18 * scale, cy + 2 * scale],
      [cx + 18 * scale, cy - 6 * scale],
      [cx + 18 * scale, cy - 24 * scale],
      [cx - 4 * scale, cy - 26 * scale],
      [cx - 18 * scale, cy - 10 * scale],
    ];
    drawHandColoredPolygon(ctx, slicePoly, frameIndex, `${tag}-cake-slice`, {
      fillColor: PALETTE.cakeSponge,
      hatchColor: PALETTE.cakeCrust,
      hatchAlpha: 0.28,
      strokeWidth: 3.0,
    });
    // Dessus glacé blanc
    drawHandColoredPolygon(
      ctx,
      [
        [cx - 18 * scale, cy - 10 * scale],
        [cx - 4 * scale, cy - 26 * scale],
        [cx + 18 * scale, cy - 24 * scale],
        [cx + 10 * scale, cy - 10 * scale],
      ],
      frameIndex,
      `${tag}-slice-icing`,
      {
        fillColor: PALETTE.cakeIcing,
        strokeWidth: 2.5,
      }
    );
    // Petite fraise sur la part
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(cx + 2 * scale, cy - 24 * scale, 7 * scale, 7.5 * scale, 0, Math.PI * 2, 10),
      frameIndex,
      `${tag}-slice-berry`,
      {
        fillColor: PALETTE.strawberryRed,
        strokeWidth: 2.2,
      }
    );
  }
}

/**
 * Dessine le ballon de jardin rouge et crème avec son ombre portée au sol (respect de la gravité).
 */
export function drawGardenBall(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  bx: number,
  by: number,
  groundY: number,
  radius = 19,
  squash = 1
): void {
  // Ombre au sol directement à la verticale du ballon (s'élargit quand le ballon est proche du sol)
  const heightAboveGround = Math.max(0, groundY - by);
  const shadowScale = clamp(1 - heightAboveGround / 160, 0.35, 1.15);
  const shadowPts = sampleEllipseArc(
    bx,
    groundY + 4,
    radius * 1.1 * shadowScale,
    radius * 0.35 * shadowScale,
    0,
    Math.PI * 2,
    14
  );
  ctx.save();
  ctx.fillStyle = 'rgba(65, 92, 42, 0.26)';
  ctx.beginPath();
  shadowPts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Corps sphérique du ballon avec squash-and-stretch au rebond
  const rx = radius * squash;
  const ry = radius / Math.max(0.75, squash);
  const ballPts = sampleEllipseArc(bx, by, rx, ry, 0, Math.PI * 2, 18);
  drawHandColoredPolygon(ctx, ballPts, frameIndex, 'garden-ball', {
    fillColor: PALETTE.ballRed,
    hatchColor: '#9E2E22',
    hatchAlpha: 0.25,
    strokeWidth: 3.0,
  });

  // Bande crème médiane sur le ballon
  const stripePts = sampleEllipseArc(bx, by, rx * 0.92, ry * 0.38, 0, Math.PI, 10);
  drawPencilPolyline(ctx, stripePts, frameIndex, 'garden-ball-stripe', {
    color: PALETTE.ballCream,
    width: 3.5,
    doublePass: false,
  });
}
