<template>
  <div class="home-view flex flex-col h-full overflow-hidden">
    <!-- Toolbar -->
    <Toolbar @openSettings="showSettings = true" />

    <!-- Main Content -->
    <div class="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
      <!-- Left: Editor -->
      <div class="flex-1 flex flex-col min-w-0">
        <NoteEditor class="flex-1 min-h-0" />

        <!-- Piano Visualizer (optional) -->
        <div v-if="settings.showPianoVisualizer" class="mt-4">
          <PianoKeyboard />
        </div>
      </div>

      <!-- Right: Controls & Status -->
      <div class="w-72 flex flex-col gap-4 shrink-0">
        <StatusPanel />
        <PlaybackControls />
      </div>
    </div>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="pm-modal-overlay" @click.self="closeSettings">
        <div class="pm-modal-container">
          <div class="pm-modal-header">
            <h3 class="pm-modal-title">Einstellungen</h3>
            <button class="pm-modal-close" @click="closeSettings">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="pm-modal-body">
            <!-- Hotkeys Section -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Hotkeys</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-text-primary">Start</span>
                  <span class="pm-kbd">{{ settings.hotkeys.start }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-text-primary">Pause</span>
                  <span class="pm-kbd">{{ settings.hotkeys.pause }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-text-primary">Stop</span>
                  <span class="pm-kbd">{{ settings.hotkeys.stop }}</span>
                </div>
              </div>
              <p class="text-xs text-text-muted mt-2">Hotkey-Anpassung kommt bald...</p>
            </div>

            <!-- Display Section -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Anzeige</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-text-primary">Piano Visualizer</span>
                  <input
                    type="checkbox"
                    class="pm-toggle"
                    :checked="settings.showPianoVisualizer"
                    @change="settings.togglePianoVisualizer()"
                  />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-text-primary">Song Metadaten</span>
                  <input
                    type="checkbox"
                    class="pm-toggle"
                    :checked="settings.showMetadata"
                    @change="settings.toggleMetadata()"
                  />
                </label>
              </div>
            </div>

            <!-- About Section -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">Info</h4>
              <div class="text-sm space-y-1">
                <p class="text-text-primary">Piano Manager v1.0.1</p>
                <p class="text-text-muted">Entwickelt von DerEchteAlec</p>
              </div>
              <div class="flex gap-2 mt-3">
                <a href="https://github.com/LeCyreaxYT" target="_blank" class="pm-link-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://discord.gg/example" target="_blank" class="pm-link-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
                  </svg>
                  Discord
                </a>
              </div>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-border flex justify-end">
            <button class="pm-btn-primary" @click="closeSettings">Schließen</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@store/index'

// Components
import Toolbar from '@components/layout/Toolbar.vue'
import NoteEditor from '@components/editor/NoteEditor.vue'
import PlaybackControls from '@components/playback/PlaybackControls.vue'
import StatusPanel from '@components/playback/StatusPanel.vue'
import PianoKeyboard from '@components/visualizer/PianoKeyboard.vue'

const settings = useSettingsStore()

const showSettings = ref(false)

function closeSettings() {
  showSettings.value = false
  settings.saveSettings()
}

// Keyboard shortcuts for modal
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showSettings.value) {
    closeSettings()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
