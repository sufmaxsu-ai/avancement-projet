#!/usr/bin/env bash
# ==============================================================================
# scripts/export-video.sh — Pipeline d'export « Le Gâteau de Mamie »
#
# Usage principal :
#   ./scripts/export-video.sh index.html final/animation.mp4
#
# Supporte également :
#   - Encodage direct d'une séquence PNG/JPEG existante :
#       ./scripts/export-video.sh frames_raw_tmp/%05d.png final/animation.mp4
#   - Formats de sortie MP4 (.mp4), WebM (.webm) ou MOV (.mov)
#   - Options : --format <mp4|webm|mov> --ext <png|jpg> --keep-frames
# ==============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

FPS=24
DURATION="45.0"
TOTAL_FRAMES=1080
WIDTH=1080
HEIGHT=1920
FRAME_EXT="jpg"
KEEP_FRAMES=0
FORCED_FORMAT=""

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --format)
      FORCED_FORMAT="$2"
      shift 2
      ;;
    --ext)
      FRAME_EXT="$2"
      shift 2
      ;;
    --keep-frames)
      KEEP_FRAMES=1
      shift
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

INPUT_SOURCE="${POSITIONAL[0]:-index.html}"
OUTPUT_FILE="${POSITIONAL[1]:-final/animation.mp4}"

echo "=================================================================="
echo " EXPORT VIDÉO — « LE GÂTEAU DE MAMIE »"
echo " Durée retenue : ${DURATION}s (${TOTAL_FRAMES} frames à ${FPS} fps)"
echo " Format        : ${WIDTH}x${HEIGHT} (9:16 vertical)"
echo " Entrée        : ${INPUT_SOURCE}"
echo " Sortie        : ${OUTPUT_FILE}"
echo "=================================================================="

# 1. Vérification des dépendances
echo "[étape 1/6] Vérification des dépendances..."
for cmd in node npm ffmpeg ffprobe; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERREUR : La commande requise '$cmd' est introuvable." >&2
    exit 1
  fi
done
echo "  -> node $(node -v), npm $(npm -v)"
echo "  -> $(ffmpeg -version | head -n 1)"
echo "  -> $(ffprobe -version | head -n 1)"

mkdir -p "$(dirname "$OUTPUT_FILE")"
mkdir -p public final

# 2. Génération de la piste sonore synchronisée 48 kHz
AUDIO_WAV="final/soundtrack.wav"
echo "[étape 2/6] Génération de la piste audio synchronisée (${DURATION}s, 48 kHz)..."
echo "  $ node scripts/generate-audio.mjs ${AUDIO_WAV}"
node scripts/generate-audio.mjs "$AUDIO_WAV"

# 3. Obtention des frames (soit via Chromium depuis index.html, soit depuis une séquence PNG/JPG)
FRAMES_DIR="frames_raw_tmp"
VITE_PID=""

