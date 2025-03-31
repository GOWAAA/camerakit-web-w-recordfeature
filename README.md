# Camera Kit Web Demo with Recording Feature 🎥

> Created by [gowaaa](https://www.gowaaa.com) 🚀
> A creative technology studio specializing in AR experiences

[繁體中文](README.zh-TW.md) | English

A web application demonstrating Snap's Camera Kit integration with video recording capabilities. This project allows users to apply Snap Lenses and record videos with the effects.

> ⚠️ **SECURITY WARNING**  
> **HOW TO USE THIS REPO SAFELY**  
> Follow these steps to keep your app secure:
>
> 1. For local development:
>
>    - Copy `.env.example` to create your own `.env` file
>    - Add your Camera Kit credentials to `.env`
>    - Never share or commit your `.env` file
>    - ⚠️ **NEVER** put credentials directly in your code files
>
> 2. For deployment:
>    - Use Vercel (recommended hosting platform)
>    - Add your credentials in Vercel's Settings → Environment Variables
>    - Follow our [Deployment Guide](#deployment-on-vercel-)
>
> ✅ This setup keeps your credentials safe and your app secure!

![Demo](https://github.com/GOWAAA/camerakit-web-w-recordfeature/blob/main/camerakit-template-demo.gif)

🔗 [Live Demo](https://camerakit-web-w-recordfeature-gw.vercel.app)

## Features ✨

- **Snap Lens Integration** 🎭
- **Video Recording** 📹
- **Front/Back Camera Switch** 🔄
- **Share Recording** 📤
- **Download Recording** ⬇️
- **Loading Animation** ⌛
- **Responsive Design** 📱

## Tech Stack 🛠️

- Camera Kit for Web V1.1.0
- FFmpeg.wasm (for video processing)
- Webpack 5
- MediaRecorder API
- Web Share API

## Project Structure 📁

```
project/
├── src/
│   ├── assets/         # Images and icons
│   │   ├── BackButton.png
│   │   ├── DownloadButton.png
│   │   ├── LoadingIcon.png
│   │   ├── Powered_bysnap.png
│   │   ├── RecordButton.png
│   │   ├── RecordOutline.png
│   │   ├── RecordStop.png
│   │   ├── ShareButton.png
│   │   └── SwitchButton.png
│   ├── styles/        # CSS files
│   │   └── index.v3.css
│   ├── camera.js      # Camera functionality
│   ├── recorder.js    # Recording functionality
│   ├── ui.js         # UI management
│   ├── videoProcessor.js # Video processing logic
│   ├── settings.js   # Configuration settings
│   ├── index.html    # Main HTML file (with direct image references)
│   └── main.js       # Main JavaScript file
├── .env              # Environment variables (local development)
├── .env.example      # Example environment variables template
├── webpack.config.js # Webpack configuration
└── package.json      # Project dependencies
```

### Key Changes in Latest Version

- Modular JavaScript files for better code organization:
  - `camera.js`: Handles camera initialization and management
  - `recorder.js`: Manages video recording functionality
  - `ui.js`: Controls UI elements and interactions
  - `videoProcessor.js`: Handles video processing operations
  - `settings.js`: Centralizes configuration settings

## Getting Started 🚀

### Prerequisites 📋

- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- Camera Kit credentials from Snap

> 💡 **New to Node.js?**
>
> 1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
> 2. After installation, open your terminal/command prompt
> 3. Verify installation by typing:
>    ```bash
>    node --version
>    npm --version
>    ```
>    Both commands should show version numbers

### Installation 💿

1. Clone the repository:

   > 💡 **New to GitHub?**  
   > Choose one of these methods:
   >
   > **Option A: Using GitHub Desktop (Recommended for beginners)**
   >
   > - Download [GitHub Desktop](https://desktop.github.com/)
   > - Click the green "Code" button above
   > - Click "Open with GitHub Desktop"
   > - Choose where to save it on your computer
   >
   > **Option B: Using Git command line**

   ```bash
   git clone https://github.com/gowaaa/camerakit-web-w-recordfeature.git
   cd camerakit-web-w-recordfeature
   ```

2. Install dependencies:

```bash
npm ci
```

> 💡 **Note**: For first-time installation, `npm ci` is recommended as it:
>
> - Ensures exact versions from package-lock.json
> - Is faster and more reliable
> - Provides consistent installations across all environments
>
> Only use `npm install` if you need to modify dependencies (add new ones or update existing ones).

3. Configure Camera Kit credentials:
   Create `.env` file in the root directory:

```
LENS_ID=__LENS_ID__
GROUP_ID=__GROUP_ID__
API_TOKEN=__API_TOKEN__
```

### Development 🔧

Start the development server:

```bash
npm run serve
```

Webpack will start a development server with HTTPS enabled.
You'll see two URLs in the terminal:

- Local: `https://localhost:9000`
- Network: `https://YOUR_IP_ADDRESS:9000` (for mobile devices)

To test on your mobile device, use the Network URL shown in your terminal.

⚠️ **Notes**:

- Your mobile device must be on the same WiFi network as your computer
- Accept the self-signed certificate warning in your browser when testing
- HTTPS is required for camera access on mobile devices

### Production Build 🏗️

Build the project:

```bash
npm run build
```

Output will be in a new `build` directory.

### Deployment on Vercel 🚀

To deploy securely on Vercel:

1. Create a Vercel account at [vercel.com](https://vercel.com)

   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Follow the authorization steps

2. Import your GitHub repository:

   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Import"

3. Add your Camera Kit credentials as environment variables:

   - In your project dashboard, go to "Settings" → "Environment Variables"
   - Add these three variables exactly as shown:
     ```
     LENS_ID=your_actual_lens_id_here
     GROUP_ID=your_actual_group_id_here
     API_TOKEN=your_actual_api_token_here
     ```

4. Deploy your project:
   - Vercel will automatically detect and use the environment variables
   - Your credentials will be securely stored and used during build time

⚠️ **Security Note**:

- Using environment variables on Vercel keeps your credentials secure
- Never commit actual credentials to your repository
- Use `.env.example` for reference (copy to `.env` and add your credentials for local development)
- Keep your `.env` file in `.gitignore`

## Browser Support 🌐

- Chrome (latest) ✅
- Firefox (latest) 🦊
- Safari (iOS 14.5+) 📱
- Edge (latest) 🌍

## Troubleshooting 🔧

### Common Issues ⚠️

1. **Build Errors**:

   - Ensure all dependencies are installed
   - Check webpack configuration
   - Verify file paths in imports

2. **Camera Issues**:

   - Use HTTPS for camera access
   - Grant camera permissions
   - Check browser compatibility

3. **Recording Issues**:
   - Ensure sufficient device storage
   - Check MediaRecorder support
   - Verify permissions

## License 📄

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments 👏

- Based on Vincent Trastour's Camera Kit tutorial: [Watch on YouTube](https://www.youtube.com/watch?v=ZQM9Ua_JKMY)
- Built with [Snap Camera Kit](https://kit.snapchat.com/camera-kit)
- Uses [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
- Project improvements with help from Hong Wei ([@hongweitangcom](https://www.instagram.com/hongweitangcom/))

## ⚠️ Important Note About Dependencies

This project requires specific dependency versions to function correctly. Please:

- Do not modify `package-lock.json`
- Use `npm ci` instead of `npm install` because:
  - It's faster and more reliable
  - It ensures exact versions from package-lock.json
  - It removes node_modules before installing
  - It won't update package.json or package-lock.json

The Camera Kit integration is sensitive to dependency versions. Modifying these may break the functionality.

---

Happy coding! 🎥✨
