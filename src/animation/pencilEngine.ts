import { PALETTE } from './config';

export type Point2D = [number, number];
export type Point3D = [number, number, number];

/**
 * Générateur pseudo-aléatoire déterministe Mulberry32.
 * Garantit qu'un même (frameIndex, tag) produit toujours exactement les mêmes traits.
 */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createPRNG(frameIndex: number, tag: string): () => number {
  // Graine changeant à chaque frame pour un véritable effet "dessiné feuille par feuille"
  let seed = (hashString(tag) ^ Math.imul(frameIndex + 101, 2654435761)) >>> 0;
  return function rand(): number {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPt(p: Point2D, q: Point2D, t: number): Point2D {
  return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t: number): number {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function easeOutBack(t: number, overshoot = 1.35): number {
  const c = clamp(t, 0, 1);
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + overshoot * Math.pow(c - 1, 2);
}

/**
 * Cinématique inverse analytique à 2 os (épaule->coude->poignet ou hanche->genou->cheville).
 * Le paramètre `polePoint` guide l'orientation anatomique du coude ou du genou
 * pour empêcher toute hyperextension ou retournement non naturel.
 */
export function solveTwoBoneIK(
  root: Point2D,
  target: Point2D,
  len1: number,
  len2: number,
  polePoint: Point2D
): { mid: Point2D; end: Point2D } {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const rawDist = Math.hypot(dx, dy);
  const maxReach = Math.max(0.01, len1 + len2 - 0.5);
  const minReach = Math.abs(len1 - len2) + 0.5;
  const dist = clamp(rawDist, minReach, maxReach);

  const baseAngle = Math.atan2(dy, dx);
  const cosAngle = clamp((len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist), -1, 1);
  const bendAngle = Math.acos(cosAngle);

  const mid1: Point2D = [
    root[0] + Math.cos(baseAngle + bendAngle) * len1,
    root[1] + Math.sin(baseAngle + bendAngle) * len1,
  ];
  const mid2: Point2D = [
    root[0] + Math.cos(baseAngle - bendAngle) * len1,
    root[1] + Math.sin(baseAngle - bendAngle) * len1,
  ];

  // Choisit l'articulation la plus proche du pôle anatomique
  const d1 = Math.hypot(mid1[0] - polePoint[0], mid1[1] - polePoint[1]);
  const d2 = Math.hypot(mid2[0] - polePoint[0], mid2[1] - polePoint[1]);
  const mid = d1 <= d2 ? mid1 : mid2;

  const end: Point2D =
    rawDist > maxReach
      ? [root[0] + Math.cos(baseAngle) * maxReach, root[1] + Math.sin(baseAngle) * maxReach]
      : [target[0], target[1]];

  return { mid, end };
}

/**
 * Texture de papier grainé chaud dessiné sur tout le canevas.
 */
export function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameIndex: number
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, PALETTE.paperBase);
  grad.addColorStop(0.55, PALETTE.paperWarm);
  grad.addColorStop(1, '#EADBC4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Fibres de papier subtiles (stables avec légère vibration organique de grain)
  const randStatic = createPRNG(0, 'paper-fibers-static');
  ctx.save();
  ctx.strokeStyle = 'rgba(130, 102, 74, 0.055)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 160; i++) {
    const x = randStatic() * width;
    const y = randStatic() * height;
    const len = 14 + randStatic() * 34;
    const ang = (randStatic() - 0.5) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }

  // Grain crayonné vivant par frame
  const randFrame = createPRNG(frameIndex, 'paper-grain-boil');
  ctx.fillStyle = 'rgba(98, 76, 54, 0.035)';
  for (let i = 0; i < 120; i++) {
    const gx = randFrame() * width;
    const gy = randFrame() * height;
    const gr = 1 + randFrame() * 2.4;
    ctx.fillRect(gx, gy, gr, gr);
  }
  ctx.restore();
}

/**
 * Subdivise une polyligne pour permettre au bruit de crayon d'onduler naturellement
 * même sur de longs segments droits.
 */
export function subdividePolyline(pts: Point2D[], maxStep = 14, closed = false): Point2D[] {
  if (pts.length < 2) return pts.slice();
  const out: Point2D[] = [];
  const count = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < count; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(dist / maxStep));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
    }
  }
  if (!closed) {
    out.push(pts[pts.length - 1]);
  }
  return out;
}

export interface PencilStrokeOptions {
  color?: string;
  width?: number;
  wobble?: number;
  closed?: boolean;
  doublePass?: boolean;
  alpha?: number;
  lineCap?: CanvasLineCap;
}

