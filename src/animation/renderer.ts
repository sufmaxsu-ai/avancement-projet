import { FILM_CONFIG, getPhaseForFrame } from './config';
import { clamp } from './pencilEngine';
import { renderSceneFrame } from './scenes';

export interface RenderFrameOptions {
  onionSkin?: boolean;
  showSafeZone?: boolean;
}

/**
 * Dessine une frame déterministe sur le contexte Canvas 2D fourni.
 */
export function drawAnimationFrame(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  opts: RenderFrameOptions = {}
): number {
  const f = clamp(Math.floor(frameIndex), 0, FILM_CONFIG.totalFrames - 1);
  const { width, height } = FILM_CONFIG;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Rendu principal de la frame courante
  renderSceneFrame(ctx, f, width, height);

  // Superposition Onion Skinning optionnelle (pour l'inspection image par image dans le studio)
  if (opts.onionSkin && f > 0) {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      renderSceneFrame(offCtx, Math.max(0, f - 1), width, height);
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.filter = 'sepia(0.9) hue-rotate(-35deg) saturate(2.2)';
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();
    }
  }

  // Grille de zone de sécurité TikTok / Instagram Reels 9:16 optionnelle
  if (opts.showSafeZone) {
    ctx.save();
    ctx.strokeStyle = 'rgba(210, 64, 52, 0.72)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    // Zone centrale de sécurité : x = 90..950, y = 180..1680
    ctx.strokeRect(90, 180, 860, 1500);
    ctx.fillStyle = 'rgba(210, 64, 52, 0.85)';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('SAFE ZONE 9:16 (TikTok / Reels)', 110, 215);
    ctx.restore();
  }

  ctx.restore();
  return f;
}

/**
 * Positionne l'animation à un instant précis `timeSeconds` (en secondes).
 */
export function seekAnimationTime(
  ctx: CanvasRenderingContext2D,
  timeSeconds: number,
  opts: RenderFrameOptions = {}
): number {
  const frameIndex = clamp(
    Math.round(timeSeconds * FILM_CONFIG.fps),
    0,
    FILM_CONFIG.totalFrames - 1
  );
  return drawAnimationFrame(ctx, frameIndex, opts);
}

declare global {
  interface Window {
    drawFrame?: (frameIndex: number) => number;
    seek?: (timeSeconds: number) => number;
    getAnimationMetadata?: () => {
      title: string;
      width: number;
      height: number;
      fps: number;
      totalFrames: number;
      durationSeconds: number;
      currentPhase: string;
    };
  }
}

/**
 * Attache les fonctions déterministes `window.drawFrame(frameIndex)` et `window.seek(t)`
 * au canevas actif afin que Chromium Headless (Playwright) puisse capturer chaque frame.
 */
export function registerGlobalAnimationBindings(
  canvas: HTMLCanvasElement,
  onFrameRendered?: (frameIndex: number) => void
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let currentFrame = 0;

  window.drawFrame = (frameIndex: number): number => {
    currentFrame = drawAnimationFrame(ctx, frameIndex);
    if (onFrameRendered) onFrameRendered(currentFrame);
    return currentFrame;
  };

  window.seek = (timeSeconds: number): number => {
    const idx = clamp(
      Math.round(timeSeconds * FILM_CONFIG.fps),
      0,
      FILM_CONFIG.totalFrames - 1
    );
    return window.drawFrame ? window.drawFrame(idx) : idx;
  };

  window.getAnimationMetadata = () => ({
    title: FILM_CONFIG.title,
    width: FILM_CONFIG.width,
    height: FILM_CONFIG.height,
    fps: FILM_CONFIG.fps,
    totalFrames: FILM_CONFIG.totalFrames,
    durationSeconds: FILM_CONFIG.durationSeconds,
    currentPhase: getPhaseForFrame(currentFrame).title,
  });
}
