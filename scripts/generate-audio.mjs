#!/usr/bin/env node
// Génère la piste sonore synchronisée de 45.0 secondes (48 kHz, stéréo 16-bit WAV)
// entièrement par synthèse mathématique locale, sans dépendance ni clé API.

import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 48000;
const DURATION = 45.0;
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);

const MELODY_NOTES = [
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
  // Scène 4 — Les enfants au jardin (15.0s..20.0s)
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
  [42.9, 698.46, 1.9],
];

const left = new Float32Array(TOTAL_SAMPLES);
const right = new Float32Array(TOTAL_SAMPLES);

function addPluck(startSec, freq, durSec, amp, pan = 0) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  const gainL = amp * (1 - Math.max(0, pan) * 0.4);
  const gainR = amp * (1 + Math.min(0, pan) * 0.4);

  for (let i = 0; i < len && startIdx + i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.018);
    const decay = Math.exp(-t * (3.2 / durSec));
    const env = attack * decay;
    const sig =
      0.68 * Math.sin(2 * Math.PI * freq * t) +
      0.22 * Math.sin(2 * Math.PI * freq * 2 * t) +
      0.1 * Math.sin(2 * Math.PI * freq * 3 * t);
    left[startIdx + i] += sig * env * gainL;
    right[startIdx + i] += sig * env * gainR;
  }
}

function addSoftClick(startSec, freq, amp) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(0.055 * SAMPLE_RATE);
  for (let i = 0; i < len && startIdx + i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 65);
    const f = freq * Math.exp(-t * 14);
    const s = Math.sin(2 * Math.PI * f * t) * env * amp;
    left[startIdx + i] += s;
    right[startIdx + i] += s;
  }
}

// 1. Ajout des notes de la mélodie et de leur basse douce
for (let idx = 0; idx < MELODY_NOTES.length; idx++) {
  const [t, f, d] = MELODY_NOTES[idx];
  const pan = ((idx % 3) - 1) * 0.25;
  addPluck(t, f, d * 1.15, 0.14, pan);
  addPluck(t, f * 0.5, d * 1.35, 0.08, -pan * 0.5);
}

// 2. Bruitages subtils synchronisés aux scènes :
// Cassage des 2 œufs (Scène 2 : f120=5.0s, f148=6.16s)
addSoftClick(5.0, 960, 0.12);
addSoftClick(6.16, 940, 0.12);

// Fouettage du gâteau (Scène 2 : 8.25s..10.3s)
for (let f = 198; f <= 248; f += 6) {
  addSoftClick(f / 24, 520 + (f % 12) * 18, 0.05);
}

// Pas de course joyeux des enfants (Scène 8 : 32.5s..35.2s)
for (let f = 780; f <= 845; f += 5) {
  addSoftClick(f / 24, 270 + (f % 10) * 14, 0.06);
}

// Balancement rythmique léger des pieds sous la chaise (Scène 9 : 36.8s..39.8s)
for (let f = 884; f <= 955; f += 11) {
  addSoftClick(f / 24, 340, 0.035);
}

// fondu de sortie sur la dernière seconde (44.0s..45.0s)
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  const fadeOut = t > 43.8 ? Math.max(0, (45.0 - t) / 1.2) : 1.0;
  left[i] = Math.max(-0.95, Math.min(0.95, left[i] * fadeOut));
  right[i] = Math.max(-0.95, Math.min(0.95, right[i] * fadeOut));
}

// Encodage de l'en-tête WAV RIFF 48 kHz 16-bit stéréo
const outPath = process.argv[2] || path.resolve('final/soundtrack.wav');
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const numChannels = 2;
const bytesPerSample = 2;
const dataSize = TOTAL_SAMPLES * numChannels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // PCM chunk size
buffer.writeUInt16LE(1, 20); // PCM = 1
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * numChannels * bytesPerSample, 28);
buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
buffer.writeUInt16LE(16, 34); // 16 bits
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const sL = Math.round(left[i] * 32767);
  const sR = Math.round(right[i] * 32767);
  buffer.writeInt16LE(sL, offset);
  buffer.writeInt16LE(sR, offset + 2);
  offset += 4;
}

fs.writeFileSync(outPath, buffer);
console.log(`[audio] Piste sonore WAV 48 kHz générée : ${outPath} (${DURATION}s)`);
