import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  Film,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LiveSoundtrackSynthesizer,
  RenderFrameOptions,
  attachGlobalAnimationAPI,
  renderAnimationFrame,
} from './animation/engine';
import {
  ALL_CELS,
  CelSpecification,
  DURATION_SECONDS,
  FPS,
  TOTAL_CELS,
  TOTAL_FRAMES,
  WALK_CYCLE_12_POSES,
  getCelForFrame,
} from './animation/exposureSheet';

export function App() {
  const isHeadlessRenderMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('render') === '1';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const soundRef = useRef<LiveSoundtrackSynthesizer>(new LiveSoundtrackSynthesizer());

  const [isPlaying, setIsPlaying] = useState<boolean>(() => !isHeadlessRenderMode);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [showOnionSkin, setShowOnionSkin] = useState<boolean>(false);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [characterOnly, setCharacterOnly] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'xsheet' | 'walk12' | 'bible' | 'export'>('xsheet');
  const [mp4Available, setMp4Available] = useState<boolean>(true);

  const optionsRef = useRef<RenderFrameOptions>({
    showOnionSkin: false,
    showSafeZones: false,
    characterOnly: false,
  });

  useEffect(() => {
    optionsRef.current = { showOnionSkin, showSafeZones, characterOnly };
  }, [showOnionSkin, showSafeZones, characterOnly]);

  const currentCel: CelSpecification = getCelForFrame(currentFrame);
  const currentTimeSec = (currentFrame / FPS).toFixed(2);

  // Dessine la frame courante sur le Canvas 1080x1920
  const drawCurrent = useCallback(
    (frameIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      renderAnimationFrame(ctx, frameIdx, {
        showOnionSkin,
        showSafeZones,
        characterOnly,
      });
      if (window.__anim) {
        window.__anim.currentFrame = frameIdx;
      }
    },
    [showOnionSkin, showSafeZones, characterOnly]
  );

  // Attache l'API globale déterministe `window.drawFrame(frameIndex)` et `window.seek(t)`
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    attachGlobalAnimationAPI(
      canvas,
      (externalFrame) => {
        // Lorsqu'un outil externe (Chromium / Playwright) appelle window.drawFrame,
        // on met en pause la boucle temps réel pour garantir un déterminisme absolu.
        setIsPlaying(false);
        setCurrentFrame(externalFrame);
      },
      () => optionsRef.current
    );

    drawCurrent(0);
  }, [drawCurrent]);

  // Redessine immédiatement si l'utilisateur change d'option ou de frame en pause
  useEffect(() => {
    drawCurrent(currentFrame);
  }, [currentFrame, showOnionSkin, showSafeZones, characterOnly, drawCurrent]);

  // Boucle de lecture en direct via requestAnimationFrame cadencée exactement à 24 fps
  useEffect(() => {
    if (!isPlaying) return;

    let rafId = 0;
    let lastTimestamp = performance.now();
    const frameDurationMs = 1000 / FPS;
    let accumulator = 0;

    const tick = (now: number) => {
      const delta = now - lastTimestamp;
      lastTimestamp = now;
      accumulator += delta;

      if (accumulator >= frameDurationMs) {
        const steps = Math.max(1, Math.floor(accumulator / frameDurationMs));
        accumulator %= frameDurationMs;
        setCurrentFrame((prev) => {
          const next = (prev + steps) % TOTAL_FRAMES;
          soundRef.current.onFrame(next);
          return next;
        });
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Raccourcis clavier accessibles (Espace = lecture/pause, Flèches = frame/cel)
  useEffect(() => {
    if (isHeadlessRenderMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrame((f) => (f + (e.shiftKey ? 2 : 1)) % TOTAL_FRAMES);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrame((f) => (f - (e.shiftKey ? 2 : 1) + TOTAL_FRAMES) % TOTAL_FRAMES);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHeadlessRenderMode]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  const handleStepFrame = (delta: number) => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev + delta + TOTAL_FRAMES) % TOTAL_FRAMES);
  };

  const handleToggleAudio = () => {
    const nextState = soundRef.current.toggle();
    setAudioEnabled(nextState);
  };

  // Mode minimal plein écran pour la capture Chromium headless (?render=1)
  if (isHeadlessRenderMode) {
    return (
      <div className="m-0 p-0 bg-[#FAF3E6] flex items-center justify-center overflow-hidden">
        <canvas
          id="animation-canvas"
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: '1080px', height: '1920px', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191411] text-[#FAF3E6] flex flex-col">
      {/* En-tête Studio */}
      <header className="border-b border-[#382B24] bg-[#211A16]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D9795D] to-[#B85A40] flex items-center justify-center shadow-md shadow-black/30">
              <Sparkles className="w-5 h-5 text-[#FAF3E6]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#FAF3E6]">
                  La Promenade de Grand-mère Colette
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7B9A82]/25 text-[#A8C9B0] border border-[#7B9A82]/40">
                  Dessiné Image par Image • 24 fps
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C8B6A6]">
                Animation 2D traditionnelle en JavaScript &amp; Canvas 2D • Aquarelle, Crayon &amp; Encre Sépia • Format Vertical 9:16 (1080×1920)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="./animation.mp4"
              download="la-promenade-de-grand-mere-colette-1080x1920-24fps.mp4"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#D9795D] hover:bg-[#E2886D] text-white shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le MP4 (1080×1920)</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8 flex-1">
        {/* Grille principale : Prévisualisation JavaScript en Direct (Gauche) + Contrôles & Lecteur MP4 (Droite) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne 1 : Canvas 2D Temps Réel (5 colonnes) */}
          <div className="lg:col-span-5 flex flex-col items-center bg-[#231C18] border border-[#3B2E26] rounded-2xl p-4 shadow-xl">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#E6D5C3]">
                  Prévisualisation Directe Canvas 2D (Temps Réel JS)
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#332721] text-[#F5C76B]">
                1080 × 1920 (9:16)
              </span>
            </div>

            {/* Conteneur proportionnel 9:16 */}
            <div className="relative w-full max-w-[350px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border-2 border-[#4A3A30] bg-[#FAF3E6]">
              <canvas
                id="animation-canvas"
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleTogglePlay}
                title="Cliquer pour Lecture / Pause"
                className="w-full h-full object-contain block cursor-pointer"
              />

              {/* Badge flottant du dessin actif */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#231C18]/85 text-[#FAF3E6] backdrop-blur-sm border border-white/15">
                  {currentCel.celId} • Frame {String(currentFrame).padStart(3, '0')}/143
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-sm border ${
                    currentCel.role === 'KEY'
                      ? 'bg-amber-500/90 text-stone-950 border-amber-300'
                      : currentCel.role === 'BRK'
                      ? 'bg-sky-500/90 text-stone-950 border-sky-300'
                      : 'bg-stone-800/85 text-stone-200 border-stone-600'
                  }`}
                >
                  {currentCel.role === 'KEY'
                    ? 'POSE CLÉ'
                    : currentCel.role === 'BRK'
                    ? 'BREAKDOWN'
                    : 'INTERVALLE'}
                </span>
              </div>
            </div>

            {/* Barre de progression et contrôles complets du lecteur Canvas */}
            <div className="w-full mt-4 space-y-3 bg-[#1B1512] p-3.5 rounded-xl border border-[#352922]">
              {/* Scrubber Timeline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-[#D5C3B3]">
                  <span>
                    Temps : <strong className="text-[#FAF3E6]">{currentTimeSec} s</strong> /{' '}
                    {DURATION_SECONDS.toFixed(2)} s
                  </span>
                  <span>
                    Dessin <strong className="text-[#F5C76B]">{currentCel.celNumber}</strong>/{TOTAL_CELS} (sur 2)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={TOTAL_FRAMES - 1}
                  value={currentFrame}
                  aria-label="Barre de progression de l'animation"
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentFrame(Number(e.target.value));
                  }}
                  className="w-full accent-[#D9795D] h-2 bg-[#382C25] rounded-lg cursor-pointer"
                />
              </div>

              {/* Boutons Lecture / Pause / Reprise / Redémarrage / Pas-à-pas */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#D9795D] hover:bg-[#E3886D] text-white transition cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>{currentFrame > 0 ? 'Reprendre' : 'Lecture'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    title="Redémarrer au début (Frame 0)"
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-[#2E241E] hover:bg-[#3D3028] text-[#E6D5C3] border border-[#46372E] transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Redémarrer</span>
                  </button>
                </div>

                {/* Navigation image par image / dessin par dessin */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStepFrame(-2)}
                    title="Dessin précédent (-2 frames)"
                    className="px-2 py-1.5 rounded bg-[#2E241E] hover:bg-[#3D3028] text-xs font-mono text-[#E6D5C3] border border-[#46372E] cursor-pointer"
                  >
                    -1 Cel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepFrame(-1)}
                    title="Image précédente (-1 frame)"
                    className="p-1.5 rounded bg-[#2E241E] hover:bg-[#3D3028] text-[#E6D5C3] border border-[#46372E] cursor-pointer"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepFrame(1)}
                    title="Image suivante (+1 frame)"
                    className="p-1.5 rounded bg-[#2E241E] hover:bg-[#3D3028] text-[#E6D5C3] border border-[#46372E] cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepFrame(2)}
                    title="Dessin suivant (+2 frames)"
                    className="px-2 py-1.5 rounded bg-[#2E241E] hover:bg-[#3D3028] text-xs font-mono text-[#E6D5C3] border border-[#46372E] cursor-pointer"
                  >
                    +1 Cel
                  </button>
                </div>
              </div>

              {/* Outils d'inspection d'animation (Onion Skin, Safe Zone, Pose seule, Audio JS) */}
              <div className="pt-2 border-t border-[#322720] grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnionSkin((v) => !v)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    showOnionSkin
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                      : 'bg-[#261E19] border-[#3E3028] text-[#C8B6A6] hover:bg-[#312620]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Onion Skin (Pelures)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSafeZones((v) => !v)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    showSafeZones
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-[#261E19] border-[#3E3028] text-[#C8B6A6] hover:bg-[#312620]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Zone Sûre 9:16</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCharacterOnly((v) => !v)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    characterOnly
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                      : 'bg-[#261E19] border-[#3E3028] text-[#C8B6A6] hover:bg-[#312620]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Pose sur Papier</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    audioEnabled
                      ? 'bg-[#D9795D]/30 border-[#D9795D] text-[#FFE2D6]'
                      : 'bg-[#261E19] border-[#3E3028] text-[#C8B6A6] hover:bg-[#312620]'
                  }`}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span>{audioEnabled ? 'Son JS Actif' : 'Activer Son JS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Colonne 2 : Télémesure de la Pose Active, Lecteur MP4 Exporté & Caractéristiques (7 colonnes) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Carte d'analyse biomécanique du dessin courant */}
            <div className="bg-[#231C18] border border-[#3B2E26] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#362A22] pb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D9795D]">
                    {currentCel.actTitle}
                  </span>
                  <h2 className="text-lg font-bold text-[#FAF3E6]">
                    {currentCel.celId} — {currentCel.phaseName}
                  </h2>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#312620] text-[#E6D5C3] border border-[#47382F]">
                  Exposition : Frames {currentCel.startFrame}–{currentCel.endFrame} (2 frames @ 24 fps)
                </span>
              </div>

              <p className="text-sm text-[#E2D3C5] leading-relaxed">
                {currentCel.description}
              </p>

              {/* Métriques biomécaniques de la pose */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-[#1B1512] p-3 rounded-xl border border-[#332720]">
                  <div className="text-[11px] uppercase text-[#A89686]">Transfert Poids (Bassin)</div>
                  <div className="text-sm font-mono font-bold text-[#FAF3E6] mt-0.5">
                    Δy = {currentCel.pose.pelvisDy >= 0 ? `+${currentCel.pose.pelvisDy}` : currentCel.pose.pelvisDy} px
                  </div>
                  <div className="text-[11px] text-[#8E7C6D]">
                    Retard châle : {currentCel.pose.shawlLagDy >= 0 ? `+${currentCel.pose.shawlLagDy}` : currentCel.pose.shawlLagDy} px
                  </div>
                </div>

                <div className="bg-[#1B1512] p-3 rounded-xl border border-[#332720]">
                  <div className="text-[11px] uppercase text-[#A89686]">Pied Gauche</div>
                  <div className="text-sm font-mono font-bold text-[#93C5FD] mt-0.5">
                    {currentCel.pose.leftFoot.contactState}
                  </div>
                  <div className="text-[11px] text-[#8E7C6D]">
                    dx: {currentCel.pose.leftFoot.dx}px | angle: {currentCel.pose.leftFoot.angleDeg}°
                  </div>
                </div>

                <div className="bg-[#1B1512] p-3 rounded-xl border border-[#332720]">
                  <div className="text-[11px] uppercase text-[#A89686]">Pied Droit</div>
                  <div className="text-sm font-mono font-bold text-[#FCD34D] mt-0.5">
                    {currentCel.pose.rightFoot.contactState}
                  </div>
                  <div className="text-[11px] text-[#8E7C6D]">
                    dx: {currentCel.pose.rightFoot.dx}px | angle: {currentCel.pose.rightFoot.angleDeg}°
                  </div>
                </div>

                <div className="bg-[#1B1512] p-3 rounded-xl border border-[#332720]">
                  <div className="text-[11px] uppercase text-[#A89686]">Canne &amp; Expression</div>
                  <div className="text-sm font-mono font-bold text-[#6EE7B7] mt-0.5">
                    {currentCel.pose.caneTipLiftY === 0 ? 'Canne en appui' : `Levée (${currentCel.pose.caneTipLiftY}px)`}
                  </div>
                  <div className="text-[11px] text-[#8E7C6D]">
                    Yeux: {Math.round(currentCel.pose.eyeOpen * 100)}% | Tête: {currentCel.pose.headTiltDeg.toFixed(1)}°
                  </div>
                </div>
              </div>
            </div>

            {/* Lecteur MP4 Exporté + Caractéristiques Techniques du Film */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-[#231C18] border border-[#3B2E26] rounded-2xl p-5 shadow-xl">
              {/* Lecteur Vidéo MP4 (5 colonnes) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E6D5C3] flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-[#D9795D]" />
                    <span>Film MP4 Rendu (FFmpeg)</span>
                  </span>
                </div>

                {mp4Available ? (
                  <div className="w-full max-w-[220px] aspect-[9/16] rounded-xl overflow-hidden border border-[#4A3A30] bg-black shadow-lg">
                    <video
                      src="./animation.mp4"
                      controls
                      loop
                      playsInline
                      preload="metadata"
                      onError={() => setMp4Available(false)}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[220px] aspect-[9/16] rounded-xl border border-dashed border-[#5A473B] bg-[#1B1512] p-4 flex flex-col items-center justify-center text-center">
                    <Film className="w-8 h-8 text-[#8C7867] mb-2" />
                    <p className="text-xs text-[#C8B6A6]">
                      Fichier MP4 non détecté à <code>./animation.mp4</code>. La prévisualisation JavaScript Canvas 2D à gauche fonctionne de manière 100 % autonome !
                    </p>
                  </div>
                )}
              </div>

              {/* Spécifications Techniques Validées (7 colonnes) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#FAF3E6] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Caractéristiques Techniques du Film Livrable</span>
                  </h3>
                  <p className="text-xs text-[#B8A594] mt-1">
                    Chaque frame du fichier MP4 est rendue individuellement dans Chromium headless via{' '}
                    <code className="text-[#F5C76B]">window.drawFrame(frameIndex)</code> puis assemblée par FFmpeg.
                  </p>

                  <dl className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-[#1B1512] p-2.5 rounded-lg border border-[#322720]">
                      <dt className="text-[#9E8B7B]">Format &amp; Résolution</dt>
                      <dd className="font-mono font-bold text-[#FAF3E6] mt-0.5">
                        9:16 Vertical • 1080 × 1920
                      </dd>
                    </div>
                    <div className="bg-[#1B1512] p-2.5 rounded-lg border border-[#322720]">
                      <dt className="text-[#9E8B7B]">Cadence &amp; Durée</dt>
                      <dd className="font-mono font-bold text-[#FAF3E6] mt-0.5">
                        24 fps constant • 6,00 s (144 frames)
                      </dd>
                    </div>
                    <div className="bg-[#1B1512] p-2.5 rounded-lg border border-[#322720]">
                      <dt className="text-[#9E8B7B]">Dessins Uniques</dt>
                      <dd className="font-mono font-bold text-[#F5C76B] mt-0.5">
                        72 Cels (12 dessins/s « sur 2 »)
                      </dd>
                    </div>
                    <div className="bg-[#1B1512] p-2.5 rounded-lg border border-[#322720]">
                      <dt className="text-[#9E8B7B]">Codec Vidéo &amp; Pixels</dt>
                      <dd className="font-mono font-bold text-[#FAF3E6] mt-0.5">
                        H.264 (libx264) • yuv420p • faststart
                      </dd>
                    </div>
                    <div className="bg-[#1B1512] p-2.5 rounded-lg border border-[#322720] col-span-2">
                      <dt className="text-[#9E8B7B]">Piste Sonore Synchronisée</dt>
                      <dd className="font-mono font-bold text-[#A8C9B0] mt-0.5">
                        AAC Stéréo 48 kHz (pas feutrés sur pavés, canne boisée, oiseaux &amp; brise)
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <a
                    href="./animation.mp4"
                    download="la-promenade-de-grand-mere-colette-1080x1920-24fps.mp4"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D9795D] hover:bg-[#E3886D] text-white shadow transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger animation.mp4</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveTab('export')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#2E241E] hover:bg-[#3A2D25] text-[#E6D5C3] border border-[#47382F] transition cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-[#F5C76B]" />
                    <span>Commandes d'Export Vidéo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Basse : Onglets Feuille d'Exposition (72 Cels), 12 Poses Clés/Breakdowns, Bible Graphique & Script d'Export */}
        <section className="bg-[#231C18] border border-[#3B2E26] rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#362A22] pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('xsheet')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'xsheet'
                    ? 'bg-[#D9795D] text-white'
                    : 'bg-[#1B1512] text-[#C8B6A6] hover:bg-[#2E241E]'
                }`}
              >
                Feuille d'Exposition Interactive (72 Dessins / 144 Frames)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('walk12')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'walk12'
                    ? 'bg-[#D9795D] text-white'
                    : 'bg-[#1B1512] text-[#C8B6A6] hover:bg-[#2E241E]'
                }`}
              >
                Décomposition des 12 Poses du Cycle de Marche
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bible')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'bible'
                    ? 'bg-[#D9795D] text-white'
                    : 'bg-[#1B1512] text-[#C8B6A6] hover:bg-[#2E241E]'
                }`}
              >
                Bible Graphique &amp; Storyboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-[#D9795D] text-white'
                    : 'bg-[#1B1512] text-[#C8B6A6] hover:bg-[#2E241E]'
                }`}
              >
                Pipeline Chromium → FFmpeg &amp; Script d'Export
              </button>
            </div>
          </div>

          {/* ONGLET 1 : Feuille d'exposition interactive des 72 dessins uniques */}
          {activeTab === 'xsheet' && (
            <div className="space-y-3">
              <p className="text-xs text-[#C8B6A6]">
                Cliquez sur n'importe quel dessin (<code className="text-[#F5C76B]">CEL_001</code> à{' '}
                <code className="text-[#F5C76B]">CEL_072</code>) pour positionner immédiatement le Canvas 2D sur cette pose exacte.
              </p>
              <div className="max-h-[420px] overflow-y-auto rounded-xl border border-[#362A22] bg-[#191411]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#28201B] text-[#D8C6B6] sticky top-0 z-10 border-b border-[#3B2E26]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Dessin (Cel)</th>
                      <th className="py-2.5 px-3 font-semibold">Frames (24 fps)</th>
                      <th className="py-2.5 px-3 font-semibold">Temps (s)</th>
                      <th className="py-2.5 px-3 font-semibold">Rôle</th>
                      <th className="py-2.5 px-3 font-semibold">Phase de Marche</th>
                      <th className="py-2.5 px-3 font-semibold">Bassin Δy</th>
                      <th className="py-2.5 px-3 font-semibold">Action &amp; Expression</th>
                      <th className="py-2.5 px-3 font-semibold">Cue Sonore</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B221D]">
                    {ALL_CELS.map((cel) => {
                      const isSelected = cel.celNumber === currentCel.celNumber;
                      return (
                        <tr
                          key={cel.celId}
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentFrame(cel.startFrame);
                          }}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#D9795D]/25 text-white font-semibold'
                              : 'hover:bg-[#261E1A] text-[#D8C7B8]'
                          }`}
                        >
                          <td className="py-2 px-3 font-mono font-bold text-[#F5C76B]">
                            {cel.celId}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {String(cel.startFrame).padStart(3, '0')}–{String(cel.endFrame).padStart(3, '0')}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {cel.timeStartSec.toFixed(2)}s
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                cel.role === 'KEY'
                                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                  : cel.role === 'BRK'
                                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                                  : 'bg-stone-700/40 text-stone-300'
                              }`}
                            >
                              {cel.role}
                            </span>
                          </td>
                          <td className="py-2 px-3">{cel.phaseName}</td>
                          <td className="py-2 px-3 font-mono">
                            {cel.pose.pelvisDy >= 0 ? `+${cel.pose.pelvisDy}` : cel.pose.pelvisDy} px
                          </td>
                          <td className="py-2 px-3 text-[#E6D5C3]">{cel.description}</td>
                          <td className="py-2 px-3 text-[#A8C9B0] font-mono text-[11px]">
                            {cel.audioCue ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ONGLET 2 : Les 12 poses du cycle de marche */}
          {activeTab === 'walk12' && (
            <div className="space-y-4">
              <p className="text-xs text-[#C8B6A6]">
                Chaque foulée double (1,00 seconde = 24 frames) est composée de <strong>12 dessins uniques</strong> (2 Poses Clés de contact, 6 Breakdowns Down/Passing/Up et 4 Intervalles). Cliquez sur une carte pour inspecter la pose correspondante sur le Canvas.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {WALK_CYCLE_12_POSES.map((pose) => {
                  const targetFrame = pose.phaseIndex * 2;
                  const isCurrentPhase = currentCel.phaseIndex === pose.phaseIndex;
                  return (
                    <button
                      key={pose.phaseIndex}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame(targetFrame);
                      }}
                      className={`text-left p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isCurrentPhase
                          ? 'bg-[#D9795D]/25 border-[#D9795D] text-white'
                          : 'bg-[#1B1512] border-[#332720] text-[#D8C7B8] hover:border-[#5C473B]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#F5C76B]">
                            Dessin #{pose.phaseIndex + 1}/12
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pose.role === 'KEY'
                                ? 'bg-amber-500/30 text-amber-200'
                                : pose.role === 'BRK'
                                ? 'bg-sky-500/30 text-sky-200'
                                : 'bg-stone-700 text-stone-300'
                            }`}
                          >
                            {pose.role}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#FAF3E6] leading-snug">
                          {pose.phaseName}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#2E241E] text-[11px] font-mono text-[#B8A594] space-y-0.5">
                        <div>Bassin Δy: {pose.pelvisDy >= 0 ? `+${pose.pelvisDy}` : pose.pelvisDy}px</div>
                        <div>Pied G: {pose.leftFoot.contactState}</div>
                        <div>Pied D: {pose.rightFoot.contactState}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ONGLET 3 : Résumé de la Bible Graphique et du Storyboard */}
          {activeTab === 'bible' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="bg-[#1B1512] p-4 rounded-xl border border-[#332720] space-y-2">
                <h4 className="text-sm font-bold text-[#F5C76B]">
                  1. Bible Graphique — Grand-mère Colette
                </h4>
                <p className="text-[#D8C7B8]">
                  Colette est dessinée en pied (~700 px de haut au cœur de la zone sûre 9:16) avec un chignon blanc argenté, des lunettes rondes en laiton doré, un châle tricoté terracotta aux franges animées avec retard (<em>overlapping action</em>), un cardigan vert sauge, une jupe plissée bleu lavande, un panier d'osier fleuri au bras gauche et une canne en noyer dans la main droite.
                </p>
              </div>
              <div className="bg-[#1B1512] p-4 rounded-xl border border-[#332720] space-y-2">
                <h4 className="text-sm font-bold text-[#F5C76B]">
                  2. Décor Multi-Plans — La Rue des Glycines
                </h4>
                <p className="text-[#D8C7B8]">
                  Quatre plans de parallaxe dessinés sur papier grain torchon (<code>#FAF3E6</code>) : collines et clocher (<code>0.18×</code>), façades de la Boulangerie <em>Au Blé d'Or</em>, de la Maison aux Glycines avec son chat roux animé et de l'Herboristerie (<code>0.52×</code>), trottoir pavé synchronisé au pixel près sur la foulée (<code>1.00×</code>, zéro glissement des pieds) et premier plan fleuri avec papillon doré (<code>1.26×</code>).
                </p>
              </div>
              <div className="bg-[#1B1512] p-4 rounded-xl border border-[#332720] space-y-2">
                <h4 className="text-sm font-bold text-[#F5C76B]">
                  3. Storyboard en 3 Actes (6,00 s / 144 frames)
                </h4>
                <ul className="space-y-1.5 text-[#D8C7B8]">
                  <li>
                    <strong>Acte I (0.0s–2.0s, CEL_001–024)</strong> : Marche sereine devant la boulangerie illuminée par le soleil matinal.
                  </li>
                  <li>
                    <strong>Acte II (2.0s–4.0s, CEL_025–048)</strong> : Colette lève les yeux, sourit et fait un signe de la main au chat roux sous les glycines pendant qu'un papillon doré voltige autour de son panier.
                  </li>
                  <li>
                    <strong>Acte III (4.0s–6.0s, CEL_049–072)</strong> : Elle hume paisiblement son bouquet de lavande les paupières closes puis poursuit sa promenade ensoleillée.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ONGLET 4 : Pipeline Chromium -> FFmpeg et Script d'Export */}
          {activeTab === 'export' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#1B1512] p-4 rounded-xl border border-[#332720] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F5C76B]">
                  <Terminal className="w-4 h-4" />
                  <span>Script d'Export Autonome (HTML/JS, Séquence PNG ou Vidéo)</span>
                </div>
                <p className="text-[#D8C7B8]">
                  Le script <code className="text-[#FAF3E6]">./scripts/export-video.sh</code> lance automatiquement le serveur Vite si nécessaire, ouvre l'<code>index.html</code> racine dans Chromium headless (Playwright), appelle <code>window.drawFrame(0..143)</code> pour capturer individuellement les 144 frames PNG, génère la piste audio 48 kHz et assemble le MP4 final avec FFmpeg :
                </p>
                <pre className="p-3 rounded-lg bg-black/60 text-emerald-300 font-mono overflow-x-auto leading-relaxed">
{`# A. Depuis l'index.html racine (Chromium + FFmpeg)
./scripts/export-video.sh index.html final/animation.mp4

# B. Depuis une séquence d'images PNG déjà rendue
./scripts/export-video.sh build/frames final/animation.mp4

# C. Réencodage ou conversion d'une vidéo existante
./scripts/export-video.sh final/animation.mp4 final/animation.webm`}
                </pre>
              </div>

              <div className="bg-[#1B1512] p-4 rounded-xl border border-[#332720] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commande FFmpeg Directe &amp; Contrôle Qualité</span>
                </div>
                <p className="text-[#D8C7B8]">
                  Exemple de conversion FFmpeg directe à partir des 144 frames PNG capturées individuellement :
                </p>
                <pre className="p-3 rounded-lg bg-black/60 text-amber-200 font-mono overflow-x-auto leading-relaxed">
{`ffmpeg -y -framerate 24 -i build/frames/%05d.png \\
  -i build/audio/soundtrack.wav \\
  -c:v libx264 -pix_fmt yuv420p -crf 18 \\
  -c:a aac -b:a 192k -ar 48000 \\
  -movflags +faststart -shortest final/animation.mp4`}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
export default App;
