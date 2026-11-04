import {
  GROUND_CONTACT_Y,
  drawStreetBackground,
  drawStreetForeground,
} from './background';
import { CHARACTER_ANCHOR_X, drawGrandmotherColette } from './character';
import {
  ALL_CELS,
  CelSpecification,
  DURATION_SECONDS,
  FPS,
  TOTAL_CELS,
  TOTAL_FRAMES,
  WALK_CYCLE_12_POSES,
  getCelForFrame,
} from './exposureSheet';
import { drawPaperFinishOverlay, getPaperBackgroundCanvas } from './pen';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

export interface RenderFrameOptions {
  /** Affiche les pelures d'oignon (CEL précédent en bleu, CEL suivant en rouge + arcs de mouvement) */
  showOnionSkin?: boolean;
  /** Affiche les guides de la zone de sécurité 9:16 TikTok / Instagram Reels */
  showSafeZones?: boolean;
  /** Dessine uniquement Grand-mère Colette sur papier aquarelle (pour planches de poses clés/breakdowns) */
  characterOnly?: boolean;
}

declare global {
  interface Window {
    drawFrame?: (frameIndex: number, opts?: RenderFrameOptions) => CelSpecification;
    seek?: (timeSeconds: number, opts?: RenderFrameOptions) => CelSpecification;
    __anim?: {
      fps: number;
      totalFrames: number;
      totalCels: number;
      duration: number;
      width: number;
      height: number;
      ready: boolean;
      currentFrame: number;
    };
  }
}

/**
 * Fonction maîtresse déterministe : dessine exactement la frame `frameIndex` (0..143)
 * sur le contexte Canvas 2D fourni (1080x1920).
 */
export function renderAnimationFrame(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  options: RenderFrameOptions = {}
): CelSpecification {
  const clampedFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameIndex)));
  const cel = getCelForFrame(clampedFrame);

  // Réinitialisation déterministe complète de l'état Canvas 2D
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 1. Décor multi-plans (ou papier vierge en mode inspection de pose)
  if (options.characterOnly) {
    const paper = getPaperBackgroundCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(paper, 0, 0);
    // Ligne de sol de référence
    ctx.strokeStyle = 'rgba(107, 83, 71, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, GROUND_CONTACT_Y);
    ctx.lineTo(CANVAS_WIDTH - 140, GROUND_CONTACT_Y);
    ctx.stroke();
  } else {
    drawStreetBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, cel);
  }

  // 2. Mode Onion Skin (superposition du dessin précédent en bleu et suivant en rouge + arcs)
  if (options.showOnionSkin) {
    const prevCelIdx = (cel.celNumber - 2 + TOTAL_CELS) % TOTAL_CELS;
    const nextCelIdx = cel.celNumber % TOTAL_CELS;
    const prevCel = ALL_CELS[prevCelIdx];
    const nextCel = ALL_CELS[nextCelIdx];

    drawGrandmotherColette(ctx, prevCel, {
      anchorX: CHARACTER_ANCHOR_X - 14,
      onionTint: '#2563EB',
      onionAlpha: 0.32,
    });
    drawGrandmotherColette(ctx, nextCel, {
      anchorX: CHARACTER_ANCHOR_X + 14,
      onionTint: '#DC2626',
      onionAlpha: 0.32,
    });
    drawKinematicMotionArcs(ctx, cel);
  }

  // 3. Dessin principal de Grand-mère Colette
  drawGrandmotherColette(ctx, cel);

  // 4. Premier plan (lavandes, pétales flottants, papillon doré)
  if (!options.characterOnly) {
    drawStreetForeground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, cel);
  }

  // 5. Finition grain de papier torchon et vignettage livre jeunesse
  drawPaperFinishOverlay(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 6. Guides optionnels de Zone de Sécurité 9:16 (TikTok / Instagram Reels)
  if (options.showSafeZones) {
    drawSafeZoneOverlay(ctx, clampedFrame, cel);
  }

  ctx.restore();
  return cel;
}

/**
 * Trace les courbes d'arcs cinématiques (bassin, pied gauche, pied droit, embout de canne)
 * lorsque le mode Onion Skin est actif.
 */
