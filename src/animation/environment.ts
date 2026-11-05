import { PALETTE } from './config';
import {
  Point2D,
  clamp,
  drawHandColoredPolygon,
  drawPencilPolyline,
  lerp,
  sampleEllipseArc,
} from './pencilEngine';

/**
 * Calcule la position exacte à l'écran de la poignée du four 3D
 * en fonction de l'angle d'ouverture de la porte (0° = fermée, 75° = ouverte).
 */
export function getOvenDoorGeometry(openAngleDeg: number): {
  hingeLeft: Point2D;
  hingeRight: Point2D;
  topLeft: Point2D;
  topRight: Point2D;
  handleCenter: Point2D;
  handleLeft: Point2D;
  handleRight: Point2D;
  openRad: number;
} {
  const openRad = (clamp(openAngleDeg, 0, 82) * Math.PI) / 180;
  const hingeY = 1096;
  const doorHeight = 224;
  const hingeLeft: Point2D = [726, hingeY];
  const hingeRight: Point2D = [976, hingeY];

  // Projection 3D perspective lorsque la porte bascule vers l'avant autour de la charnière basse
  const cosA = Math.cos(openRad);
  const sinA = Math.sin(openRad);

  // Plus la porte s'ouvre vers la caméra, plus le bord supérieur descend et s'élargit par perspective
  const perspectiveSpread = sinA * 28;
  const forwardDrop = sinA * 56;
  const topY = hingeY - doorHeight * cosA + forwardDrop;

  const topLeft: Point2D = [hingeLeft[0] - perspectiveSpread, topY];
  const topRight: Point2D = [hingeRight[0] + perspectiveSpread * 0.75, topY + 6 * (1 - cosA)];

  // La poignée est située à 84% de la hauteur de la porte à partir de la charnière
  const hRatio = 0.84;
  const handleY = lerp(hingeY, topY, hRatio) - sinA * 10;
  const handleLeft: Point2D = [
    lerp(hingeLeft[0], topLeft[0], hRatio) + 28,
    handleY,
  ];
  const handleRight: Point2D = [
    lerp(hingeRight[0], topRight[0], hRatio) - 28,
    handleY + 3 * (1 - cosA),
  ];
  const handleCenter: Point2D = [
    (handleLeft[0] + handleRight[0]) * 0.5,
    (handleLeft[1] + handleRight[1]) * 0.5,
  ];

  return {
    hingeLeft,
    hingeRight,
    topLeft,
    topRight,
    handleCenter,
    handleLeft,
    handleRight,
    openRad,
  };
}

/**
 * Dessine les murs de la cuisine, le sol carrelé en perspective 3D et la grande porte-fenêtre
 * ouverte donnant sur le jardin ensoleillé (profondeur multi-plans).
 */
