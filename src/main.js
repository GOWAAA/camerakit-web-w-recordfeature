/**
 * Camera Kit Web Demo with Recording Feature
 * Created by gowaaa (https://www.gowaaa.com)
 * A creative technology studio specializing in AR experiences
 *
 * @copyright 2025 GOWAAA
 */

import { bootstrapCameraKit, createMediaStreamSource, Transform2D } from "@snap/camera-kit"
import { bootstrapCameraKitWithRemoteAPI } from "./remoteAPI"
import "./styles/index.v3.css"
import { CameraManager } from "./camera"
import { MediaRecorderManager } from "./recorder"
import { UIManager } from "./ui"
import { VideoProcessor } from "./videoProcessor"
import { Settings } from "./settings"
import { launchParams } from "./launchParams"
;(async function () {
  let audioContexts = []
  let monitorNodes = []
  let monitoredStreams = []
  let userMediaStream = null
  let mediaRecorder = null
  let currentRenderTarget
  let cameraKit = null

  setupAudioContextMonitor()
  setupAudioNodeMonitor()

  if (!Settings.config.apiToken || !Settings.config.lensID || !Settings.config.groupID) {
    console.error("Missing required environment variables. Please check your environment settings.")
    return
  }

  // Initialize managers
  const uiManager = new UIManager()
  const cameraManager = new CameraManager()
  const videoProcessor = new VideoProcessor()

  // Initialize Camera Kit
  if (Settings.config.useRemoteAPI) {
    cameraKit = await bootstrapCameraKitWithRemoteAPI()
  } else {
    cameraKit = await bootstrapCameraKit({
      apiToken: Settings.config.apiToken,
      logger: "console", //to show lens print log on the broswer console
    })
  }
  // Get canvas element for live render target
  const liveRenderTarget = document.getElementById("canvas")
  const captureRenderTarget = document.getElementById("capture-canvas")

  // Create camera kit session
  const session = await cameraKit.createSession({ liveRenderTarget })

  //Set captureRenderTarget canvas to render out capture render target from camera kit
  //It is not rendering out anything yet until session.play('capture') is called
  //To record capture render target, set recordCaptureRenderTarget to be true in settings.js
  captureRenderTarget.replaceWith(session.output.capture)

  currentRenderTarget = liveRenderTarget

  // Initialize camera and set up source
  const mediaStream = await cameraManager.initializeCamera()

  const source = createMediaStreamSource(mediaStream, {
    cameraType: "user",
    disableSourceAudio: false,
  })
  await session.setSource(source)
  source.setTransform(Transform2D.MirrorX)
  await source.setRenderSize(window.innerWidth, window.innerHeight)
  await session.setFPSLimit(Settings.camera.fps)
  await session.play() //plays live target by default

  // Load and apply lens
  const lens = await cameraKit.lensRepository.loadLens(Settings.config.lensID, Settings.config.groupID)
  //launchParams allow you to send data to lens at launch, giving you control to trigger different lens effect
  // such as different text, colours, objects visibility etc.
  // See launchParams.js for code sample to use in Lens Studio
  // You may remove launchParams if you have no need for it
  await session.applyLens(lens, launchParams)

  // Set up event listeners
  uiManager.recordButton.addEventListener("click", async () => {
    if (!uiManager.isRecording) {
      if (Settings.recording.recordCaptureRenderTarget) {
        //disable live canvas so the capture canvas that is behind live canvas will be shown instead
        // capture canvas z-index is set behind live canvas in css
        liveRenderTarget.style.display = "none"
        //play capture render target so capture canvas will render the lens
        await session.play("capture")
        currentRenderTarget = captureRenderTarget
      }

      //setup audio streams
      mediaRecorder = await setupAudioStreams()
      const success = await mediaRecorder.startRecording(session)
      if (success) {
        uiManager.updateRecordButtonState(true)
      }
    } else {
      uiManager.updateRecordButtonState(false)
      uiManager.toggleRecordButton(false)
      mediaRecorder.stopRecording()
      if (Settings.recording.recordCaptureRenderTarget) {
        //show live render target canvas again
        liveRenderTarget.style.display = "block"
        //need to play live target for canvas to show anything
        await session.play("live")
        currentRenderTarget = liveRenderTarget
      }
    }
  })

  uiManager.switchButton.addEventListener("click", async () => {
    try {
      const source = await cameraManager.updateCamera(session)
      uiManager.updateRenderSize(source, liveRenderTarget)
      uiManager.updateRenderSize(source, captureRenderTarget)
    } catch (error) {
      console.error("Error switching camera:", error)
    }
  })

  // Back button: restore the camera view, clear the finished recording,
  // and resize both canvases. This is the only back-button handler.
  document.getElementById("back-button").addEventListener("click", () => {
    try {
      uiManager.returnToCameraView()
      if (mediaRecorder) {
        mediaRecorder.resetRecordingVariables()
      }
      uiManager.updateRenderSize(source, liveRenderTarget)
      uiManager.updateRenderSize(source, captureRenderTarget)
    } catch (error) {
      console.error("Error returning to camera view:", error)
    }
  })

  // Add window resize listener - keep both canvases sized to the window
  window.addEventListener("resize", () => {
    uiManager.updateRenderSize(source, liveRenderTarget)
    uiManager.updateRenderSize(source, captureRenderTarget)
  })

  // Update initial render size
  uiManager.updateRenderSize(source, liveRenderTarget)
  uiManager.updateRenderSize(source, captureRenderTarget)

  //functions for audio monitoring recording
  function setupAudioContextMonitor() {
    const originalAudioContext = window.AudioContext || window.webkitAudioContext
    let capturedAudioContext = null

    window.AudioContext = window.webkitAudioContext = function () {
      capturedAudioContext = new originalAudioContext()
      console.log("Audio context created:", capturedAudioContext)

      audioContexts.push(capturedAudioContext)

      return capturedAudioContext
    }
  }

  function setupAudioNodeMonitor() {
    // Store the original connect method
    const originalConnect = AudioNode.prototype.connect

    // Override the AudioNode.prototype.connect method
    AudioNode.prototype.connect = function (destinationNode) {
      console.log("Audio Node Connecting: " + this + " to " + destinationNode)

      // if the current node is a gainNode, create another stream node and connect it
      if (destinationNode instanceof AudioDestinationNode) {
        console.log("final node found")

        // create monitor node
        let streamNode = this.context.createMediaStreamDestination()
        monitorNodes.push(streamNode)

        // connect current node to the monitor node
        this.connect(streamNode)
      }

      // Call original connect method
      return originalConnect.apply(this, arguments)
    }
  }

  async function setupAudioStreams() {
    // Wait for monitor nodes to be ready
    await waitForMonitorNodes()

    // Rebuild the list from scratch each time. Without this, a second recording
    // would re-add the streams collected for the first one and mix in duplicates.
    monitoredStreams = []

    if (Settings.recording.recordMicAudio) {
      // Only the microphone is needed here; the camera video is already handled
      // by the Camera Kit session, so we request audio only. Release any mic
      // stream left open by a previous recording before opening a new one.
      if (userMediaStream) {
        userMediaStream.getTracks().forEach((track) => track.stop())
      }
      userMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      monitoredStreams.push(userMediaStream)
    }

    if (Settings.recording.recordLensAudio) {
      for (const node of monitorNodes) {
        if (node.stream) {
          monitoredStreams.push(node.stream)
        }
      }
    }

    return new MediaRecorderManager(videoProcessor, uiManager, monitoredStreams)
  }

  async function waitForMonitorNodes() {
    const maxWait = 1000 // wait up to 1 second
    const checkInterval = 100 // Check every 100ms
    let waited = 0

    while (waited < maxWait) {
      const allReady = monitorNodes.every((node) => node && node.stream)
      if (allReady) return

      await new Promise((resolve) => setTimeout(resolve, checkInterval))
      waited += checkInterval
    }

    console.warn("Some monitor nodes may not be ready")
  }
})()
