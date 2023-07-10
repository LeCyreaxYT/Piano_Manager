
export interface IElectronAPI {
  clearNotes(): void
  startPianoBot(): void
  pausePianoBot(): void
  stopPianoBot(): void
  loadPianoBot(): void
  savePianoBot(): void

  syncData(data: any): void
  syncDataResponse(callback: (data: any) => void): void
  requestSync(): void
  requestSyncResponse(callback: (data: any) => void): void
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}