// ----------------------------------------------------------------------
import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
    // Piano Bot Controls
    startPianoBot: () => ipcRenderer.send('startPianoBot'),
    pausePianoBot: () => ipcRenderer.send('pausePianoBot'),
    stopPianoBot: () => ipcRenderer.send('stopPianoBot'),
    loadPianoBot: () => ipcRenderer.send('loadPianoBot'),
    savePianoBot: () => ipcRenderer.send('savePianoBot'),

    // Data Sync
    syncData: (data: any) => ipcRenderer.send('syncData', data),
    syncDataResponse: (callback: (data: any) => void) => ipcRenderer.on('syncDataResponse', (_event, data) => callback(data)),

    requestSync: () => ipcRenderer.send('requestSync'),
    requestSyncResponse: (callback: (data: any) => void) => ipcRenderer.on('requestSyncResponse', (_event, data) => callback(data)),

    // Window Controls
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
})

// Also expose as electronAPI for the titlebar component
contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
})
