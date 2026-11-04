// Moteur de rendu déterministe final (prévisualisation live + capture Chromium image par image)

import { FILM_CONFIG, SAFE_ZONE, SCENES, getSceneForFrame } from './config';
import { clamp, ensurePaperTextures } from './pencilEngine';
import { drawSafeZoneOverlay, renderSceneAtFrame } from './scenes';

export interface RenderOptions {
  showSafeZone?: boolean;
  showOnionSkin?: boolean;
  showFrameStamp?: boolean;
}

let offscreenOnionCanvas: HTMLCanvasElement | null = null;

function getOnionCanvas(w: number, h: number): HTMLCanvasElement {
  if (!offscreenOnionCanvas || offscreenOnionCanvas.width !== w || offscreenOnionCanvas.height !== h) {
    offscreenOnionCanvas = document.createElement('canvas');
    offscreenOnionCanvas.width = w;
    offscreenOnionCanvas.height = h;
  }
  return offscreenOnionCanvas;
}

/**
 * Fonction de rendu déterministe principale :
 * Le même numéro de frame produit toujours exactement la même image, pixel pour pixel.
 */
export function renderFilmFrame(
  canvas: HTMLCanvasElement,
  frameIndex: number,
  options: RenderOptions = {}
): void {
  const W = FILM_CONFIG.width;
  const H = FILM_CONFIG.height;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const clampedFrame = clamp(Math.floor(frameIndex), 0, FILM_CONFIG.totalFrames - 1);
  const { base, overlay } = ensurePaperTextures(W, H);

  // 1. Fond papier aquarelle grainé
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(base, 0, 0);

  // 2. Pelure d'oignon (Onion Skinning : dessin précédent f-2 en ocre-rouge, suivant f+2 en bleu-sauge)
  if (options.showOnionSkin) {
    const onion = getOnionCanvas(W, H);
    const octx = onion.getContext('2d')!;

    if (clampedFrame >= 2) {
      octx.clearRect(0, 0, W, H);
      renderSceneAtFrame(octx, clampedFrame - 2);
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.filter = 'sepia(1) hue-rotate(-30deg) saturate(2.5)';
      ctx.drawImage(onion, 0, 0);
      ctx.restore();
    }

    if (clampedFrame + 2 < FILM_CONFIG.totalFrames) {
      octx.clearRect(0, 0, W, H);
      renderSceneAtFrame(octx, clampedFrame + 2);
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.filter = 'sepia(1) hue-rotate(140deg) saturate(2)';
      ctx.drawImage(onion, 0, 0);
      ctx.restore();
    }
  }

  // 3. Dessin complet de la scène courante
  renderSceneAtFrame(ctx, clampedFrame);

  // 4. Grain de papier supérieur et vignette livre illustré
  ctx.drawImage(overlay, 0, 0);

  // 5. Superposition optionnelle de la zone de sécurité 9:16
  if (options.showSafeZone) {
    drawSafeZoneOverlay(ctx);
  }

  // 6. Cartouche technique optionnel (pour planches contact QA)
  if (options.showFrameStamp) {
    const { scene } = getSceneForFrame(clampedFrame);
    const timeSec = (clampedFrame / FILM_CONFIG.fps).toFixed(2);
    ctx.save();
    ctx.fillStyle = 'rgba(42, 28, 18, 0.82)';
    ctx.fillRect(68, 1410, 620, 48);
    ctx.fillStyle = '#FAF3E6';
    ctx.font = 'bold 21px monospace';
    ctx.fillText(
      `Frame ${String(clampedFrame).padStart(4, '0')} | ${timeSec}s | ${scene.title}`,
      84,
      1441
    );
    ctx.restore();
  }
}

/**
 * Interface globale exposée sur window pour Chromium headless (Playwright/Puppeteer) et les tests QA
 */
declare global {
  interface Window {
    drawFrame?: (frameOrTime: number, opts?: RenderOptions) => number;
    seek?: (timeSeconds: number, opts?: RenderOptions) => number;
    getFilmMeta?: () => typeof FILM_CONFIG & { safeZone: typeof SAFE_ZONE; scenes: typeof SCENES };
    __ACTIVE_CANVAS__?: HTMLCanvasElement | null;
    __ON_EXTERNAL_SEEK__?: ((frame: number) => void) | null;
  }
}

export function registerGlobalFilmAPI(): void {
  if (typeof window === 'undefined') return;

  window.getFilmMeta = () => ({
    ...FILM_CONFIG,
    safeZone: SAFE_ZONE,
    scenes: SCENES,
  });

  window.drawFrame = (frameIndex: number, opts?: RenderOptions) => {
    const f = clamp(Math.floor(frameIndex), 0, FILM_CONFIG.totalFrames - 1);
    const canvas =
      window.__ACTIVE_CANVAS__ ||
      (document.getElementById('film-canvas') as HTMLCanvasElement | null);
    if (canvas) {
      renderFilmFrame(canvas, f, opts);
    }
    if (window.__ON_EXTERNAL_SEEK__) {
      window.__ON_EXTERNAL_SEEK__(f);
    }
    return f;
  };

  window.seek = (timeSeconds: number, opts?: RenderOptions) => {
    const f = clamp(
      Math.round(timeSeconds * FILM_CONFIG.fps),
      0,
      FILM_CONFIG.totalFrames - 1
    );
    return window.drawFrame!(f, opts);
  };
}
