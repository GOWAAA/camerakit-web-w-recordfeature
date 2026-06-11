---
name: camera-kit-web
description: >-
  Reference for Snap's Camera Kit Web SDK (@snap/camera-kit) — how to bootstrap
  it, create a session, set a camera source, load and apply AR lenses, render to
  the live vs capture canvas, record output, use the Remote API, and pass launch
  params. Use when working on this repo's camera/lens/recording code or any task
  that touches @snap/camera-kit.
---

# Camera Kit Web SDK reference

Snap's **Camera Kit Web SDK** (`@snap/camera-kit`) renders Snap AR **Lenses** in
the browser. You give it a camera (or video/image) input, it applies a Lens, and
it renders the result to `<canvas>` elements you can display or record.

This reference is distilled from the SDK's own TypeScript definitions for the
version pinned in this repo. Verify the version before relying on details:

```bash
cat node_modules/@snap/camera-kit/package.json | grep '"version"'
```

This repo currently uses **v1.8.0**. The official API docs (a later version) are
at <https://developers.snap.com/reference/CameraKit/web/>. When the installed
version and the online docs disagree, trust the installed `*.d.ts` files in
`node_modules/@snap/camera-kit/dist/` — that is the code actually running.

Credentials (API token, lens ID, lens group ID) come from the **Camera Kit
Portal**. In this repo they are supplied as env vars (`API_TOKEN`, `LENS_ID`,
`GROUP_ID`); see `settings.js` and `webpack.config.js`.

## The core flow

Every integration follows the same five steps:

```js
import { bootstrapCameraKit, createMediaStreamSource, Transform2D } from "@snap/camera-kit"

// 1. Bootstrap — downloads the WASM render engine, returns a CameraKit instance.
const cameraKit = await bootstrapCameraKit({ apiToken })

// 2. Create a session — the rendering pipeline. Optionally pass your canvas.
const session = await cameraKit.createSession({ liveRenderTarget: canvasEl })

// 3. Set a source — what the lens renders on top of (camera, video, image).
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
const source = createMediaStreamSource(stream, { cameraType: "user" })
await session.setSource(source)
await session.setRenderSize(window.innerWidth, window.innerHeight) // via source in this repo
await session.play()                              // starts rendering the "live" target

// 4. Load a lens from the portal, then apply it to the session.
const lens = await cameraKit.lensRepository.loadLens(lensId, groupId)
await session.applyLens(lens)

// 5. (later) clean up
await session.destroy()
```

## Key exports

From `@snap/camera-kit`:

| Export | Kind | Purpose |
| --- | --- | --- |
| `bootstrapCameraKit(config, provide?)` | function | Entry point. Returns a `CameraKit`. Pass `{ apiToken }`; optional `provide` callback customizes the DI container (used for the Remote API). |
| `CameraKit` | class | Has `lensRepository`, `metrics`, `createSession()`, `destroy()`. |
| `createMediaStreamSource(stream, options?)` | function | Wraps a `MediaStream` as a Camera Kit source. |
| `createVideoSource` / `createImageSource` / `createFunctionSource` | functions | Other input sources (video element, image, custom frame function). |
| `Transform2D` | class | 2D transform for the source. Static `MirrorX`, `MirrorY`, `Identity`. |
| `Injectable`, `remoteApiServicesFactory` | DI helpers | Register a Remote API handler at bootstrap (see Remote API). |

## bootstrapCameraKit

```js
const cameraKit = await bootstrapCameraKit({
  apiToken,            // required, from the Camera Kit Portal
  logger: "console",   // optional: print lens logs to the browser console
})
```

Throws `ConfigurationError` (bad config), `PlatformNotSupportedError`
(unsupported browser), or `BootstrapError` (WASM init/download failed). Calling
`bootstrapCameraKit` downloads the render engine WebAssembly, so do it once and
reuse the instance.

## CameraKit and sessions

- `cameraKit.lensRepository` — query/load lenses (see below).
- `cameraKit.createSession({ liveRenderTarget?, renderWhileTabHidden? })` —
  returns a `CameraKitSession`. If you don't pass `liveRenderTarget`, Camera Kit
  creates a canvas you can insert into the DOM. `renderWhileTabHidden: true`
  keeps rendering when the tab is backgrounded (small perf cost).
- `cameraKit.destroy()` — destroys all sessions and frees resources.

## CameraKitSession

The main object you interact with. Notable members:

- `session.output` — `{ live: HTMLCanvasElement, capture: HTMLCanvasElement }`.
  Two rendered outputs (see Render targets below).
- `session.playing` — `{ live: boolean, capture: boolean }` current play state.
- `session.setSource(source)` — set the input. Also accepts a raw `MediaStream`
  or `HTMLVideoElement` plus options. **A source can only be attached once** —
  to reuse one, call `source.copy()` for a fresh instance.
- `session.play(target?)` — start/resume rendering. `target` is `"live"`
  (default) or `"capture"`.
- `session.pause(target?)` — pause rendering for a target.
- `session.applyLens(lens, launchData?)` — apply a lens (only one at a time).
  Resolves `true` if applied, `false` if superseded by another `applyLens`,
  rejects on error.
- `session.removeLens()` — remove the current lens; rendering continues with the
  raw source.
- `session.setFPSLimit(fps)` — cap render FPS to save CPU/GPU.
- `session.mute(fade?)` / `session.unmute(fade?)` — mute/unmute lens audio.
- `session.events` — `addEventListener("error", ...)`; see Error handling.
- `session.destroy()` — tear down the session.

