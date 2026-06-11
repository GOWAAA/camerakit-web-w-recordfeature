# Audio capture & recording

> Audience: any coding agent or developer working on this repo. This is the
> trickiest part of the codebase. Read it before changing anything in
> `main.js`'s audio functions or in `recorder.js`.

This document explains how the app records a video of the lens **with sound**.
None of this is part of the Camera Kit SDK — Camera Kit only renders to
`<canvas>` and plays lens audio through the speakers. To record, this repo
captures the canvas as video and reconstructs the audio from the Web Audio
graph, then mixes and encodes everything itself.

## The problem

Two kinds of audio need to end up in the recording:

1. **Microphone** — the person's voice. Easy: `getUserMedia({ audio: true })`.
2. **Lens audio** — sounds the lens itself plays. Hard: Camera Kit plays these
   through the Web Audio API straight to the speakers and gives us **no handle**
   to record them.

The trick for (2) is to intercept the Web Audio API so that whenever any audio
is routed to the speakers, we also route a copy into a recordable
`MediaStream`.

## How lens audio is intercepted (`main.js`)

Two global patches are installed at the very top of `main.js`, **before**
`bootstrapCameraKit` runs, so they are in place before the lens builds its audio
graph. Order matters: if these ran after the lens created its audio nodes, the
taps would miss that audio.

### 1. `setupAudioContextMonitor()`

Replaces `window.AudioContext` / `window.webkitAudioContext` with a wrapper that
constructs the real context but also records every `AudioContext` that anyone
(including the lens) creates, into the module-level `audioContexts` array.

### 2. `setupAudioNodeMonitor()`

Replaces `AudioNode.prototype.connect`. Every time any node connects to the real
speaker output (`AudioDestinationNode`, i.e. `context.destination`), the wrapper:

1. creates a `MediaStreamAudioDestinationNode` ("monitor node"),
2. connects the same source node to it (so it receives a copy of the audio),
3. stores it in the module-level `monitorNodes` array,
4. then calls the original `connect` so normal playback still happens.

Each monitor node exposes a `.stream` (a `MediaStream`) carrying a copy of the
audio that was heading to the speakers — that is the lens audio, now recordable.

> Why no feedback loop: the check is specifically for `AudioDestinationNode`
> (the speakers). A `MediaStreamAudioDestinationNode` is a different type, so
> connecting sources into our monitor nodes (or into the mixer below) does not
> get re-tapped.

### `waitForMonitorNodes()`

A lens may build its audio graph asynchronously, so the taps don't all exist the
instant recording starts. Before assembling streams, the app polls for up to
**1 second** (`maxWait`), every 100 ms, until each monitor node has a `.stream`.
If some never appear it logs a warning and continues with what it has.

## Assembling the streams to record (`main.js` → `setupAudioStreams`)

When the user starts a recording:

1. `waitForMonitorNodes()` — wait for the lens taps to be ready.
2. Reset `monitoredStreams = []`. **This reset is required** — the array is
   module-level, so without it a second recording would re-add the first
   recording's streams and mix in duplicate/stale audio.
3. If `Settings.recording.recordMicAudio`: stop any mic stream left open by a
   previous recording, then `getUserMedia({ audio: true })` and add it.
4. If `Settings.recording.recordLensAudio`: add each monitor node's `.stream`.
5. Construct a `MediaRecorderManager` with the collected streams.

## Mixing and encoding (`recorder.js`)

`MediaRecorderManager` combines everything into one recording:

- **Mix audio:** create a fresh `AudioContext` and a
  `MediaStreamAudioDestinationNode` (`mixDestination`). Each input stream becomes
  a `MediaStreamSource` connected into `mixDestination`, so all mics + lens taps
  are summed into a single audio track.
- **Capture video:** `session.output.live.captureStream(fps)` (or `.capture`
  when `recordCaptureRenderTarget` is set) yields the rendered canvas as a video
  `MediaStream`.
- **Record:** build a new `MediaStream` from the canvas video track + the mixed
  audio track, and feed it to a `MediaRecorder` using the bitrate/mime settings
  from `settings.js`.
- **On stop:** assemble the chunks into a `Blob`, hand it to `VideoProcessor`
  (ffmpeg.wasm) to fix the duration metadata, then show the result via
  `UIManager`.

`resetRecordingVariables()` stops the canvas/AV stream tracks and clears the
recorder state when the user taps back.

## Settings that control this (`settings.js`)

```js
recording: {
  recordMicAudio: true,            // include the microphone
  recordLensAudio: true,           // include sounds the lens plays
  recordCaptureRenderTarget: false,// record the "capture" canvas instead of "live"
  mimeType: "video/mp4",
  fps: 60,
  recordVideoBitsPerSecond: 6000000,
  recordAudioBitsPerSecond: 128000,
  outputFileName: "recording.mp4",
}
```

## Constraints & gotchas

- **Install the patches early.** They must run before the lens creates its audio
  graph (i.e. before `bootstrapCameraKit`). Keep them at the top of `main.js`.
- **The patches are global and permanent.** Overriding `AudioContext` and
  `AudioNode.prototype.connect` affects *all* audio on the page, not just the
  lens. Be deliberate; install them once.
- **Only Web Audio routed to `context.destination` is captured.** Audio played
  through `<audio>`/`<video>` elements or other paths won't be tapped.
- **Monitor nodes accumulate.** A lens that repeatedly reconnects nodes can
  create multiple taps of the same audio. Resetting `monitoredStreams` each
  recording (above) prevents cross-recording duplication, but be aware of this if
  you hear doubled lens audio.
- **Autoplay policy.** An `AudioContext` may start `suspended` until a user
  gesture. Recording is triggered by a button press (a gesture), which generally
  resumes audio — keep recording user-initiated.
- **ffmpeg.wasm needs cross-origin isolation.** The
  `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp` headers must be served (set in
  `webpack.config.js` for dev and `vercel.json` for production). Without them
  ffmpeg won't load and the duration fix fails.

## Files involved

- `main.js` — installs the two patches, waits for taps, and assembles the
  streams (`setupAudioContextMonitor`, `setupAudioNodeMonitor`,
  `waitForMonitorNodes`, `setupAudioStreams`).
- `recorder.js` — mixes the streams and drives `MediaRecorder`.
- `videoProcessor.js` — ffmpeg.wasm duration fix.
- `settings.js` — the recording toggles and encoder settings.
