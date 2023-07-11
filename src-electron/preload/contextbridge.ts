// ----------------------------------------------------------------------
import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
    clearNotes: () => ipcRenderer.send('clearNoteds'),
    startPianoBot: () => ipcRenderer.send('startPianoBot'),
    pausePianoBot: () => ipcRenderer.send('pausePianoBot'),
    stopPianoBot: () => ipcRenderer.send('stopPianoBot'),
    loadPianoBot: () => ipcRenderer.send('loadPianoBot'),
    savePianoBot: () => ipcRenderer.send('savePianoBot'),

    syncData: (data: any) => ipcRenderer.send('syncData', data),
    syncDataResponse: (callback: (data: any) => void) => ipcRenderer.on('syncDataResponse', (event, data) => callback(data)),

    requestSync: () => ipcRenderer.send('requestSync'),
    requestSyncResponse: (callback: (data: any) => void) => ipcRenderer.on('requestSyncResponse', (event, data) => callback(data))
})