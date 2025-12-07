import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { release, setPriority } from 'node:os'
import { join } from 'node:path'
import pianoBot from './events/pianoBot'

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
let url: string | undefined
let indexHtml: string

// Main window
let mainWindow: BrowserWindow | null = null

function setupEnvironment() {
  // Set environment variables
  process.env.DIST_ELECTRON = join(__dirname, '..')
  process.env.DIST = join(process.env.DIST_ELECTRON, '../dist-build')
  process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST

  url = process.env.VITE_DEV_SERVER_URL
  indexHtml = join(process.env.DIST, 'index.html')

  // Disable GPU Acceleration for Windows 7
  if (release().startsWith('6.1')) app.disableHardwareAcceleration()

  // Set application name for Windows 10+ notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId('de.lecyreaxyt.piano_manager')
  }
}

function createWindow() {
  const win = new BrowserWindow({
    title: 'Piano Manager | By DerEchteAlec',
    icon: join(process.env.PUBLIC!, 'logo.png'),

    frame: false,
    titleBarStyle: 'hidden',
    height: 680,
    width: 1000,
    minHeight: 680,
    minWidth: 800,
    resizable: true,

    autoHideMenuBar: true,

    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  return win
}

function initApp() {
  mainWindow = createWindow()

  // Menu Template
  Menu.setApplicationMenu(null)

  if (url) {
    mainWindow.loadURL(url)
   // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url: linkUrl }) => {
    if (linkUrl.startsWith('https:')) shell.openExternal(linkUrl)
    return { action: 'deny' }
  })

  mainWindow.webContents.once('dom-ready', () => {
    try {
      setPriority(process.pid, -20)
      if (mainWindow) {
        setPriority(mainWindow.webContents.getOSProcessId(), -20)
      }
    } catch (e) {
      // Ignore priority setting errors
    }
  })

  // ----------------- [Piano Bot] ----------------- //
  pianoBot.init(mainWindow)

  // ----------------- [Window Controls IPC] ----------------- //
  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow?.close()
  })
}

// Single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.whenReady().then(() => {
  setupEnvironment()
  initApp()
})

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    initApp()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (url) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
