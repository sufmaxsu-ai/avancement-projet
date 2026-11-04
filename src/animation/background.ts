import { CelSpecification } from './exposureSheet';
import {
  drawOrganicInkStroke,
  drawPencilHatch,
  drawWatercolorWash,
  getPaperBackgroundCanvas,
} from './pen';
import { Point2D, createSeededRandom, noise1D } from './prng';

/** Hauteur du trottoir où se posent exactement les talons de Grand-mère Colette */
export const GROUND_CONTACT_Y = 1452;

/**
 * Dessine l'arrière-plan multi-plans (Plan 0 Ciel, Plan 1 Horizon Village, Plan 2 Façades & Chat Roux, Plan 3 Chaussée pavée).
 */
export function drawStreetBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cel: CelSpecification
): void {
  const scroll = cel.groundScrollPx; // 0 .. ~960 px sur 6 secondes
  const bgSeed = 'STREET_BG_STATIC';
  const boilSeed = cel.celId; // Pour les éléments vivants dessinés image par image (chat, glycines, brise)

  // 0. Papier aquarelle de base
  const paper = getPaperBackgroundCanvas(width, height);
  ctx.drawImage(paper, 0, 0);

  // 1. Ciel matinal doré et rayons de soleil obliques
  ctx.save();
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 620);
  skyGrad.addColorStop(0, '#F7DEC0');
  skyGrad.addColorStop(0.55, '#FBEFD9');
  skyGrad.addColorStop(1, '#FAF3E6');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, 620);

  // Soleil doux du matin en haut à gauche
  const sunGrad = ctx.createRadialGradient(210, 175, 18, 210, 175, 340);
  sunGrad.addColorStop(0, 'rgba(255, 243, 196, 0.85)');
  sunGrad.addColorStop(0.4, 'rgba(248, 212, 138, 0.35)');
  sunGrad.addColorStop(1, 'rgba(248, 212, 138, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, width, 600);

  // Nuages aquarelle doux (parallaxe 0.08x)
  const cloudShift = -scroll * 0.08;
  drawCloudWash(ctx, 260 + cloudShift, 130, 155, 42, `${bgSeed}/cloud1`);
  drawCloudWash(ctx, 730 + cloudShift, 175, 185, 48, `${bgSeed}/cloud2`);
  ctx.restore();

  // 2. Plan lointain : Collines vert sauge, toits du village et petit clocher (parallaxe 0.18x)
  const farShift = -scroll * 0.18;
  drawDistantVillage(ctx, width, farShift, bgSeed);

  // 3. Plan intermédiaire : Les 3 jolies façades de la Rue des Glycines (parallaxe 0.52x)
  const midShift = -scroll * 0.52;
  drawStreetFacades(ctx, midShift, cel, bgSeed, boilSeed);

  // 4. Plan d'appui (Parallaxe 1.00x) : Trottoir calcaire et pavés en éventail verrouillés au pixel près sur la foulée
  drawCobblestoneGround(ctx, width, height, scroll, bgSeed);

  // 5. Rayons de lumière matinale obliques
  drawMorningSunbeams(ctx, width, height, cel.celNumber);
}

function drawCloudWash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string
): void {
  const pts: Point2D[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const rMod = 1 + 0.15 * Math.sin(i * 2.1);
    pts.push({
      x: cx + Math.cos(ang) * rx * rMod,
      y: cy + Math.sin(ang) * ry * rMod,
    });
  }
  drawWatercolorWash(ctx, pts, 'rgba(255, 252, 245, 0.72)', seed, {
    passes: 2,
    spread: 3.5,
  });
}

function drawDistantVillage(
  ctx: CanvasRenderingContext2D,
  width: number,
  farShift: number,
  seed: string
): void {
  ctx.save();
  // Colline douce à l'horizon
  const hillPts: Point2D[] = [
    { x: -120, y: 540 },
    { x: 180 + farShift, y: 375 },
    { x: 540 + farShift, y: 398 },
    { x: 920 + farShift, y: 355 },
    { x: width + 180, y: 410 },
    { x: width + 180, y: 560 },
    { x: -120, y: 560 },
  ];
  drawWatercolorWash(ctx, hillPts, '#C8D6C3', `${seed}/far-hill`, {
    passes: 2,
    spread: 2.5,
    alpha: 0.78,
  });

  // Silhouettes de cyprès et de toits lointains
  const cypressX = [140, 210, 820, 875, 1080];
  for (let i = 0; i < cypressX.length; i++) {
    const cx = cypressX[i] + farShift;
    const cy = 370 + (i % 2) * 18;
    const treePts: Point2D[] = [
      { x: cx - 14, y: cy + 75 },
      { x: cx - 11, y: cy + 20 },
      { x: cx, y: cy - 38 },
      { x: cx + 11, y: cy + 20 },
      { x: cx + 14, y: cy + 75 },
    ];
    drawWatercolorWash(ctx, treePts, '#7F9B82', `${seed}/cypress-${i}`, {
      passes: 2,
      alpha: 0.75,
    });
  }

  // Petit clocher de village au loin
  const bx = 585 + farShift;
  const towerPts: Point2D[] = [
    { x: bx - 32, y: 460 },
    { x: bx - 30, y: 310 },
    { x: bx, y: 248 },
    { x: bx + 30, y: 310 },
    { x: bx + 32, y: 460 },
  ];
  drawWatercolorWash(ctx, towerPts, '#E6D2B8', `${seed}/belltower`, { passes: 2, alpha: 0.85 });
  drawWatercolorWash(
    ctx,
    [
      { x: bx - 35, y: 312 },
      { x: bx, y: 244 },
      { x: bx + 35, y: 312 },
    ],
    '#C97A60',
    `${seed}/belltower-roof`,
    { passes: 2, alpha: 0.85 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: bx - 30, y: 440 },
      { x: bx - 30, y: 310 },
      { x: bx, y: 246 },
      { x: bx + 30, y: 310 },
      { x: bx + 30, y: 440 },
    ],
    `${seed}/belltower-ink`,
    { color: '#7D6657', width: 2.0, alpha: 0.65 }
  );
  ctx.restore();
}

