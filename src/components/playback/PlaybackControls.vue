<template>
  <div class="playback-controls pm-panel">
    <!-- Main Controls -->
    <div class="flex items-center justify-center gap-3 mb-4">
      <!-- Start Button -->
      <button
        @click="store.start()"
        :class="store.isPlaying ? 'pm-control-btn-success' : 'pm-control-btn-primary'"
        :disabled="!store.notes || store.isPlaying"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Pause Button -->
      <button
        @click="store.pause()"
        :class="store.isPaused ? 'pm-control-btn-warning' : 'pm-control-btn-ghost'"
        :disabled="store.isStopped"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Stop Button -->
      <button
        @click="store.stop()"
        :class="store.isStopped ? 'pm-control-btn-error' : 'pm-control-btn-ghost'"
        :disabled="store.isStopped"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Divider -->
      <div class="h-8 w-px bg-border mx-1"></div>

      <!-- Loop Toggle -->
      <button
        @click="store.setLoop(!store.isLoop)"
        :class="store.isLoop ? 'pm-control-btn-accent' : 'pm-control-btn-ghost'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" :class="store.isLoop ? '' : 'opacity-50'">
          <path fill-rule="evenodd" d="M12 5.25c1.213 0 2.415.046 3.605.135a3.256 3.256 0 013.01 3.01c.044.583.077 1.17.1 1.759L17.03 8.47a.75.75 0 10-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 00-1.06-1.06l-1.752 1.751c-.023-.65-.06-1.296-.108-1.939a4.756 4.756 0 00-4.392-4.392 49.422 49.422 0 00-7.436 0A4.756 4.756 0 003.89 8.282c-.017.224-.033.447-.046.672a.75.75 0 101.497.092c.013-.217.028-.434.044-.651a3.256 3.256 0 013.01-3.01c1.19-.09 2.392-.136 3.605-.136zm-6.97 6.22a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.752-1.751c.023.65.06 1.296.108 1.939a4.756 4.756 0 004.392 4.392 49.413 49.413 0 007.436 0 4.756 4.756 0 004.392-4.392c.017-.223.032-.447.046-.672a.75.75 0 00-1.497-.092c-.013.217-.028.434-.044.651a3.256 3.256 0 01-3.01 3.01 47.953 47.953 0 01-7.21 0 3.256 3.256 0 01-3.01-3.01 47.759 47.759 0 01-.1-1.759L6.97 15.53a.75.75 0 001.06-1.06l-3-3z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Hotkey Hints -->
    <div class="flex items-center justify-center gap-4 mb-4 text-xs text-text-muted">
      <span class="pm-kbd">F2</span>
      <span class="pm-kbd">F3</span>
      <span class="pm-kbd">F4</span>
    </div>

    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="flex justify-between text-xs text-text-muted mb-1">
        <span>{{ store.playtime }}</span>
        <span>{{ store.currentNoteIndex }} / {{ store.noteCount }}</span>
      </div>
      <div class="pm-progress-bar">
        <div
          class="pm-progress-fill"
          :class="{
            'bg-success': store.isPlaying,
            'bg-warning': store.isPaused,
            'bg-error': store.isStopped && store.noteCount > 0,
          }"
          :style="{ width: `${store.progress}%` }"
        ></div>
      </div>
    </div>

    <!-- BPM Slider -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium w-12 text-text-secondary">BPM</span>
      <input
        type="range"
        min="30"
        max="300"
        :value="store.bpm"
        @input="store.setBpm(Number(($event.target as HTMLInputElement).value))"
        class="pm-range-slider flex-1"
      />
      <input
        type="number"
        :value="store.bpm"
        @input="store.setBpm(Number(($event.target as HTMLInputElement).value))"
        min="30"
        max="300"
        class="pm-number-input w-20 text-center"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePianoBotStore } from '@store/index'

const store = usePianoBotStore()
</script>