function drawKinematicMotionArcs(
  ctx: CanvasRenderingContext2D,
  currentCel: CelSpecification
): void {
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);

  // Arc du bassin
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) {
    const ph = WALK_CYCLE_12_POSES[i % 12];
    const x = CHARACTER_ANCHOR_X - 66 + i * 11;
    const y = GROUND_CONTACT_Y - 315 + ph.pelvisDy;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Arc de la cheville gauche
  ctx.strokeStyle = 'rgba(37, 99, 235, 0.75)';
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const ph = WALK_CYCLE_12_POSES[i];
    const x = CHARACTER_ANCHOR_X + ph.leftFoot.dx;
    const y = GROUND_CONTACT_Y + ph.leftFoot.liftY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Points de contact actuels
  ctx.setLineDash([]);
  const p = currentCel.pose;
  const markers = [
    { x: CHARACTER_ANCHOR_X + p.leftFoot.dx, y: GROUND_CONTACT_Y + p.leftFoot.liftY, col: '#2563EB', label: 'Pied G' },
    { x: CHARACTER_ANCHOR_X + p.rightFoot.dx, y: GROUND_CONTACT_Y + p.rightFoot.liftY, col: '#D97706', label: 'Pied D' },
    { x: CHARACTER_ANCHOR_X + p.caneTipDx, y: GROUND_CONTACT_Y + p.caneTipLiftY, col: '#059669', label: 'Canne' },
  ];
  for (const m of markers) {
    ctx.fillStyle = m.col;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Affiche la zone de sécurité TikTok / Instagram Reels (9:16) et le cartouche technique du dessin.
 */
function drawSafeZoneOverlay(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  cel: CelSpecification
): void {
  ctx.save();
  // Zone exclue par les interfaces sociales (haut 220px, bas 360px, droite 140px, gauche 80px)
  ctx.fillStyle = 'rgba(20, 16, 12, 0.22)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 220);
  ctx.fillRect(0, 1560, CANVAS_WIDTH, 360);
  ctx.fillRect(0, 220, 80, 1340);
  ctx.fillRect(940, 220, 140, 1340);

  // Cadre de la zone de sécurité
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(80, 220, 860, 1340);

  // Cartouche d'information en haut de la zone sûre
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(42, 31, 24, 0.84)';
  ctx.fillRect(100, 240, 820, 96);
  ctx.fillStyle = '#FDE68A';
  ctx.font = 'bold 26px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(
    `FRAME ${String(frameIndex).padStart(3, '0')}/143 | ${cel.celId} (${cel.role}) | ${(frameIndex / FPS).toFixed(2)}s`,
    122,
    280
  );
  ctx.fillStyle = '#FAF3E6';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(`${cel.phaseName} — Zone sûre TikTok/Reels (80..940 × 220..1560)`, 122, 316);
  ctx.restore();
}

/**
 * Synthétiseur Web Audio temps réel discret pour accompagner la prévisualisation en direct dans le navigateur.
 */
export class LiveSoundtrackSynthesizer {
  private ctx: AudioContext | null = null;
  private lastTriggeredCel: number = -1;
  public enabled: boolean = false;

  public toggle(enable?: boolean): boolean {
    this.enabled = enable ?? !this.enabled;
    if (this.enabled && !this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.enabled) {
      this.ctx.resume();
    }
    return this.enabled;
  }

  public onFrame(frameIndex: number): void {
    if (!this.enabled || !this.ctx) return;
    const cel = getCelForFrame(frameIndex);
    if (cel.celNumber === this.lastTriggeredCel) return;
    this.lastTriggeredCel = cel.celNumber;

    const now = this.ctx.currentTime;

    // Contact pied gauche + appui boisé de la canne
    if (cel.phaseIndex === 0) {
      this.playSoftFootstep(now, 125);
      this.playWoodCaneTap(now + 0.03);
    }
    // Contact pied droit
    if (cel.phaseIndex === 6) {
      this.playSoftFootstep(now, 142);
    }
    // Petites notes douces de boîte à musique acoustique / oiseaux du matin
    if (cel.celNumber === 11 || cel.celNumber === 31 || cel.celNumber === 59 || cel.celNumber === 67) {
      const freqMap: Record<number, number> = { 11: 523.25, 31: 659.25, 59: 587.33, 67: 523.25 };
      this.playGentleChime(now, freqMap[cel.celNumber] ?? 523.25);
    }
  }

  private playSoftFootstep(time: number, freq: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.075);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.07, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.085);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private playWoodCaneTap(time: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, time);
    osc.frequency.exponentialRampToValueAtTime(190, time + 0.035);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.045, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.045);
  }

  private playGentleChime(time: number, freq: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.035, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);
  }
}

/**
 * Expose globalement `window.drawFrame(frameIndex)`, `window.seek(t)` et `window.__anim`
 * sur l'index.html racine afin que Chromium headless (Playwright) puisse piloter
 * et capturer chaque frame de manière 100 % déterministe.
 */
export function attachGlobalAnimationAPI(
  canvas: HTMLCanvasElement,
  onExternalFrameChange?: (frameIndex: number, cel: CelSpecification) => void,
  getOptions?: () => RenderFrameOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  window.__anim = {
    fps: FPS,
    totalFrames: TOTAL_FRAMES,
    totalCels: TOTAL_CELS,
    duration: DURATION_SECONDS,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    ready: true,
    currentFrame: 0,
  };

  window.drawFrame = (frameIndex: number, overrideOpts?: RenderFrameOptions) => {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameIndex)));
    const opts = overrideOpts ?? (getOptions ? getOptions() : {});
    const cel = renderAnimationFrame(ctx, clamped, opts);
    if (window.__anim) {
      window.__anim.currentFrame = clamped;
    }
    if (onExternalFrameChange) {
      onExternalFrameChange(clamped, cel);
    }
    return cel;
  };

  window.seek = (timeSeconds: number, overrideOpts?: RenderFrameOptions) => {
    const targetFrame = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(timeSeconds * FPS + 1e-6))
    );
    return window.drawFrame!(targetFrame, overrideOpts);
  };
}