function drawStreetFacades(
  ctx: CanvasRenderingContext2D,
  midShift: number,
  cel: CelSpecification,
  bgSeed: string,
  boilSeed: string
): void {
  const groundTopY = 1288;

  // =========================================================================
  // MAISON 1 (Gauche, x: -160 .. 470) : Boulangerie « Au Blé d'Or »
  // =========================================================================
  const m1x = -140 + midShift;
  const m1w = 600;
  const m1Top = 360;

  // Façade ocre crème
  drawWatercolorWash(
    ctx,
    [
      { x: m1x, y: groundTopY },
      { x: m1x, y: m1Top },
      { x: m1x + m1w, y: m1Top },
      { x: m1x + m1w, y: groundTopY },
    ],
    '#F4E1C4',
    `${bgSeed}/m1-wall`,
    { passes: 3, spread: 2.5, edgeColor: '#D9BF9B' }
  );

  // Toit en tuiles terre cuite
  drawWatercolorWash(
    ctx,
    [
      { x: m1x - 15, y: m1Top + 12 },
      { x: m1x + 25, y: m1Top - 78 },
      { x: m1x + m1w - 10, y: m1Top - 78 },
      { x: m1x + m1w + 12, y: m1Top + 12 },
    ],
    '#CE755A',
    `${bgSeed}/m1-roof`,
    { passes: 3, spread: 2.0 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: m1x - 15, y: m1Top + 10 },
      { x: m1x + m1w + 12, y: m1Top + 10 },
    ],
    `${bgSeed}/m1-eave`,
    { color: '#5A4336', width: 3.2 }
  );

  // Fenêtre haute de la boulangerie avec volets vert sauge
  drawStorybookWindow(ctx, m1x + 250, 470, 120, 165, '#839E88', `${bgSeed}/m1-win1`);

  // Bandeau bois et enseigne « BOULANGERIE »
  const shopX = m1x + 115;
  const shopY = 735;
  const shopW = 415;
  const shopH = 550;

  drawWatercolorWash(
    ctx,
    [
      { x: shopX, y: shopY + shopH },
      { x: shopX, y: shopY },
      { x: shopX + shopW, y: shopY },
      { x: shopX + shopW, y: shopY + shopH },
    ],
    '#8A5A42',
    `${bgSeed}/m1-woodfront`,
    { passes: 2, spread: 1.8 }
  );

  // Vitrine chaude éclairée avec pains dorés
  const vitX = shopX + 36;
  const vitY = shopY + 86;
  const vitW = 245;
  const vitH = 265;
  drawWatercolorWash(
    ctx,
    [
      { x: vitX, y: vitY + vitH },
      { x: vitX, y: vitY },
      { x: vitX + vitW, y: vitY },
      { x: vitX + vitW, y: vitY + vitH },
    ],
    '#FCE4A6',
    `${bgSeed}/m1-vitrine`,
    { passes: 2, spread: 1.5 }
  );

  // Pains et couronnes exposés dans la vitrine
  for (let b = 0; b < 3; b++) {
    const bx = vitX + 42 + b * 75;
    const by = vitY + 215;
    drawWatercolorWash(
      ctx,
      [
        { x: bx - 26, y: by },
        { x: bx - 20, y: by - 26 },
        { x: bx + 20, y: by - 26 },
        { x: bx + 26, y: by },
      ],
      '#D68A3E',
      `${bgSeed}/bread-${b}`,
      { passes: 2, spread: 1.0 }
    );
    drawOrganicInkStroke(
      ctx,
      [
        { x: bx - 26, y: by },
        { x: bx - 18, y: by - 25 },
        { x: bx + 18, y: by - 25 },
        { x: bx + 26, y: by },
      ],
      `${bgSeed}/bread-ink-${b}`,
      { color: '#5A3D28', width: 2.2, closed: true }
    );
  }

  // Store banne rayé rouge brique & crème (légère ondulation dans la brise)
  const awningSway = Math.sin(cel.celNumber * 0.22) * 2.2;
  const stripes = 7;
  const stripeW = (shopW + 24) / stripes;
  for (let s = 0; s < stripes; s++) {
    const sx = shopX - 12 + s * stripeW;
    const col = s % 2 === 0 ? '#C95B48' : '#FDF4E3';
    drawWatercolorWash(
      ctx,
      [
        { x: sx, y: shopY + 42 },
        { x: sx + stripeW, y: shopY + 42 },
        { x: sx + stripeW + 6, y: shopY + 114 + awningSway },
        { x: sx + 6, y: shopY + 114 + awningSway },
      ],
      col,
      `${bgSeed}/awning-${s}`,
      { passes: 2, spread: 1.2 }
    );
  }
  drawOrganicInkStroke(
    ctx,
    [
      { x: shopX - 12, y: shopY + 42 },
      { x: shopX + shopW + 12, y: shopY + 42 },
      { x: shopX + shopW + 18, y: shopY + 114 + awningSway },
      { x: shopX - 6, y: shopY + 114 + awningSway },
    ],
    `${boilSeed}/awning-outline`,
    { color: '#4A3429', width: 2.8, closed: true }
  );

  // =========================================================================
  // MAISON 2 (Centre, x: 460 .. 1140) : Maison aux Glycines & Chat Roux
  // =========================================================================
  const m2x = 460 + midShift;
  const m2w = 660;
  const m2Top = 285;

  // Mur en pierre blonde chaleureuse
  drawWatercolorWash(
    ctx,
    [
      { x: m2x, y: groundTopY },
      { x: m2x, y: m2Top },
      { x: m2x + m2w, y: m2Top },
      { x: m2x + m2w, y: groundTopY },
    ],
    '#EFE0C6',
    `${bgSeed}/m2-wall`,
    { passes: 3, spread: 2.5, edgeColor: '#D5BE9A' }
  );

  // Quelques pierres apparentes dessinées au crayon
  const stoneCoords = [
    [m2x + 70, 620],
    [m2x + 520, 580],
    [m2x + 95, 920],
    [m2x + 545, 860],
    [m2x + 480, 1080],
  ];
  for (let i = 0; i < stoneCoords.length; i++) {
    const [sx, sy] = stoneCoords[i];
    drawPencilHatch(ctx, sx, sy, 32, 14, 0.05, '#B89F7D', `${bgSeed}/stone-${i}`, 6, 1.4, 0.35);
    drawOrganicInkStroke(
      ctx,
      [
        { x: sx - 30, y: sy - 12 },
        { x: sx + 30, y: sy - 12 },
        { x: sx + 32, y: sy + 12 },
        { x: sx - 28, y: sy + 12 },
      ],
      `${bgSeed}/stone-ink-${i}`,
      { color: '#8A725E', width: 1.6, closed: true, alpha: 0.55 }
    );
  }

  // Séparation verticale des façades
  drawOrganicInkStroke(
    ctx,
    [
      { x: m2x, y: m2Top },
      { x: m2x, y: groundTopY },
    ],
    `${bgSeed}/m2-left-edge`,
    { color: '#5A4438', width: 3.0 }
  );

  // Fenêtre haute de la Maison 2
  drawStorybookWindow(ctx, m2x + 260, 390, 130, 175, '#7C92AB', `${bgSeed}/m2-win-top`);

  // Grande fenêtre fleurie du rez-de-chaussée (où se trouve le Chat Roux !)
  const catWinX = m2x + 245;
  const catWinY = 675;
  const catWinW = 165;
  const catWinH = 225;
  drawStorybookWindow(ctx, catWinX, catWinY, catWinW, catWinH, '#7C92AB', `${bgSeed}/m2-win-cat`);

  // Jardinière de géraniums sous la fenêtre
  drawFlowerBox(ctx, catWinX - 12, catWinY + catWinH + 4, catWinW + 24, 38, `${bgSeed}/m2-geraniums`);

  // LE CHAT ROUX TIGRÉ sur le rebord ensoleillé (animé image par image en réponse à Colette)
  drawAnimatedGingerCat(ctx, catWinX + 108, catWinY + catWinH - 4, cel, boilSeed);

  // Porte cintrée en bois vert amande à gauche de la fenêtre
  const doorX = m2x + 58;
  const doorY = 865;
  const doorW = 132;
  const doorH = groundTopY - doorY;
  drawWatercolorWash(
    ctx,
    [
      { x: doorX, y: doorY + doorH },
      { x: doorX, y: doorY + 45 },
      { x: doorX + doorW * 0.5, y: doorY },
      { x: doorX + doorW, y: doorY + 45 },
      { x: doorX + doorW, y: doorY + doorH },
    ],
    '#7F9B84',
    `${bgSeed}/m2-door`,
    { passes: 3, spread: 1.8 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: doorX, y: doorY + doorH },
      { x: doorX, y: doorY + 45 },
      { x: doorX + doorW * 0.5, y: doorY },
      { x: doorX + doorW, y: doorY + 45 },
      { x: doorX + doorW, y: doorY + doorH },
    ],
    `${bgSeed}/m2-door-ink`,
    { color: '#4B382E', width: 3.0 }
  );

  // Arche de Glycines en fleurs (grappes mauves et feuillage qui ondule dans la brise)
  drawWisteriaGarland(ctx, m2x + 30, 625, 590, cel, bgSeed, boilSeed);

  // =========================================================================
  // MAISON 3 (Droite, x: 1120 .. 1760) : Herboristerie & Lanterne en fer forgé
  // =========================================================================
  const m3x = 1120 + midShift;
  const m3w = 640;
  const m3Top = 340;

  drawWatercolorWash(
    ctx,
    [
      { x: m3x, y: groundTopY },
      { x: m3x, y: m3Top },
      { x: m3x + m3w, y: m3Top },
      { x: m3x + m3w, y: groundTopY },
    ],
    '#F3D8CB',
    `${bgSeed}/m3-wall`,
    { passes: 3, spread: 2.5 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: m3x, y: m3Top },
      { x: m3x, y: groundTopY },
    ],
    `${bgSeed}/m3-edge`,
    { color: '#5A4438', width: 3.0 }
  );

  drawStorybookWindow(ctx, m3x + 120, 485, 125, 170, '#88A68E', `${bgSeed}/m3-win-top`);
  drawStorybookWindow(ctx, m3x + 120, 770, 145, 200, '#88A68E', `${bgSeed}/m3-win-bot`);
  drawFlowerBox(ctx, m3x + 110, 974, 165, 36, `${bgSeed}/m3-flowers`);

  // Réverbère ancien / Lanterne de rue à l'entrée de l'Herboristerie
  const lampX = m2x + 585;
  drawVintageStreetLamp(ctx, lampX, groundTopY, `${bgSeed}/street-lamp`);
}

function drawStorybookWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shutterColor: string,
  seed: string
): void {
  const shutterW = 38;
  // Volets gauche et droit
  drawWatercolorWash(
    ctx,
    [
      { x: x - shutterW - 4, y },
      { x: x - 4, y },
      { x: x - 4, y: y + h },
      { x: x - shutterW - 4, y: y + h },
    ],
    shutterColor,
    `${seed}/shutter-L`,
    { passes: 2, spread: 1.5 }
  );
  drawWatercolorWash(
    ctx,
    [
      { x: x + w + 4, y },
      { x: x + w + shutterW + 4, y },
      { x: x + w + shutterW + 4, y: y + h },
      { x: x + w + 4, y: y + h },
    ],
    shutterColor,
    `${seed}/shutter-R`,
    { passes: 2, spread: 1.5 }
  );

  // Vitrage aux reflets dorés et bleutés
  drawWatercolorWash(
    ctx,
    [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ],
    '#526878',
    `${seed}/glass`,
    { passes: 2, spread: 1.2 }
  );
  // Rideau dentelle crème à l'intérieur
  drawWatercolorWash(
    ctx,
    [
      { x: x + 6, y: y + 6 },
      { x: x + w * 0.46, y: y + 6 },
      { x: x + w * 0.32, y: y + h * 0.72 },
      { x: x + 6, y: y + h * 0.82 },
    ],
    'rgba(253, 245, 230, 0.72)',
    `${seed}/curtain-L`,
    { passes: 2, spread: 1.2 }
  );

  // Croisillons de la fenêtre
  drawOrganicInkStroke(
    ctx,
    [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ],
    `${seed}/frame`,
    { color: '#4A372B', width: 2.8, closed: true }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: x + w * 0.5, y },
      { x: x + w * 0.5, y: y + h },
    ],
    `${seed}/mullion-v`,
    { color: '#4A372B', width: 2.2 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x, y: y + h * 0.5 },
      { x: x + w, y: y + h * 0.5 },
    ],
    `${seed}/mullion-h`,
    { color: '#4A372B', width: 2.2 }
  );

  // Rebord en pierre
  drawWatercolorWash(
    ctx,
    [
      { x: x - 14, y: y + h },
      { x: x + w + 14, y: y + h },
      { x: x + w + 14, y: y + h + 16 },
      { x: x - 14, y: y + h + 16 },
    ],
    '#D9C3A3',
    `${seed}/sill`,
    { passes: 2, spread: 1.0 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: x - 14, y: y + h },
      { x: x + w + 14, y: y + h },
      { x: x + w + 14, y: y + h + 16 },
      { x: x - 14, y: y + h + 16 },
    ],
    `${seed}/sill-ink`,
    { color: '#4A372B', width: 2.2, closed: true }
  );
}

function drawFlowerBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: string
): void {
  drawWatercolorWash(
    ctx,
    [
      { x, y },
      { x: x + w, y },
      { x: x + w - 8, y: y + h },
      { x: x + 8, y: y + h },
    ],
    '#C47252',
    `${seed}/pot`,
    { passes: 2, spread: 1.4 }
  );
  // Touffes de feuillage et géraniums rouges
  const rng = createSeededRandom(seed);
  for (let i = 0; i < 6; i++) {
    const fx = x + 18 + (i / 5) * (w - 36);
    const fy = y - 4 + (rng() - 0.5) * 6;
    drawWatercolorWash(
      ctx,
      [
        { x: fx - 16, y: fy + 8 },
        { x: fx, y: fy - 14 },
        { x: fx + 16, y: fy + 8 },
      ],
      '#5E8564',
      `${seed}/leaf-${i}`,
      { passes: 2, spread: 1.5 }
    );
    drawWatercolorWash(
      ctx,
      [
        { x: fx - 9, y: fy - 4 },
        { x: fx, y: fy - 18 },
        { x: fx + 9, y: fy - 4 },
        { x: fx, y: fy + 4 },
      ],
      i % 2 === 0 ? '#D9564A' : '#E87E6B',
      `${seed}/bloom-${i}`,
      { passes: 2, spread: 1.2 }
    );
  }
}

