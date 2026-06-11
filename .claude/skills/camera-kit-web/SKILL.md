---
name: camera-kit-web
description: >-
  Reference for this repo's camera/lens/recording stack. Covers Snap's Camera Kit
  Web SDK (@snap/camera-kit) — bootstrap, session, camera source, applying AR
  lenses, live vs capture render targets, Remote API, launch params — and the
  custom in-browser audio capture + recording mechanism (AudioContext patching,
  stream mixing, MediaRecorder, ffmpeg.wasm). Use when working on @snap/camera-kit
  or the recording/audio code in main.js, recorder.js, or videoProcessor.js.
---

# Camera Kit Web + audio capture

The canonical references for this repo are plain Markdown so any agent or
developer can read them, not just Claude:

- **Camera Kit Web SDK:** [`docs/camera-kit-web.md`](../../../docs/camera-kit-web.md)
  — bootstrap → session → source → lens → play, the API surface, live vs capture
  render targets, error handling, sources/transforms, lens loading, Remote API,
  and launch params.
- **Audio capture & recording:** [`docs/audio-capture.md`](../../../docs/audio-capture.md)
  — how lens audio and mic are captured by patching the Web Audio API, mixed, and
  encoded with `MediaRecorder` + ffmpeg.wasm. This is the custom, non-SDK part.

For project-wide setup, architecture, and conventions, see
[`AGENTS.md`](../../../AGENTS.md).

When the installed SDK and online docs disagree, trust the type definitions in
`node_modules/@snap/camera-kit/dist/*.d.ts` — they match the running version.
