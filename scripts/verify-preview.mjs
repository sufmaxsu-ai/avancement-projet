#!/usr/bin/env node
// Teste automatiquement la prévisualisation live dans le navigateur (Playwright + Chromium)
// ainsi que les boutons de contrôle, la zone de sécurité 9:16 et le téléchargement du MP4.

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:4188/';

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];
page.on('pageerror', (err) => errors.push(err.message));

await page.goto(url, { waitUntil: 'networkidle' });
console.log('[preview-test] Titre de la page :', await page.title());

const canvasInfo = await page.evaluate(() => {
  const c = document.getElementById('film-canvas');
  return {
    width: c?.width,
    height: c?.height,
    hasDrawFrame: typeof window.drawFrame === 'function',
    hasSeek: typeof window.seek === 'function',
  };
});
console.log('[preview-test] Contrat Canvas & API :', canvasInfo);

// Test d'interaction : accès direct à la Scène 9 (Pieds qui balancent sous la table)
await page.getByText('Pieds qui balancent sous la table (Scène 9)').click();
await page.waitForTimeout(250);

// Activation de la superposition Zone sûre 9:16
await page.getByText('Zone sûre 9:16').click();
await page.waitForTimeout(250);

await page.screenshot({ path: 'docs/qa/live_browser_studio_preview.jpg', quality: 90 });

// Vérification HTTP du fichier MP4 servi à côté de index.html
const mp4Url = new URL('./animation.mp4', url).toString();
const mp4Resp = await page.request.head(mp4Url);
console.log(
  '[preview-test] ./animation.mp4 HTTP status :',
  mp4Resp.status(),
  '| Taille :',
  mp4Resp.headers()['content-length'],
  'octets'
);

await browser.close();

if (
  errors.length > 0 ||
  mp4Resp.status() !== 200 ||
  canvasInfo.width !== 1080 ||
  canvasInfo.height !== 1920 ||
  !canvasInfo.hasDrawFrame
) {
  console.error('[preview-test] ÉCHEC :', { errors, canvasInfo, status: mp4Resp.status() });
  process.exit(1);
}

console.log('[preview-test] SUCCÈS : Prévisualisation live, contrôles et téléchargement MP4 validés.');
