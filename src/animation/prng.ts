/**
 * Générateur pseudo-aléatoire déterministe (Mulberry32) et primitives mathématiques
 * pour garantir qu'un même frameIndex produit toujours exactement le même dessin au pixel près.
 */

export interface Point2D {
  x: number;
  y: number;
  pressure?: number;
}

export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seedStr: string): () => number {
  return mulberry32(hashString(seedStr));
}

export function noise1D(x: number, seed: number = 1337): number {
  const xi = Math.floor(x);
  const xf = x - xi;
  const u = xf * xf * (3 - 2 * xf);
  const h0 = mulberry32((xi * 374761393 + seed * 668265263) >>> 0)();
  const h1 = mulberry32(((xi + 1) * 374761393 + seed * 668265263) >>> 0)();
  return (h0 * (1 - u) + h1 * u) * 2 - 1;
}

export function noise2D(x: number, y: number, seed: number = 4099): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const hashXY = (ix: number, iy: number) =>
    mulberry32((ix * 374761393 + iy * 668265263 + seed * 1442695041) >>> 0)();

  const n00 = hashXY(xi, yi);
  const n10 = hashXY(xi + 1, yi);
  const n01 = hashXY(xi, yi + 1);
  const n11 = hashXY(xi + 1, yi + 1);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;
  return (nx0 * (1 - v) + nx1 * v) * 2 - 1;
}

/**
 * Évalue une spline de Catmull-Rom passant par une liste de points de contrôle 2D
 * avec interpolation de la pression du trait.
 */
export function sampleCatmullRom(points: Point2D[], subdivisionsPerSegment: number = 10, closed: boolean = false): Point2D[] {
  if (points.length < 2) return points.slice();
  if (points.length === 2) {
    const out: Point2D[] = [];
    for (let i = 0; i <= subdivisionsPerSegment; i++) {
      const t = i / subdivisionsPerSegment;
      out.push({
        x: points[0].x + (points[1].x - points[0].x) * t,
        y: points[0].y + (points[1].y - points[0].y) * t,
        pressure: (points[0].pressure ?? 1) * (1 - t) + (points[1].pressure ?? 1) * t,
      });
    }
    return out;
  }

  // Pour les polygones fermés de 3 à 7 sommets (architecture, fenêtres, volets, panier, jupe),
  // on stabilise les arêtes à 12 % et 88 % de chaque segment afin d'éviter l'effet "ballon"
  // tout en conservant des angles doux dessinés à la main.
  let workingPoints = points;
  if (closed && points.length >= 3 && points.length <= 7) {
    const refined: Point2D[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      refined.push(
        {
          x: a.x + (b.x - a.x) * 0.1,
          y: a.y + (b.y - a.y) * 0.1,
          pressure: a.pressure ?? 1,
        },
        {
          x: a.x + (b.x - a.x) * 0.5,
          y: a.y + (b.y - a.y) * 0.5,
          pressure: ((a.pressure ?? 1) + (b.pressure ?? 1)) * 0.5,
        },
        {
          x: a.x + (b.x - a.x) * 0.9,
          y: a.y + (b.y - a.y) * 0.9,
          pressure: b.pressure ?? 1,
        }
      );
    }
    workingPoints = refined;
    subdivisionsPerSegment = Math.max(3, Math.floor(subdivisionsPerSegment / 2));
  }

  const pts: Point2D[] = [];
  const n = workingPoints.length;
  const count = closed ? n : n - 1;

  for (let i = 0; i < count; i++) {
    const p0 = closed ? workingPoints[(i - 1 + n) % n] : workingPoints[Math.max(0, i - 1)];
    const p1 = workingPoints[i];
    const p2 = workingPoints[(i + 1) % n];
    const p3 = closed ? workingPoints[(i + 2) % n] : workingPoints[Math.min(n - 1, i + 2)];

    const steps = subdivisionsPerSegment;
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      const pr1 = p1.pressure ?? 1;
      const pr2 = p2.pressure ?? 1;
      const pressure = pr1 + (pr2 - pr1) * t;

      pts.push({ x, y, pressure });
    }
  }

  if (!closed) {
    const last = points[points.length - 1];
    pts.push({ x: last.x, y: last.y, pressure: last.pressure ?? 1 });
  } else if (pts.length > 0) {
    pts.push({ ...pts[0] });
  }

  return pts;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