/**
 * Trace un contour au crayon graphite bien visible, organique et vibrant entre chaque frame.
 * Effectue deux passages de mine ("doublePass") pour donner un aspect véritablement dessiné à la main.
 */
export function drawPencilPolyline(
  ctx: CanvasRenderingContext2D,
  pts: Point2D[],
  frameIndex: number,
  tag: string,
  opts: PencilStrokeOptions = {}
): void {
  if (pts.length < 2) return;
  const {
    color = PALETTE.graphiteDark,
    width = 3.8,
    wobble = 2.1,
    closed = false,
    doublePass = true,
    alpha = 0.94,
    lineCap = 'round',
  } = opts;

  const dense = subdividePolyline(pts, 13, closed);
  const rand = createPRNG(frameIndex, `stroke:${tag}`);

  ctx.save();
  ctx.lineCap = lineCap;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;

  // Passage principal au crayon gras (2B/4B)
  const phase = rand() * Math.PI * 2;
  const freq = 0.45 + rand() * 0.35;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width * (0.94 + rand() * 0.14);
  ctx.beginPath();

  const displaced1: Point2D[] = dense.map((p, idx) => {
    // Atténue légèrement le tremblement aux extrémités d'un trait ouvert pour préserver les jonctions
    const edgeFactor = closed
      ? 1
      : Math.min(1, Math.min(idx / 2, (dense.length - 1 - idx) / 2) + 0.35);
    const wave = Math.sin(idx * freq + phase) * wobble * 0.72;
    const jitterX = (rand() - 0.5) * wobble * 1.15;
    const jitterY = (rand() - 0.5) * wobble * 1.15;
    return [p[0] + (wave + jitterX) * edgeFactor, p[1] + ( -wave * 0.6 + jitterY) * edgeFactor];
  });

  displaced1.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (closed) ctx.closePath();
  ctx.stroke();

  // Second passage de mine plus fin et légèrement décalé (coup de crayon spontané)
  if (doublePass) {
    const phase2 = rand() * Math.PI * 2;
    ctx.globalAlpha = alpha * 0.44;
    ctx.lineWidth = Math.max(1.3, width * 0.56);
    ctx.beginPath();
    dense.forEach((p, idx) => {
      const wave2 = Math.cos(idx * (freq * 1.25) + phase2) * wobble * 1.15;
      const jx = (rand() - 0.5) * wobble * 1.45;
      const jy = (rand() - 0.5) * wobble * 1.45;
      const x = p[0] + wave2 + jx;
      const y = p[1] - wave2 * 0.7 + jy;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    if (closed) ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Trace des hachures obliques au crayon à l'intérieur d'un polygone déjà clippé.
 */
export function drawPencilHatchingInClip(
  ctx: CanvasRenderingContext2D,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  frameIndex: number,
  tag: string,
  color: string,
  spacing = 11,
  angleRad = -0.55,
  alpha = 0.22
): void {
  const rand = createPRNG(frameIndex, `hatch:${tag}`);
  const cx = (bounds.minX + bounds.maxX) * 0.5;
  const cy = (bounds.minY + bounds.maxY) * 0.5;
  const diag = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.65;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const nx = -sinA;
  const ny = cosA;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';

  const steps = Math.min(48, Math.max(4, Math.floor((diag * 2) / spacing)));
  for (let i = -steps; i <= steps; i++) {
    const offset = i * spacing + (rand() - 0.5) * 3.2;
    const px = cx + nx * offset;
    const py = cy + ny * offset;
    const j1 = (rand() - 0.5) * 4;
    const j2 = (rand() - 0.5) * 4;
    ctx.beginPath();
    ctx.moveTo(px - cosA * diag + j1, py - sinA * diag - j1);
    ctx.lineTo(px + cosA * diag + j2, py + sinA * diag - j2);
    ctx.stroke();
  }
  ctx.restore();
}

export interface HandColoredShapeOptions {
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  wobble?: number;
  colorOffsetScale?: number; // Décalage "humain" du coloriage (dépasse légèrement d'un côté)
  occludePaper?: boolean; // Masque les traits d'arrière-plan sous l'objet
  hatchColor?: string;
  hatchAlpha?: number;
  hatchSpacing?: number;
  hatchAngle?: number;
  strokeOutline?: boolean;
}

/**
 * Remplit un polygone avec un coloriage imparfait "fait main" (léger décalage et dépassement organique
 * qui varie légèrement d'une frame à l'autre + hachures crayonnées) puis trace son contour au crayon.
 */
export function drawHandColoredPolygon(
  ctx: CanvasRenderingContext2D,
  pts: Point2D[],
  frameIndex: number,
  tag: string,
  opts: HandColoredShapeOptions
): void {
  if (pts.length < 3) return;
  const {
    fillColor,
    strokeColor = PALETTE.graphiteDark,
    strokeWidth = 3.8,
    wobble = 2.1,
    colorOffsetScale = 3.6,
    occludePaper = true,
    hatchColor,
    hatchAlpha = 0.22,
    hatchSpacing = 12,
    hatchAngle = -0.52,
    strokeOutline = true,
  } = opts;

  const dense = subdividePolyline(pts, 16, true);
  const rand = createPRNG(frameIndex, `fill:${tag}`);

  // 1. Cache opaque couleur papier pour empêcher tout trait résiduel de l'arrière-plan de transparaître
  if (occludePaper) {
    ctx.save();
    ctx.fillStyle = PALETTE.paperBase;
    ctx.beginPath();
    dense.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 2. Polygone de coloriage légèrement décalé et imparfait (dépasse légèrement du trait d'un côté)
  const shiftX = (rand() - 0.38) * colorOffsetScale * 1.55;
  const shiftY = (rand() - 0.42) * colorOffsetScale * 1.45;
  const phase = rand() * Math.PI * 2;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const colorPoly: Point2D[] = dense.map(([x, y], idx) => {
    const wave = Math.sin(idx * 0.55 + phase) * (colorOffsetScale * 0.65);
    const cx = x + shiftX + wave + (rand() - 0.5) * colorOffsetScale * 0.7;
    const cy = y + shiftY - wave * 0.6 + (rand() - 0.5) * colorOffsetScale * 0.7;
    if (cx < minX) minX = cx;
    if (cy < minY) minY = cy;
    if (cx > maxX) maxX = cx;
    if (cy > maxY) maxY = cy;
    return [cx, cy];
  });

  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = 0.94;
  ctx.beginPath();
  colorPoly.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();

  // 3. Hachures de crayon de couleur à l'intérieur du remplissage
  if (hatchColor) {
    ctx.clip();
    drawPencilHatchingInClip(
      ctx,
      { minX, minY, maxX, maxY },
      frameIndex,
      tag,
      hatchColor,
      hatchSpacing,
      hatchAngle,
      hatchAlpha
    );
  }
  ctx.restore();

  // 4. Contour au crayon graphite
  if (strokeOutline) {
    drawPencilPolyline(ctx, pts, frameIndex, `${tag}:outline`, {
      color: strokeColor,
      width: strokeWidth,
      wobble,
      closed: true,
      doublePass: true,
    });
  }
}

/**
 * Génère les points d'une ellipse ou d'un arc d'ellipse.
 */
export function sampleEllipseArc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startAngle = 0,
  endAngle = Math.PI * 2,
  segments = 28,
  rotation = 0
): Point2D[] {
  const pts: Point2D[] = [];
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = lerp(startAngle, endAngle, t);
    const lx = Math.cos(a) * rx;
    const ly = Math.sin(a) * ry;
    pts.push([cx + lx * cosR - ly * sinR, cy + lx * sinR + ly * cosR]);
  }
  return pts;
}

/**
 * Géométrie unifiée d'un membre articulé (bras + avant-bras ou cuisse + mollet).
 * Supprime 100 % des traits de séparation internes au coude/genou et garantit
 * l'absence totale d'écart blanc entre les segments.
 */
export interface UnifiedLimbGeometry {
  spine: Point2D[];
  outerEdge: Point2D[]; // Du début à la fin côté externe
  innerEdge: Point2D[]; // Du début à la fin côté pli interne
  fullPolygon: Point2D[]; // Polygone fermé continu du membre entier
  midOuterPt: Point2D;
  midInnerPt: Point2D;
  endCenter: Point2D;
  endDir: number; // Angle tangent au poignet ou à la cheville
}

export function computeUnifiedLimbGeometry(
  start: Point2D,
  mid: Point2D,
  end: Point2D,
  wStart: number,
  wMid: number,
  wEnd: number,
  stepsPerSegment = 10
): UnifiedLimbGeometry {
  // Construction d'une courbe médiane lisse qui adoucit légèrement l'angle du coude/genou
  const spine: Point2D[] = [];
  const pA = lerpPt(start, mid, 0.82);
  const pB = lerpPt(mid, end, 0.18);

  for (let i = 0; i < stepsPerSegment; i++) {
    const t = i / stepsPerSegment;
    spine.push(lerpPt(start, pA, t));
  }
  // Courbe de Bézier quadratique douce autour de l'articulation centrale
  const cornerSteps = 7;
  for (let i = 0; i <= cornerSteps; i++) {
    const t = i / cornerSteps;
    const u = 1 - t;
    const x = u * u * pA[0] + 2 * u * t * mid[0] + t * t * pB[0];
    const y = u * u * pA[1] + 2 * u * t * mid[1] + t * t * pB[1];
    spine.push([x, y]);
  }
  for (let i = 1; i <= stepsPerSegment; i++) {
    const t = i / stepsPerSegment;
    spine.push(lerpPt(pB, end, t));
  }

  const n = spine.length;
  const outerEdge: Point2D[] = [];
  const innerEdge: Point2D[] = [];

  // Détermine de quel côté plie l'articulation (produit vectoriel)
  const v1x = mid[0] - start[0];
  const v1y = mid[1] - start[1];
  const v2x = end[0] - mid[0];
  const v2y = end[1] - mid[1];
  const cross = v1x * v2y - v1y * v2x;
  const bendSign = cross >= 0 ? 1 : -1;

  for (let i = 0; i < n; i++) {
    const prev = spine[Math.max(0, i - 1)];
    const next = spine[Math.min(n - 1, i + 1)];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;

    // Normale unitaire
    const nx = -ty * bendSign;
    const ny = tx * bendSign;

    const u = i / (n - 1);
    const width = u < 0.5 ? lerp(wStart, wMid, u * 2) : lerp(wMid, wEnd, (u - 0.5) * 2);
    const hw = width * 0.5;

    outerEdge.push([spine[i][0] - nx * hw, spine[i][1] - ny * hw]);
    innerEdge.push([spine[i][0] + nx * hw, spine[i][1] + ny * hw]);
  }

  const midIdx = Math.floor(n * 0.5);
  const fullPolygon: Point2D[] = [...outerEdge, ...innerEdge.slice().reverse()];
  const endDir = Math.atan2(end[1] - mid[1], end[0] - mid[0]);

  return {
    spine,
    outerEdge,
    innerEdge,
    fullPolygon,
    midOuterPt: outerEdge[midIdx],
    midInnerPt: innerEdge[midIdx],
    endCenter: end,
    endDir,
  };
}

export interface UnifiedLimbRenderOptions {
  skinColor: string;
  skinHatchColor?: string;
  garmentColor?: string; // Couleur de la manche ou du short/pantalon s'il couvre le haut du membre
  garmentHatchColor?: string;
  garmentSplitRatio?: number; // ex: 0.58 pour une manche retroussée à l'avant-bras, 0.35 pour manche courte
  cuffColor?: string; // Revers de manche éventuel
  strokeColor?: string;
  strokeWidth?: number;
  drawShoulderCap?: boolean;
}

/**
 * Dessine un membre complet (bras+avant-bras ou cuisse+jambe) comme UNE SEULE forme continue :
 * - Aucun trait de séparation entre le bras et l'avant-bras (ni entre la cuisse et le mollet).
 * - Aucun espace blanc ou décalage à l'articulation.
 * - Un léger pli anatomique naturel dans le creux du coude uniquement si le bras est plié.
 */
export function drawUnifiedLimb(
  ctx: CanvasRenderingContext2D,
  start: Point2D,
  mid: Point2D,
  end: Point2D,
  wStart: number,
  wMid: number,
  wEnd: number,
  frameIndex: number,
  tag: string,
  opts: UnifiedLimbRenderOptions
): UnifiedLimbGeometry {
  const geom = computeUnifiedLimbGeometry(start, mid, end, wStart, wMid, wEnd, 10);
  const {
    skinColor,
    skinHatchColor = PALETTE.skinShadow,
    garmentColor,
    garmentHatchColor,
    garmentSplitRatio = 0,
    cuffColor,
    strokeColor = PALETTE.graphiteDark,
    strokeWidth = 3.8,
  } = opts;

  // 1. Remplissage continu de la silhouette entière du membre (peau de base sans aucune coupure)
  drawHandColoredPolygon(ctx, geom.fullPolygon, frameIndex, `${tag}:skin-base`, {
    fillColor: skinColor,
    hatchColor: skinHatchColor,
    hatchAlpha: 0.16,
    occludePaper: true,
    strokeOutline: false,
    colorOffsetScale: 3.0,
  });

  const n = geom.outerEdge.length;

  // 2. Si une manche ou un short recouvre la partie supérieure du membre, on la colorie sur le même tube continu
  if (garmentColor && garmentSplitRatio > 0.05) {
    const splitIdx = clamp(Math.round(n * garmentSplitRatio), 2, n - 2);
    const garmentPoly: Point2D[] = [
      ...geom.outerEdge.slice(0, splitIdx + 1),
      ...geom.innerEdge.slice(0, splitIdx + 1).reverse(),
    ];

    drawHandColoredPolygon(ctx, garmentPoly, frameIndex, `${tag}:garment`, {
      fillColor: garmentColor,
      hatchColor: garmentHatchColor,
      hatchAlpha: 0.22,
      occludePaper: false, // La base papier est déjà posée sur tout le membre
      strokeOutline: false,
      colorOffsetScale: 3.4,
    });

    // Trait d'ourlet de la manche / du short (et revers retroussé éventuel)
    const cuffOut = geom.outerEdge[splitIdx];
    const cuffIn = geom.innerEdge[splitIdx];
    if (cuffColor) {
      const prevIdx = Math.max(0, splitIdx - 2);
      const bandPoly: Point2D[] = [
        geom.outerEdge[prevIdx],
        cuffOut,
        cuffIn,
        geom.innerEdge[prevIdx],
      ];
      drawHandColoredPolygon(ctx, bandPoly, frameIndex, `${tag}:cuff`, {
        fillColor: cuffColor,
        occludePaper: false,
        strokeOutline: false,
        colorOffsetScale: 2.2,
      });
    }
    drawPencilPolyline(ctx, [cuffOut, cuffIn], frameIndex, `${tag}:hem`, {
      color: strokeColor,
      width: strokeWidth * 0.82,
      wobble: 1.6,
      closed: false,
    });
  }

  // 3. Tracé au crayon UNIQUEMENT sur les deux bords longs extérieurs continus (jamais de trait coupant le coude !)
  drawPencilPolyline(ctx, geom.outerEdge, frameIndex, `${tag}:outer-edge`, {
    color: strokeColor,
    width: strokeWidth,
    wobble: 2.0,
    closed: false,
  });

  drawPencilPolyline(ctx, geom.innerEdge, frameIndex, `${tag}:inner-edge`, {
    color: strokeColor,
    width: strokeWidth,
    wobble: 2.0,
    closed: false,
  });

  // 4. Très léger pli anatomique ouvert au creux du coude/genou si le membre est fléchi (sans jamais barrer le membre)
  const ang1 = Math.atan2(mid[1] - start[1], mid[0] - start[0]);
  const ang2 = Math.atan2(end[1] - mid[1], end[0] - mid[0]);
  let bendDiff = Math.abs(ang2 - ang1);
  if (bendDiff > Math.PI) bendDiff = Math.PI * 2 - bendDiff;
  if (bendDiff > 0.42) {
    const creaseDir: Point2D = [
      (geom.midOuterPt[0] - geom.midInnerPt[0]) * 0.24,
      (geom.midOuterPt[1] - geom.midInnerPt[1]) * 0.24,
    ];
    drawPencilPolyline(
      ctx,
      [
        geom.midInnerPt,
        [geom.midInnerPt[0] + creaseDir[0], geom.midInnerPt[1] + creaseDir[1]],
      ],
      frameIndex,
      `${tag}:crease`,
      {
        color: strokeColor,
        width: strokeWidth * 0.65,
        wobble: 1.1,
        closed: false,
        doublePass: false,
      }
    );
  }

  return geom;
}

/**
 * Projection 3D perspective simple et naturelle vers le canevas 2D (1080 x 1920).
 * Origine (0,0,0) = centre de la pièce à hauteur du plan de travail ;
 * x : droite (+), y : bas (+), z : profondeur vers l'arrière-plan (+).
 */
export interface Camera3DConfig {
  vanishingX: number;
  vanishingY: number;
  focalLength: number;
}

export const DEFAULT_CAMERA_3D: Camera3DConfig = {
  vanishingX: 510,
  vanishingY: 640,
  focalLength: 1450,
};

export function project3D(
  pt: Point3D,
  cam: Camera3DConfig = DEFAULT_CAMERA_3D
): { pos: Point2D; scale: number } {
  const [x, y, z] = pt;
  const scale = cam.focalLength / Math.max(250, cam.focalLength + z);
  const sx = cam.vanishingX + (x - cam.vanishingX) * scale;
  const sy = cam.vanishingY + (y - cam.vanishingY) * scale;
  return { pos: [sx, sy], scale };
}
