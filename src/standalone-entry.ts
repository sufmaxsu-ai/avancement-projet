import {
  EXPOSURE_SHEET,
  FILM_CONFIG,
  KEYFRAME_DOC_LIST,
  getPhaseForFrame,
} from './animation/config';
import {
  drawAnimationFrame,
  registerGlobalAnimationBindings,
} from './animation/renderer';

function initStandalonePreview(): void {
  const canvas = document.getElementById('animation-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const params = new URLSearchParams(window.location.search);
  const isHeadless = params.get('headless') === '1';

  let currentFrame = 0;
  let isPlaying = !isHeadless;
  let onionSkin = false;
  let showSafeZone = false;

  const scrubber = document.getElementById('timeline-scrubber') as HTMLInputElement | null;
  const timeDisplay = document.getElementById('time-display');
  const frameDisplay = document.getElementById('frame-display');
  const phaseTitleEl = document.getElementById('phase-title');
  const phaseSummaryEl = document.getElementById('phase-summary');
  const btnPlay = document.getElementById('btn-play');
  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  const btnRestart = document.getElementById('btn-restart');
  const btnPrev = document.getElementById('btn-prev-frame');
  const btnNext = document.getElementById('btn-next-frame');
  const chkOnion = document.getElementById('chk-onion') as HTMLInputElement | null;
  const chkSafe = document.getElementById('chk-safe') as HTMLInputElement | null;
  const keyframesContainer = document.getElementById('keyframes-list');

  if (isHeadless) {
    document.body.classList.add('headless-mode');
  }

  function updateUI(frameIdx: number): void {
    const f = Math.max(0, Math.min(FILM_CONFIG.totalFrames - 1, Math.floor(frameIdx)));
    if (scrubber) scrubber.value = String(f);
    if (timeDisplay) {
      timeDisplay.textContent = `${(f / FILM_CONFIG.fps).toFixed(2)} s / ${FILM_CONFIG.durationSeconds.toFixed(2)} s`;
    }
    if (frameDisplay) {
      frameDisplay.textContent = `Frame ${String(f + 1).padStart(3, '0')} / ${FILM_CONFIG.totalFrames}`;
    }
    const phase = getPhaseForFrame(f);
    if (phaseTitleEl) phaseTitleEl.textContent = phase.title;
    if (phaseSummaryEl) phaseSummaryEl.textContent = `${phase.summary} (${phase.details})`;
  }

  function renderFrameNow(frameIdx: number): number {
    currentFrame = drawAnimationFrame(ctx!, frameIdx, {
      onionSkin: isHeadless ? false : onionSkin,
      showSafeZone: isHeadless ? false : showSafeZone,
    });
    updateUI(currentFrame);
    return currentFrame;
  }

  registerGlobalAnimationBindings(canvas, (renderedIdx) => {
    currentFrame = renderedIdx;
    updateUI(currentFrame);
  });

  // Surcharge window.drawFrame pour inclure la mise à jour UI de preview.html
  window.drawFrame = (frameIdx: number): number => renderFrameNow(frameIdx);
  window.seek = (timeSeconds: number): number => {
    const idx = Math.round(timeSeconds * FILM_CONFIG.fps);
    return renderFrameNow(idx);
  };

  // Génération des boutons de poses clés
  if (keyframesContainer) {
    keyframesContainer.innerHTML = '';
    KEYFRAME_DOC_LIST.forEach((kf) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kf-btn';
      btn.textContent = `f.${kf.frame} — ${kf.label}`;
      btn.addEventListener('click', () => {
        isPlaying = false;
        renderFrameNow(kf.frame);
      });
      keyframesContainer.appendChild(btn);
    });
  }

  if (scrubber) {
    scrubber.max = String(FILM_CONFIG.totalFrames - 1);
    scrubber.addEventListener('input', () => {
      isPlaying = false;
      renderFrameNow(Number(scrubber.value));
    });
  }

  btnPlay?.addEventListener('click', () => {
    isPlaying = true;
  });
  btnPause?.addEventListener('click', () => {
    isPlaying = false;
  });
  btnResume?.addEventListener('click', () => {
    isPlaying = true;
  });
  btnRestart?.addEventListener('click', () => {
    isPlaying = true;
    renderFrameNow(0);
  });
  btnPrev?.addEventListener('click', () => {
    isPlaying = false;
    renderFrameNow((currentFrame - 1 + FILM_CONFIG.totalFrames) % FILM_CONFIG.totalFrames);
  });
  btnNext?.addEventListener('click', () => {
    isPlaying = false;
    renderFrameNow((currentFrame + 1) % FILM_CONFIG.totalFrames);
  });

  chkOnion?.addEventListener('change', () => {
    onionSkin = Boolean(chkOnion.checked);
    renderFrameNow(currentFrame);
  });
  chkSafe?.addEventListener('change', () => {
    showSafeZone = Boolean(chkSafe.checked);
    renderFrameNow(currentFrame);
  });

  // Rendu initial
  renderFrameNow(0);

  // Boucle temps réel requestAnimationFrame à 24 fps
  if (!isHeadless) {
    let lastTick = performance.now();
    const interval = 1000 / FILM_CONFIG.fps;
    const tick = (now: number) => {
      if (isPlaying) {
        const elapsed = now - lastTick;
        if (elapsed >= interval) {
          const steps = Math.max(1, Math.floor(elapsed / interval));
          lastTick = now - (elapsed % interval);
          renderFrameNow((currentFrame + steps) % FILM_CONFIG.totalFrames);
        }
      } else {
        lastTick = now;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStandalonePreview);
} else {
  initStandalonePreview();
}

export { FILM_CONFIG, EXPOSURE_SHEET };
