import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { Settings } from "./settings"

export class VideoProcessor {
  constructor() {
    this.ffmpeg = new FFmpeg()
  }

  async fixVideoDuration(blob) {
    try {
      console.log("Loading FFmpeg...")
      const { baseURL, coreURL, wasmURL, outputOptions } = Settings.ffmpeg

      const fullCoreURL = `${baseURL}/${coreURL}`
      const fullWasmURL = `${baseURL}/${wasmURL}`

      console.log("Loading FFmpeg with URLs:", {
        coreURL: fullCoreURL,
        wasmURL: fullWasmURL,
      })

      await this.ffmpeg.load({
        coreURL: fullCoreURL,
        wasmURL: fullWasmURL,
      })

      console.log("FFmpeg loaded successfully")

      await this.ffmpeg.writeFile("input.mp4", await fetchFile(blob))
      await this.ffmpeg.exec(["-i", "input.mp4", ...outputOptions, "output.mp4"])
      const fixedData = await this.ffmpeg.readFile("output.mp4")
      return new Blob([fixedData.buffer], { type: Settings.recording.mimeType })
    } catch (error) {
      console.error("Error in fixVideoDuration:", error)
      throw error
    }
  }
}
