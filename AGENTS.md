# Agent & contributor guide

Guidance for anyone — human or AI coding agent (Claude, Cursor, Copilot, Codex,
etc.) — working in this repo. It is intentionally tool-agnostic. `CLAUDE.md`
simply points here so Claude-based tools read the same instructions.

Deep references live in `docs/`:

- [`docs/camera-kit-web.md`](docs/camera-kit-web.md) — the Snap Camera Kit Web
  SDK (`@snap/camera-kit`) API and usage.
- [`docs/audio-capture.md`](docs/audio-capture.md) — the custom recording and
  audio-capture mechanism (**not** part of Camera Kit, and the trickiest code
  here). Read it before touching the audio path.

## What this project is

A web demo built on Snap's **Camera Kit Web SDK** that shows an AR lens over the
user's camera and lets them **record, preview, download, and share** a video of
the result. Recording is done in the browser with `MediaRecorder`, and the
output is post-processed with **ffmpeg (WebAssembly)** to fix the video duration
metadata.

The code is intentionally plain — vanilla JS with a few small manager classes,
no framework. Keep it that way: readable and easy for newcomers to change.

## How to run

- `npm install` — install dependencies.
- `npm run serve` — webpack dev server (HTTPS on port 9000). HTTPS is required
  because the camera/microphone APIs only work in a secure context.
- `npm run build` — production build into `build/`.

Camera Kit credentials are read from environment variables at build time
(`API_TOKEN`, `LENS_ID`, `GROUP_ID`). Copy `.env.example` to `.env` and fill in
real values from the Camera Kit Portal. Webpack injects them via `DefinePlugin`,
so rebuild after changing them.

There is **no test suite or linter** configured. Verify changes by building
(`npm run build`) and, when possible, running the app and exercising the
record → preview → download/share → back flow.

## Architecture (`src/`)

Entry point is `main.js`, which wires together single-purpose manager classes:

- `main.js` — bootstraps Camera Kit, creates the session, sets the camera
  source, applies the lens, and wires the record / switch / back buttons. Also
  installs the audio-capture monitoring (see `docs/audio-capture.md`).
- `settings.js` — **single source of truth** for configuration (camera,
  recording, ffmpeg, UI, remote API). Add settings here instead of hard-coding.
- `camera.js` (`CameraManager`) — getUserMedia, front/back switching, and the
  constraints for each camera.
- `recorder.js` (`MediaRecorderManager`) — mixes audio streams, records the
  canvas via `MediaRecorder`, hands the blob to the video processor.
- `videoProcessor.js` (`VideoProcessor`) — loads ffmpeg.wasm and rewrites the
  recording so its duration metadata is correct.
- `ui.js` (`UIManager`) — all DOM/visibility logic: button state, loading
  spinner, preview element, post-recording buttons.
- `remoteAPI.js` — optional bootstrap that lets a lens call back into the web app
  via Camera Kit's Remote API.
- `launchParams.js` — data passed to the lens at launch (see file for the
  matching Lens Studio code).
- `index.html` / `styles/index.v3.css` — markup and styles.

## Conventions

- Put configuration in `settings.js`, not inline.
- Keep DOM manipulation inside `UIManager`; keep session/recording logic in
  `main.js` and the relevant manager.
- Each DOM event should have a single handler. (For example, the back button is
  handled only in `main.js`, which calls `uiManager.returnToCameraView()`.)
- Match the existing style: small classes, plain JS, descriptive names, and
  comments that explain *why* rather than *what*.
- When unsure about the Camera Kit API, trust the installed type definitions in
  `node_modules/@snap/camera-kit/dist/*.d.ts` over any online docs — they match
  the version actually running.

## Gotchas

- **Render targets:** a session has two canvas outputs, `live` and `capture`.
  This demo records `live` by default; `recordCaptureRenderTarget = true` records
  `capture`, which is why `main.js` swaps the visible canvas and calls
  `session.play("capture")`. See `docs/camera-kit-web.md`.
- **Audio capture is custom and fragile.** `main.js` patches `AudioContext` and
  `AudioNode.prototype.connect` to tap lens audio. Read `docs/audio-capture.md`
  before changing it.
- **COOP/COEP headers** are required by ffmpeg.wasm (set in `webpack.config.js`
  dev server and `vercel.json` for production). Don't remove them.
