const { app, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')

let server

function startServer(callback) {
  const eaglyCraftPath = path.join(__dirname, 'EaglyMC')
  
  server = http.createServer((req, res) => {
    let filePath = path.join(eaglyCraftPath, req.url === '/' ? 'index.html' : req.url)
    
    // Security: Prevent directory traversal
    if (!filePath.startsWith(eaglyCraftPath)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Try index.html if file not found
        if (req.url.includes('.') && !req.url.endsWith('/')) {
          res.writeHead(404)
          res.end('Not Found')
          return
        }
        // Fallback to index.html
        filePath = path.join(eaglyCraftPath, 'index.html')
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404)
            res.end('Not Found')
            return
          }
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(data)
        })
        return
      }
      
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wasm': 'application/wasm',
        '.ico': 'image/x-icon',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
      }
      
      const contentType = mimeTypes[ext] || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  })
  
  server.listen(0, () => { // Use port 0 to get random available port
    console.log(`HTTP Server running on http://localhost:${server.address().port}`)
    callback(server.address().port)
  })
}

function createWindow(port) {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Eaglercraft 1.20',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      webSecurity: true,
      nodeIntegration: false,
      // Enable experimental features for JSPI
      experimentalFeatures: true,
      enableBlinkFeatures: 'JSPI,WebAssemblySimd,WebAssemblyTailCall,WebAssemblyExtendedConst',
      webgl: true,
      enableWebSQL: false,
      zoomFactor: 1.0
    },
    show: false // Don't show until ready
  })

  // Set Chrome flags BEFORE loading
  const session = mainWindow.webContents.session
  
  // Enable experimental WebAssembly features
  app.commandLine.appendSwitch('enable-experimental-webassembly-features')
  app.commandLine.appendSwitch('enable-javascript-harmony')
  app.commandLine.appendSwitch('enable-features', 'JSPI,SharedArrayBuffer,WebAssembly,WebAssemblySimd,WebAssemblyTailCall,WebAssemblyExtendedConst')
  app.commandLine.appendSwitch('js-flags', '--experimental-wasm-stack-switching --harmony-import-assertions')
  
  // Required for WebAssembly threading
  app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer')
  
  // Required headers for SharedArrayBuffer
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    })
  })

  mainWindow.loadURL(`http://localhost:${port}`)
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })
  
  // Open DevTools for debugging (remove in production)
  mainWindow.webContents.openDevTools({ mode: 'detach' })
}

app.whenReady().then(() => {
  // Set app name
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.eaglercraft.desktop')
  }
  
  startServer((port) => {
    createWindow(port)
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startServer((port) => {
        createWindow(port)
      })
    }
  })
})

app.on('window-all-closed', () => {
  if (server) {
    server.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})