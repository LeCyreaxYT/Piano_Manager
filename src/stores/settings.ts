import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Hotkeys {
  start: string
  pause: string
  stop: string
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const hotkeys = ref<Hotkeys>({
    start: 'F2',
    pause: 'F3',
    stop: 'F4'
  })

  const showPianoVisualizer = ref(true)
  const showMetadata = ref(true)
  const editorFontSize = ref(14)

  // Actions
  function setHotkey(action: keyof Hotkeys, key: string) {
    hotkeys.value[action] = key
    // TODO: Sync with electron to update global shortcuts
  }

  function togglePianoVisualizer() {
    showPianoVisualizer.value = !showPianoVisualizer.value
  }

  function toggleMetadata() {
    showMetadata.value = !showMetadata.value
  }

  function setEditorFontSize(size: number) {
    editorFontSize.value = Math.max(10, Math.min(24, size))
  }

  // Load settings from localStorage
  function loadSettings() {
    try {
      const saved = localStorage.getItem('piano-manager-settings')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.hotkeys) hotkeys.value = data.hotkeys
        if (data.showPianoVisualizer !== undefined) showPianoVisualizer.value = data.showPianoVisualizer
        if (data.showMetadata !== undefined) showMetadata.value = data.showMetadata
        if (data.editorFontSize) editorFontSize.value = data.editorFontSize
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      localStorage.setItem('piano-manager-settings', JSON.stringify({
        hotkeys: hotkeys.value,
        showPianoVisualizer: showPianoVisualizer.value,
        showMetadata: showMetadata.value,
        editorFontSize: editorFontSize.value
      }))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  return {
    // State
    hotkeys,
    showPianoVisualizer,
    showMetadata,
    editorFontSize,

    // Actions
    setHotkey,
    togglePianoVisualizer,
    toggleMetadata,
    setEditorFontSize,
    loadSettings,
    saveSettings
  }
})
