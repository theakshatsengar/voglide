vo/glide

Local-first macOS desktop app that records mic audio, transcribes it with mlx-whisper, and shows the transcript.

Quick start

1) Backend
- cd backend
- python3 -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
- python run_transcription.py
	(press Enter to stop recording)

2) Desktop
- cd desktop
- npm install
- npm run dev
- Click Start Recording, then Stop Recording to transcribe.

Notes
- The Electron app spawns the Python recorder and waits for Stop to transcribe.
- Language detection is automatic with English and Hindi fallback.

Packaging
- Build the backend binary with: npm run backend:dist
- Build the Electron app with: npm run electron:dist