cleanup() {
  if [[ -n "$VITE_PID" ]]; then
    pkill -9 -P "$VITE_PID" 2>/dev/null || true
    kill -9 "$VITE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if [[ "$INPUT_SOURCE" == *.html ]] || [[ "$INPUT_SOURCE" == http* ]]; then
  if [[ "$INPUT_SOURCE" == *.html ]] && [[ ! -f "$INPUT_SOURCE" ]]; then
    echo "ERREUR : Fichier HTML introuvable : $INPUT_SOURCE" >&2
    exit 1
  fi

  rm -rf "$FRAMES_DIR"
  mkdir -p "$FRAMES_DIR"

  SERVER_URL="$INPUT_SOURCE"
  if [[ "$INPUT_SOURCE" == *.html ]]; then
    PORT=4179
    echo "[étape 3/6] Démarrage du serveur Vite local sur le port ${PORT}..."
    echo "  $ npx vite --host 127.0.0.1 --port ${PORT} --strictPort"
    npx vite --host 127.0.0.1 --port "$PORT" --strictPort </dev/null >/tmp/vite_export.log 2>&1 &
    VITE_PID=$!

    # Attente active que le serveur Vite réponde
    READY=0
    for _ in $(seq 1 40); do
      if curl -s "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
        READY=1
        break
      fi
      sleep 0.25
    done
    if [[ "$READY" -ne 1 ]]; then
      echo "ERREUR : Le serveur Vite n'a pas démarré à temps." >&2
      cat /tmp/vite_export.log >&2 || true
      exit 1
    fi
    SERVER_URL="http://127.0.0.1:${PORT}/?export=1"
  fi

  echo "[étape 4/6] Rendu individuel des ${TOTAL_FRAMES} frames avec Chromium headless..."
  echo "  $ node scripts/render-frames.mjs \"${SERVER_URL}\" \"${FRAMES_DIR}\" \"${FRAME_EXT}\""
  node scripts/render-frames.mjs "$SERVER_URL" "$FRAMES_DIR" "$FRAME_EXT"

  if [[ -n "$VITE_PID" ]]; then
    pkill -9 -P "$VITE_PID" 2>/dev/null || true
    kill -9 "$VITE_PID" 2>/dev/null || true
    VITE_PID=""
  fi

  INPUT_PATTERN="${FRAMES_DIR}/%05d.${FRAME_EXT}"
else
  echo "[étape 3-4/6] Utilisation de la séquence d'images fournie : ${INPUT_SOURCE}"
  if [[ -d "$INPUT_SOURCE" ]]; then
    if ls "$INPUT_SOURCE"/*.png >/dev/null 2>&1; then
      FRAME_EXT="png"
    else
      FRAME_EXT="jpg"
    fi
    INPUT_PATTERN="${INPUT_SOURCE}/%05d.${FRAME_EXT}"
    FRAMES_DIR="$INPUT_SOURCE"
  else
    INPUT_PATTERN="$INPUT_SOURCE"
    FRAMES_DIR="$(dirname "$INPUT_SOURCE")"
  fi
fi

# Vérification du nombre d'images produites
COUNT_FRAMES=$(find "$FRAMES_DIR" -maxdepth 1 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | wc -l | tr -d ' ')
echo "  -> Nombre de frames vérifiées dans ${FRAMES_DIR} : ${COUNT_FRAMES} (attendu : ${TOTAL_FRAMES})"
if [[ "$COUNT_FRAMES" -lt "$TOTAL_FRAMES" ]]; then
  echo "ERREUR : Nombre de frames insuffisant (${COUNT_FRAMES} < ${TOTAL_FRAMES})." >&2
  exit 1
fi

# 5. Assemblage vidéo avec FFmpeg selon le format (mp4, webm, mov)
EXT_OUT="${FORCED_FORMAT:-${OUTPUT_FILE##*.}}"
EXT_OUT="$(echo "$EXT_OUT" | tr '[:upper:]' '[:lower:]')"

echo "[étape 5/6] Assemblage vidéo FFmpeg (format: ${EXT_OUT})..."
rm -f "$OUTPUT_FILE"

if [[ "$EXT_OUT" == "webm" ]]; then
  CMD=(
    ffmpeg -y
    -framerate "$FPS"
    -i "$INPUT_PATTERN"
    -i "$AUDIO_WAV"
    -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 4M -crf 24
    -c:a libopus -b:a 160k -ar 48000
    -t "$DURATION"
    "$OUTPUT_FILE"
  )
elif [[ "$EXT_OUT" == "mov" ]]; then
  CMD=(
    ffmpeg -y
    -framerate "$FPS"
    -i "$INPUT_PATTERN"
    -i "$AUDIO_WAV"
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium
    -c:a aac -b:a 192k -ar 48000
    -movflags +faststart
    -t "$DURATION"
    "$OUTPUT_FILE"
  )
else
  CMD=(
    ffmpeg -y
    -framerate "$FPS"
    -i "$INPUT_PATTERN"
    -i "$AUDIO_WAV"
    -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset medium
    -vf "scale=${WIDTH}:${HEIGHT}:flags=lanczos"
    -r "$FPS"
    -c:a aac -b:a 192k -ar 48000
    -movflags +faststart
    -t "$DURATION"
    "$OUTPUT_FILE"
  )
fi

echo "  $ ${CMD[*]}"
"${CMD[@]}"

# Copie automatique dans public/animation.mp4 pour la livraison autonome à côté d'index.html
if [[ "$EXT_OUT" == "mp4" ]]; then
  cp -f "$OUTPUT_FILE" "public/animation.mp4"
  echo "  -> Copie synchronisée dans public/animation.mp4"
fi

# 6. Vérification stricte avec FFprobe
echo "[étape 6/6] Contrôle qualité du fichier généré avec FFprobe..."
if [[ ! -s "$OUTPUT_FILE" ]]; then
  echo "ERREUR : Le fichier de sortie $OUTPUT_FILE est vide ou absent !" >&2
  exit 1
fi

PROBE_JSON=$(ffprobe -v error -show_format -show_streams -of json "$OUTPUT_FILE")
echo "$PROBE_JSON" > "final/ffprobe_report.json"

python3 - "$OUTPUT_FILE" "$WIDTH" "$HEIGHT" "$FPS" "$DURATION" << 'PYEOF'
import json, subprocess, sys

video_path, exp_w, exp_h, exp_fps, exp_dur = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5])
raw = subprocess.check_output([
    "ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", video_path
]).decode("utf-8")
data = json.loads(raw)

streams = data.get("streams", [])
v_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
a_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)

if not v_stream:
    print("ERREUR FFprobe : Aucun flux vidéo trouvé !", file=sys.stderr)
    sys.exit(1)

w = int(v_stream.get("width", 0))
h = int(v_stream.get("height", 0))
codec = v_stream.get("codec_name", "")
pix_fmt = v_stream.get("pix_fmt", "")
nb_frames = int(v_stream.get("nb_frames", 0) or round(float(data["format"]["duration"]) * exp_fps))
dur = float(data["format"].get("duration", 0))
size_kb = int(data["format"].get("size", 0)) / 1024.0

print(f"  -> Vidéo   : codec={codec}, résolution={w}x{h}, pix_fmt={pix_fmt}, frames={nb_frames}, durée={dur:.2f}s, taille={size_kb:.1f} Ko")
if a_stream:
    print(f"  -> Audio   : codec={a_stream.get('codec_name')}, sample_rate={a_stream.get('sample_rate')} Hz, channels={a_stream.get('channels')}")

if w != exp_w or h != exp_h:
    print(f"ERREUR : Résolution {w}x{h} != attendu {exp_w}x{exp_h}", file=sys.stderr)
    sys.exit(1)

if abs(dur - exp_dur) > 0.25:
    print(f"ERREUR : Durée {dur}s != attendu {exp_dur}s", file=sys.stderr)
    sys.exit(1)

print("  -> Validation FFprobe RÉUSSIE.")
PYEOF

echo "=================================================================="
echo " EXPORT TERMINÉ AVEC SUCCÈS : ${OUTPUT_FILE}"
echo "=================================================================="