/**
 * Dessine le chat roux tigré sur le rebord de fenêtre, animé image par image :
 * ses oreilles, son inclinaison de tête et sa queue réagissent au salut de Grand-mère Colette à l'Acte II.
 */
function drawAnimatedGingerCat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  sillY: number,
  cel: CelSpecification,
  boilSeed: string
): void {
  const cNum = cel.celNumber;
  // Le chat se redresse et remue joyeusement la queue pendant l'Acte II (CEL_020..CEL_044)
  const greetFactor =
    cNum >= 20 && cNum <= 44
      ? Math.sin(((cNum - 20) / 24) * Math.PI)
      : 0;
  const tailWag = Math.sin(cNum * 0.45) * (10 + greetFactor * 14);
  const headTilt = greetFactor * 6.5;
  const earPerk = greetFactor * 4.5;

  ctx.save();
  // Queue souple qui dépasse du rebord
  const tailPts: Point2D[] = [
    { x: cx + 18, y: sillY - 12, pressure: 1.1 },
    { x: cx + 38 + tailWag * 0.4, y: sillY - 2, pressure: 1.0 },
    { x: cx + 46 + tailWag, y: sillY - 28 - greetFactor * 12, pressure: 0.9 },
  ];
  drawOrganicInkStroke(ctx, tailPts, `${boilSeed}/cat-tail-fill`, {
    color: '#E07F42',
    width: 11,
    taperStart: 0.1,
    taperEnd: 0.2,
    graphiteDouble: false,
  });
  drawOrganicInkStroke(ctx, tailPts, `${boilSeed}/cat-tail-ink`, {
    color: '#4A3326',
    width: 2.4,
  });

  // Corps assis du chat roux
  const bodyPts: Point2D[] = [
    { x: cx - 22, y: sillY },
    { x: cx - 24, y: sillY - 38 },
    { x: cx - 10, y: sillY - 58 },
    { x: cx + 14, y: sillY - 56 },
    { x: cx + 24, y: sillY - 32 },
    { x: cx + 20, y: sillY },
  ];
  drawWatercolorWash(ctx, bodyPts, '#E28446', `${boilSeed}/cat-body`, {
    passes: 2,
    spread: 1.2,
  });
  // Plastron crème
  drawWatercolorWash(
    ctx,
    [
      { x: cx - 12, y: sillY - 12 },
      { x: cx - 10, y: sillY - 46 },
      { x: cx + 6, y: sillY - 46 },
      { x: cx + 8, y: sillY - 12 },
    ],
    '#FAF0DC',
    `${boilSeed}/cat-chest`,
    { passes: 2, spread: 1.0 }
  );
  drawOrganicInkStroke(ctx, bodyPts, `${boilSeed}/cat-body-ink`, {
    color: '#4A3326',
    width: 2.5,
    closed: true,
  });

  // Tête et oreilles expressives
  const hx = cx - 4 - headTilt * 0.4;
  const hy = sillY - 72 - earPerk * 0.5;
  const headPts: Point2D[] = [
    { x: hx - 18, y: hy + 8 },
    { x: hx - 20, y: hy - 14 - earPerk }, // oreille G
    { x: hx - 8, y: hy - 8 },
    { x: hx + 8, y: hy - 8 },
    { x: hx + 20, y: hy - 14 - earPerk }, // oreille D
    { x: hx + 18, y: hy + 8 },
    { x: hx, y: hy + 16 },
  ];
  drawWatercolorWash(ctx, headPts, '#E28446', `${boilSeed}/cat-head`, {
    passes: 2,
    spread: 1.0,
  });
  drawOrganicInkStroke(ctx, headPts, `${boilSeed}/cat-head-ink`, {
    color: '#4A3326',
    width: 2.4,
    closed: true,
  });

  // Yeux et museau du chat (regarde vers Grand-mère Colette)
  ctx.fillStyle = '#3B2D26';
  ctx.beginPath();
  ctx.arc(hx - 6, hy + 2, 2.3, 0, Math.PI * 2);
  ctx.arc(hx + 6, hy + 2, 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWisteriaGarland(
  ctx: CanvasRenderingContext2D,
  startX: number,
  topY: number,
  spanW: number,
  cel: CelSpecification,
  bgSeed: string,
  boilSeed: string
): void {
  const breeze = Math.sin(cel.celNumber * 0.18) * 4.5;

  // Branche maîtresse en bois tortueux
  const vinePts: Point2D[] = [
    { x: startX, y: topY + 25 },
    { x: startX + spanW * 0.28, y: topY - 12 },
    { x: startX + spanW * 0.62, y: topY + 8 },
    { x: startX + spanW, y: topY - 6 },
  ];
  drawOrganicInkStroke(ctx, vinePts, `${bgSeed}/wisteria-vine`, {
    color: '#5C4435',
    width: 5.5,
  });

  // Grappes tombantes de glycines mauves et violettes
  const clusterCount = 11;
  for (let i = 0; i < clusterCount; i++) {
    const u = i / (clusterCount - 1);
    const cx = startX + 20 + u * (spanW - 40);
    const cy = topY + Math.sin(u * Math.PI * 2) * 12;
    const clusterLen = 58 + (i % 3) * 26;
    const sway = breeze * (0.6 + (i % 2) * 0.5);

    // Feuillage tendre en haut de la grappe
    drawWatercolorWash(
      ctx,
      [
        { x: cx - 22, y: cy + 6 },
        { x: cx, y: cy - 16 },
        { x: cx + 22, y: cy + 6 },
      ],
      '#769674',
      `${bgSeed}/wist-leaf-${i}`,
      { passes: 2, spread: 1.8 }
    );

    // Grappe conique de fleurs de glycine
    const blossomPts: Point2D[] = [
      { x: cx - 18, y: cy + 8 },
      { x: cx + 18, y: cy + 8 },
      { x: cx + 11 + sway * 0.5, y: cy + clusterLen * 0.55 },
      { x: cx + sway, y: cy + clusterLen },
      { x: cx - 11 + sway * 0.5, y: cy + clusterLen * 0.55 },
    ];
    const col = i % 2 === 0 ? '#9B82B8' : '#B49AD1';
    drawWatercolorWash(ctx, blossomPts, col, `${bgSeed}/wist-cluster-${i}`, {
      passes: 3,
      spread: 2.2,
      edgeColor: '#7C6299',
    });
    drawOrganicInkStroke(
      ctx,
      [
        { x: cx - 10, y: cy + 12 },
        { x: cx + sway * 0.6, y: cy + clusterLen * 0.65 },
        { x: cx + sway, y: cy + clusterLen },
      ],
      `${boilSeed}/wist-accent-${i}`,
      { color: '#5E4775', width: 1.8, alpha: 0.65 }
    );
  }
}

function drawVintageStreetLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundTopY: number,
  seed: string
): void {
  // Fût en fonte gris-vert anthracite
  const polePts: Point2D[] = [
    { x, y: groundTopY, pressure: 1.4 },
    { x, y: groundTopY - 380, pressure: 1.0 },
    { x, y: groundTopY - 720, pressure: 0.85 },
  ];
  drawOrganicInkStroke(ctx, polePts, `${seed}/pole`, {
    color: '#3A3532',
    width: 8.5,
    taperStart: 0.05,
    taperEnd: 0.1,
  });

  // Console en volute et lanterne vitrée dorée
  const topY = groundTopY - 710;
  drawOrganicInkStroke(
    ctx,
    [
      { x, y: topY + 35 },
      { x: x - 34, y: topY + 8 },
      { x: x - 52, y: topY + 22 },
    ],
    `${seed}/scroll`,
    { color: '#3A3532', width: 4.0 }
  );

  const lx = x - 52;
  const ly = topY + 22;
  // Halo chaud de la lanterne
  const glow = ctx.createRadialGradient(lx, ly + 28, 4, lx, ly + 28, 72);
  glow.addColorStop(0, 'rgba(255, 234, 165, 0.75)');
  glow.addColorStop(1, 'rgba(255, 234, 165, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(lx, ly + 28, 72, 0, Math.PI * 2);
  ctx.fill();

  drawWatercolorWash(
    ctx,
    [
      { x: lx - 18, y: ly + 10 },
      { x: lx + 18, y: ly + 10 },
      { x: lx + 13, y: ly + 48 },
      { x: lx - 13, y: ly + 48 },
    ],
    '#FFE699',
    `${seed}/lantern-glass`,
    { passes: 2, spread: 1.0 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: lx - 22, y: ly + 10 },
      { x: lx, y: ly - 8 },
      { x: lx + 22, y: ly + 10 },
      { x: lx + 14, y: ly + 48 },
      { x: lx - 14, y: ly + 48 },
    ],
    `${seed}/lantern-cage`,
    { color: '#3A3532', width: 2.6, closed: true }
  );
}

/**
 * Dessine le trottoir et la rue pavée (Parallaxe 1.00x).
 * Chaque dalle et chaque pavé se déplace exactement de `-scroll` pixels,
 * ce qui garantit que le pied d'appui de Colette et l'embout de sa canne ne glissent jamais !
 */
function drawCobblestoneGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scroll: number,
  seed: string
): void {
  const wallBaseY = 1288;
  const curbY = 1482;

  // 1. Trottoir en pierre calcaire chaude (y: 1288 .. 1482)
  const sidewalkGrad = ctx.createLinearGradient(0, wallBaseY, 0, curbY);
  sidewalkGrad.addColorStop(0, '#E5D2B8');
  sidewalkGrad.addColorStop(1, '#D7C0A3');
  ctx.fillStyle = sidewalkGrad;
  ctx.fillRect(0, wallBaseY, width, curbY - wallBaseY);

  // 2. Chaussée pavée au premier plan (y: 1482 .. 1920)
  const roadGrad = ctx.createLinearGradient(0, curbY, 0, height);
  roadGrad.addColorStop(0, '#C9B39B');
  roadGrad.addColorStop(0.5, '#BEA68D');
  roadGrad.addColorStop(1, '#AD947B');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, curbY, width, height - curbY);

  // Ligne de base des façades et bordure du trottoir
  drawOrganicInkStroke(
    ctx,
    [
      { x: -20, y: wallBaseY },
      { x: width + 20, y: wallBaseY },
    ],
    `${seed}/wall-base-line`,
    { color: '#5A4436', width: 3.2 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: -20, y: curbY },
      { x: width + 20, y: curbY },
    ],
    `${seed}/curb-top-line`,
    { color: '#5A4436', width: 3.6 }
  );
  drawOrganicInkStroke(
    ctx,
    [
      { x: -20, y: curbY + 18 },
      { x: width + 20, y: curbY + 18 },
    ],
    `${seed}/curb-bot-line`,
    { color: '#6E5647', width: 2.4 }
  );

  // Dalles du trottoir avec joints en perspective qui défilent exactement à `-scroll`
  const slabSpacing = 135;
  const firstSlabIdx = Math.floor((scroll - 200) / slabSpacing);
  const lastSlabIdx = Math.ceil((scroll + width + 200) / slabSpacing);

  for (let idx = firstSlabIdx; idx <= lastSlabIdx; idx++) {
    const sx = idx * slabSpacing - scroll;
    drawOrganicInkStroke(
      ctx,
      [
        { x: sx + 28, y: wallBaseY },
        { x: sx - 18, y: curbY },
      ],
      `${seed}/slab-joint-${idx}`,
      { color: '#8C7460', width: 2.0, alpha: 0.65, graphiteDouble: false }
    );

    // Petite touffe d'herbe ou pâquerette au pied du mur toutes les 2 dalles
    if (Math.abs(idx) % 2 === 0) {
      drawOrganicInkStroke(
        ctx,
        [
          { x: sx + 12, y: wallBaseY + 4 },
          { x: sx + 8, y: wallBaseY - 14 },
          { x: sx + 18, y: wallBaseY + 4 },
          { x: sx + 24, y: wallBaseY - 11 },
        ],
        `${seed}/tuft-${idx}`,
        { color: '#648363', width: 2.2, alpha: 0.78, graphiteDouble: false }
      );
    }
  }

  // Rangées de pavés dessinés à la main sur la chaussée (y: 1510 .. 1840)
  const rows = [1535, 1605, 1685, 1775];
  for (let r = 0; r < rows.length; r++) {
    const ry = rows[r];
    const cobbleW = 92 + r * 12;
    const cobbleH = 38 + r * 5;
    const rowOffset = (r % 2) * (cobbleW * 0.5);
    const startC = Math.floor((scroll - 160) / cobbleW);
    const endC = Math.ceil((scroll + width + 160) / cobbleW);

    for (let c = startC; c <= endC; c++) {
      const cx = c * cobbleW + rowOffset - scroll;
      const n = noise1D(c * 1.7 + r * 13.1, 901);
      const tone = n > 0.2 ? '#D8C4AC' : n < -0.2 ? '#B59B82' : '#C7B097';

      const pts: Point2D[] = [
        { x: cx - cobbleW * 0.42, y: ry - cobbleH * 0.38 },
        { x: cx + cobbleW * 0.42, y: ry - cobbleH * 0.4 },
        { x: cx + cobbleW * 0.44, y: ry + cobbleH * 0.38 },
        { x: cx - cobbleW * 0.4, y: ry + cobbleH * 0.4 },
      ];
      drawWatercolorWash(ctx, pts, tone, `${seed}/cobble-${r}-${c}`, {
        passes: 1,
        spread: 1.0,
        alpha: 0.58,
      });
      drawOrganicInkStroke(ctx, pts, `${seed}/cobble-ink-${r}-${c}`, {
        color: '#7A6352',
        width: 1.8,
        closed: true,
        alpha: 0.48,
        graphiteDouble: false,
      });
    }
  }
}

