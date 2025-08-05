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
    this.audioContexts = []
    this.monitorNodes = []
    this.monitoredStreams = []
    this.userMediaStream = null

    // prepare audio streams and connect to this.mixDestination
    let mixAudioContext = new AudioContext()
    this.mixDestination = mixAudioContext.createMediaStreamDestination()
    for (let i = 0; i < audioStreams.length; i++) {
      if (audioStreams[i]) {
        let newStream = mixAudioContext.createMediaStreamSource(audioStreams[i])
        newStream.connect(this.mixDestination)
      }
    }

    let audioTracks = []
    for (let i = 0; i < audioStreams.length; i++) {
      if (audioStreams[i]) {
        audioTracks.push(...audioStreams[i].getAudioTracks())
      }
    }
  }

  async startRecording(renderTarget) {
    try {
      const recordStream = new MediaStream()
      this.canvasStream = renderTarget.captureStream(Settings.recording.fps)
      recordStream.addTrack(this.canvasStream.getVideoTracks()[0])
      recordStream.addTrack(this.mixDestination.stream.getAudioTracks()[0])

      this.mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: Settings.recording.mimeType,
        videoBitsPerSecond: Settings.recording.videoBitsPerSecond,
        audioBitsPerSecond: Settings.recording.audioBitsPerSecond,
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
