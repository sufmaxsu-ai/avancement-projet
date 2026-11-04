// Moteur de dessin traditionnel au crayon graphite, hachures et aquarelle sur papier grainé
// Synthèse des techniques de hand-drawn-film (cels.js, materials.js) et example-draw-javascript (pencil.js)

import { PALETTE } from './config';

export type Point = [number, number];

/**
 * Générateur pseudo-aléatoire déterministe Mulberry32
 */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hachage déterministe 2D (pour ancrer les hachures et le grain de crayon à l'objet)
 */
export function hash2D(ix: number, iy: number, seed = 1): number {
  let h = Math.imul(ix | 0, 73856093) ^ Math.imul(iy | 0, 19349663) ^ Math.imul(seed | 0, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Convertit un numéro de frame (24 fps) en numéro de dessin d'exposition (12 dessins/s sur 2s)
 */
export function getBoilStep(frame: number, onOnes = false): number {
  return onOnes ? Math.floor(frame) : Math.floor(frame / 2);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutQuad(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Cache du papier aquarelle grainé pour éviter de recalculer 2 millions de pixels à chaque frame
let cachedPaperCanvas: HTMLCanvasElement | null = null;
let cachedOverlayCanvas: HTMLCanvasElement | null = null;

export function ensurePaperTextures(width: number, height: number): {
  base: HTMLCanvasElement;
  overlay: HTMLCanvasElement;
} {
  if (
    cachedPaperCanvas &&
    cachedOverlayCanvas &&
    cachedPaperCanvas.width === width &&
    cachedPaperCanvas.height === height
  ) {
    return { base: cachedPaperCanvas, overlay: cachedOverlayCanvas };
  }

  const base = document.createElement('canvas');
  base.width = width;
  base.height = height;
  const bctx = base.getContext('2d')!;

  // Fond crème chaud aquarelle
  const grad = bctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    80,
    width * 0.5,
    height * 0.5,
    height * 0.72
  );
  grad.addColorStop(0, '#FAF3E6');
  grad.addColorStop(0.65, PALETTE.paperBase);
  grad.addColorStop(1, '#E6D5BA');
  bctx.fillStyle = grad;
  bctx.fillRect(0, 0, width, height);

  // Fibres et grain du papier Canson / Arches déterministe
  const rand = mulberry32(192837);
  for (let i = 0; i < 4200; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = 0.8 + rand() * 2.8;
    bctx.fillStyle = rand() > 0.5 ? 'rgba(165, 132, 95, 0.045)' : 'rgba(255, 250, 240, 0.07)';
    bctx.fillRect(x, y, r * 1.4, r);
  }

  // Fines fibres de cellulose dessinées
  bctx.strokeStyle = 'rgba(138, 105, 74, 0.04)';
  bctx.lineWidth = 0.9;
  for (let i = 0; i < 650; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const len = 8 + rand() * 26;
    const ang = rand() * Math.PI * 2;
    bctx.beginPath();
    bctx.moveTo(x, y);
    bctx.quadraticCurveTo(
      x + Math.cos(ang + 0.3) * len * 0.5,
      y + Math.sin(ang + 0.3) * len * 0.5,
      x + Math.cos(ang) * len,
      y + Math.sin(ang) * len
    );
    bctx.stroke();
  }

  // Calque de grain supérieur (tooth overlay) appliqué en fin de rendu
  const overlay = document.createElement('canvas');
  overlay.width = width;
  overlay.height = height;
  const octx = overlay.getContext('2d')!;

  const randOv = mulberry32(991823);
  for (let i = 0; i < 3600; i++) {
    const x = randOv() * width;
    const y = randOv() * height;
    const sz = 1 + randOv() * 2.2;
    octx.fillStyle =
      randOv() > 0.45 ? 'rgba(247, 239, 225, 0.085)' : 'rgba(92, 64, 51, 0.032)';
    octx.fillRect(x, y, sz, sz);
  }

  // Bordure douce de carnet d'illustrations ancien
  const vig = octx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    width * 0.38,
    width * 0.5,
    height * 0.5,
    height * 0.64
  );
  vig.addColorStop(0, 'rgba(92, 64, 51, 0)');
  vig.addColorStop(0.82, 'rgba(110, 78, 48, 0.04)');
  vig.addColorStop(1, 'rgba(88, 58, 34, 0.18)');
  octx.fillStyle = vig;
  octx.fillRect(0, 0, width, height);

  cachedPaperCanvas = base;
  cachedOverlayCanvas = overlay;
  return { base, overlay };
}

export interface PencilStrokeOptions {
  color?: string;
  width?: number;
  jitter?: number;
  seed?: number;
  boilStep?: number;
  opacity?: number;
  doublePass?: boolean;
  closed?: boolean;
}

/**
 * Génère une polyligne légèrement irrégulière imitant la main d'un illustrateur
 */
export function buildOrganicPolyline(
  points: Point[],
  opts: { jitter?: number; seed?: number; boilStep?: number; closed?: boolean; step?: number } = {}
): Point[] {
  const { jitter = 1.35, seed = 101, boilStep = 0, closed = false, step = 18 } = opts;
  const rand = mulberry32((seed * 7919 + boilStep * 104729) | 0);
  const out: Point[] = [];
  const count = closed ? points.length : points.length - 1;

  for (let i = 0; i < count; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const subdivisions = Math.max(1, Math.min(18, Math.ceil(dist / step)));
    const nx = dist > 0.001 ? -(p2[1] - p1[1]) / dist : 0;
    const ny = dist > 0.001 ? (p2[0] - p1[0]) / dist : 0;

    for (let s = 0; s < subdivisions; s++) {
      const t = s / subdivisions;
      // Tremblement organique nul aux extrémités d'ancrage pour préserver les contacts
      const env = Math.sin(t * Math.PI);
      const offset = (rand() - 0.5) * 2 * jitter * (0.35 + 0.65 * env);
      const along = (rand() - 0.5) * jitter * 0.35;
      out.push([
        lerp(p1[0], p2[0], t) + nx * offset + along,
        lerp(p1[1], p2[1], t) + ny * offset + along,
      ]);
    }
  }
  if (!closed && points.length > 0) {
    const last = points[points.length - 1];
    out.push([
      last[0] + (rand() - 0.5) * jitter * 0.4,
      last[1] + (rand() - 0.5) * jitter * 0.4,
    ]);
  }
  return out;
}

/**
 * Trace un trait de crayon graphite expressif (double passage organique + grain)
 */
export function drawPencilPolyline(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  opts: PencilStrokeOptions = {}
): void {
  if (points.length < 2) return;
  const {
    color = PALETTE.pencilDark,
    width = 2.6,
    jitter = 1.25,
    seed = 42,
    boilStep = 0,
    opacity = 0.9,
    doublePass = true,
    closed = false,
  } = opts;

  const p1 = buildOrganicPolyline(points, { jitter, seed, boilStep, closed, step: 16 });
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;

  // Passage principal au crayon
  ctx.globalAlpha = opacity;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(p1[0][0], p1[0][1]);
  for (let i = 1; i < p1.length; i++) {
    const prev = p1[i - 1];
    const cur = p1[i];
    const mx = (prev[0] + cur[0]) * 0.5;
    const my = (prev[1] + cur[1]) * 0.5;
    ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
  }
  const endPt = p1[p1.length - 1];
  ctx.lineTo(endPt[0], endPt[1]);
  if (closed) ctx.closePath();
  ctx.stroke();

  // Second passage de graphite plus fin et légèrement décalé (aspect croquis fait main)
  if (doublePass) {
    const p2 = buildOrganicPolyline(points, {
      jitter: jitter * 1.15,
      seed: seed + 313,
      boilStep,
      closed,
      step: 22,
    });
    ctx.globalAlpha = opacity * 0.36;
    ctx.lineWidth = Math.max(1.0, width * 0.55);
    ctx.beginPath();
    ctx.moveTo(p2[0][0], p2[0][1]);
    for (let i = 1; i < p2.length; i++) {
      ctx.lineTo(p2[i][0], p2[i][1]);
    }
    if (closed) ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPencilLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: PencilStrokeOptions = {}
): void {
  drawPencilPolyline(
    ctx,
    [
      [x1, y1],
      [x2, y2],
    ],
    opts
  );
}

/**
 * Hachures au crayon (inspirées de formHatch dans hand-drawn-film/materials.js)
 */
export function drawHatching(
  ctx: CanvasRenderingContext2D,
  box: [number, number, number, number],
  opts: {
    angle?: number;
    spacing?: number;
    color?: string;
    opacity?: number;
    width?: number;
    cross?: boolean;
    seed?: number;
    boilStep?: number;
  } = {}
): void {
  const [bx, by, bw, bh] = box;
  const {
    angle = -0.55,
    spacing = 8.5,
    color = PALETTE.pencilSoft,
    opacity = 0.2,
    width = 1.15,
    cross = false,
    seed = 77,
    boilStep = 0,
  } = opts;

  const rand = mulberry32((seed * 4099 + boilStep * 97) | 0);
  const diag = Math.hypot(bw, bh);
  const cx = bx + bw * 0.5;
  const cy = by + bh * 0.5;

  const renderPass = (ang: number, alphaMul: number) => {
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const nx = -sin;
    const ny = cos;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.globalAlpha = opacity * alphaMul;
    ctx.beginPath();

    const steps = Math.ceil(diag / spacing);
    for (let i = -steps; i <= steps; i++) {
      const offset = i * spacing + (rand() - 0.5) * 1.6;
      const ox = cx + nx * offset;
      const oy = cy + ny * offset;
      const halfLen = diag * 0.52;
      const x1 = ox - cos * halfLen + (rand() - 0.5) * 2;
      const y1 = oy - sin * halfLen + (rand() - 0.5) * 2;
      const x2 = ox + cos * halfLen + (rand() - 0.5) * 2;
      const y2 = oy + sin * halfLen + (rand() - 0.5) * 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.restore();
  };

  renderPass(angle, 1.0);
  if (cross) {
    renderPass(angle + 0.85, 0.55);
  }
}

export interface HandShapeOptions extends PencilStrokeOptions {
  fill?: string;
  fillOpacity?: number;
  hatch?: boolean;
  hatchAngle?: number;
  hatchSpacing?: number;
  hatchOpacity?: number;
  crossHatch?: boolean;
  stroke?: boolean;
}

/**
 * Dessine une forme fermée avec remplissage aquarelle doux, hachures optionnelles et contour crayonné
 */
export function drawHandShape(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  opts: HandShapeOptions = {}
): void {
  if (points.length < 3) return;
  const {
    fill,
    fillOpacity = 1,
    hatch = false,
    hatchAngle = -0.6,
    hatchSpacing = 9,
    hatchOpacity = 0.16,
    crossHatch = false,
    stroke = true,
    jitter = 1.3,
    seed = 101,
    boilStep = 0,
  } = opts;

  const poly = buildOrganicPolyline(points, {
    jitter,
    seed,
    boilStep,
    closed: true,
    step: 18,
  });

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) {
    ctx.lineTo(poly[i][0], poly[i][1]);
  }
  ctx.closePath();

  if (fill) {
    ctx.save();
    ctx.globalAlpha = fillOpacity;
    ctx.fillStyle = fill;
    ctx.fill();

    // Léger ourlet aquarelle sur le bord intérieur
    ctx.clip();
    ctx.strokeStyle = fill;
    ctx.globalAlpha = fillOpacity * 0.25;
    ctx.lineWidth = 4.5;
    ctx.stroke();

    if (hatch) {
      drawHatching(ctx, [minX, minY, maxX - minX, maxY - minY], {
        angle: hatchAngle,
        spacing: hatchSpacing,
        opacity: hatchOpacity,
        cross: crossHatch,
        seed: seed + 19,
        boilStep,
      });
    }
    ctx.restore();
  } else if (hatch) {
    ctx.save();
    ctx.clip();
    drawHatching(ctx, [minX, minY, maxX - minX, maxY - minY], {
      angle: hatchAngle,
      spacing: hatchSpacing,
      opacity: hatchOpacity,
      cross: crossHatch,
      seed: seed + 19,
      boilStep,
    });
    ctx.restore();
  }

  ctx.restore();

  if (stroke) {
    drawPencilPolyline(ctx, points, { ...opts, closed: true });
  }
}

/**
 * Génère les sommets d'une ellipse organique pour drawHandShape
 */
export function makeEllipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation = 0,
  segments = 20
): Point[] {
  const pts: Point[] = [];
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const lx = Math.cos(a) * rx;
    const ly = Math.sin(a) * ry;
    pts.push([cx + lx * cosR - ly * sinR, cy + lx * sinR + ly * cosR]);
  }
  return pts;
}

export function drawHandEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opts: HandShapeOptions & { rotation?: number; segments?: number } = {}
): void {
  const pts = makeEllipsePoints(cx, cy, rx, ry, opts.rotation ?? 0, opts.segments ?? 20);
  drawHandShape(ctx, pts, opts);
}

export function makeRoundedRectPoints(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 6
): Point[] {
  const cr = Math.min(r, w * 0.45, h * 0.45);
  if (cr <= 1) {
    return [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ];
  }
  return [
    [x + cr, y],
    [x + w - cr, y],
    [x + w, y + cr],
    [x + w, y + h - cr],
    [x + w - cr, y + h],
    [x + cr, y + h],
    [x, y + h - cr],
    [x, y + cr],
  ];
}

export function drawHandRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: HandShapeOptions & { radius?: number } = {}
): void {
  const pts = makeRoundedRectPoints(x, y, w, h, opts.radius ?? 4);
  drawHandShape(ctx, pts, opts);
}

/**
 * Dessine une volute de vapeur chaude et délicate
 */
export function drawSteamWisp(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  height: number,
  phase: number,
  boilStep: number,
  seed: number,
  opacity = 0.45
): void {
  const pts: Point[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const sway = Math.sin(u * Math.PI * 2.2 - phase * 3.2 + seed) * (10 + u * 14);
    pts.push([baseX + sway, baseY - u * height]);
  }
  drawPencilPolyline(ctx, pts, {
    color: '#FFFDF8',
    width: 3.2,
    jitter: 0.9,
    seed,
    boilStep,
    opacity,
    doublePass: true,
  });
}
