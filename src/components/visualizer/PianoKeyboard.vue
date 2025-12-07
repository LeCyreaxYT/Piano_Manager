<template>
  <div class="piano-keyboard pm-panel">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium text-text-primary">Piano Visualizer</span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-text-muted">Aktive Note:</span>
        <span class="pm-kbd" :class="activeKey ? 'text-primary' : ''">{{ activeKey || '-' }}</span>
      </div>
    </div>

    <!-- Piano Keys -->
    <div class="pm-piano-container relative h-24 select-none">
      <!-- White Keys -->
      <div class="white-keys flex h-full">
        <div
          v-for="key in whiteKeys"
          :key="key.note"
          class="pm-white-key"
          :class="{ 'active': isKeyActive(key.note) }"
          @mousedown="pressKey(key.note)"
          @mouseup="releaseKey(key.note)"
          @mouseleave="releaseKey(key.note)"
        >
          <span class="text-[10px] text-gray-500 font-mono">{{ key.label }}</span>
        </div>
      </div>

      <!-- Black Keys -->
      <div class="black-keys absolute top-0 left-0 right-0 h-14 flex pointer-events-none">
        <div
          v-for="(key, index) in blackKeyPositions"
          :key="index"
          class="black-key-wrapper flex-1 relative"
        >
          <div
            v-if="key"
            class="pm-black-key"
            :class="{ 'active': isKeyActive(key.note) }"
            @mousedown="pressKey(key.note)"
            @mouseup="releaseKey(key.note)"
            @mouseleave="releaseKey(key.note)"
          >
            <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 font-mono">
              {{ key.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-center gap-4 mt-3 text-xs text-text-muted">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-white border border-border rounded-sm"></div>
        <span>Normale Tasten</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-surface-900 rounded-sm"></div>
        <span>Shift-Tasten</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-primary rounded-sm"></div>
        <span>Aktiv</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePianoBotStore } from '@store/index'

const store = usePianoBotStore()

// Active keys tracking - use exact key matching (case-sensitive)
const activeKeys = ref<Set<string>>(new Set())
const activeKey = ref<string | null>(null)

// White keys (lowercase letters for white keys)
const whiteKeys = [
  { note: '1', label: '1' },
  { note: '2', label: '2' },
  { note: '3', label: '3' },
  { note: '4', label: '4' },
  { note: '5', label: '5' },
  { note: '6', label: '6' },
  { note: '7', label: '7' },
  { note: '8', label: '8' },
  { note: '9', label: '9' },
  { note: '0', label: '0' },
  { note: 'q', label: 'q' },
  { note: 'w', label: 'w' },
  { note: 'e', label: 'e' },
  { note: 'r', label: 'r' },
  { note: 't', label: 't' },
  { note: 'y', label: 'y' },
  { note: 'u', label: 'u' },
  { note: 'i', label: 'i' },
  { note: 'o', label: 'o' },
  { note: 'p', label: 'p' },
]

// Black key positions (uppercase letters for black keys / shift keys)
// null = no black key at this position
const blackKeyPositions = [
  null, // after 1
  { note: '!', label: '!' },
  { note: '@', label: '@' },
  null, // after 4
  { note: '$', label: '$' },
  { note: '%', label: '%' },
  { note: '^', label: '^' },
  null, // after 8
  { note: '(', label: '(' },
  null, // after 0
  { note: 'Q', label: 'Q' },
  { note: 'W', label: 'W' },
  null, // after e
  { note: 'R', label: 'R' },
  { note: 'T', label: 'T' },
  null, // after y
  { note: 'U', label: 'U' },
  { note: 'I', label: 'I' },
  { note: 'O', label: 'O' },
  null, // after p
]

// FIXED: Use exact key matching - don't match uppercase with lowercase
function isKeyActive(note: string): boolean {
  return activeKeys.value.has(note)
}

function pressKey(note: string) {
  activeKeys.value.add(note)
  activeKey.value = note
}

function releaseKey(note: string) {
  activeKeys.value.delete(note)
  if (activeKey.value === note) {
    activeKey.value = activeKeys.value.size > 0 ? Array.from(activeKeys.value)[0] : null
  }
}

// Clear all keys
function clearAllKeys() {
  activeKeys.value.clear()
  activeKey.value = null
}

// Timeout reference for auto-clearing keys
let autoClearTimeout: ReturnType<typeof setTimeout> | null = null

// Watch for playback state changes
watch(() => store.state, (newState) => {
  if (newState === 'stopped') {
    clearAllKeys()
  }
})

// Watch for current note changes during playback
watch(() => store.currentNoteIndex, () => {
  // Clear previous timeout
  if (autoClearTimeout) {
    clearTimeout(autoClearTimeout)
  }

  // Auto-clear keys after note duration (prevents stuck keys)
  autoClearTimeout = setTimeout(() => {
    clearAllKeys()
  }, 150)
})

// Handle global mouseup to prevent stuck keys when mouse leaves component while pressed
function handleGlobalMouseUp() {
  clearAllKeys()
}

onMounted(() => {
  window.addEventListener('mouseup', handleGlobalMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
  if (autoClearTimeout) {
    clearTimeout(autoClearTimeout)
  }
})
</script>
