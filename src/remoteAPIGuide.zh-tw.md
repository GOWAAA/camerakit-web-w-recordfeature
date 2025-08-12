# 遠端 API 設定指南

感謝 @bastiensaro (https://www.filtre-experience.fr/) 讓此指南得以實現

從 Lens 到 Camera Kit for Web 設定 Remote API 檢測按鈕點擊的逐步指南。

## 🔧 設定 Remote API

建立新的 API

1. 前往 https://my-lenses.snapchat.com/apis/
2. 點擊 **"Add a new API"**
3. 填寫以下詳細資訊（忽略所有選用輸入項）：

建立 API

- **Name**：`Button Press API` _（或您偏好的任何名稱，這將是您從資源庫匯入 API 時看到的名稱）_
- **Provider**：您的名稱 _（或您偏好的任何名稱）_
- **Description**：`API to detect button pressed event from lens` _（您可以自訂此項，不會影響 API 功能）_
- **Target Platforms**：選擇 `Camera_Kit`
- **Username Allowlist**：輸入您的 Snap 用戶名稱
- **Request Processor**：選擇 `Custom Processor`
- **Snap Kit App ID**：
  1. 前往 MyLenses → 您的 Camera Kit 應用程式 → Developer Portal
  2. 複製應用程式名稱下方的 ID
- **Host**：您的用戶名稱或任何您想要的內容 _（這不會影響 API 功能）_

建立端點

使用以下設定建立端點：

- **Reference ID**：`button_pressed` _（這是端點名稱）_
- **Path**：`button_pressed` _（這可以是任何內容，不會影響 API）_
- **Method**：選擇 `GET`
- **Parameters**：`button_id` _（您可以新增任意數量的參數）_
- **Parameter Location**：`Query`
- **Required**：`Yes`
- **Constant**：`No`

4. 點擊 **"Create your API"**

## 🎯 Lens Studio 設定

將 API 匯入到 Lens Studio

5. 開啟 **Lens Studio**
6. 建立新專案並從 **Asset Library** 匯入您剛建立的 API
7. 您會看到在您的場景中建立的 JavaScript 程式碼
8. 在您的場景中建立一個 **screen button** 和 **2D text**

更新 JavaScript 程式碼

9. 開啟從 API 提供的 JavaScript 程式碼 _（不是以 "Module" 結尾的那個）_
10. 將現有程式碼替換為以下內容：

```javascript
// @input Asset.RemoteServiceModule remoteServiceModule
// @input Component.InteractionComponent button
// @input Component.Text responseText

// 匯入模組
const Module = require("./button_pressed API Module")
const ApiModule = new Module.ApiModule(script.remoteServiceModule)

script.button.onTap.add(() => {
  script.responseText.text = "pressed"

  // 如果您建立了不同的端點名稱（參考 ID），請將其更改為 ApiModule.YourEndPoint
  ApiModule.button_pressed({
    parameters: {
      "button_id": "12345", // 替換為實際的參數名稱和值
    },
  })
    .then((response) => {
      // 將回應解析為 JSON 字串並記錄
      print("Response metadata: " + JSON.stringify(response.metadata))
      print("Response body: " + response.bodyAsString())
      script.responseText.text = response.bodyAsString()
    })
    .catch((error) => {
      print(error + "\\n" + error.stack)
    })
})
```

設定腳本輸入

11. 將 **button** 和 **text** 元件指派給腳本輸入欄位
12. 當您點擊按鈕時，您會在 Lens Studio 中收到 **bad request** - 這是正常的，因為它只在 Camera Kit 上運作

## 📱 部署與測試

Lens 審核流程

13. **提交您的 lens 以供審核**
14. 如果您還沒有，請將您的 lens 新增到 **Lens Scheduler**（這樣您就可以在 Camera Kit 上執行它）

Camera Kit 設定

15. 在您的 Camera Kit 專案中，前往 `settings.js` 並設定：
    ```javascript
    remoteAPISpecId: "YOUR_REMOTE_API_SPEC_ID_HERE",
    useRemoteAPI: true
    ```

最終步驟

16. **等待 lens 獲得批准**
17. 在本地執行 Camera Kit 程式碼

## ✅ 預期結果

當一切設定正確時，當您在 lens 中按下按鈕時，您應該會在控制台中看到 `button 12345 is pressed`。

---

> **注意**：API 只有在 Camera Kit 上執行時才能正常運作，在 Lens Studio 預覽模式下無法運作。
>
> **注意**：確保您的 specsID、端點和參數名稱與您在 remoteAPI.js 中建立的內容相符。
