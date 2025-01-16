# Camera Kit 網頁示範（含錄影功能）🎥

一個展示 Snap Camera Kit 整合的網頁應用程式，允許使用者套用 Snap 濾鏡並錄製影片。

> ⚠️ **安全警告**  
> **請勿將此程式碼用於客戶專案**  
> Camera Kit API Token 暴露在前端程式碼中。若要用於生產環境，請實作伺服器端驗證。

## 功能特點 ✨

- **Snap 濾鏡整合** 🎭
- **影片錄製** 📹
- **前後鏡頭切換** 🔄
- **影片分享** 📤
- **影片下載** ⬇️
- **載入動畫** ⌛
- **響應式設計** 📱

## 技術架構 🛠️

- Camera Kit for Web
- FFmpeg.wasm（影片處理）
- Webpack 5
- MediaRecorder API
- Web Share API

## 專案結構 📁

```
project/
├── src/
│   ├── assets/         # 圖片和圖示
│   │   ├── BackButton.png
│   │   ├── DownloadButton.png
│   │   ├── LoadingIcon.png
│   │   ├── Powered_bysnap.png
│   │   ├── RecordButton.png
│   │   ├── RecordOutline.png
│   │   ├── RecordStop.png
│   │   ├── ShareButton.png
│   │   └── SwitchButton.png
│   ├── styles/        # CSS 檔案
│   │   └── index.v3.css
│   ├── config.js      # Camera Kit 憑證
│   ├── index.html     # 主要 HTML 檔案
│   └── main.js        # 主要 JavaScript 檔案
├── build/             # 生產環境建置輸出
├── webpack.config.js  # Webpack 設定
└── package.json       # 專案依賴
```

## 開始使用 🚀

### 系統需求 📋

- Node.js（v14 或更高版本）- [下載連結](https://nodejs.org/)
- npm（Node.js 安裝時會一併安裝）
- Camera Kit 憑證（從 Snap 取得）

> 💡 **第一次使用 Node.js？**
>
> 1. 從 [nodejs.org](https://nodejs.org/) 下載並安裝 Node.js
> 2. 安裝完成後，開啟終端機/命令提示字元
> 3. 輸入以下指令確認安裝成功：
>    ```bash
>    node --version
>    npm --version
>    ```
>    兩個指令都應該顯示版本號碼

### 安裝步驟 💿

1. 複製專案：

```bash
git clone <你的儲存庫網址>
cd camerakit-web-w-recordfeature
```

2. 安裝依賴：

```bash
npm install
```

3. 設定 Camera Kit 憑證：
   建立 `src/config.js` 並填入你的憑證：

```javascript
export const CONFIG = {
  LENS_ID: "__LENS_ID__",
  GROUP_ID: "__GROUP_ID__",
  API_TOKEN: "__API_TOKEN__",
}
```

### 開發環境 🔧

啟動開發伺服器：

```bash
npm run serve
```

Webpack 將啟動支援 HTTPS 的開發伺服器。
終端機會顯示兩個網址：

- 本機：`https://localhost:9000`
- 網路：`https://你的IP地址:9000`（用於手機測試）

使用終端機顯示的網路網址在手機上測試。

⚠️ **注意事項**：

- 手機必須與電腦連接同一個 WiFi 網路
- 在瀏覽器中接受自簽憑證警告
- 需要 HTTPS 才能存取相機

### 生產環境建置 🏗️

建置專案：

```bash
npm run build
```

輸出檔案將在 `build` 目錄中。

### 部署到 Vercel 🚀

> 💡 **第一次使用 Vercel？**  
> Vercel 是一個讓網站部署變得簡單的平台。你需要：
>
> 1. GitHub 帳號 - [在此註冊](https://github.com/signup)
> 2. 將專案程式碼上傳到 GitHub
> 3. Vercel 帳號（可以用 GitHub 帳號註冊）

在 Vercel 上安全部署（不暴露 Camera Kit 憑證）：

1. 在 [vercel.com](https://vercel.com) 建立帳號

   - 點擊「Sign Up」
   - 選擇「Continue with GitHub」
   - 依照指示完成授權

2. 匯入你的 GitHub 儲存庫：

   - 前往 [vercel.com/new](https://vercel.com/new)
   - 選擇你的儲存庫
   - 點擊「Import」並等待部署完成

⚠️ **安全注意事項**：

- 使用 Vercel 環境變數可確保憑證安全
- 切勿將實際憑證提交到儲存庫
- 本機開發使用本地 `config.js`，Vercel 會使用其環境變數版本

## 瀏覽器支援 🌐

- Chrome（最新版）✅
- Firefox（最新版）🦊
- Safari（iOS 14.5+）📱
- Edge（最新版）🌍

## 常見問題 🔧

### 問題排解 ⚠️

1. **建置錯誤**：

   - 確認所有依賴已安裝
   - 檢查 webpack 設定
   - 驗證檔案路徑

2. **相機問題**：

   - 使用 HTTPS
   - 授予相機權限
   - 檢查瀏覽器相容性

3. **錄影問題**：
   - 確保裝置有足夠儲存空間
   - 檢查 MediaRecorder 支援
   - 驗證權限設定

## 授權條款 📄

MIT 授權

Copyright (c) 2024

特此免費授予任何取得本軟體及相關文件檔案（「軟體」）複本的人，不受限制地處理本軟體的權利，
包括但不限於使用、複製、修改、合併、發布、散布、再授權和/或販售本軟體複本的權利，
以及允許獲得本軟體的人這樣做，但須符合以下條件：

上述版權聲明和本許可聲明應包含在本軟體的所有複本或重要部分中。

本軟體按「原樣」提供，不提供任何形式的明示或暗示保證，包括但不限於對適銷性、
特定用途適用性和非侵權性的保證。在任何情況下，作者或版權持有人均不對任何索賠、
損害或其他責任負責，無論是在合約、侵權或其他方面，與本軟體或本軟體的使用或其他交易有關。

## 致謝 👏

- 基於 Vincent Trastour 的 Camera Kit 教學：[觀看 YouTube](https://www.youtube.com/watch?v=ZQM9Ua_JKMY)
- 使用 [Snap Camera Kit](https://kit.snapchat.com/camera-kit) 建置
- 使用 [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)

---

祝編程愉快！🎥✨