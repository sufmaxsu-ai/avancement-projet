#!/usr/bin/env bash
# ==============================================================================
# scripts/export-video.sh — Pipeline Autonome d'Export Vidéo 2D Image par Image
# ==============================================================================
# Prend en charge 3 types de sources :
#   A. Source HTML/JavaScript (ex: index.html) :
#      Lance automatiquement le serveur Vite si nécessaire, ouvre l'index.html
#      racine dans Chromium headless (Playwright), appelle window.drawFrame(i)
#      pour capturer chaque frame PNG individuellement, puis assemble avec FFmpeg.
#   B. Séquence d'images PNG/JPEG numérotées (ex: build/frames ou build/frames/%05d.png) :
#      Encode directement la séquence d'images avec FFmpeg.
#   C. Vidéo existante (ex: final/animation.mp4 -> final/animation.webm) :
#      Convertit ou réencode la vidéo avec FFmpeg.
#
# Exemples :
#   ./scripts/export-video.sh index.html final/animation.mp4
#   ./scripts/export-video.sh build/frames final/animation.mp4
#   ./scripts/export-video.sh final/animation.mp4 final/animation.webm
# ==============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FPS=24
FORMAT=""
FRAMES_DIR="${PROJECT_ROOT}/build/frames"
AUDIO_WAV="${PROJECT_ROOT}/build/audio/soundtrack.wav"
VITE_PID=""

