#!/usr/bin/env node
// Capture déterministe image par image via Chromium headless (Playwright)
// Ouvre l'index.html racine (?export=1), appelle window.drawFrame(frame) pour chaque frame 0..1079,
// sauvegarde chaque image numérotée dans l'ordre et extrait les poses clés dans docs/keyframes/.

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const serverUrl = args[0] || 'http://127.0.0.1:4173/?export=1';
const outDir = path.resolve(args[1] || 'frames_raw_tmp');
const ext = (args[2] || 'jpg').replace(/^\./, '').toLowerCase();
const concurrency = Math.max(1, Number(process.env.RENDER_WORKERS || 8));

const TOTAL_FRAMES = 1080;
const WIDTH = 1080;
const HEIGHT = 1920;

// Poses clés et intermédiaires représentatives des 10 scènes conservées dans docs/keyframes/
const ARCHIVE_KEYFRAMES = [
  { frame: 12, slug: 'scene01_tablier' },
  { frame: 44, slug: 'scene01_manches_retroussees' },
  { frame: 98, slug: 'scene01_saladier_pose' },
  { frame: 126, slug: 'scene02_oeuf_casse' },
  { frame: 176, slug: 'scene02_farine_et_traces' },
  { frame: 226, slug: 'scene02_fouet_et_pate' },
  { frame: 270, slug: 'scene03_pate_coule_moule' },
  { frame: 332, slug: 'scene03_enfournement' },
  { frame: 390, slug: 'scene04_jardin_ballon' },
  { frame: 430, slug: 'scene04_jardin_saut_clara' },
  { frame: 516, slug: 'scene05_sortie_four_vapeur' },
  { frame: 562, slug: 'scene05_gateau_dore_table' },
  { frame: 604, slug: 'scene06_sucre_glace_progressif' },
  { frame: 662, slug: 'scene06_fraises_ajustees' },
  { frame: 712, slug: 'scene07_appel_mamie_texte' },
  { frame: 766, slug: 'scene08_enfants_entendent' },
  { frame: 804, slug: 'scene08_course_jardin' },
  { frame: 842, slug: 'scene08_entree_cuisine' },
  { frame: 904, slug: 'scene09_pieds_balancent_A' },
  { frame: 916, slug: 'scene09_pieds_balancent_B' },
  { frame: 974, slug: 'scene10_decoupe_couteau' },
  { frame: 1006, slug: 'scene10_service_clara' },
  { frame: 1038, slug: 'scene10_service_leo' },
  { frame: 1068, slug: 'scene10_tableau_final_famille' },
];

function findChromiumExecutable() {
  const candidates = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const keyframesDir = path.resolve('docs/keyframes');
  fs.mkdirSync(keyframesDir, { recursive: true });

  const execPath = findChromiumExecutable();
  console.log(
    `[render] Lancement de Chromium headless (${execPath || 'playwright default'}) avec ${concurrency} workers...`
  );
  console.log(`[render] URL source : ${serverUrl}`);
  console.log(`[render] Dossier frames : ${outDir} (${TOTAL_FRAMES} frames, ${WIDTH}x${HEIGHT}, format: ${ext})`);

  const browser = await chromium.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  let completed = 0;
  const startTime = Date.now();

  const renderRange = async (workerId, startFrame, endFrame) => {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(serverUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // Vérifie que l'API déterministe window.drawFrame est bien exposée
    await page.waitForFunction(
      () => typeof window.drawFrame === 'function' && !!document.getElementById('film-canvas'),
      { timeout: 15000 }
    );

    for (let f = startFrame; f <= endFrame; f++) {
      const dataUrl = await page.evaluate(
        ({ frameIdx, mimeType }) => {
          window.drawFrame(frameIdx, { showSafeZone: false, showOnionSkin: false });
          const canvas = document.getElementById('film-canvas');
          return canvas.toDataURL(mimeType, 0.95);
        },
        { frameIdx: f, mimeType: mime }
      );

      const base64Data = dataUrl.split(',')[1];
      const buf = Buffer.from(base64Data, 'base64');
      const fileName = `${String(f).padStart(5, '0')}.${ext}`;
      const filePath = path.join(outDir, fileName);
      fs.writeFileSync(filePath, buf);

      // Si cette frame fait partie des poses clés archivées dans docs/keyframes/
      const keyHit = ARCHIVE_KEYFRAMES.find((k) => k.frame === f);
      if (keyHit) {
        const jpgDataUrl =
          mime === 'image/jpeg'
            ? dataUrl
            : await page.evaluate((frameIdx) => {
                window.drawFrame(frameIdx, { showSafeZone: false, showOnionSkin: false });
                return document.getElementById('film-canvas').toDataURL('image/jpeg', 0.94);
              }, f);
        fs.writeFileSync(
          path.join(keyframesDir, `${String(f).padStart(4, '0')}_${keyHit.slug}.jpg`),
          Buffer.from(jpgDataUrl.split(',')[1], 'base64')
        );
      }

      completed++;
      if (completed % 120 === 0 || completed === TOTAL_FRAMES) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `[render] Progression : ${completed}/${TOTAL_FRAMES} frames rendues (${elapsed}s)`
        );
      }
    }

    await context.close();
  };

  const chunkSize = Math.ceil(TOTAL_FRAMES / concurrency);
  const promises = [];
  for (let w = 0; w < concurrency; w++) {
    const s = w * chunkSize;
    const e = Math.min(TOTAL_FRAMES - 1, (w + 1) * chunkSize - 1);
    if (s <= e) {
      promises.push(renderRange(w, s, e));
    }
  }

  await Promise.all(promises);
  await browser.close();

  // Vérification stricte que les 1080 frames existent et sont non vides
  let verified = 0;
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const p = path.join(outDir, `${String(f).padStart(5, '0')}.${ext}`);
    if (!fs.existsSync(p) || fs.statSync(p).size < 1000) {
      throw new Error(`Frame manquante ou invalide : ${p}`);
    }
    verified++;
  }

  console.log(`[render] Succès : ${verified}/${TOTAL_FRAMES} frames vérifiées dans ${outDir}`);
}

main().catch((err) => {
  console.error('[render] ERREUR :', err);
  process.exit(1);
});
