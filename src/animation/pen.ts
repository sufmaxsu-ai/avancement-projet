import { Point2D, createSeededRandom, hashString, noise1D, sampleCatmullRom } from './prng';

export interface InkStrokeOptions {
  color?: string;
  width?: number;
  wobble?: number;
  taperStart?: number;
  taperEnd?: number;
  closed?: boolean;
  alpha?: number;
  graphiteDouble?: boolean;
  subdivisions?: number;
}

export interface WatercolorWashOptions {
  passes?: number;
  spread?: number;
  alpha?: number;
  edgeColor?: string;
  edgeWidth?: number;
  closed?: boolean;
}

let cachedPaperCanvas: HTMLCanvasElement | null = null;
let cachedOverlayCanvas: HTMLCanvasElement | null = null;

/**
 * Construit et met en cache le fond de papier aquarelle grain torchon (#FAF3E6)
 * avec fibres coton et grain déterministe (inspiré de pencil.js buildTooth + pen.mjs).
 */
export function getPaperBackgroundCanvas(width: number, height: number): HTMLCanvasElement {
  if (cachedPaperCanvas && cachedPaperCanvas.width === width && cachedPaperCanvas.height === height) {
    return cachedPaperCanvas;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Base aquarelle ivoire chaud
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FDF6E9');
  bgGrad.addColorStop(0.5, '#FAF2E3');
  bgGrad.addColorStop(1, '#F4E8D4');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Grain de papier multi-échelle sur une grille 540x960 mise à l'échelle x2
  const gw = Math.floor(width / 2);
  const gh = Math.floor(height / 2);
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = gw;
  grainCanvas.height = gh;
  const gctx = grainCanvas.getContext('2d')!;
  const imgData = gctx.createImageData(gw, gh);
  const data = imgData.data;

  const rng = createSeededRandom('PAPER_TORCHON_GRAIN_2026');
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const idx = (y * gw + x) * 4;
      const fine = (rng() - 0.5) * 14;
      const weave = Math.sin(x * 0.45) * Math.cos(y * 0.45) * 4.5;
      const delta = fine + weave;
      data[idx] = Math.max(0, Math.min(255, 248 + delta));
      data[idx + 1] = Math.max(0, Math.min(255, 238 + delta));
      data[idx + 2] = Math.max(0, Math.min(255, 222 + delta));
      data[idx + 3] = 36;
    }
  }
  gctx.putImageData(imgData, 0, 0);
  ctx.drawImage(grainCanvas, 0, 0, width, height);

  // 3. Fibres de papier subtiles dessinées au crayon très clair
  ctx.save();
  for (let i = 0; i < 420; i++) {
    const fx = rng() * width;
    const fy = rng() * height;
    const len = 8 + rng() * 26;
    const ang = rng() * Math.PI * 2;
    ctx.strokeStyle = rng() > 0.5 ? 'rgba(198, 176, 148, 0.14)' : 'rgba(255, 252, 245, 0.22)';
    ctx.lineWidth = 0.8 + rng() * 1.1;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo(
      fx + Math.cos(ang + 0.3) * (len * 0.5),
      fy + Math.sin(ang + 0.3) * (len * 0.5),
      fx + Math.cos(ang) * len,
      fy + Math.sin(ang) * len
    );
    ctx.stroke();
  }
  ctx.restore();

  cachedPaperCanvas = canvas;
  return canvas;
}

/**
 * Superpose en fin de rendu un voile de grain de papier et un vignettage livre jeunesse.
 */
