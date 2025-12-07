import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PlaybackState = 'stopped' | 'paused' | 'running'

export interface SongMetadata {
  difficulty?: string
  type?: string
  region?: string
  targetLength?: string
  tempo?: number
}

export interface PianoBotState {
  state: PlaybackState
  playtime: string
  estimatedDuration: string
  noteCount: number
  currentNoteIndex: number
  isLoop: boolean
  bpm: number
  notes: string
  error: string
  metadata: SongMetadata
}

export const usePianoBotStore = defineStore('pianoBot', () => {
  // State
  const state = ref<PlaybackState>('stopped')
  const playtime = ref('00:00:00')
  const estimatedDuration = ref('00:00:00')
  const noteCount = ref(0)
  const currentNoteIndex = ref(0)
  const isLoop = ref(false)
  const bpm = ref(135)
  const notes = ref('')
  const error = ref('')
  const metadata = ref<SongMetadata>({})
  const recentFiles = ref<string[]>([])

  // Computed
  const progress = computed(() => {
    if (noteCount.value === 0) return 0
    return (currentNoteIndex.value / noteCount.value) * 100
  })

  const isPlaying = computed(() => state.value === 'running')
  const isPaused = computed(() => state.value === 'paused')
  const isStopped = computed(() => state.value === 'stopped')

  const statusColor = computed(() => {
    switch (state.value) {
      case 'running': return 'success'
      case 'paused': return 'warning'
      case 'stopped': return 'error'
      default: return 'neutral'
    }
  })

  const statusText = computed(() => {
    switch (state.value) {
      case 'running': return 'Spielt'
      case 'paused': return 'Pausiert'
      case 'stopped': return 'Gestoppt'
      default: return 'Unbekannt'
    }
  })

  // Actions
  function parseMetadata(rawNotes: string): { metadata: SongMetadata; cleanNotes: string } {
    const lines = rawNotes.split('\n')
    const meta: SongMetadata = {}
    let notesStartIndex = 0

    // Parse metadata from header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const nextLine = lines[i + 1]?.trim()

      if (line === 'DIFFICULTY LEVEL' && nextLine) {
        // Skip the number, get the difficulty name
        const difficultyName = lines[i + 2]?.trim()
        if (difficultyName && !difficultyName.includes('TYPE')) {
          meta.difficulty = difficultyName
        }
        i += 2
      } else if (line === 'TYPE' && nextLine) {
        meta.type = nextLine
        // Check for region on next line
        const regionLine = lines[i + 2]?.trim()
        if (regionLine && !regionLine.includes('TARGET') && !regionLine.includes('TEMPO')) {
          meta.region = regionLine
          i += 2
        } else {
          i += 1
        }
      } else if (line === 'TARGET LENGTH' && nextLine) {
        meta.targetLength = nextLine
        i += 1
      } else if (line === 'TEMPO' && nextLine) {
        const tempoValue = parseInt(nextLine)
        if (!isNaN(tempoValue)) {
          meta.tempo = tempoValue
        }
        i += 1
        notesStartIndex = i + 1
        break
      } else if (line.includes('[') || line.includes('{') || /^[a-zA-Z0-9|]+$/.test(line)) {
        // Found notes, stop parsing metadata
        notesStartIndex = i
        break
      }
    }

    // Extract clean notes (everything after metadata)
    const cleanNotes = lines.slice(notesStartIndex).join('\n').trim()

    return { metadata: meta, cleanNotes }
  }

  function setNotes(rawNotes: string) {
    const { metadata: meta, cleanNotes } = parseMetadata(rawNotes)
    metadata.value = meta
    notes.value = cleanNotes

    // Auto-set BPM from metadata if available
    if (meta.tempo) {
      bpm.value = meta.tempo
    }

    // Sync with electron
    syncToElectron()
  }

  function setBpm(value: number) {
    bpm.value = Math.max(30, Math.min(300, value))
    syncToElectron()
  }

  function setLoop(value: boolean) {
    isLoop.value = value
    syncToElectron()
  }

  function syncToElectron() {
    if (window.api) {
      window.api.syncData({
        notes: notes.value,
        bpm: bpm.value,
        isLoop: isLoop.value
      })
    }
  }

  function updateFromElectron(data: any) {
    if (data.state !== undefined) state.value = data.state
    if (data.playtime !== undefined) playtime.value = data.playtime
    if (data.estimatedDuration !== undefined) estimatedDuration.value = data.estimatedDuration
    if (data.noteCount !== undefined) noteCount.value = data.noteCount
    if (data.currentNoteIndex !== undefined) currentNoteIndex.value = data.currentNoteIndex
    if (data.error !== undefined) error.value = data.error
    if (data.isLoop !== undefined) isLoop.value = data.isLoop
    if (data.bpm !== undefined) bpm.value = data.bpm
  }

  // Playback Controls
  function start() {
    if (window.api) {
      window.api.startPianoBot()
    }
  }

  function pause() {
    if (window.api) {
      window.api.pausePianoBot()
    }
  }

  function stop() {
    if (window.api) {
      window.api.stopPianoBot()
    }
  }

  function load() {
    if (window.api) {
      window.api.loadPianoBot()
    }
  }

  function save() {
    if (window.api) {
      window.api.savePianoBot()
    }
  }

  function reset() {
    notes.value = ''
    metadata.value = {}
    error.value = ''
    currentNoteIndex.value = 0
    syncToElectron()
  }

  // Initialize listeners
  function initElectronListeners() {
    if (window.api) {
      window.api.syncDataResponse((data: any) => {
        updateFromElectron(data)
      })

      window.api.requestSyncResponse((data: any) => {
        updateFromElectron(data)
        if (data.notes) {
          notes.value = data.notes
        }
      })

      // Request initial sync
      window.api.requestSync()
    }
  }

  return {
    // State
    state,
    playtime,
    estimatedDuration,
    noteCount,
    currentNoteIndex,
    isLoop,
    bpm,
    notes,
    error,
    metadata,
    recentFiles,

    // Computed
    progress,
    isPlaying,
    isPaused,
    isStopped,
    statusColor,
    statusText,

    // Actions
    setNotes,
    setBpm,
    setLoop,
    syncToElectron,
    updateFromElectron,
    start,
    pause,
    stop,
    load,
    save,
    reset,
    initElectronListeners
  }
})
