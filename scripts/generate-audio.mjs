#!/usr/bin/env node
/**
 * Génère de manière 100 % locale et déterministe :
 * 1. La piste sonore stéréo 48 kHz (build/audio/soundtrack.wav, 6,00 secondes)
 *    synchronisée avec les contacts des pieds, la canne en bois, les oiseaux et la brise.
 * 2. Le fichier JSON complet de la feuille d'exposition (art/exposure_sheet.json).
 */

import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 48000;
const DURATION_SEC = 6.0;
const FPS = 24;
const TOTAL_FRAMES = 144;
const TOTAL_CELS = 72;
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSoundtrackWav(outputPath) {
  const left = new Float32Array(NUM_SAMPLES);
  const right = new Float32Array(NUM_SAMPLES);
  const rng = mulberry32(20260501);

  // 1. Ambiance matinale très douce (brise légère filtrée dans les glycines)
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const breezeEnv = 0.0045 * (0.7 + 0.3 * Math.sin(t * Math.PI * 0.65));
    const whiteL = (rng() * 2 - 1) * breezeEnv;
    const whiteR = (rng() * 2 - 1) * breezeEnv;
    lpL = lpL * 0.985 + whiteL * 0.015;
    lpR = lpR * 0.985 + whiteR * 0.015;
    left[i] += lpL;
    right[i] += lpR;
  }

  // Helper : ajoute un pas feutré sur pavé à un numéro de frame exact
  const addFootstep = (frameIdx, baseFreq, pan) => {
    const startSample = Math.floor((frameIdx / FPS) * SAMPLE_RATE);
    const durSamples = Math.floor(0.095 * SAMPLE_RATE);
    for (let k = 0; k < durSamples && startSample + k < NUM_SAMPLES; k++) {
      const dt = k / SAMPLE_RATE;
      const env = Math.sin(Math.min(1, dt / 0.012) * (Math.PI / 2)) * Math.exp(-dt * 42);
      const freq = baseFreq * Math.exp(-dt * 18) + 42;
      const thump = Math.sin(2 * Math.PI * freq * dt) * 0.085;
      const scuff = (rng() * 2 - 1) * Math.exp(-dt * 65) * 0.025;
      const sig = (thump + scuff) * env;
      left[startSample + k] += sig * (0.5 - pan * 0.25);
      right[startSample + k] += sig * (0.5 + pan * 0.25);
    }
  };

  // Helper : ajoute le petit "toc" boisé chaleureux de la canne en noyer
  const addCaneTap = (frameIdx) => {
    const startSample = Math.floor(((frameIdx + 0.4) / FPS) * SAMPLE_RATE);
    const durSamples = Math.floor(0.055 * SAMPLE_RATE);
    for (let k = 0; k < durSamples && startSample + k < NUM_SAMPLES; k++) {
      const dt = k / SAMPLE_RATE;
      const env = Math.exp(-dt * 85);
      const wood =
        (Math.sin(2 * Math.PI * 390 * dt) * 0.65 +
          Math.sin(2 * Math.PI * 760 * dt) * 0.35) *
        0.055 *
        env;
      left[startSample + k] += wood * 0.42;
      right[startSample + k] += wood * 0.58;
    }
  };

  // Helper : ajoute un chant d'oiseau matinal discret au loin
  const addBirdChirp = (timeSec, fStart, fEnd, pan) => {
    const startSample = Math.floor(timeSec * SAMPLE_RATE);
    const durSamples = Math.floor(0.18 * SAMPLE_RATE);
    let phase = 0;
    for (let k = 0; k < durSamples && startSample + k < NUM_SAMPLES; k++) {
      const u = k / durSamples;
      const env = Math.sin(u * Math.PI) * 0.022;
      const freq = fStart + (fEnd - fStart) * Math.sin(u * Math.PI * 1.5);
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const sig = Math.sin(phase) * env;
      left[startSample + k] += sig * (0.5 - pan * 0.35);
      right[startSample + k] += sig * (0.5 + pan * 0.35);
    }
  };

  // Helper : ajoute une note acoustique douce de boîte à musique / harpe celtique
  const addAcousticNote = (timeSec, freq, durSec, amp = 0.032) => {
    const startSample = Math.floor(timeSec * SAMPLE_RATE);
    const durSamples = Math.floor(durSec * SAMPLE_RATE);
    for (let k = 0; k < durSamples && startSample + k < NUM_SAMPLES; k++) {
      const dt = k / SAMPLE_RATE;
      const attack = Math.min(1, dt / 0.025);
      const decay = Math.exp(-dt * 2.4);
      const env = attack * decay * amp;
      const sig =
        (Math.sin(2 * Math.PI * freq * dt) * 0.75 +
          Math.sin(2 * Math.PI * freq * 2 * dt) * 0.2 +
          Math.sin(2 * Math.PI * freq * 3 * dt) * 0.05) *
        env;
      left[startSample + k] += sig * 0.52;
      right[startSample + k] += sig * 0.48;
    }
  };

  // 2. Synchronisation exacte des 12 pas (6 cycles de marche sur 144 frames)
  for (let cycle = 0; cycle < 6; cycle++) {
    const leftContactFrame = cycle * 24; // phaseIndex 0 (CEL 1, 13, 25, 37, 49, 61)
    const rightContactFrame = cycle * 24 + 12; // phaseIndex 6 (CEL 7, 19, 31, 43, 55, 67)
    addFootstep(leftContactFrame, 118, -0.2);
    addCaneTap(leftContactFrame);
    addFootstep(rightContactFrame, 132, 0.2);
  }

  // 3. Chants d'oiseaux discrets du matin
  addBirdChirp(0.85, 1760, 2240, -0.4);
  addBirdChirp(1.06, 2120, 1840, -0.4);
  addBirdChirp(2.62, 1920, 2480, 0.35); // Réponse joyeuse lors du salut au chat roux
  addBirdChirp(4.85, 1680, 2100, -0.25);

  // 4. Mélodie acoustique très douce ponctuant les 3 actes
  const melody = [
    [0.05, 523.25, 1.1], // Do5
    [1.0, 659.25, 1.1],  // Mi5
    [2.0, 783.99, 1.2],  // Sol5 (Début Acte II : Regard vers le chat)
    [2.5, 880.0, 1.3],   // La5 (Salut de la main)
    [3.5, 783.99, 1.1],  // Sol5
    [4.25, 659.25, 1.3], // Mi5 (Acte III : Parfum de lavande)
    [5.0, 587.33, 1.0],  // Ré5
    [5.5, 523.25, 0.9],  // Do5 (Résolution paisible)
  ];
  for (const [t, f, d] of melody) {
    addAcousticNote(t, f, d, 0.028);
  }

  // 5. Fondu d'entrée (80 ms) et de sortie (180 ms) pour éviter tout clic audio
  const fadeInSamples = Math.floor(0.08 * SAMPLE_RATE);
  const fadeOutSamples = Math.floor(0.18 * SAMPLE_RATE);
  for (let i = 0; i < fadeInSamples; i++) {
    const g = i / fadeInSamples;
    left[i] *= g;
    right[i] *= g;
  }
  for (let i = 0; i < fadeOutSamples; i++) {
    const idx = NUM_SAMPLES - 1 - i;
    const g = i / fadeOutSamples;
    left[idx] *= g;
    right[idx] *= g;
  }

  // Encodage RIFF WAVE PCM 16-bit Stéréo 48000 Hz
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = NUM_SAMPLES * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20);  // PCM format = 1
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16 bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const sL = Math.max(-0.95, Math.min(0.95, left[i]));
    const sR = Math.max(-0.95, Math.min(0.95, right[i]));
    buffer.writeInt16LE(Math.round(sL * 32767), offset);
    buffer.writeInt16LE(Math.round(sR * 32767), offset + 2);
    offset += 4;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`[Audio] Piste sonore stéréo 48 kHz générée : ${outputPath} (${(buffer.length / 1024).toFixed(1)} Ko)`);
}