export function drawPaperFinishOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  if (!cachedOverlayCanvas || cachedOverlayCanvas.width !== width || cachedOverlayCanvas.height !== height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const octx = c.getContext('2d')!;
    const rng = createSeededRandom('PAPER_OVERLAY_TOOTH_V1');

    // Fines mouchetures de grain crayon / papier
    for (let i = 0; i < 1800; i++) {
      const x = rng() * width;
      const y = rng() * height;
      const r = 0.6 + rng() * 1.6;
      octx.fillStyle = rng() > 0.45 ? 'rgba(130, 102, 78, 0.032)' : 'rgba(255, 250, 240, 0.045)';
      octx.beginPath();
      octx.arc(x, y, r, 0, Math.PI * 2);
      octx.fill();
    }

    // Vignettage chaleureux de page d'album illustré
    const vig = octx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      width * 0.38,
      width * 0.5,
      height * 0.5,
      height * 0.62
    );
    vig.addColorStop(0, 'rgba(245, 228, 200, 0)');
    vig.addColorStop(0.78, 'rgba(218, 190, 152, 0.06)');
    vig.addColorStop(1, 'rgba(168, 132, 96, 0.22)');
    octx.fillStyle = vig;
    octx.fillRect(0, 0, width, height);

    cachedOverlayCanvas = c;
  }

  ctx.save();
  ctx.drawImage(cachedOverlayCanvas, 0, 0);
  ctx.restore();
}

/**
 * Remplissage aquarelle/gouache en plusieurs passes translucides avec léger décalage organique.
 */
