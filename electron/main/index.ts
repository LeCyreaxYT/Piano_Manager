import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import pianoBot from './events/pianoBot';

// Custom Titlebar
import { setupTitlebar, attachTitlebarToWindow } from "custom-electron-titlebar/main";
setupTitlebar();

// Set environment variables
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

// Main window
let mainWindow: BrowserWindow | null = null

export class WindowManager {
  public static init() {
    mainWindow = WindowManager.createWindow();

    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
      mainWindow.loadURL(url)
      mainWindow.webContents.openDevTools()
    } else {
      mainWindow.loadFile(indexHtml)
    }
  
    // Test actively push message to the Electron-Renderer
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
    })
  
    // Make all links open with the browser, not with the application
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url)
      return { action: 'deny' }
    })
  
    // Attach the titlebar to the window
    WindowManager.attachTitleBar();

    // ----------------- [Piano Bot] ----------------- //
    pianoBot.init(mainWindow);
  }

  public static createWindow() {
    const win = new BrowserWindow({
      title: 'Piano Manager | By DerEchteAlec',
      icon: join(process.env.PUBLIC, 'logo.png'),

      titleBarStyle: 'hidden',
      height: 600,
      width: 800,
      resizable: false,

      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: true,
      },
    })

    return win;
  }

  public static attachTitleBar() {
    attachTitlebarToWindow(mainWindow);
  }
}

app.whenReady().then(WindowManager.init)

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (mainWindow) {
    // Focus on the main window if the user tried to open another
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    WindowManager.init()
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

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})