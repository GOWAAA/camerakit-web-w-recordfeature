import { Settings } from "./settings"

export class MediaRecorderManager {
  constructor(videoProcessor, uiManager) {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.videoProcessor = videoProcessor
    this.uiManager = uiManager
    this.audioVideoStream = null
    this.canvasStream = null
  }

  async startRecording(liveRenderTarget, constraints) {
    try {
      this.audioVideoStream = await navigator.mediaDevices.getUserMedia(constraints)
      const audioTrack = this.audioVideoStream.getAudioTracks()[0]
      this.canvasStream = liveRenderTarget.captureStream(Settings.recording.fps)
      this.canvasStream.addTrack(audioTrack)

      this.mediaRecorder = new MediaRecorder(this.canvasStream, {
        mimeType: Settings.recording.mimeType,
      })
      this.recordedChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        console.log("start record")
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        console.log("stop record")
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
