# YouTube Shorts Blocker
### A browser extension that removes YouTube Shorts from your YouTube experience, helping you avoid the endless scrolling of short-form content and focus on regular videos.
### Made using React + TypeScript template powered by [Vite](https://vite.dev/).

## 🚀 Features
- Completely removes the Shorts tab from YouTube's navigation bar
- Hides Shorts from appearing in YouTube's home feed and search results
- Blocks the YouTube Shorts player page from loading
- Minimal performance impact
- No data collection or tracking
- Open source and completely free

## 📋 Installation
### Chrome / Edge / Brave / Opera

- Download the latest release from the Releases page
- Unzip the file
- Open your browser and navigate to the extensions page:
  - **Chrome**: chrome://extensions/
  - **Edge**: edge://extensions/
  - **Brave**: brave://extensions/
  - **Opera**: opera://extensions/

- CRX File:
  - Drag and drop the **.crx** file to the extensions page and install the extension

- ZIP File:
  - Enable "Developer mode" in the top right corner
  - Click "Load unpacked" and select the unzipped folder
  - The extension should now be installed and active

### Firefox
#### Make sure to download the Firefox version of the extension!
- Open your browser and head over to the `about:debugging` page
- Navigate to "This Firefox" from the sidebar
- Click on "Load Temporary Add-on..." and select the **.zip** file of the extension

## 🛠️ Development
### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/YoYo178/yt-shorts-blocker-extension.git

# Navigate to the project directory
cd yt-shorts-blocker-extension

# Install dependencies
npm install
# or
yarn install
```

### Run
```bash
# Run in development environment (Pop-up only)
yarn run dev
# or
npm run dev
```

### Build
```bash
# Build for development
npm run build
# or
yarn run build
```

### Load unpacked extension
- Build the project
- Load the `dist` folder as an unpacked extension in your browser

## 🔄 How It Works
### The extension works by:

- Injecting CSS to hide Shorts-related elements
- Using a content script to remove Shorts components from the DOM
- Redirecting any YouTube Shorts URLs to the regular video player

## 📜 License
### This project is licensed under the MIT License - see the LICENSE file for details.
