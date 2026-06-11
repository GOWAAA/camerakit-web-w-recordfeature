# Project context for agents

This file is auto-loaded context for AI agents working in this repo. Keep it
short and current. For a deep reference on the Camera Kit Web SDK, see
`.claude/skills/camera-kit-web/SKILL.md`.

## What this project is

A web demo built on Snap's **Camera Kit Web SDK** (`@snap/camera-kit`) that
shows an AR lens over the user's camera and lets them **record, preview,
download, and share** a video of the result. Recording is done in the browser
with `MediaRecorder`, and the resulting file is post-processed with **ffmpeg
(WebAssembly)** to fix the video duration metadata.

The code is intentionally plain (vanilla JS + small manager classes, no
framework). Keep it that way: readable and easy for newcomers to change.

## How to run

- `npm install` — install dependencies.
- `npm run serve` — start the webpack dev server (HTTPS on port 9000). HTTPS is
  required because the camera/microphone APIs only work in a secure context.
- `npm run build` — production build into `build/`.

Camera Kit credentials are read from environment variables at build time
(`API_TOKEN`, `LENS_ID`, `GROUP_ID`). Copy `.env.example` to `.env` and fill in
real values. The webpack config injects these via `DefinePlugin`, so a rebuild
is needed after changing them.

There is **no test suite or linter** configured. Verify changes by building
(`npm run build`) and, when possible, running the app and exercising the
record → preview → download/share → back flow.

## Architecture (src/)

The entry point is `main.js`. It wires together a handful of single-purpose
manager classes:

- `main.js` — bootstraps Camera Kit, creates the session, sets the camera
  source, applies the lens, and wires up the record / switch / back buttons.
  Also contains the audio-capture monitoring used to record lens audio.
- `settings.js` — **single source of truth** for all configuration (camera,
  recording, ffmpeg, UI, remote API). Prefer adding a setting here over
  hard-coding values elsewhere.
- `camera.js` (`CameraManager`) — getUserMedia, front/back switching, and the
  constraints used for each camera.
- `recorder.js` (`MediaRecorderManager`) — mixes the audio streams, records the
  canvas via `MediaRecorder`, and hands the blob to the video processor.
- `videoProcessor.js` (`VideoProcessor`) — loads ffmpeg.wasm and rewrites the
  recording so its duration metadata is correct.
- `ui.js` (`UIManager`) — all DOM/visibility logic: button state, loading
  spinner, preview element, and the post-recording buttons.
- `remoteAPI.js` — optional bootstrap that lets a lens call back into the web
  app via Camera Kit's Remote API.
- `launchParams.js` — data passed to the lens at launch (see file for the
  matching Lens Studio code).
- `index.html` / `styles/index.v3.css` — markup and styles.

## Conventions

- Put configuration in `settings.js`, not inline.
- Keep DOM manipulation inside `UIManager`; keep session/recording logic in
  `main.js` and the relevant manager.
- Each DOM event should have a single handler. (For example, the back button is
  handled only in `main.js`, which calls `uiManager.returnToCameraView()`.)
- Match the existing style: small classes, plain JS, descriptive names, minimal
  comments that explain *why* rather than *what*.

## Gotchas

- **Render targets:** a session has two canvas outputs, `live` and `capture`.
  This demo normally records the `live` canvas. Setting
  `Settings.recording.recordCaptureRenderTarget = true` records the `capture`
  canvas instead, which is why `main.js` swaps which canvas is visible and calls
  `session.play("capture")`. See the skill for details.
- **COOP/COEP headers:** ffmpeg.wasm needs `Cross-Origin-Opener-Policy` and
  `Cross-Origin-Embedder-Policy` headers (set in `webpack.config.js` dev server
  and `vercel.json` for production). Don't remove them.
- **Audio capture:** `main.js` patches `window.AudioContext` and
  `AudioNode.prototype.connect` to tap the lens's audio graph so lens sounds can
  be recorded. It's unusual but deliberate — understand it before touching it.
