import { useCallback, useEffect, useRef, useState } from 'react';
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

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hasStartedOnce, setHasStartedOnce] = useState<boolean>(true);
  const [onionSkin, setOnionSkin] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [mp4Available, setMp4Available] = useState<boolean>(true);

  const isHeadless =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('headless') === '1';

  const renderSingleFrame = useCallback(
    (targetFrame: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawAnimationFrame(ctx, targetFrame, {
        onionSkin: isHeadless ? false : onionSkin,
        showSafeZone: isHeadless ? false : showSafeZone,
      });
    },
    [isHeadless, onionSkin, showSafeZone]
  );

  // Enregistrement de window.drawFrame(frameIndex) et window.seek(t) pour Chromium Headless et tests
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    registerGlobalAnimationBindings(canvas, (renderedIdx) => {
      setFrameIndex(renderedIdx);
    });
    renderSingleFrame(frameIndex);
  }, [renderSingleFrame]);

  // Redessine immédiatement lors d'un changement de frame ou d'option d'inspection
  useEffect(() => {
    renderSingleFrame(frameIndex);
  }, [frameIndex, onionSkin, showSafeZone, renderSingleFrame]);

  // Boucle requestAnimationFrame à 24 fps pour la lecture en direct dans le navigateur
  useEffect(() => {
    if (isHeadless || !isPlaying) return;

    let rafId = 0;
    let lastTick = performance.now();
    const frameInterval = 1000 / FILM_CONFIG.fps;

    const loop = (now: number) => {
      const elapsed = now - lastTick;
      if (elapsed >= frameInterval) {
        const steps = Math.max(1, Math.floor(elapsed / frameInterval));
        lastTick = now - (elapsed % frameInterval);
        setFrameIndex((prev) => (prev + steps) % FILM_CONFIG.totalFrames);
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isHeadless, isPlaying]);

  // Mode Chromium Headless pur (plein canevas 1080x1920 sans interface autour)
  if (isHeadless) {
    return (
      <div
        style={{
          width: `${FILM_CONFIG.width}px`,
          height: `${FILM_CONFIG.height}px`,
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          background: '#F6EFE2',
        }}
      >
        <canvas
          id="animation-canvas"
          ref={canvasRef}
          width={FILM_CONFIG.width}
          height={FILM_CONFIG.height}
          style={{
            display: 'block',
            width: `${FILM_CONFIG.width}px`,
            height: `${FILM_CONFIG.height}px`,
          }}
        />
      </div>
    );
  }

  const currentTimeSec = (frameIndex / FILM_CONFIG.fps).toFixed(2);
  const totalTimeSec = FILM_CONFIG.durationSeconds.toFixed(2);
  const currentPhase = getPhaseForFrame(frameIndex);

  const handlePlay = () => {
    setHasStartedOnce(true);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleResume = () => {
    setIsPlaying(true);
  };

  const handleRestart = () => {
    setFrameIndex(0);
    setHasStartedOnce(true);
    setIsPlaying(true);
  };

  const handleStep = (delta: number) => {
    setIsPlaying(false);
    setFrameIndex(
      (prev) => (prev + delta + FILM_CONFIG.totalFrames) % FILM_CONFIG.totalFrames
    );
  };

  return (
    <div className="min-h-screen bg-[#1F1915] text-[#F7EFE2] font-serif selection:bg-[#D87C4A] selection:text-white">
      {/* Barre d'en-tête Studio */}
      <header className="border-b border-[#3A2E25] bg-[#27201B]/95 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-3 h-3 rounded-full bg-[#E0684B] animate-pulse" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#FFF8EC]">
                Le Gâteau de Mamie — Studio d’Animation 2D Dessiné Image par Image
              </h1>
            </div>
            <p className="text-xs md:text-sm text-[#CBB89D] font-sans mt-0.5">
              Dessin procédural HTML5 Canvas 2D • Silhouettes anatomiques continues • Coloriage au crayon fait main • Rendu Chromium + FFmpeg
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#382D24] border border-[#524134] text-[#F2DEC2]">
              Format 9:16 (1080 × 1920)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#382D24] border border-[#524134] text-[#F2DEC2]">
              24 fps constants • {FILM_CONFIG.durationSeconds} s ({FILM_CONFIG.totalFrames} frames)
            </span>
            <a
              href="animation.mp4"
              download="le-gateau-de-mamie-9x16.mp4"
              className="px-3.5 py-1.5 rounded-lg bg-[#C96348] hover:bg-[#DF7255] text-white font-semibold transition shadow-sm"
            >
              ⬇ Télécharger le MP4 (1080×1920)
            </a>
          </div>
        </div>
      </header>

      {/* Grille principale : Prévisualisation Canvas 9:16 en direct + Contrôles / Feuille d'exposition / Vidéo MP4 */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche (5 cols) : Canevas 9:16 en direct & Barre de transport complète */}
        <section className="lg:col-span-5 flex flex-col items-center bg-[#2A221C] border border-[#43352B] rounded-2xl p-4 shadow-xl">
          <div className="w-full flex items-center justify-between mb-3 font-sans text-xs text-[#D6C3A8]">
            <span className="font-semibold uppercase tracking-wider text-[#F2C478]">
              ● Prévisualisation JavaScript en Direct (Sans MP4)
            </span>
            <span className="font-mono bg-[#1B1512] px-2.5 py-1 rounded border border-[#3E3027]">
              Frame {String(frameIndex + 1).padStart(3, '0')}/{FILM_CONFIG.totalFrames} • {currentTimeSec}s / {totalTimeSec}s
            </span>
          </div>

          {/* Conteneur vertical 9:16 strict */}
          <div
            className="relative w-full max-w-[360px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border-2 border-[#594638] bg-[#F6EFE2]"
            title="Canevas HTML5 1080x1920 dessiné en temps réel par JavaScript"
          >
            <canvas
              id="animation-canvas"
              ref={canvasRef}
              width={FILM_CONFIG.width}
              height={FILM_CONFIG.height}
              className="w-full h-full block"
            />
          </div>

          {/* Barre de progression interactive (Scrubber) */}
          <div className="w-full mt-4 font-sans">
            <div className="flex justify-between text-xs text-[#CBB89D] mb-1">
              <span>Temps courant : <strong className="text-white">{currentTimeSec} s</strong></span>
              <span className="text-[#F2C478] font-medium truncate max-w-[210px]">
                {currentPhase.title}
              </span>
              <span>Durée : <strong className="text-white">{totalTimeSec} s</strong></span>
            </div>
            <input
              id="timeline-scrubber"
              aria-label="Barre de progression de l'animation"
              type="range"
              min={0}
              max={FILM_CONFIG.totalFrames - 1}
              value={frameIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setFrameIndex(Number(e.target.value));
              }}
              className="w-full accent-[#D86C4F] cursor-pointer h-2 bg-[#1A1410] rounded-lg"
            />
          </div>

          {/* Boutons Lecture, Pause, Reprise, Redémarrage et Pas-à-pas */}
          <div className="w-full mt-3 flex flex-wrap items-center justify-center gap-2 font-sans text-xs">
            <button
              id="btn-play"
              type="button"
              onClick={handlePlay}
              className={`px-3 py-2 rounded-lg font-semibold transition ${
                isPlaying
                  ? 'bg-[#3D6E52] text-white'
                  : 'bg-[#382E26] hover:bg-[#4A3D33] text-[#F5E8D3]'
              }`}
            >
              ▶ Lecture
            </button>
            <button
              id="btn-pause"
              type="button"
              onClick={handlePause}
              className={`px-3 py-2 rounded-lg font-semibold transition ${
                !isPlaying
                  ? 'bg-[#B86F38] text-white'
                  : 'bg-[#382E26] hover:bg-[#4A3D33] text-[#F5E8D3]'
              }`}
            >
              ⏸ Pause
            </button>
            <button
              id="btn-resume"
              type="button"
              onClick={handleResume}
              disabled={isPlaying || !hasStartedOnce}
              className="px-3 py-2 rounded-lg bg-[#382E26] hover:bg-[#4A3D33] disabled:opacity-45 text-[#F5E8D3] font-semibold transition"
            >
              ⏯ Reprise
            </button>
            <button
              id="btn-restart"
              type="button"
              onClick={handleRestart}
              className="px-3 py-2 rounded-lg bg-[#382E26] hover:bg-[#4A3D33] text-[#F5E8D3] font-semibold transition"
            >
              ↺ Redémarrer
            </button>
            <button
              id="btn-prev-frame"
              type="button"
              onClick={() => handleStep(-1)}
              className="px-2.5 py-2 rounded-lg bg-[#1F1814] hover:bg-[#332821] border border-[#493A2F] text-[#E6D4BA] font-mono"
              title="Image précédente (-1 frame)"
            >
              -1f
            </button>
            <button
              id="btn-next-frame"
              type="button"
              onClick={() => handleStep(1)}
              className="px-2.5 py-2 rounded-lg bg-[#1F1814] hover:bg-[#332821] border border-[#493A2F] text-[#E6D4BA] font-mono"
              title="Image suivante (+1 frame)"
            >
              +1f
            </button>
          </div>

          {/* Options d'inspection visuelle : Onion Skinning & Safe Zone */}
          <div className="w-full mt-3 pt-3 border-t border-[#3B2F26] flex flex-wrap items-center justify-between gap-2 font-sans text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#D9C7AD]">
              <input
                type="checkbox"
                checked={onionSkin}
                onChange={(e) => setOnionSkin(e.target.checked)}
                className="accent-[#D86C4F]"
              />
              Pelure d’oignon (Onion Skin f-1)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#D9C7AD]">
              <input
                type="checkbox"
                checked={showSafeZone}
                onChange={(e) => setShowSafeZone(e.target.checked)}
                className="accent-[#D86C4F]"
              />
              Zone de sécurité 9:16 (TikTok / Reels)
            </label>
          </div>
        </section>

        {/* Colonne Droite (7 cols) : Feuille d'exposition, Poses clés, Lecteur MP4 et Détails techniques */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Détail de la phase active */}
          <div className="bg-[#2A221C] border border-[#43352B] rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-sans uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#423227] text-[#F4C67B]">
                Feuille d’Exposition • Phase {currentPhase.phaseNumber} / {EXPOSURE_SHEET.length}
              </span>
              <span className="text-xs font-mono text-[#CBB89D]">
                Frames {currentPhase.startFrame} – {currentPhase.endFrame} (
                {(currentPhase.startFrame / 24).toFixed(2)}s – {(currentPhase.endFrame / 24).toFixed(2)}s)
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#FFF7EA]">{currentPhase.title}</h2>
            <p className="text-sm text-[#E4D5BF] mt-1 font-sans">{currentPhase.summary}</p>
            <p className="text-xs text-[#B9A489] mt-1 font-sans italic">
              Détails d’animation : {currentPhase.details}
            </p>

            {/* Accès rapide aux 7 phases narratives */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-xs">
              {EXPOSURE_SHEET.map((phase) => {
                const active = phase.id === currentPhase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setFrameIndex(phase.startFrame);
                    }}
                    className={`text-left p-2.5 rounded-xl border transition ${
                      active
                        ? 'bg-[#413127] border-[#D87C4A] text-white shadow'
                        : 'bg-[#1F1814] border-[#382C23] text-[#CBB89D] hover:bg-[#2E241E]'
                    }`}
                  >
                    <div className="flex justify-between items-center font-semibold">
                      <span className="truncate">{phase.title}</span>
                      <span className="font-mono text-[11px] text-[#F2C478] ml-2">
                        f.{phase.startFrame}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accès rapide aux 11 Poses Clés inspectées */}
          <div className="bg-[#2A221C] border border-[#43352B] rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-[#FFF7EA] mb-1">
              Inspection Image par Image — 11 Poses Clés & Détails Chaleureux
            </h3>
            <p className="text-xs text-[#CBB89D] font-sans mb-3">
              Cliquez sur une pose clé pour positionner instantanément le canevas sur l’image correspondante (fouet, four 3D, course des enfants, balancement des pieds, doigt de Léo dans le gâteau quand Mamie a le dos tourné, découpe des parts).
            </p>
            <div className="flex flex-wrap gap-2 font-sans text-xs">
              {KEYFRAME_DOC_LIST.map((kf) => (
                <button
                  key={kf.frame}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setFrameIndex(kf.frame);
                  }}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    frameIndex === kf.frame
                      ? 'bg-[#C96348] border-[#F4A688] text-white font-semibold'
                      : 'bg-[#1E1713] border-[#3D3026] text-[#DFCEB4] hover:bg-[#31261E]'
                  }`}
                >
                  <span className="font-mono font-bold mr-1.5">f.{kf.frame}</span>
                  {kf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lecteur MP4 Exporté + Caractéristiques du film */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#2A221C] border border-[#43352B] rounded-2xl p-4 shadow-lg flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 font-sans text-xs">
                <span className="font-semibold text-[#F2C478] uppercase tracking-wider">
                  Lecteur Vidéo MP4 Final
                </span>
                <a
                  href="animation.mp4"
                  download="le-gateau-de-mamie-9x16.mp4"
                  className="underline text-[#E89B7E] hover:text-white"
                >
                  Télécharger
                </a>
              </div>

              {mp4Available ? (
                <video
                  controls
                  loop
                  playsInline
                  preload="metadata"
                  onError={() => setMp4Available(false)}
                  className="w-full max-w-[230px] aspect-[9/16] rounded-xl border border-[#544235] bg-black shadow-md"
                  src="animation.mp4"
                >
                  Votre navigateur ne supporte pas la lecture vidéo HTML5.
                </video>
              ) : (
                <div className="w-full max-w-[230px] aspect-[9/16] rounded-xl border border-dashed border-[#594638] flex flex-col items-center justify-center p-4 text-center font-sans text-xs text-[#CBB89D]">
                  <p className="font-semibold text-[#F2C478] mb-2">
                    Prévisualisation JS Active
                  </p>
                  <p>
                    Le canevas à gauche fonctionne de manière 100 % autonome sans fichier MP4.
                    Lancez <code>./scripts/export-video.sh</code> pour générer <code>animation.mp4</code>.
                  </p>
                </div>
              )}
            </div>

            {/* Spécifications et Pipeline d'export */}
            <div className="bg-[#2A221C] border border-[#43352B] rounded-2xl p-4 shadow-lg font-sans text-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#FFF7EA] font-serif mb-2">
                  Caractéristiques Techniques & Qualité
                </h3>
                <ul className="space-y-1.5 text-[#DFCEB4]">
                  <li>• <strong>Format :</strong> Vertical 9:16 (<code>1080 × 1920</code>)</li>
                  <li>• <strong>Cadence :</strong> <code>24 fps</code> constants (<code>180 frames</code> / <code>7,50 s</code>)</li>
                  <li>• <strong>Codec Vidéo :</strong> H.264 (<code>libx264</code>, <code>yuv420p</code>, <code>+faststart</code>)</li>
                  <li>• <strong>Audio :</strong> AAC stéréo <code>48 kHz</code> (bruitages discrets synchronisés)</li>
                  <li>• <strong>Silhouettes unifiées :</strong> Zéro trait résiduel entre bras et avant-bras, zéro trait de crâne sous les cheveux</li>
                  <li>• <strong>Trait vivant :</strong> Redessiné feuille par feuille à chaque frame avec coloriage crayon légèrement décalé</li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-[#3D3026]">
                <div className="text-[11px] font-semibold text-[#F2C478] mb-1">
                  Exporter soi-même en vidéo (Chromium + FFmpeg) :
                </div>
                <pre className="bg-[#16110E] text-[#E6D4BA] p-2.5 rounded-lg overflow-x-auto font-mono text-[11px] border border-[#382C23]">
{`./scripts/export-video.sh \\
  web/preview.html \\
  final/animation.mp4`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