export function drawKitchenAndGardenBackdrop(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  ovenGlow: number
): void {
  // 1. Mur du fond de la cuisine
  drawHandColoredPolygon(
    ctx,
    [
      [0, 0],
      [1080, 0],
      [1080, 880],
      [0, 880],
    ],
    frameIndex,
    'kitchen-wall-upper',
    {
      fillColor: PALETTE.wallCream,
      hatchColor: '#E3D2B6',
      hatchAlpha: 0.16,
      hatchSpacing: 18,
      strokeOutline: false,
      occludePaper: false,
      colorOffsetScale: 2.0,
    }
  );

  // Lambris bois bas sur le mur arrière
  drawHandColoredPolygon(
    ctx,
    [
      [0, 690],
      [660, 690],
      [660, 880],
      [0, 880],
    ],
    frameIndex,
    'kitchen-wainscot',
    {
      fillColor: PALETTE.wallWainscot,
      hatchColor: '#BDA482',
      hatchAlpha: 0.18,
      hatchSpacing: 14,
       hatchAngle: 1.57,
      strokeOutline: true,
      strokeWidth: 3.2,
    }
  );

  // Poutre en bois chaleureuse en haut (dans la marge haute)
  drawHandColoredPolygon(
    ctx,
    [
      [0, 110],
      [1080, 110],
      [1080, 162],
      [0, 162],
    ],
    frameIndex,
    'ceiling-beam',
    {
      fillColor: PALETTE.woodBeam,
      hatchColor: '#5E3F24',
      hatchAlpha: 0.25,
      hatchSpacing: 12,
      hatchAngle: 0.08,
      strokeWidth: 3.8,
    }
  );

  // 2. Sol carrelé de la cuisine en perspective 3D (y = 875 .. 1920)
  drawHandColoredPolygon(
    ctx,
    [
      [0, 875],
      [1080, 875],
      [1080, 1920],
      [0, 1920],
    ],
    frameIndex,
    'kitchen-floor-base',
    {
      fillColor: PALETTE.floorTileA,
      hatchColor: PALETTE.floorTileB,
      hatchAlpha: 0.2,
      hatchSpacing: 16,
      hatchAngle: -0.35,
      strokeWidth: 3.5,
    }
  );

  // Lignes de perspective 3D du carrelage convergeant vers le point de fuite (510, 640)
  const vpX = 510;
  const vpY = 640;
  for (let i = -3; i <= 7; i++) {
    const bottomX = i * 195;
    const tStart = (875 - vpY) / (1920 - vpY);
    const startX = lerp(vpX, bottomX, tStart);
    drawPencilPolyline(
      ctx,
      [
        [startX, 875],
        [bottomX, 1920],
      ],
      frameIndex,
      `floor-persp-ray-${i}`,
      {
        color: PALETTE.graphiteLight,
        width: 2.2,
        wobble: 1.5,
        alpha: 0.42,
        doublePass: false,
      }
    );
  }
  const tileRows = [930, 1005, 1100, 1220, 1370, 1550, 1760];
  tileRows.forEach((ry, idx) => {
    drawPencilPolyline(
      ctx,
      [
        [0, ry],
        [1080, ry],
      ],
      frameIndex,
      `floor-row-${idx}`,
      {
        color: PALETTE.graphiteLight,
        width: 2.2,
        wobble: 1.6,
        alpha: 0.4,
        doublePass: false,
      }
    );
  });

  // 3. GRANDE PORTE-FENÊTRE OUVERTE SUR LE JARDIN ENSOLEILLÉ (x = 95 .. 605, y = 225 .. 875)
  const winLeft = 95;
  const winRight = 605;
  const winTop = 225;
  const winBottom = 875;

  // Ciel du jardin
  drawHandColoredPolygon(
    ctx,
    [
      [winLeft, winTop],
      [winRight, winTop],
      [winRight, 550],
      [winLeft, 550],
    ],
    frameIndex,
    'garden-sky',
    {
      fillColor: PALETTE.skyBlue,
      hatchColor: '#B8D9EA',
      hatchAlpha: 0.22,
      hatchSpacing: 14,
      hatchAngle: -0.4,
      strokeOutline: false,
    }
  );

  // Soleil doux et rayons dans le jardin
  const sunPoly = sampleEllipseArc(495, 305, 42, 42, 0, Math.PI * 2, 20);
  drawHandColoredPolygon(ctx, sunPoly, frameIndex, 'garden-sun', {
    fillColor: PALETTE.sunGlow,
    strokeColor: '#DFB44B',
    strokeWidth: 2.6,
    colorOffsetScale: 3.2,
  });

  // Collines douces au loin
  drawHandColoredPolygon(
    ctx,
    [
      [winLeft, 520],
      [220, 485],
      [390, 500],
      [510, 475],
      [winRight, 495],
      [winRight, 600],
      [winLeft, 600],
    ],
    frameIndex,
    'garden-hills',
    {
      fillColor: PALETTE.distantHills,
      hatchColor: '#8FB278',
      hatchAlpha: 0.22,
      strokeWidth: 2.6,
    }
  );

  // Pelouse ensoleillée en pente douce vers la porte-fenêtre
  drawHandColoredPolygon(
    ctx,
    [
      [winLeft, 545],
      [winRight, 545],
      [winRight, winBottom - 22],
      [winLeft, winBottom - 22],
    ],
    frameIndex,
    'garden-lawn',
    {
      fillColor: PALETTE.grassLight,
      hatchColor: PALETTE.grassMid,
      hatchAlpha: 0.26,
      hatchSpacing: 13,
      hatchAngle: -0.25,
      strokeWidth: 2.8,
    }
  );

  // Allée de pierres menant du jardin vers le seuil de la cuisine
  const steppingStones: Array<[number, number, number, number]> = [
    [355, 795, 58, 18],
    [335, 735, 48, 15],
    [312, 682, 40, 12],
  ];
  steppingStones.forEach(([sx, sy, srx, sry], idx) => {
    const stonePts = sampleEllipseArc(sx, sy, srx, sry, 0, Math.PI * 2, 16);
    drawHandColoredPolygon(ctx, stonePts, frameIndex, `garden-stone-${idx}`, {
      fillColor: '#E5D8C3',
      strokeWidth: 2.4,
      colorOffsetScale: 2.4,
    });
  });

  // Pommier chaleureux à gauche dans le jardin
  drawHandColoredPolygon(
    ctx,
    [
      [152, 625],
      [165, 455],
      [192, 455],
      [204, 625],
    ],
    frameIndex,
    'garden-tree-trunk',
    {
      fillColor: PALETTE.treeTrunk,
      hatchColor: '#563820',
      hatchAlpha: 0.28,
      strokeWidth: 3.0,
    }
  );
  const foliagePts = sampleEllipseArc(188, 395, 84, 68, 0, Math.PI * 2, 22);
  drawHandColoredPolygon(ctx, foliagePts, frameIndex, 'garden-tree-crown', {
    fillColor: PALETTE.foliageA,
    hatchColor: PALETTE.foliageB,
    hatchAlpha: 0.3,
    strokeWidth: 3.2,
    colorOffsetScale: 4.2,
  });

  // Petites pommes rouges dans l'arbre
  const apples: Point2D[] = [
    [152, 385],
    [205, 365],
    [225, 412],
  ];
  apples.forEach(([ax, ay], idx) => {
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(ax, ay, 8, 8, 0, Math.PI * 2, 10),
      frameIndex,
      `tree-apple-${idx}`,
      {
        fillColor: PALETTE.flowerRed,
        strokeWidth: 2.0,
        colorOffsetScale: 1.5,
      }
    );
  });

  // Seuil en pierre de la porte-fenêtre (relie le jardin et le sol de la cuisine)
  drawHandColoredPolygon(
    ctx,
    [
      [winLeft - 12, winBottom - 26],
      [winRight + 12, winBottom - 26],
      [winRight + 22, winBottom + 6],
      [winLeft - 22, winBottom + 6],
    ],
    frameIndex,
    'doorway-threshold-step',
    {
      fillColor: '#D6C4AC',
      hatchColor: '#B59E82',
      hatchAlpha: 0.22,
      strokeWidth: 3.4,
    }
  );

  // Encadrement en bois de la porte-fenêtre et battants ouverts en perspective 3D
  // Battant gauche ouvert vers l'intérieur
  drawHandColoredPolygon(
    ctx,
    [
      [42, 205],
      [winLeft, 225],
      [winLeft, winBottom],
      [42, winBottom + 24],
    ],
    frameIndex,
    'french-door-left-leaf',
    {
      fillColor: '#C89B6C',
      hatchColor: '#9E7145',
      hatchAlpha: 0.22,
      strokeWidth: 3.6,
    }
  );
  // Battant droit ouvert
  drawHandColoredPolygon(
    ctx,
    [
      [winRight, 225],
      [648, 210],
      [648, winBottom + 18],
      [winRight, winBottom],
    ],
    frameIndex,
    'french-door-right-leaf',
    {
      fillColor: '#C89B6C',
      hatchColor: '#9E7145',
      hatchAlpha: 0.22,
      strokeWidth: 3.6,
    }
  );
  // Linteau supérieur de la porte-fenêtre
  drawHandColoredPolygon(
    ctx,
    [
      [winLeft - 18, 202],
      [winRight + 18, 202],
      [winRight + 10, winTop],
      [winLeft - 10, winTop],
    ],
    frameIndex,
    'french-door-lintel',
    {
      fillColor: '#B58354',
      strokeWidth: 3.6,
    }
  );

  // 4. MEUBLE DE CUISINE 3D ET FOUR 3D À DROITE (x = 665 .. 1045, y = 510 .. 1185)
  // Crédence carrelée
  drawHandColoredPolygon(
    ctx,
    [
      [675, 520],
      [1045, 520],
      [1045, 745],
      [675, 745],
    ],
    frameIndex,
    'kitchen-backsplash',
    {
      fillColor: PALETTE.tileBacksplash,
      hatchColor: '#B8C9C3',
      hatchAlpha: 0.2,
      hatchSpacing: 15,
      strokeWidth: 3.2,
    }
  );

  // Étagère murale en bois au-dessus de la crédence
  drawHandColoredPolygon(
    ctx,
    [
      [685, 505],
      [1035, 505],
      [1035, 528],
      [685, 528],
    ],
    frameIndex,
    'wall-shelf',
    {
      fillColor: PALETTE.counterWood,
      strokeWidth: 3.4,
    }
  );

  // Pot à farine et pot de confiture permanents sur l'étagère/comptoir droit
  drawHandColoredPolygon(
    ctx,
    [
      [940, 668],
      [998, 668],
      [1004, 752],
      [934, 752],
    ],
    frameIndex,
    'flour-jar-counter',
    {
      fillColor: '#FAF3E6',
      hatchColor: '#DFD2BC',
      strokeWidth: 3.2,
    }
  );
  drawHandColoredPolygon(
    ctx,
    sampleEllipseArc(969, 662, 32, 10, 0, Math.PI * 2, 14),
    frameIndex,
    'flour-jar-lid',
    {
      fillColor: PALETTE.bunRibbon,
      strokeWidth: 3.0,
    }
  );

  // Corps 3D du meuble bas (côté gauche en perspective + façade)
  drawHandColoredPolygon(
    ctx,
    [
      [660, 775],
      [702, 740],
      [702, 1125],
      [660, 1175],
    ],
    frameIndex,
    'counter-side-3d',
    {
      fillColor: PALETTE.counterFront,
      hatchColor: '#784E2A',
      hatchAlpha: 0.26,
      strokeWidth: 3.6,
    }
  );

  drawHandColoredPolygon(
    ctx,
    [
      [702, 785],
      [1045, 785],
      [1045, 1175],
      [702, 1175],
    ],
    frameIndex,
    'counter-front-face',
    {
      fillColor: PALETTE.counterWood,
      hatchColor: '#8E5E35',
      hatchAlpha: 0.22,
      strokeWidth: 3.8,
    }
  );

  // Plan de travail supérieur en perspective 3D
  drawHandColoredPolygon(
    ctx,
    [
      [652, 778],
      [698, 736],
      [1050, 736],
      [1050, 788],
    ],
    frameIndex,
    'counter-top-3d',
    {
      fillColor: PALETTE.counterTop,
      hatchColor: '#CFC0A8',
      hatchAlpha: 0.2,
      strokeWidth: 3.8,
    }
  );

  // Encastrement du four 3D (châssis + bandeau de commande)
  drawHandColoredPolygon(
    ctx,
    [
      [716, 812],
      [988, 812],
      [988, 1112],
      [716, 1112],
    ],
    frameIndex,
    'oven-frame-body',
    {
      fillColor: PALETTE.ovenBody,
      hatchColor: PALETTE.ovenPanel,
      hatchAlpha: 0.25,
      strokeWidth: 3.8,
    }
  );

  // Boutons rotatifs du four sur le bandeau supérieur
  for (const bx of [765, 852, 938]) {
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(bx, 838, 12, 12, 0, Math.PI * 2, 12),
      frameIndex,
      `oven-knob-${bx}`,
      {
        fillColor: '#D8CFC2',
        strokeWidth: 2.8,
      }
    );
  }

  // Cavité intérieure 3D du four (s'illumine chaudement pendant la cuisson)
  const cavityColor =
    ovenGlow > 0.2 ? PALETTE.ovenGlowWarm : '#3E352F';
  drawHandColoredPolygon(
    ctx,
    [
      [734, 868],
      [968, 868],
      [968, 1092],
      [734, 1092],
    ],
    frameIndex,
    'oven-cavity-interior',
    {
      fillColor: cavityColor,
      hatchColor: ovenGlow > 0.2 ? PALETTE.ovenGlowHot : '#28221E',
      hatchAlpha: 0.35,
      strokeWidth: 3.4,
    }
  );

  // Parois latérales internes en perspective 3D dans la cavité du four
  drawPencilPolyline(
    ctx,
    [
      [734, 868],
      [764, 896],
      [938, 896],
      [968, 868],
    ],
    frameIndex,
    'oven-inner-ceiling-persp',
    { color: PALETTE.graphiteDark, width: 2.4 }
  );
  // Grille métallique 3D du four (à y = 995)
  drawPencilPolyline(
    ctx,
    [
      [742, 998],
      [766, 976],
      [936, 976],
      [960, 998],
      [742, 998],
    ],
    frameIndex,
    'oven-rack-3d',
    {
      color: '#DED8CE',
      width: 3.4,
      wobble: 1.5,
    }
  );
}

