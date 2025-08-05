import { Settings } from "./settings"

export class UIManager {
  constructor() {
    this.recordButton = document.getElementById("record-button")
    this.recordOutline = document.getElementById("outline")
    this.actionButton = document.getElementById("action-buttons")
    this.switchButton = document.getElementById("switch-button")
    this.loadingIcon = document.getElementById("loading")
    this.backButtonContainer = document.getElementById("back-button-container")
    this.recordPressedCount = 0
  }

  toggleRecordButton(isVisible) {
    if (isVisible) {
      this.recordOutline.style.display = "block"
      this.recordButton.style.display = "block"
    } else {
      this.recordOutline.style.display = "none"
      this.recordButton.style.display = "none"
    }
  }

  updateRecordButtonState(isRecording) {
    this.recordButton.style.backgroundImage = isRecording
      ? `url('${Settings.ui.recordButton.stopImage}')`
      : `url('${Settings.ui.recordButton.startImage}')`
    this.recordPressedCount++
  }

  showLoading(show) {
    this.loadingIcon.style.display = show ? "block" : "none"
  }

  displayPostRecordButtons(url, fixedBlob) {
    this.actionButton.style.display = "block"
    this.backButtonContainer.style.display = "block"
    this.switchButton.style.display = "none"

    if (Settings.ui.displayPreview) {
      this.displayPreview(url)
    }

    document.getElementById("download-button").onclick = () => {
      const a = document.createElement("a")
      a.href = url
      a.download = Settings.recording.outputFileName
      a.click()
      a.remove()
    }

    document.getElementById("share-button").onclick = async () => {
      try {
        const file = new File([fixedBlob], Settings.recording.outputFileName, {
          type: Settings.recording.mimeType,
        })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Recorded Video",
            text: "Check out this recording!",
          })
          console.log("File shared successfully")
        } else {
          console.error("Sharing files is not supported on this device.")
        }
      } catch (error) {
        console.error("Error while sharing:", error)
      }
    }

    document.getElementById("back-button").onclick = async () => {
      this.actionButton.style.display = "none"
      this.backButtonContainer.style.display = "none"
      this.switchButton.style.display = "block"
      this.toggleRecordButton(true)
      if (Settings.ui.displayPreview) {
        this.removePreview()
      }
    }
  }

  updateRenderSize(source, renderTarget) {
    const width = window.innerWidth
    const height = window.innerHeight

    renderTarget.style.width = `${width}px`
    renderTarget.style.height = `${height}px`
    source.setRenderSize(width, height)
  }

  displayPreview(dataURL) {
    const preview = document.createElement("video")
    preview.src = dataURL
    preview.id = "preview"
    preview.controls = true // Allow playback controls
    preview.autoplay = true
    preview.playsInline = true
    preview.id = "preview"
    preview.style = "position: fixed; top: 30%; left: 50%; width: 70vw; height: 124vw; transform: translate(-50%, -30%); z-index: 999;"
    document.body.appendChild(preview)
  }

  removePreview() {
    const preview = document.getElementById("preview")
    if (preview) {
      preview.remove() // Remove the element from the DOM
      console.log("Preview removed")
    } else {
      console.log("No preview to remove")
    }
  }
}