function drawMorningSunbeams(
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number,
  celNumber: number
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const pulse = Math.sin(celNumber * 0.12) * 0.03;

  const beams = [
    { x0: 80, x1: 360, bx0: 380, bx1: 790, alpha: 0.14 + pulse },
    { x0: 460, x1: 680, bx0: 760, bx1: 1060, alpha: 0.11 - pulse },
  ];

  for (const b of beams) {
    const grad = ctx.createLinearGradient(b.x0, 0, b.bx0, height * 0.85);
    grad.addColorStop(0, `rgba(255, 241, 192, ${b.alpha})`);
    grad.addColorStop(0.65, `rgba(255, 232, 168, ${b.alpha * 0.55})`);
    grad.addColorStop(1, 'rgba(255, 232, 168, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(b.x0, 0);
    ctx.lineTo(b.x1, 0);
    ctx.lineTo(b.bx1, height * 0.85);
    ctx.lineTo(b.bx0, height * 0.85);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Dessine le premier plan (Plan 4 : pots de lavande en bas de cadre, pétales flottants
 * et le papillon citron-doré animé image par image).
 */
export function drawStreetForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cel: CelSpecification
): void {
  const fgShift = -cel.groundScrollPx * 1.26;
  const boilSeed = cel.celId;

  // 1. Bosquets de lavande et pots en terre cuite en bas de cadre (parallaxe 1.26x)
  const potPositions = [180, 760, 1340, 1920];
  for (let i = 0; i < potPositions.length; i++) {
    const px = potPositions[i] + fgShift;
    if (px < -180 || px > width + 180) continue;
    const py = height - 45;
    const sway = Math.sin(cel.celNumber * 0.2 + i) * 5;

    // Tiges et épis de lavande au premier plan
    for (let s = -3; s <= 3; s++) {
      const tipX = px + s * 22 + sway;
      const tipY = py - 125 - Math.abs(s) * 8;
      drawOrganicInkStroke(
        ctx,
        [
          { x: px + s * 10, y: py - 25 },
          { x: tipX, y: tipY },
        ],
        `${boilSeed}/fg-stem-${i}-${s}`,
        { color: '#58755B', width: 2.8, graphiteDouble: false }
      );
      drawWatercolorWash(
        ctx,
        [
          { x: tipX - 8, y: tipY + 26 },
          { x: tipX, y: tipY - 12 },
          { x: tipX + 8, y: tipY + 26 },
        ],
        '#866BA3',
        `${boilSeed}/fg-lav-${i}-${s}`,
        { passes: 2, spread: 1.5, alpha: 0.85 }
      );
    }
  }

  // 2. Pétales de glycine et grains de lumière flottant doucement dans la brise
  const rng = createSeededRandom('PETALS_TRAJECTORY_2026');
  for (let p = 0; p < 14; p++) {
    const baseX = rng() * 1450;
    const baseY = 380 + rng() * 980;
    const speedX = 3.2 + rng() * 2.5;
    const speedY = 1.6 + rng() * 1.4;
    const px = ((baseX - cel.celNumber * speedX) % 1280 + 1280) % 1280 - 100;
    const py = baseY + Math.sin(cel.celNumber * 0.18 + p * 2.1) * 24 + (cel.celNumber * speedY) % 140;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(cel.celNumber * 0.08 + p);
    ctx.fillStyle = p % 2 === 0 ? 'rgba(180, 154, 209, 0.72)' : 'rgba(255, 236, 179, 0.68)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Le Papillon Citron-Doré dessiné image par image (entre à CEL_018 et traverse la rue)
  if (cel.celNumber >= 16 && cel.celNumber <= 68) {
    const u = (cel.celNumber - 16) / 52; // 0..1
    const bx = 980 - u * 760 + Math.sin(u * Math.PI * 3) * 65;
    const by =
      980 -
      Math.sin(u * Math.PI) * 210 +
      Math.cos(cel.celNumber * 0.42) * 28;
    // Battement d'ailes authentique image par image (ouvert -> mi-clos -> replié)
    const wingSpan = 0.25 + 0.75 * Math.abs(Math.sin(cel.celNumber * 0.85));

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-0.18 + Math.cos(cel.celNumber * 0.35) * 0.14);

    const upperWingPts: Point2D[] = [
      { x: 0, y: 0 },
      { x: -24 * wingSpan, y: -28 * wingSpan },
      { x: 6, y: -32 * wingSpan },
      { x: 14, y: -8 },
    ];
    const lowerWingPts: Point2D[] = [
      { x: 0, y: 0 },
      { x: -18 * wingSpan, y: 18 * wingSpan },
      { x: 8, y: 20 * wingSpan },
      { x: 10, y: 2 },
    ];

    drawWatercolorWash(ctx, upperWingPts, '#F6C952', `${boilSeed}/bfly-up`, {
      passes: 2,
      spread: 1.0,
    });
    drawWatercolorWash(ctx, lowerWingPts, '#F2B438', `${boilSeed}/bfly-low`, {
      passes: 2,
      spread: 1.0,
    });
    drawOrganicInkStroke(ctx, upperWingPts, `${boilSeed}/bfly-up-ink`, {
      color: '#4A3426',
      width: 2.0,
      closed: true,
    });
    drawOrganicInkStroke(ctx, lowerWingPts, `${boilSeed}/bfly-low-ink`, {
      color: '#4A3426',
      width: 1.8,
      closed: true,
    });
    // Corps et antennes du papillon
    drawOrganicInkStroke(
      ctx,
      [
        { x: -10, y: 4 },
        { x: 12, y: -4 },
      ],
      `${boilSeed}/bfly-body`,
      { color: '#3B2D26', width: 2.8 }
    );
    ctx.restore();
  }
}