/**
 * Dessine la porte du four articulée en 3D par-dessus la cavité du four.
 * Lorsque la porte est fermée ou entrouverte, le hublot vitré permet de voir l'intérieur.
 */
export function drawOvenDoor3D(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  openAngleDeg: number,
  ovenGlow: number
): void {
  const geom = getOvenDoorGeometry(openAngleDeg);
  const { hingeLeft, hingeRight, topLeft, topRight, handleLeft, handleRight, openRad } = geom;

  // Épaisseur 3D de la tranche supérieure de la porte lorsqu'elle est ouverte
  if (openAngleDeg > 8) {
    const thickness = Math.sin(openRad) * 18;
    drawHandColoredPolygon(
      ctx,
      [
        topLeft,
        topRight,
        [topRight[0], topRight[1] + thickness],
        [topLeft[0], topLeft[1] + thickness],
      ],
      frameIndex,
      'oven-door-thickness-3d',
      {
        fillColor: '#7A848D',
        strokeWidth: 3.0,
      }
    );
  }

  // Cadre extérieur de la porte en 3D
  drawHandColoredPolygon(
    ctx,
    [topLeft, topRight, hingeRight, hingeLeft],
    frameIndex,
    'oven-door-panel-3d',
    {
      fillColor: PALETTE.ovenBody,
      hatchColor: '#333B42',
      hatchAlpha: 0.24,
      strokeWidth: 3.8,
      occludePaper: openAngleDeg > 25, // Lorsqu'elle est fermée, on dessine le hublot translucide
    }
  );

  // Hublot vitré en perspective sur la porte du four
  const winTL: Point2D = [
    lerp(topLeft[0], hingeLeft[0], 0.18) + 28,
    lerp(topLeft[1], hingeLeft[1], 0.18),
  ];
  const winTR: Point2D = [
    lerp(topRight[0], hingeRight[0], 0.18) - 28,
    lerp(topRight[1], hingeRight[1], 0.18),
  ];
  const winBR: Point2D = [
    lerp(topRight[0], hingeRight[0], 0.78) - 28,
    lerp(topRight[1], hingeRight[1], 0.78),
  ];
  const winBL: Point2D = [
    lerp(topLeft[0], hingeLeft[0], 0.78) + 28,
    lerp(topLeft[1], hingeLeft[1], 0.78),
  ];

  ctx.save();
  ctx.fillStyle =
    ovenGlow > 0.15
      ? `rgba(255, 198, 92, ${0.42 + ovenGlow * 0.32})`
      : 'rgba(135, 158, 175, 0.48)';
  ctx.beginPath();
  ctx.moveTo(winTL[0], winTL[1]);
  ctx.lineTo(winTR[0], winTR[1]);
  ctx.lineTo(winBR[0], winBR[1]);
  ctx.lineTo(winBL[0], winBL[1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawPencilPolyline(
    ctx,
    [winTL, winTR, winBR, winBL],
    frameIndex,
    'oven-door-window-outline',
    {
      color: PALETTE.graphiteDark,
      width: 3.2,
      closed: true,
    }
  );

  // Barre de poignée du four en 3D
  drawPencilPolyline(
    ctx,
    [handleLeft, handleRight],
    frameIndex,
    'oven-door-handle-bar',
    {
      color: '#EAE3D5',
      width: 7.5,
      wobble: 1.4,
      doublePass: false,
    }
  );
  drawPencilPolyline(
    ctx,
    [handleLeft, handleRight],
    frameIndex,
    'oven-door-handle-stroke',
    {
      color: PALETTE.graphiteDark,
      width: 3.4,
      wobble: 1.5,
    }
  );
}

/**
 * Dessine les deux chaises en bois des enfants (Clara à gauche x=240, Léo au centre-gauche x=435).
 * L'espace sous l'assise (y = 1335 .. 1600) est volontairement dégagé pour que l'on voie
 * parfaitement les pieds des enfants se balancer d'avant en arrière.
 */
export function drawChildrenChairsBackAndSeat(
  ctx: CanvasRenderingContext2D,
  frameIndex: number
): void {
  const chairs = [
    { id: 'clara-chair', cx: 242, seatY: 1286 },
    { id: 'leo-chair', cx: 438, seatY: 1286 },
  ];

  for (const ch of chairs) {
    const { id, cx, seatY } = ch;
    const halfW = 62;

    // Pieds arrière et montants du dossier (continus)
    drawHandColoredPolygon(
      ctx,
      [
        [cx - halfW, 995],
        [cx - halfW + 14, 995],
        [cx - halfW + 14, 1575],
        [cx - halfW, 1575],
      ],
      frameIndex,
      `${id}-left-post`,
      {
        fillColor: PALETTE.tableLeg,
        strokeWidth: 3.2,
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [cx + halfW - 14, 1055],
        [cx + halfW, 1055],
        [cx + halfW, 1575],
        [cx + halfW - 14, 1575],
      ],
      frameIndex,
      `${id}-right-post`,
      {
        fillColor: PALETTE.tableLeg,
        strokeWidth: 3.2,
      }
    );

    // traverses du dossier en bois
    drawHandColoredPolygon(
      ctx,
      [
        [cx - halfW + 10, 1012],
        [cx + halfW - 10, 1012],
        [cx + halfW - 10, 1052],
        [cx - halfW + 10, 1052],
      ],
      frameIndex,
      `${id}-backrest-top`,
      {
        fillColor: PALETTE.chairWood,
        strokeWidth: 3.2,
      }
    );

    // Assise 3D en perspective
    drawHandColoredPolygon(
      ctx,
      [
        [cx - halfW - 8, seatY],
        [cx - halfW + 6, seatY - 24],
        [cx + halfW + 6, seatY - 24],
        [cx + halfW + 10, seatY],
        [cx + halfW + 10, seatY + 18],
        [cx - halfW - 8, seatY + 18],
      ],
      frameIndex,
      `${id}-seat-3d`,
      {
        fillColor: PALETTE.chairWood,
        hatchColor: PALETTE.tableEdge,
        hatchAlpha: 0.24,
        strokeWidth: 3.5,
      }
    );

    // Pieds avant de la chaise sur les côtés (laissant le centre sous l'assise 100% ouvert pour les jambes qui balancent)
    drawHandColoredPolygon(
      ctx,
      [
        [cx - halfW - 4, seatY + 18],
        [cx - halfW + 10, seatY + 18],
        [cx - halfW + 8, 1595],
        [cx - halfW - 6, 1595],
      ],
      frameIndex,
      `${id}-front-left-leg`,
      {
        fillColor: PALETTE.chairWood,
        strokeWidth: 3.2,
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [cx + halfW - 8, seatY + 18],
        [cx + halfW + 6, seatY + 18],
        [cx + halfW + 4, 1595],
        [cx + halfW - 10, 1595],
      ],
      frameIndex,
      `${id}-front-right-leg`,
      {
        fillColor: PALETTE.chairWood,
        strokeWidth: 3.2,
      }
    );
  }
}

/**
 * Dessine la grande table familiale en chêne en perspective 3D.
 * Les 4 pieds sont aux extrémités gauche (x=125) et droite (x=895),
 * ce qui garde tout l'espace sous la table (y = 1265 .. 1620) ouvert pour voir
 * les jambes et chaussures de Clara et Léo se balancer sous leurs chaises.
 */
export function drawFamilyTable3D(ctx: CanvasRenderingContext2D, frameIndex: number): void {
  // Ombre douce au sol sous la table et les chaises
  const shadowPts = sampleEllipseArc(510, 1605, 410, 44, 0, Math.PI * 2, 24);
  ctx.save();
  ctx.fillStyle = 'rgba(92, 68, 44, 0.13)';
  ctx.beginPath();
  shadowPts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Pieds arrière de la table (x = 185 et x = 835)
  drawHandColoredPolygon(
    ctx,
    [
      [182, 1225],
      [204, 1225],
      [202, 1565],
      [180, 1565],
    ],
    frameIndex,
    'table-leg-back-left',
    {
      fillColor: PALETTE.tableLeg,
      strokeWidth: 3.4,
    }
  );
  drawHandColoredPolygon(
    ctx,
    [
      [822, 1225],
      [844, 1225],
      [842, 1565],
      [820, 1565],
    ],
    frameIndex,
    'table-leg-back-right',
    {
      fillColor: PALETTE.tableLeg,
      strokeWidth: 3.4,
    }
  );

  // Plateau supérieur 3D de la table en perspective trapézoïdale (y = 1138 .. 1236)
  drawHandColoredPolygon(
    ctx,
    [
      [168, 1138],
      [854, 1138],
      [916, 1234],
      [112, 1234],
    ],
    frameIndex,
    'table-top-surface-3d',
    {
      fillColor: PALETTE.tableTop,
      hatchColor: PALETTE.tableEdge,
      hatchAlpha: 0.22,
      hatchSpacing: 14,
      hatchAngle: 0.05,
      strokeWidth: 4.0,
    }
  );

  // Chant avant (épaisseur 3D du plateau de table)
  drawHandColoredPolygon(
    ctx,
    [
      [112, 1234],
      [916, 1234],
      [912, 1264],
      [116, 1264],
    ],
    frameIndex,
    'table-front-apron-3d',
    {
      fillColor: PALETTE.tableEdge,
      hatchColor: PALETTE.tableLeg,
      hatchAlpha: 0.26,
      strokeWidth: 3.8,
    }
  );

  // Pieds avant aux extrémités gauche (x=126) et droite (x=882)
  drawHandColoredPolygon(
    ctx,
    [
      [124, 1262],
      [152, 1262],
      [148, 1622],
      [120, 1622],
    ],
    frameIndex,
    'table-leg-front-left',
    {
      fillColor: PALETTE.tableEdge,
      hatchColor: PALETTE.tableLeg,
      strokeWidth: 3.8,
    }
  );
  drawHandColoredPolygon(
    ctx,
    [
      [874, 1262],
      [902, 1262],
      [898, 1622],
      [870, 1622],
    ],
    frameIndex,
    'table-leg-front-right',
    {
      fillColor: PALETTE.tableEdge,
      hatchColor: PALETTE.tableLeg,
      strokeWidth: 3.8,
    }
  );
}