### Render targets: live vs capture

A lens can render to two targets, exposed as two canvases:

- **`live`** — what the person using the lens sees. May include UI/hints only
  relevant to the active user.
- **`capture`** — what's meant to be shared/saved (e.g. sent to others or
  recorded). For many lenses the two look identical, but a lens author can make
  them differ.

`session.play()` defaults to the `live` target. To render and record the
capture target, call `session.play("capture")` and read from
`session.output.capture`. **This is exactly what this repo's
`recordCaptureRenderTarget` setting toggles:** when enabled, `main.js` hides the
live canvas, plays the capture target, and records `session.output.capture`.

### Error handling

Listen for lens runtime errors. On a `LensExecutionError`, Camera Kit
automatically removes the failing lens:

```js
session.events.addEventListener("error", ({ detail }) => {
  if (detail.error.name === "LensExecutionError") {
    // the lens was removed; prompt the user to pick another
  }
})
```

## Sources and transforms

`createMediaStreamSource(stream, options)` options (all optional):

- `cameraType: "user" | "environment"` — front or rear camera. Some lens
  features (e.g. surface tracking) only activate for `"environment"`. Default
  `"user"`.
- `fpsLimit: number` — cap source FPS.
- `transform: Transform2D` — e.g. `Transform2D.MirrorX` to mirror the front
  camera so it behaves like a selfie view.
- `disableSourceAudio: boolean` — set `true` to keep the source's audio out of
  the lens.

On the returned source you can also call:

- `source.setTransform(Transform2D.MirrorX)` — mirror/rotate/scale the input.
- `source.setRenderSize(width, height)` — pixel resolution Camera Kit renders
  at. This is separate from CSS display size; smaller render size = faster but
  lower tracking accuracy. (Call after `session.play()` in v1.8.0.)
- `source.copy(deviceInfo?)` — make a fresh, re-attachable copy (optionally
  changing `cameraType`).

To switch cameras, stop the old tracks, get a new `getUserMedia` stream, build a
new source with the other `cameraType`, and `setSource` it again — this repo
does that in `camera.js`'s `updateCamera`.

## Loading lenses (LensRepository)

```js
// A single lens by ID + group ID (both from the Camera Kit Portal):
const lens = await cameraKit.lensRepository.loadLens(lensId, groupId)

// All lenses in one or more groups:
const { lenses, errors } = await cameraKit.lensRepository.loadLensGroups([groupId])

// Optional: warm the cache so applyLens is faster later.
await cameraKit.lensRepository.cacheLensContent([lens])
```

A lens must be loaded before `session.applyLens(lens)`.

## Launch params

You can pass data to a lens when it launches via the second arg of `applyLens`.
This repo wraps it in `launchParams.js`:

```js
export const launchParams = { launchParams: { testParam: "text from web app" } }
// ...
await session.applyLens(lens, launchParams)
```

In Lens Studio, read it from `global.launchParams` (e.g.
`launchDataStore.getString("testParam")`). Payload must be ≤ 3 KB. In practice
pass everything as strings (JSON-encode numbers/arrays). See `launchParams.js`
for the matching Lens Studio snippet.

## Remote API (lens → web app callbacks)

A lens can call out to your web app through Camera Kit's Remote API. You register
a handler at bootstrap by providing a service to the DI container:

```js
import { bootstrapCameraKit, Injectable, remoteApiServicesFactory } from "@snap/camera-kit"

const myService = {
  apiSpecId: "<spec id from the portal's API section>",
  getRequestHandler(request) {
    if (request.endpointId !== "my_endpoint") return // ignore others
    // request.parameters is Record<string,string>; request.body is ArrayBuffer
    return (reply) => {
      reply({
        status: "success",         // RemoteApiStatus
        metadata: {},
        body: new TextEncoder().encode("done"),
      })
    }
  },
}

const cameraKit = await bootstrapCameraKit({ apiToken }, (container) =>
  container.provides(
    Injectable(remoteApiServicesFactory.token, [remoteApiServicesFactory.token], (existing) => [...existing, myService])
  )
)
```

`apiSpecId` and `endpointId` must match what you configured in the portal's
"My Lenses" API section. `getRequestHandler` returns a handler that gets a
`reply` callback (callable multiple times), or returns nothing to ignore the
request. This repo's `remoteAPI.js` is a worked example; it's only used when
`Settings.config.useRemoteAPI` is `true`.

## Recording (how this repo does it)

Camera Kit only renders to canvases — it does not record. This repo records by:

1. `session.output.live.captureStream(fps)` (or `.capture`) to get a video
   `MediaStream` from the rendered canvas.
2. Mixing audio (mic and/or lens audio) into one stream via the Web Audio API.
   Lens audio is captured by patching `AudioContext` / `AudioNode.connect` in
   `main.js` to tap the lens's audio graph.
3. Feeding video + mixed audio into a `MediaRecorder` (`recorder.js`).
4. Running the recorded blob through ffmpeg.wasm (`videoProcessor.js`) to fix the
   duration metadata that `MediaRecorder` leaves wrong.

ffmpeg.wasm requires the `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers (set in
`webpack.config.js` for dev and `vercel.json` for production).

## Environment requirements

- **HTTPS / secure context** — camera and mic APIs require it (the dev server
  runs HTTPS on port 9000).
- **WebAssembly** — both Camera Kit's render engine and ffmpeg are WASM.
- **A modern browser.** `navigator.share` (used for the share button) is mainly
  available on mobile; the code falls back gracefully when it isn't.
