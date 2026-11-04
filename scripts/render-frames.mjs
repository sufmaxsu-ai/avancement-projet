#!/usr/bin/env node
/**
 * Pipeline de rendu image par image (JavaScript -> Chromium Headless via Playwright)
 * Ouvre l'index.html racine (via le serveur Vite), appelle window.drawFrame(frameIndex)
 * pour chaque frame 0..143 et enregistre chaque image individuellement en PNG 1080x1920.
 * Génère également les dessins isolés des Poses Clés, Breakdowns et Intervalles dans art/poses/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const url = process.env.RENDER_URL || process.argv[2] || 'http://127.0.0.1:5173/?render=1';
const outDir = path.resolve(process.argv[3] || 'build/frames');
const posesDir = path.resolve('art/poses');

function findSystemChromium() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ].filter(Boolean);

  for (const bin of candidates) {
    if (fs.existsSync(bin)) {
      return bin;
    }
  }
  return undefined;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(posesDir, { recursive: true });

  const executablePath = findSystemChromium();
  console.log(`[Render] Lancement de Chromium headless (${executablePath || 'Playwright bundled'})...`);
  console.log(`[Render] Ouverture de la source : ${url}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(
      () =>
        typeof window.drawFrame === 'function' &&
        typeof window.seek === 'function' &&
        window.__anim &&
        window.__anim.ready === true,
      { timeout: 15000 }
    );

    const animMeta = await page.evaluate(() => window.__anim);
    const totalFrames = animMeta.totalFrames || 144;
    console.log(
      `[Render] Moteur prêt : ${totalFrames} frames (${animMeta.totalCels} dessins uniques @ ${animMeta.fps} fps, ${animMeta.width}x${animMeta.height})`
    );

    // 1. Vérification du déterminisme : même frame appelée deux fois = octets strictement identiques
    const detCheck = await page.evaluate(() => {
      const c = document.getElementById('animation-canvas');
      window.drawFrame(56, { showOnionSkin: false, showSafeZones: false, characterOnly: false });
      const d1 = c.toDataURL('image/png');
      window.drawFrame(12, { showOnionSkin: false, showSafeZones: false, characterOnly: false });
      window.drawFrame(56, { showOnionSkin: false, showSafeZones: false, characterOnly: false });
      const d2 = c.toDataURL('image/png');
      return d1 === d2;
    });
    if (!detCheck) {
      throw new Error('Échec du test de déterminisme sur window.drawFrame(56) !');
    }
    console.log('[Render] Test de déterminisme strict (accès aléatoire seek/drawFrame) : OK');

    // 2. Capture individuelle des 144 frames du film (00000.png .. 00143.png)
    const startTime = Date.now();
    for (let f = 0; f < totalFrames; f++) {
      const dataUrl = await page.evaluate((frameIdx) => {
        window.drawFrame(frameIdx, {
          showOnionSkin: false,
          showSafeZones: false,
          characterOnly: false,
        });
        const canvas = document.getElementById('animation-canvas');
        return canvas.toDataURL('image/png');
      }, f);

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const frameFilename = `${String(f).padStart(5, '0')}.png`;
      fs.writeFileSync(path.join(outDir, frameFilename), Buffer.from(base64Data, 'base64'));

      if (f % 24 === 0 || f === totalFrames - 1) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `[Render] Frame ${String(f).padStart(3, '0')}/${totalFrames - 1} -> ${frameFilename} (${elapsed}s)`
        );
      }
    }

    // 3. Export des 12 dessins du cycle de marche (Poses Clés KEY, Breakdowns BRK, Intervalles INB)
    //    et des poses d'expression (Acte II Salut au chat, Acte III Parfum de lavande) dans art/poses/
    const poseStudies = [
      { frame: 0, name: 'pose_01_CEL001_KEY_contact_gauche.png', opts: { characterOnly: true } },
      { frame: 2, name: 'pose_02_CEL002_INB_amorti_gauche.png', opts: { characterOnly: true } },
      { frame: 4, name: 'pose_03_CEL003_BRK_down_gauche.png', opts: { characterOnly: true } },
      { frame: 6, name: 'pose_04_CEL004_BRK_passage_droit.png', opts: { characterOnly: true } },
      { frame: 8, name: 'pose_05_CEL005_BRK_up_gauche.png', opts: { characterOnly: true } },
      { frame: 10, name: 'pose_06_CEL006_INB_approche_contact_droit.png', opts: { characterOnly: true } },
      { frame: 12, name: 'pose_07_CEL007_KEY_contact_droit.png', opts: { characterOnly: true } },
      { frame: 14, name: 'pose_08_CEL008_INB_amorti_droit.png', opts: { characterOnly: true } },
      { frame: 16, name: 'pose_09_CEL009_BRK_down_droit.png', opts: { characterOnly: true } },
      { frame: 18, name: 'pose_10_CEL010_BRK_passage_gauche.png', opts: { characterOnly: true } },
      { frame: 20, name: 'pose_11_CEL011_BRK_up_droit.png', opts: { characterOnly: true } },
      { frame: 22, name: 'pose_12_CEL012_INB_approche_contact_gauche.png', opts: { characterOnly: true } },
      { frame: 56, name: 'pose_13_CEL029_ACTE2_salut_chat_roux.png', opts: { characterOnly: true } },
      { frame: 106, name: 'pose_14_CEL054_ACTE3_parfum_lavande.png', opts: { characterOnly: true } },
      { frame: 6, name: 'study_15_onion_skin_arcs.png', opts: { characterOnly: true, showOnionSkin: true } },
      { frame: 56, name: 'study_16_safe_zone_9x16.png', opts: { showSafeZones: true } },
    ];

    for (const study of poseStudies) {
      const dataUrl = await page.evaluate(
        ({ f, o }) => {
          window.drawFrame(f, o);
          const canvas = document.getElementById('animation-canvas');
          return canvas.toDataURL('image/png');
        },
        { f: study.frame, o: study.opts }
      );
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(path.join(posesDir, study.name), Buffer.from(base64Data, 'base64'));
    }
    console.log(`[Render] ${poseStudies.length} planches de poses clés, breakdowns et études exportées dans ${posesDir}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[Render] Erreur fatale :', err);
  process.exit(1);
});
