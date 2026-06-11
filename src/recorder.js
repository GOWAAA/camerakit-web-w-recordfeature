import { Settings } from "./settings"
export class MediaRecorderManager {
  constructor(videoProcessor, uiManager, audioStreams) {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.videoProcessor = videoProcessor
    this.uiManager = uiManager
    this.audioVideoStream = null
    this.canvasStream = null
    this.mixDestination = null

    // Mix every incoming audio stream (mic and/or lens audio) into a single
    // destination so the recording captures all of them together.
    const mixAudioContext = new AudioContext()
    this.mixDestination = mixAudioContext.createMediaStreamDestination()
    for (const stream of audioStreams) {
      if (stream) {
        mixAudioContext.createMediaStreamSource(stream).connect(this.mixDestination)
      }
    }
  }

  async startRecording(session) {
    try {
      const recordStream = new MediaStream()
      if (Settings.recording.recordCaptureRenderTarget) {
        this.canvasStream = session.output.capture.captureStream(Settings.recording.fps)
      } else {
        this.canvasStream = session.output.live.captureStream(Settings.recording.fps)
      }
      recordStream.addTrack(this.canvasStream.getVideoTracks()[0])
      recordStream.addTrack(this.mixDestination.stream.getAudioTracks()[0])

      this.mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: Settings.recording.mimeType,
        videoBitsPerSecond: Settings.recording.recordVideoBitsPerSecond,
        audioBitsPerSecond: Settings.recording.recordAudioBitsPerSecond,
      })
      this.recordedChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        this.uiManager.showLoading(true)
        const blob = new Blob(this.recordedChunks, { type: Settings.recording.mimeType })
        const fixedBlob = await this.videoProcessor.fixVideoDuration(blob)
        const url = URL.createObjectURL(fixedBlob)
        this.uiManager.showLoading(false)
        this.uiManager.displayPostRecordButtons(url, fixedBlob)
      }

      this.mediaRecorder.start()
      return true
    } catch (error) {
      console.error("Error accessing media devices:", error)
      return false
    }
  }

  resetRecordingVariables() {
    this.mediaRecorder = null
    this.recordedChunks = []
    // Stop all tracks in the audio/video stream
    if (this.audioVideoStream) {
      this.audioVideoStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.audioVideoStream = null
    }

    // Stop all tracks in the canvas stream
    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.canvasStream = null
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }
  }
}
