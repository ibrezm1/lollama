# Lollama 🦙

A premium, install-less web client for Ollama. Host it on GitHub Pages and chat with your local AI models in style.

![Lollama Interface](https://via.placeholder.com/800x450.png?text=Lollama+Premium+UI)

## Features

- 💎 **Premium UI**: Modern glassmorphism design with smooth animations.
- 🌓 **Theming**: Integrated Dark and Light modes.
- ⚙️ **Configurable**: Connect to any Ollama server and port.
- 📦 **Zero Install**: Runs entirely in the browser.
- 📝 **Markdown**: Full support for markdown rendering and code blocks.
- 💾 **Persistence**: Saves your settings and chat history locally.

## Getting Started

### 1. Configure Ollama
To allow the web client to communicate with your local Ollama instance, you must set the `OLLAMA_ORIGINS` environment variable:

```bash
# MacOS / Linux
OLLAMA_ORIGINS="https://ibrezm1.github.io,http://localhost:*" ollama serve

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="https://ibrezm1.github.io,http://localhost:*"; ollama serve
```

### Alternative: Using a CORS Proxy
If you cannot change Ollama's environment variables, you can run a local proxy to bypass CORS restrictions:

```bash
npx local-cors-proxy --proxyUrl http://192.168.1.65:11434 --port 8010 --proxyPartial ""
```
*Note: Replace `192.168.1.65` with your Ollama server's IP if different. Then, set your server address in the Lollama settings to `http://localhost:8010`.*


### 2. Local Development
```bash
npm install
npm run dev
```

### 3. Deploy to GitHub Pages
```bash
npm run deploy
```

## Built With
- React + Vite
- Lucide Icons
- Vanilla CSS (Design System)
