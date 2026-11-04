// Bande-son procédurale nostalgique et bruitages synchronisés (Web Audio API locale, 48 kHz)

import { FILM_CONFIG } from './config';

// Gamme pentatonique / majeure chaleureuse en Fa majeur / Ré mineur doux (esprit boîte à musique / guitare acoustique)
const MELODY_NOTES: [number, number, number][] = [
  // [timeSec, freqHz, durationSec]
  // Scène 1 — Préparation (0.0s..4.5s)
  [0.2, 349.23, 0.9],
  [1.0, 440.0, 0.8],
  [1.8, 523.25, 1.1],
  [2.8, 440.0, 0.8],
  [3.6, 392.0, 0.9],
  // Scène 2 — La pâte (4.5s..10.5s)
  [4.6, 349.23, 0.7],
  [5.3, 440.0, 0.7],
  [6.0, 523.25, 0.8],
  [6.8, 587.33, 0.9],
  [7.7, 523.25, 0.7],
  [8.4, 440.0, 0.7],
  [9.1, 392.0, 0.7],
  [9.8, 440.0, 0.8],
  // Scène 3 — Cuisson (10.5s..15.0s)
  [10.6, 349.23, 0.9],
  [11.5, 523.25, 0.9],
  [12.4, 440.0, 0.9],
  [13.4, 392.0, 1.2],
  // Scène 4 — Les enfants au jardin (15.0s..20.0s) — Rythme plus sautillant et joyeux
  [15.1, 523.25, 0.5],
  [15.6, 587.33, 0.5],
  [16.1, 659.25, 0.7],
  [16.8, 523.25, 0.5],
  [17.3, 698.46, 0.7],
  [18.0, 659.25, 0.6],
  [18.6, 587.33, 0.6],
  [19.2, 523.25, 0.8],
  // Scène 5 — Sortie du four (20.0s..24.0s)
  [20.2, 440.0, 0.9],
  [21.1, 523.25, 0.9],
  [22.0, 698.46, 1.1],
  [23.1, 587.33, 0.9],
  // Scène 6 — Décoration (24.0s..28.0s)
  [24.1, 523.25, 0.7],
  [24.9, 659.25, 0.7],
  [25.7, 698.46, 0.7],
  [26.5, 587.33, 0.7],
  [27.2, 523.25, 0.8],
  // Scène 7 — L'appel de Mamie (28.0s..31.5s)
  [28.2, 523.25, 0.6],
  [28.8, 659.25, 0.6],
  [29.4, 783.99, 1.0],
  [30.5, 698.46, 0.9],
  // Scène 8 — La course (31.5s..35.5s)
  [31.6, 587.33, 0.45],
  [32.1, 659.25, 0.45],
  [32.6, 698.46, 0.45],
  [33.1, 783.99, 0.5],
  [33.7, 698.46, 0.5],
  [34.3, 659.25, 0.5],
  [34.9, 587.33, 0.6],
  // Scène 9 — Installation & Pieds qui balancent (35.5s..40.0s)
  [35.6, 523.25, 0.6],
  [36.2, 440.0, 0.6],
  [36.8, 523.25, 0.6],
  [37.4, 587.33, 0.6],
  [38.0, 523.25, 0.6],
  [38.6, 440.0, 0.6],
  [39.2, 523.25, 0.8],
  // Scène 10 — Le goûter & Tableau final (40.0s..45.0s)
  [40.1, 349.23, 0.9],
  [41.0, 440.0, 0.9],
  [41.9, 523.25, 1.0],
  [42.9, 698.46, 1.8],
];

export class LiveSoundtrackController {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private lastTriggeredFrame = -1;

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx({ sampleRate: 48000 });
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public onFrame(frame: number): void {
    if (this.isMuted || frame === this.lastTriggeredFrame) return;
    this.lastTriggeredFrame = frame;

    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    // Déclenche les notes de la mélodie qui tombent sur cette frame
    for (const [noteTime, freq, dur] of MELODY_NOTES) {
      const noteFrame = Math.round(noteTime * FILM_CONFIG.fps);
      if (noteFrame === frame) {
        this.playWarmPluck(ctx, freq, dur, 0.08);
        this.playWarmPluck(ctx, freq * 0.5, dur * 1.15, 0.045);
      }
    }

    // Petits bruitages subtils synchronisés aux actions clés :
    // Cassage des œufs (frames 120 et 148)
    if (frame === 120 || frame === 148) {
      this.playTapClick(ctx, 920, 0.05);
    }
    // Fouettage (frames 198..248 toutes les 6 frames)
    if (frame >= 198 && frame <= 248 && frame % 6 === 0) {
      this.playTapClick(ctx, 520 + (frame % 12) * 20, 0.025);
    }
    // Pas de course joyeux des enfants (Scène 8 : frames 780..845 toutes les 5 frames)
    if (frame >= 780 && frame <= 845 && frame % 5 === 0) {
      this.playTapClick(ctx, 280 + (frame % 10) * 15, 0.03);
    }
  }

  private playWarmPluck(ctx: AudioContext, freq: number, duration: number, gainPeak: number): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playTapClick(ctx: AudioContext, freq: number, gainPeak: number): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.045);

    gain.gain.setValueAtTime(gainPeak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }
}