function generateExposureSheetJson(jsonOutputPath) {
  const phaseNames = [
    { role: 'KEY', name: 'Contact Gauche (Clé)', dy: 0 },
    { role: 'INB', name: 'Amorti Gauche (Intervalle)', dy: 7 },
    { role: 'BRK', name: 'Pose Basse Gauche (Breakdown Down)', dy: 11 },
    { role: 'BRK', name: 'Passage Jambe Droite (Breakdown Passing)', dy: 2 },
    { role: 'BRK', name: 'Pose Haute Gauche (Breakdown Up)', dy: -8 },
    { role: 'INB', name: 'Approche Contact Droit (Intervalle)', dy: -3 },
    { role: 'KEY', name: 'Contact Droit (Clé)', dy: 0 },
    { role: 'INB', name: 'Amorti Droit (Intervalle)', dy: 7 },
    { role: 'BRK', name: 'Pose Basse Droite (Breakdown Down)', dy: 11 },
    { role: 'BRK', name: 'Passage Jambe Gauche (Breakdown Passing)', dy: 2 },
    { role: 'BRK', name: 'Pose Haute Droite (Breakdown Up)', dy: -8 },
    { role: 'INB', name: 'Approche Contact Gauche (Intervalle)', dy: -3 },
  ];

  const cels = [];
  for (let c = 0; c < TOTAL_CELS; c++) {
    const celNumber = c + 1;
    const celId = `CEL_${String(celNumber).padStart(3, '0')}`;
    const startFrame = c * 2;
    const endFrame = startFrame + 1;
    const ph = phaseNames[c % 12];
    const act = c < 24 ? 1 : c < 48 ? 2 : 3;

    cels.push({
      celNumber,
      celId,
      startFrame,
      endFrame,
      durationFrames: 2,
      timeStartSec: Number((startFrame / FPS).toFixed(3)),
      timeEndSec: Number(((endFrame + 1) / FPS).toFixed(3)),
      act,
      cycleNumber: Math.floor(c / 12) + 1,
      phaseIndex: c % 12,
      role: ph.role,
      phaseName: ph.name,
      pelvisDy: ph.dy,
      groundScrollPx: c * 13.5,
    });
  }

  const payload = {
    title: 'La Promenade de Grand-mère Colette',
    format: '9:16 vertical',
    width: 1080,
    height: 1920,
    fps: FPS,
    totalFrames: TOTAL_FRAMES,
    totalUniqueCels: TOTAL_CELS,
    exposureCadence: 'on twos (12 unique drawings/sec, 2 frames per cel)',
    durationSeconds: DURATION_SEC,
    cels,
  };

  fs.mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
  fs.writeFileSync(jsonOutputPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`[X-Sheet] Feuille d'exposition JSON enregistrée : ${jsonOutputPath}`);
}

const wavOut = process.argv[2] || path.resolve('build/audio/soundtrack.wav');
const jsonOut = path.resolve('art/exposure_sheet.json');

generateSoundtrackWav(wavOut);
generateExposureSheetJson(jsonOut);