export function drawWatercolorWash(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  fillStyle: string | CanvasGradient,
  seedKey: string,
  options: WatercolorWashOptions = {}
): void {
  if (points.length < 3) return;
  const passes = options.passes ?? 3;
  const spread = options.spread ?? 2.2;
  const baseAlpha = options.alpha ?? 0.92;
  const closed = options.closed ?? true;

  const sampled = sampleCatmullRom(points, 8, closed);
  const seedNum = hashString(seedKey);

  ctx.save();
  ctx.fillStyle = fillStyle;

  for (let p = 0; p < passes; p++) {
    const passAlpha = p === 0 ? baseAlpha * 0.78 : (baseAlpha * 0.34) / Math.max(1, passes - 1);
    ctx.globalAlpha = Math.min(1, passAlpha);
    ctx.beginPath();

    for (let i = 0; i < sampled.length; i++) {
      const pt = sampled[i];
      const nX = noise1D(i * 0.35 + p * 17.3, seedNum + p * 101) * spread * (p === 0 ? 0.5 : 1.0);
      const nY = noise1D(i * 0.35 + p * 31.7 + 50, seedNum + p * 211) * spread * (p === 0 ? 0.5 : 1.0);
      if (i === 0) {
        ctx.moveTo(pt.x + nX, pt.y + nY);
      } else {
        ctx.lineTo(pt.x + nX, pt.y + nY);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  // Halo doux de pigment sur le bord de l'aquarelle
  if (options.edgeColor) {
    ctx.globalAlpha = (options.alpha ?? 1) * 0.35;
    ctx.strokeStyle = options.edgeColor;
    ctx.lineWidth = options.edgeWidth ?? 1.8;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Trace un trait d'encre sépia ou de crayon fusain avec épaisseur variable (ruban de pression),
 * tremblement organique cohérent verrouillé sur la graine du dessin (celId) et double-passe graphite.
 */
export function drawOrganicInkStroke(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  seedKey: string,
  options: InkStrokeOptions = {}
): void {
  if (points.length < 2) return;

  const color = options.color ?? '#3B2D26';
  const baseWidth = options.width ?? 3.2;
  const wobble = options.wobble ?? 1.15;
  const taperStart = options.taperStart ?? 0.25;
  const taperEnd = options.taperEnd ?? 0.25;
  const closed = options.closed ?? false;
  const alpha = options.alpha ?? 0.94;
  const subdivisions = options.subdivisions ?? 9;
  const graphiteDouble = options.graphiteDouble ?? true;

  const sampled = sampleCatmullRom(points, subdivisions, closed);
  if (sampled.length < 2) return;

  const seedNum = hashString(seedKey);
  const displaced: Point2D[] = [];

  for (let i = 0; i < sampled.length; i++) {
    const pt = sampled[i];
    const u = i / Math.max(1, sampled.length - 1);
    const dx = noise1D(u * 6.5, seedNum + 11) * wobble;
    const dy = noise1D(u * 6.5 + 19.7, seedNum + 29) * wobble;
    displaced.push({
      x: pt.x + dx,
      y: pt.y + dy,
      pressure: pt.pressure ?? 1,
    });
  }

  // Construction du ruban à épaisseur variable (gauche / droite)
  const leftSide: Point2D[] = [];
  const rightSide: Point2D[] = [];
  const n = displaced.length;

  for (let i = 0; i < n; i++) {
    const pPrev = displaced[Math.max(0, i - 1)];
    const pCurr = displaced[i];
    const pNext = displaced[Math.min(n - 1, i + 1)];

    let tx = pNext.x - pPrev.x;
    let ty = pNext.y - pPrev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;

    // Normale perpendiculaire
    const nx = -ty;
    const ny = tx;

    const u = i / Math.max(1, n - 1);
    let env = 1.0;
    if (!closed) {
      if (taperStart > 0 && u < taperStart) {
        const t = u / taperStart;
        env *= 0.28 + 0.72 * Math.sin(t * (Math.PI / 2));
      }
      if (taperEnd > 0 && u > 1 - taperEnd) {
        const t = (1 - u) / taperEnd;
        env *= 0.28 + 0.72 * Math.sin(t * (Math.PI / 2));
      }
    }

    const grainMod = 0.86 + 0.28 * ((noise1D(u * 14.0, seedNum + 73) + 1) * 0.5);
    const halfW = Math.max(0.45, (baseWidth * (pCurr.pressure ?? 1) * env * grainMod) * 0.5);

    leftSide.push({ x: pCurr.x + nx * halfW, y: pCurr.y + ny * halfW });
    rightSide.push({ x: pCurr.x - nx * halfW, y: pCurr.y - ny * halfW });
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(leftSide[0].x, leftSide[0].y);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(leftSide[i].x, leftSide[i].y);
  }
  for (let i = n - 1; i >= 0; i--) {
    ctx.lineTo(rightSide[i].x, rightSide[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // Seconde passe fine au crayon graphite légèrement décalée (signature dessin à la main)
  if (graphiteDouble && baseWidth >= 1.8) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.32;
    ctx.lineWidth = Math.max(0.8, baseWidth * 0.36);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const pt = displaced[i];
      const u = i / Math.max(1, n - 1);
      const gx = pt.x + noise1D(u * 9.2 + 3.1, seedNum + 313) * (wobble * 1.35);
      const gy = pt.y + noise1D(u * 9.2 + 14.8, seedNum + 509) * (wobble * 1.35);
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    if (closed) ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Dessine une série de hachures douces au crayon de couleur (joues rosées, laine du châle, ombres de pierre).
 */
export function drawPencilHatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleRad: number,
  color: string,
  seedKey: string,
  strokeCount: number = 9,
  lineWidth: number = 1.5,
  alpha: number = 0.28
): void {
  const rng = createSeededRandom(seedKey);
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const perpX = -sinA;
  const perpY = cosA;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.globalAlpha = alpha;

  for (let i = 0; i < strokeCount; i++) {
    const t = (i / Math.max(1, strokeCount - 1)) * 2 - 1;
    const chord = Math.sqrt(Math.max(0.08, 1 - t * t));
    const offsetPerp = t * ry;
    const halfLen = rx * chord * (0.78 + rng() * 0.32);

    const mx = cx + perpX * offsetPerp + (rng() - 0.5) * 2.5;
    const my = cy + perpY * offsetPerp + (rng() - 0.5) * 2.5;

    const x0 = mx - cosA * halfLen;
    const y0 = my - sinA * halfLen;
    const x1 = mx + cosA * halfLen;
    const y1 = my + sinA * halfLen;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(
      mx + perpX * (rng() - 0.5) * 3.2,
      my + perpY * (rng() - 0.5) * 3.2,
      x1,
      y1
    );
    ctx.stroke();
  }

  ctx.restore();
}
