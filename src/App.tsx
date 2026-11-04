import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Film,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  FILM_CONFIG,
  SAFE_ZONE,
  SCENES,
  getSceneForFrame,
} from './animation/config';
import { CHARACTER_BIBLE, PROP_BIBLE } from './animation/characterBible';
import { renderFilmFrame } from './animation/renderer';
import { LiveSoundtrackController } from './animation/soundtrack';

export function App() {
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isHeadlessExport =
    searchParams?.get('export') === '1' || searchParams?.get('headless') === '1';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const soundRef = useRef<LiveSoundtrackController | null>(null);

  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(!isHeadlessExport);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [showOnionSkin, setShowOnionSkin] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scenes' | 'bible' | 'mp4'>('scenes');

  if (!soundRef.current && typeof window !== 'undefined') {
    soundRef.current = new LiveSoundtrackController();
  }

  // Synchronise le canvas avec la frame courante et expose le canvas actif à window.drawFrame
  const drawCurrent = useCallback(
    (frameToDraw: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      window.__ACTIVE_CANVAS__ = canvas;
      renderFilmFrame(canvas, frameToDraw, {
        showSafeZone,
        showOnionSkin,
      });
    },
    [showSafeZone, showOnionSkin]
  );

  useEffect(() => {
    window.__ON_EXTERNAL_SEEK__ = (f: number) => {
      setIsPlaying(false);
      setCurrentFrame(f);
    };
    return () => {
      window.__ON_EXTERNAL_SEEK__ = null;
    };
  }, []);

  useEffect(() => {
    drawCurrent(currentFrame);
  }, [currentFrame, drawCurrent]);

  // Boucle requestAnimationFrame à 24 images/seconde pour la prévisualisation live
  useEffect(() => {
    if (!isPlaying || isHeadlessExport) return;

    let animId = 0;
    let lastTimestamp = performance.now();
    const frameInterval = 1000 / FILM_CONFIG.fps;

    const tick = (now: number) => {
      const elapsed = now - lastTimestamp;
      if (elapsed >= frameInterval) {
        const steps = Math.max(1, Math.floor(elapsed / frameInterval));
        lastTimestamp = now - (elapsed % frameInterval);

        setCurrentFrame((prev) => {
          const next = prev + steps;
          if (next >= FILM_CONFIG.totalFrames) {
            // Fin douce sur la dernière image souvenir puis arrêt propre
            setIsPlaying(false);
            return FILM_CONFIG.totalFrames - 1;
          }
          soundRef.current?.onFrame(next);
          return next;
        });
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isHeadlessExport]);

  // Raccourcis clavier pratiques (Espace = lecture/pause, Flèches = -1/+1 frame, R = redémarrer)
  useEffect(() => {
    if (isHeadlessExport) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrame((f) => Math.min(FILM_CONFIG.totalFrames - 1, f + 1));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrame((f) => Math.max(0, f - 1));
      } else if (e.key === 'r' || e.key === 'R') {
        setCurrentFrame(0);
        setIsPlaying(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHeadlessExport]);

  // Mode minimaliste dédié au rendu Chromium headless frame par frame
  if (isHeadlessExport) {
    return (
      <div className="m-0 p-0 w-[1080px] h-[1920px] overflow-hidden bg-[#F7EFE1]">
        <canvas
          id="film-canvas"
          ref={canvasRef}
          width={FILM_CONFIG.width}
          height={FILM_CONFIG.height}
          className="block w-[1080px] h-[1920px]"
        />
      </div>
    );
  }

  const { scene: activeScene, localFrame, sceneFrames } = getSceneForFrame(currentFrame);
  const currentSeconds = (currentFrame / FILM_CONFIG.fps).toFixed(1);
  const totalSeconds = FILM_CONFIG.durationSeconds.toFixed(1);
  const drawingIndex = Math.floor(currentFrame / 2) + 1;

  const handleRestart = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (!isPlaying && currentFrame >= FILM_CONFIG.totalFrames - 1) {
      setCurrentFrame(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const handleToggleMute = () => {
    if (soundRef.current) {
      const m = soundRef.current.toggleMute();
      setIsMuted(m);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5ECE0] text-[#3D2B1F] flex flex-col">
      {/* En-tête éditorial style livre d'histoires d'enfance */}
      <header className="border-b border-[#D8C5A8] bg-[#FAF4E8]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D49B54] text-[#FAF3E6] flex items-center justify-center shadow-sm border border-[#8A5A36]/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#3D2B1F]">
                « Le Gâteau de Mamie »
              </h1>
              <p className="text-xs sm:text-sm text-[#6E523D]">
                Court-métrage d’animation 2D dessiné image par image (Canvas 2D • Chromium • FFmpeg)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-full bg-[#EFE3CE] border border-[#D4BFA0] text-[#5C4033]">
              Format 9:16 ({FILM_CONFIG.width}×{FILM_CONFIG.height})
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#EFE3CE] border border-[#D4BFA0] text-[#5C4033]">
              {FILM_CONFIG.fps} fps (12 dessins/s)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#D49B54]/20 border border-[#D49B54] text-[#5C4033] font-semibold">
              Durée : {totalSeconds}s ({FILM_CONFIG.totalFrames} frames)
            </span>
            <a
              href="./animation.mp4"
              download="le-gateau-de-mamie-1080x1920.mp4"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C9678] hover:bg-[#688264] text-[#FAF3E6] font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger MP4
            </a>
          </div>
        </div>
      </header>

      {/* Corps principal : Lecteur Live Canvas 9:16 à gauche + Studio & Livrables à droite */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* COLONNE GAUCHE : PRÉVISUALISATION LIVE CANVAS 2D (9:16) */}
        <section
          aria-label="Prévisualisation Live Canvas 2D"
          className="lg:col-span-5 flex flex-col items-center"
        >
          <div className="w-full max-w-[405px] bg-[#FAF4E8] border-2 border-[#C8B08E] rounded-2xl p-3 shadow-lg">
            {/* Barre d'état supérieure du lecteur */}
            <div className="flex items-center justify-between text-xs text-[#6E523D] mb-2 px-1">
              <span className="font-semibold flex items-center gap-1.5 text-[#3D2B1F]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                  }`}
                />
                Rendu JavaScript Temps Réel
              </span>
              <span className="font-mono">
                Frame {String(currentFrame).padStart(4, '0')}/{FILM_CONFIG.totalFrames} • Dessin #
                {drawingIndex}
              </span>
            </div>

            {/* Conteneur 9:16 strict pour le Canvas 1080x1920 */}
            <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden border border-[#B89D78] bg-[#F7EFE1] shadow-inner">
              <canvas
                id="film-canvas"
                ref={canvasRef}
                width={FILM_CONFIG.width}
                height={FILM_CONFIG.height}
                onClick={handleTogglePlay}
                title="Cliquer pour Lecture / Pause"
                className="w-full h-full object-contain block cursor-pointer"
              />

              {/* Badge de scène discret en haut du lecteur */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-md bg-[#3D2B1F]/80 text-[#FAF3E6] text-[11px] font-medium backdrop-blur-xs">
                  {activeScene.title}
                </span>
                <span className="px-2 py-1 rounded-md bg-[#3D2B1F]/80 text-[#FAF3E6] text-[11px] font-mono">
                  {currentSeconds}s / {totalSeconds}s
                </span>
              </div>
            </div>

            {/* Barre de progression interactive (Scrubber) avec repères des 10 scènes */}
            <div className="mt-3 px-1">
              <input
                type="range"
                aria-label="Barre de progression du film"
                min={0}
                max={FILM_CONFIG.totalFrames - 1}
                value={currentFrame}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrame(Number(e.target.value));
                }}
                className="w-full accent-[#C87D3B] cursor-pointer h-2 rounded-lg bg-[#E2D3BC]"
              />
              {/* Repères visuels des 10 scènes sous la barre */}
              <div className="grid grid-cols-10 gap-0.5 mt-1">
                {SCENES.map((s) => {
                  const isCurrent = s.id === activeScene.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame(s.startFrame);
                      }}
                      title={`${s.title} (${s.startTime}s - ${s.endTime}s)`}
                      className={`h-1.5 rounded-xs transition cursor-pointer ${
                        isCurrent
                          ? 'bg-[#C84B44]'
                          : 'bg-[#D4BFA0] hover:bg-[#B5956B]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Contrôles Lecture / Pause / Reprise / Redémarrage / Pas-à-pas */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3D2B1F] hover:bg-[#563E2E] text-[#FAF3E6] text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      {currentFrame > 0 && currentFrame < FILM_CONFIG.totalFrames - 1
                        ? 'Reprendre'
                        : 'Lecture'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  title="Redémarrer depuis le début (frame 0)"
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#EFE3CE] hover:bg-[#E3D2B4] text-[#3D2B1F] text-xs font-medium border border-[#CBB492] transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Début
                </button>
              </div>

              {/* Navigation image par image */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame((f) => Math.max(0, f - 1));
                  }}
                  title="Image précédente (-1 frame)"
                  className="p-2 rounded-lg bg-[#EFE3CE] hover:bg-[#E3D2B4] border border-[#CBB492] text-[#3D2B1F] transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame((f) => Math.min(FILM_CONFIG.totalFrames - 1, f + 1));
                  }}
                  title="Image suivante (+1 frame)"
                  className="p-2 rounded-lg bg-[#EFE3CE] hover:bg-[#E3D2B4] border border-[#CBB492] text-[#3D2B1F] transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  title={isMuted ? 'Activer le son' : 'Couper le son'}
                  className="p-2 rounded-lg bg-[#EFE3CE] hover:bg-[#E3D2B4] border border-[#CBB492] text-[#3D2B1F] transition cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-[#C84B44]" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#5E785A]" />
                  )}
                </button>
              </div>
            </div>

            {/* Outils de contrôle visuel : Zone de sécurité 9:16 & Pelure d'oignon */}
            <div className="mt-3 pt-2.5 border-t border-[#E2D3BC] flex flex-wrap items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={() => setShowSafeZone((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  showSafeZone
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-[#F3E9D8] text-[#5C4033] border-[#D4BFA0] hover:bg-[#E6D7BE]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Zone sûre 9:16
              </button>

              <button
                type="button"
                onClick={() => setShowOnionSkin((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  showOnionSkin
                    ? 'bg-[#C87D3B] text-white border-[#9B5D24]'
                    : 'bg-[#F3E9D8] text-[#5C4033] border-[#D4BFA0] hover:bg-[#E6D7BE]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Pelure d’oignon (f±2)
              </button>
            </div>
          </div>
        </section>

        {/* COLONNE DROITE : FEUILLE D'EXPOSITION DES 10 SCÈNES, BIBLE GRAPHIQUE & EXPORT MP4 */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Carte de la scène active */}
          <div className="bg-[#FAF4E8] border border-[#C8B08E] rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D49B54]/25 text-[#5C4033]">
                <Sparkles className="w-3.5 h-3.5 text-[#B57D47]" />
                Scène en cours ({activeScene.startTime.toFixed(1)}s – {activeScene.endTime.toFixed(1)}s)
              </span>
              <span className="text-xs font-mono text-[#6E523D]">
                Frame locale {localFrame + 1}/{sceneFrames} • Lieu :{' '}
                {activeScene.location === 'kitchen'
                  ? 'Cuisine de Mamie'
                  : activeScene.location === 'garden'
                  ? 'Jardin ensoleillé'
                  : 'Jardin → Cuisine'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#3D2B1F]">
              {activeScene.title}
            </h2>
            <p className="text-sm text-[#5C4033] mt-1 leading-relaxed">
              {activeScene.summary}
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeScene.keyDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F2E6D0]/75 border border-[#DCC7AA] text-xs text-[#4A3525] flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#688264] shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            {/* Raccourcis rapides vers les moments phares demandés */}
            <div className="mt-3 pt-3 border-t border-[#E2D3BC] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#6E523D]">Accès direct aux temps forts :</span>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrame(125);
                }}
                className="px-2.5 py-1 rounded-md bg-[#EFE3CE] hover:bg-[#E2D0B2] text-xs font-medium border border-[#CBB492] cursor-pointer"
              >
                • Casser les œufs & fouetter (Scène 2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrame(700);
                }}
                className="px-2.5 py-1 rounded-md bg-[#EFE3CE] hover:bg-[#E2D0B2] text-xs font-medium border border-[#CBB492] cursor-pointer"
              >
                • L’appel de Mamie (Scène 7)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(true);
                  setCurrentFrame(885);
                }}
                className="px-2.5 py-1 rounded-md bg-[#C84B44]/15 hover:bg-[#C84B44]/25 text-[#8F2D27] text-xs font-semibold border border-[#C84B44]/40 cursor-pointer"
              >
                ★ Pieds qui balancent sous la table (Scène 9)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(true);
                  setCurrentFrame(965);
                }}
                className="px-2.5 py-1 rounded-md bg-[#7C9678]/20 hover:bg-[#7C9678]/35 text-[#3F573C] text-xs font-semibold border border-[#7C9678] cursor-pointer"
              >
                ★ Découpe & service des parts (Scène 10)
              </button>
            </div>
          </div>

          {/* Barre d'onglets : 10 Scènes / Bible Graphique / Vidéo MP4 & Export */}
          <div className="flex border-b border-[#C8B08E] gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('scenes')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-t border-x transition cursor-pointer ${
                activeTab === 'scenes'
                  ? 'bg-[#FAF4E8] text-[#3D2B1F] border-[#C8B08E]'
                  : 'bg-[#EAE0CE] text-[#6E523D] border-transparent hover:bg-[#EFE5D4]'
              }`}
            >
              <Eye className="w-4 h-4" />
              Les 10 Scènes & Feuille d’Exposition
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bible')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-t border-x transition cursor-pointer ${
                activeTab === 'bible'
                  ? 'bg-[#FAF4E8] text-[#3D2B1F] border-[#C8B08E]'
                  : 'bg-[#EAE0CE] text-[#6E523D] border-transparent hover:bg-[#EFE5D4]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Bible Graphique & Continuité
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mp4')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-t border-x transition cursor-pointer ${
                activeTab === 'mp4'
                  ? 'bg-[#FAF4E8] text-[#3D2B1F] border-[#C8B08E]'
                  : 'bg-[#EAE0CE] text-[#6E523D] border-transparent hover:bg-[#EFE5D4]'
              }`}
            >
              <Film className="w-4 h-4" />
              Lecteur MP4 & Pipeline FFmpeg
            </button>
          </div>

          {/* CONTENU ONGLET 1 : LES 10 SCÈNES OBLIGATOIRES */}
          {activeTab === 'scenes' && (
            <div className="bg-[#FAF4E8] border border-[#C8B08E] rounded-b-2xl rounded-tr-2xl p-4 shadow-sm space-y-2.5 max-h-[540px] overflow-y-auto">
              {SCENES.map((scene) => {
                const isSelected = scene.id === activeScene.id;
                return (
                  <div
                    key={scene.id}
                    onClick={() => {
                      setCurrentFrame(scene.startFrame);
                      setIsPlaying(true);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#F3E5CC] border-[#C87D3B] shadow-xs'
                        : 'bg-[#FDF9F1] border-[#DFCBB0] hover:bg-[#F6EBDA]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-serif font-bold text-sm text-[#3D2B1F]">
                        {scene.title}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#E9DAC1] text-[#5C4033]">
                        {scene.startTime.toFixed(1)}s – {scene.endTime.toFixed(1)}s (Frames{' '}
                        {scene.startFrame}–{scene.endFrame})
                      </span>
                    </div>
                    <p className="text-xs text-[#5C4033] mt-1">{scene.summary}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* CONTENU ONGLET 2 : BIBLE GRAPHIQUE DES PERSONNAGES & ACCESSOIRES */}
          {activeTab === 'bible' && (
            <div className="bg-[#FAF4E8] border border-[#C8B08E] rounded-b-2xl rounded-tr-2xl p-4 shadow-sm space-y-4 max-h-[540px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CHARACTER_BIBLE.map((char) => (
                  <div
                    key={char.id}
                    className="p-3.5 rounded-xl bg-[#FDF9F1] border border-[#DFCBB0] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif font-bold text-base text-[#3D2B1F]">
                          {char.name}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFE3CE] text-[#5C4033]">
                          {char.age}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E523D] mt-0.5">{char.role}</p>
                      <p className="text-xs text-[#4A3525] mt-2">
                        <strong>Coiffure :</strong> {char.hairStyle}
                      </p>
                      <p className="text-xs text-[#4A3525] mt-1">
                        <strong>Proportions :</strong> {char.heightDescription}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#E6D7BE] flex flex-wrap gap-1.5">
                      {char.colors.map((c) => (
                        <span
                          key={c.label}
                          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#F2E6D0] border border-[#D4BFA0]"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F3E7D3] border border-[#D4BFA0]">
                <h4 className="font-serif font-bold text-sm text-[#3D2B1F] mb-2">
                  Continuité des Objets & Marge de Sécurité 9:16
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A3525]">
                  {PROP_BIBLE.map((prop) => (
                    <div key={prop.id} className="p-2 rounded-lg bg-[#FAF4E8] border border-[#DFCBB0]">
                      <strong>{prop.name}</strong> (Scènes {prop.scenesUsed.join(', ')}) :{' '}
                      {prop.description}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5C4033] mt-2 font-mono">
                  Zone sûre 9:16 garantie : Haut={SAFE_ZONE.top}px, Bas={SAFE_ZONE.bottom}px, Gauche=
                  {SAFE_ZONE.left}px, Droite={SAFE_ZONE.right}px → x∈[{SAFE_ZONE.xMin},{' '}
                  {SAFE_ZONE.xMax}], y∈[{SAFE_ZONE.yMin}, {SAFE_ZONE.yMax}].
                </p>
              </div>
            </div>
          )}

          {/* CONTENU ONGLET 3 : LECTEUR MP4 FINAL & COMMANDE D'EXPORT */}
          {activeTab === 'mp4' && (
            <div className="bg-[#FAF4E8] border border-[#C8B08E] rounded-b-2xl rounded-tr-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[250px] aspect-[9/16] rounded-xl overflow-hidden border-2 border-[#B89D78] bg-black shadow">
                    <video
                      src="./animation.mp4"
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    >
                      Votre navigateur ne supporte pas la lecture vidéo MP4.
                    </video>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <h3 className="font-serif font-bold text-base text-[#3D2B1F]">
                    Fichier MP4 Final & Pipeline Reproductible
                  </h3>
                  <p className="text-xs text-[#5C4033] leading-relaxed">
                    Chaque frame du fichier <code>animation.mp4</code> est rendue individuellement
                    par Chromium headless via l’API déterministe <code>window.drawFrame(frame)</code>{' '}
                    exposée par cet <code>index.html</code> racine, puis assemblée avec FFmpeg en
                    H.264 (<code>yuv420p</code>, <code>-movflags +faststart</code>) et vérifiée par
                    FFprobe.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#F2E6D0] border border-[#D4BFA0]">
                      <div className="text-[#6E523D]">Résolution & Format</div>
                      <div className="font-bold text-[#3D2B1F]">1080 × 1920 (9:16 vertical)</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F2E6D0] border border-[#D4BFA0]">
                      <div className="text-[#6E523D]">Cadence & Durée</div>
                      <div className="font-bold text-[#3D2B1F]">24 fps • 45,0 secondes (1080 frames)</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F2E6D0] border border-[#D4BFA0]">
                      <div className="text-[#6E523D]">Codec Vidéo</div>
                      <div className="font-bold text-[#3D2B1F]">H.264 (libx264, yuv420p)</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F2E6D0] border border-[#D4BFA0]">
                      <div className="text-[#6E523D]">Piste Audio</div>
                      <div className="font-bold text-[#3D2B1F]">AAC 48 kHz Stéréo synchronisée</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#2B1E16] text-[#FAF3E6] font-mono text-xs overflow-x-auto">
                    <div className="text-[#D49B54] mb-1">
                      # Relancer le rendu Chromium + assemblage FFmpeg :
                    </div>
                    <code>./scripts/export-video.sh index.html final/animation.mp4</code>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="./animation.mp4"
                      download="le-gateau-de-mamie-1080x1920.mp4"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C9678] hover:bg-[#688264] text-[#FAF3E6] text-xs font-semibold shadow-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger animation.mp4 (1080×1920)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