cleanup() {
  if [[ -n "${VITE_PID}" ]] && kill -0 "${VITE_PID}" 2>/dev/null; then
    echo "[export-video] Arrêt du serveur Vite temporaire (PID ${VITE_PID})..."
    kill "${VITE_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

usage() {
  cat << 'EOF'
Usage :
  ./scripts/export-video.sh <source> <destination> [--fps 24] [--format mp4|webm|mov]

Arguments :
  <source>       Fichier HTML/JS (ex: index.html), dossier/motif PNG (ex: build/frames
                 ou build/frames/%05d.png), ou fichier vidéo existant (.mp4, .webm, .mov).
  <destination>  Chemin du fichier vidéo à produire (ex: final/animation.mp4).

Options :
  --fps <n>      Cadence d'images par seconde (défaut : 24)
  --format <fmt> Forcer le format de sortie : mp4, webm ou mov (déduit de l'extension par défaut)
  -h, --help     Afficher cette aide et des exemples de commandes FFmpeg directes

Exemple FFmpeg direct pour une séquence PNG :
  ffmpeg -framerate 24 -i frames/%05d.png \
    -c:v libx264 -pix_fmt yuv420p -crf 18 \
    -movflags +faststart animation.mp4
EOF
}

if [[ $# -lt 1 ]] || [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 2 ]]; then
  echo "[Erreur] Vous devez spécifier une <source> et une <destination>." >&2
  usage
  exit 1
fi

SOURCE_ARG="$1"
DEST_ARG="$2"
shift 2

while [[ $# -gt 0 ]]; do
  case "$1" in
    --fps)
      FPS="${2:-24}"
      shift 2
      ;;
    --format)
      FORMAT="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[Erreur] Option inconnue : $1" >&2
      usage
      exit 1
      ;;
  esac
done

# 1. Vérification des dépendances
command -v ffmpeg >/dev/null 2>&1 || { echo "[Erreur] ffmpeg n'est pas installé." >&2; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "[Erreur] ffprobe n'est pas installé." >&2; exit 1; }

# 2. Déduction du format de sortie (mp4, webm, mov)
if [[ -z "${FORMAT}" ]]; then
  EXT="${DEST_ARG##*.}"
  FORMAT="$(echo "${EXT}" | tr '[:upper:]' '[:lower:]')"
fi

case "${FORMAT}" in
  mp4|webm|mov) ;;
  *)
    echo "[Erreur] Format de sortie non supporté : '${FORMAT}'. Utilisez .mp4, .webm ou .mov." >&2
    exit 1
    ;;
esac

mkdir -p "$(dirname "${DEST_ARG}")"

# Helper d'exécution affichant clairement chaque commande
run_cmd() {
  echo "+ $*"
  "$@"
}

# Helper de sélection des arguments d'encodage FFmpeg selon le format cible
encode_from_sequence() {
  local seq_pattern="$1"
  local dest_file="$2"
  local audio_inputs=()
  local audio_map=()

  if [[ -f "${AUDIO_WAV}" ]]; then
    audio_inputs=(-i "${AUDIO_WAV}")
  fi

  if [[ "${FORMAT}" == "mp4" ]]; then
    if [[ -f "${AUDIO_WAV}" ]]; then
      run_cmd ffmpeg -y -framerate "${FPS}" -i "${seq_pattern}" "${audio_inputs[@]}" \
        -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
        -r "${FPS}" -vsync cfr \
        -c:a aac -b:a 192k -ar 48000 -ac 2 \
        -movflags +faststart -shortest "${dest_file}"
    else
      run_cmd ffmpeg -y -framerate "${FPS}" -i "${seq_pattern}" \
        -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
        -r "${FPS}" -vsync cfr \
        -movflags +faststart "${dest_file}"
    fi
  elif [[ "${FORMAT}" == "webm" ]]; then
    if [[ -f "${AUDIO_WAV}" ]]; then
      run_cmd ffmpeg -y -framerate "${FPS}" -i "${seq_pattern}" "${audio_inputs[@]}" \
        -c:v libvpx-vp9 -b:v 0 -crf 24 -pix_fmt yuv420p \
        -r "${FPS}" \
        -c:a libopus -b:a 160k -ar 48000 \
        -shortest "${dest_file}"
    else
      run_cmd ffmpeg -y -framerate "${FPS}" -i "${seq_pattern}" \
        -c:v libvpx-vp9 -b:v 0 -crf 24 -pix_fmt yuv420p \
        -r "${FPS}" "${dest_file}"
    fi
  elif [[ "${FORMAT}" == "mov" ]]; then
    if [[ -f "${AUDIO_WAV}" ]]; then
      run_cmd ffmpeg -y -framerate "${FPS}" -i "${seq_pattern}" "${audio_inputs[@]}" \
        -c:v libx264 -crf 18 -pix_fmt yuv420p \
        -r "${FPS}" \
        -c:a aac -b:a 192k -ar 48000 -ac 2 \
        -movflags +faststart -shortest "${dest_file}"
    else
      run_cmd ffmpeg -y -framerate "${FPS}" -i "${seq_pattern}" \
        -c:v libx264 -crf 18 -pix_fmt yuv420p \
        -r "${FPS}" \
        -movflags +faststart "${dest_file}"
    fi
  fi
}

# ==============================================================================
# Détection automatique du type de source : A (HTML/JS), B (Séquence PNG/JPG), C (Vidéo)
# ==============================================================================
SOURCE_LOWER="$(echo "${SOURCE_ARG}" | tr '[:upper:]' '[:lower:]')"

if [[ "${SOURCE_LOWER}" == *.html ]] || [[ "${SOURCE_LOWER}" == *.htm ]] || [[ "${SOURCE_LOWER}" == *.ts ]] || [[ "${SOURCE_LOWER}" == *.tsx ]] || [[ "${SOURCE_LOWER}" == *.js ]] || [[ "${SOURCE_LOWER}" == http://* ]] || [[ "${SOURCE_LOWER}" == https://* ]]; then
  echo "=============================================================================="
  echo "[Mode A] Source HTML/JavaScript détectée : ${SOURCE_ARG}"
  echo "Étape 1/3 : Synthèse de la piste sonore stéréo 48 kHz synchronisée"
  echo "=============================================================================="
  command -v node >/dev/null 2>&1 || { echo "[Erreur] node n'est pas installé." >&2; exit 1; }
  run_cmd node "${PROJECT_ROOT}/scripts/generate-audio.mjs" "${AUDIO_WAV}"

  echo "=============================================================================="
  echo "Étape 2/3 : Rendu individuel des 144 frames dans Chromium headless (Playwright)"
  echo "=============================================================================="
  RENDER_URL=""
  if [[ "${SOURCE_LOWER}" == http://* ]] || [[ "${SOURCE_LOWER}" == https://* ]]; then
    RENDER_URL="${SOURCE_ARG}"
  else
    # Vérifie si un serveur Vite écoute déjà sur 5173, sinon en démarre un
    PORT=5173
    if ! (echo > /dev/tcp/127.0.0.1/${PORT}) >/dev/null 2>&1; then
      PORT=4173
      if ! (echo > /dev/tcp/127.0.0.1/${PORT}) >/dev/null 2>&1; then
        PORT=5179
        echo "[export-video] Lancement automatique du serveur Vite sur http://127.0.0.1:${PORT} ..."
        (cd "${PROJECT_ROOT}" && npx vite --host 127.0.0.1 --port "${PORT}" --strictPort >/tmp/vite_export.log 2>&1) &
        VITE_PID=$!
        for _ in {1..30}; do
          if (echo > /dev/tcp/127.0.0.1/${PORT}) >/dev/null 2>&1; then
            break
          fi
          sleep 0.3
        done
      fi
    fi
    RENDER_URL="http://127.0.0.1:${PORT}/?render=1"
  fi

  run_cmd node "${PROJECT_ROOT}/scripts/render-frames.mjs" "${RENDER_URL}" "${FRAMES_DIR}"

  echo "=============================================================================="
  echo "Étape 3/3 : Assemblage FFmpeg -> ${DEST_ARG}"
  echo "=============================================================================="
  encode_from_sequence "${FRAMES_DIR}/%05d.png" "${DEST_ARG}"

elif [[ -d "${SOURCE_ARG}" ]] || [[ "${SOURCE_ARG}" == *"%0"* ]] || [[ "${SOURCE_LOWER}" == *.png ]] || [[ "${SOURCE_LOWER}" == *.jpg ]] || [[ "${SOURCE_LOWER}" == *.jpeg ]]; then
  echo "=============================================================================="
  echo "[Mode B] Séquence d'images détectée : ${SOURCE_ARG}"
  echo "=============================================================================="
  SEQ_PATTERN="${SOURCE_ARG}"
  if [[ -d "${SOURCE_ARG}" ]]; then
    if compgen -G "${SOURCE_ARG}/*.png" > /dev/null; then
      SEQ_PATTERN="${SOURCE_ARG%/}/%05d.png"
    elif compgen -G "${SOURCE_ARG}/*.jpg" > /dev/null; then
      SEQ_PATTERN="${SOURCE_ARG%/}/%05d.jpg"
    else
      echo "[Erreur] Aucune image PNG ou JPG trouvée dans le dossier ${SOURCE_ARG}." >&2
      exit 1
    fi
  fi
  encode_from_sequence "${SEQ_PATTERN}" "${DEST_ARG}"

elif [[ -f "${SOURCE_ARG}" ]]; then
  echo "=============================================================================="
  echo "[Mode C] Fichier vidéo existant détecté : ${SOURCE_ARG} -> ${DEST_ARG}"
  echo "=============================================================================="
  if [[ "${FORMAT}" == "mp4" ]]; then
    run_cmd ffmpeg -y -i "${SOURCE_ARG}" \
      -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
      -r "${FPS}" \
      -c:a aac -b:a 192k -ar 48000 \
      -movflags +faststart "${DEST_ARG}"
  elif [[ "${FORMAT}" == "webm" ]]; then
    run_cmd ffmpeg -y -i "${SOURCE_ARG}" \
      -c:v libvpx-vp9 -b:v 0 -crf 24 -pix_fmt yuv420p \
      -r "${FPS}" \
      -c:a libopus -b:a 160k -ar 48000 "${DEST_ARG}"
  elif [[ "${FORMAT}" == "mov" ]]; then
    run_cmd ffmpeg -y -i "${SOURCE_ARG}" \
      -c:v libx264 -crf 18 -pix_fmt yuv420p \
      -r "${FPS}" \
      -c:a aac -b:a 192k -ar 48000 \
      -movflags +faststart "${DEST_ARG}"
  fi
else
  echo "[Erreur] Source introuvable ou non reconnue : ${SOURCE_ARG}" >&2
  exit 1
fi

echo "=============================================================================="
echo "[Succès] Vidéo générée et vérifiée avec ffprobe : ${DEST_ARG}"
echo "=============================================================================="
run_cmd ffprobe -v error -show_entries format=filename,duration,size,bit_rate -show_entries stream=index,codec_name,codec_type,width,height,pix_fmt,r_frame_rate,sample_rate,channels -of default=noprint_wrappers=1 "${DEST_ARG}"
