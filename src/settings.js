/**
 * Camera Kit Web Demo Settings
 * Centralized configuration for the application
 */

export const Settings = {
  //Camera kit config
  config: {
    apiToken: process.env.API_TOKEN,
    lensID: process.env.LENS_ID,
    groupID: process.env.GROUP_ID,
    remoteAPISpecId: "YOUR_REMOTE_API_SPEC_ID_HERE", // From my lenses API section
    useRemoteAPI: false, // Set to true to enable using remote API
  },
  // Camera settings
  camera: {
    fps: 60,
    constraints: {
      front: {
        video: {
          facingMode: { exact: "user" },
        },
        audio: true,
      },
      back: {
        video: {
          facingMode: { exact: "environment" },
        },
        audio: true,
      },
      desktop: {
        video: {
          facingMode: "user",
        },
        audio: true,
      },
    },
  },

  // Recording settings
  recording: {
    mimeType: "video/mp4",
    fps: 60,
    outputFileName: "recording.mp4",
    recordVideoBitsPerSecond: 6000000,
    recordAudioBitsPerSecond: 128000,
    recordLensAudio: true,
    recordMicAudio: true,
    recordCaptureRenderTarget: false,
  },

  // FFmpeg settings
  ffmpeg: {
    baseURL: "/ffmpeg",
    coreURL: "ffmpeg-core.js",
    wasmURL: "ffmpeg-core.wasm",
    outputOptions: ["-movflags", "faststart", "-c", "copy", "-c:a", "aac"],
  },

  // UI settings
  ui: {
    recordButton: {
      startImage: "./assets/RecordButton.png",
      stopImage: "./assets/RecordStop.png",
    },
    assets: {
      poweredBySnap: "./assets/Powered_bysnap.png",
      recordOutline: "./assets/RecordOutline.png",
      shareButton: "./assets/ShareButton.png",
      downloadButton: "./assets/DownloadButton.png",
      backButton: "./assets/BackButton.png",
      loadingIcon: "./assets/LoadingIcon.png",
    },
    displayPreview: true,
  },

  //remote API settings
  remoteAPI: {
    isEnabled: false,
  },
}
