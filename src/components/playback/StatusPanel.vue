<template>
  <div class="status-panel pm-panel">
    <!-- Status Indicator -->
    <div class="flex items-center justify-center mb-4">
      <div
        class="pm-status-badge"
        :class="statusBadgeClass"
      >
        <span class="pm-status-dot" :class="statusDotClass"></span>
        <span class="font-medium">{{ store.statusText }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Playtime -->
      <div class="pm-stat-card">
        <div class="pm-stat-label">Spielzeit</div>
        <div class="pm-stat-value-primary">{{ store.playtime }}</div>
      </div>

      <!-- Estimated Duration -->
      <div class="pm-stat-card">
        <div class="pm-stat-label">Dauer</div>
        <div class="pm-stat-value">{{ store.estimatedDuration }}</div>
      </div>

      <!-- Note Count -->
      <div class="pm-stat-card">
        <div class="pm-stat-label">Noten</div>
        <div class="pm-stat-value">{{ store.noteCount }}</div>
      </div>

      <!-- BPM -->
      <div class="pm-stat-card">
        <div class="pm-stat-label">Tempo</div>
        <div class="pm-stat-value">{{ store.bpm }} <span class="text-xs font-normal text-text-muted">BPM</span></div>
      </div>

      <!-- Loop Status -->
      <div class="pm-stat-card">
        <div class="pm-stat-label">Loop</div>
        <div class="text-xl font-bold" :class="store.isLoop ? 'text-accent' : 'text-text-muted'">
          {{ store.isLoop ? 'An' : 'Aus' }}
        </div>
      </div>
    </div>

    <!-- Song Metadata -->
    <div v-if="hasMetadata && settings.showMetadata" class="mt-4 pt-4 border-t border-border">
      <div class="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Song Info</div>
      <div class="space-y-2 text-sm">
        <div v-if="store.metadata.difficulty" class="flex justify-between">
          <span class="text-text-muted">Schwierigkeit</span>
          <span :class="difficultyBadgeClass">{{ store.metadata.difficulty }}</span>
        </div>
        <div v-if="store.metadata.type" class="flex justify-between">
          <span class="text-text-muted">Typ</span>
          <span class="text-text-primary">{{ store.metadata.type }}</span>
        </div>
        <div v-if="store.metadata.region" class="flex justify-between">
          <span class="text-text-muted">Region</span>
          <span class="text-text-primary">{{ store.metadata.region }}</span>
        </div>
        <div v-if="store.metadata.targetLength" class="flex justify-between">
          <span class="text-text-muted">Länge</span>
          <span class="text-text-primary">{{ store.metadata.targetLength }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePianoBotStore, useSettingsStore } from '@store/index'

const store = usePianoBotStore()
const settings = useSettingsStore()

const hasMetadata = computed(() => {
  return store.metadata.difficulty || store.metadata.type || store.metadata.region || store.metadata.targetLength
})

const statusBadgeClass = computed(() => {
  switch (store.state) {
    case 'running': return 'pm-status-badge-running'
    case 'paused': return 'pm-status-badge-paused'
    case 'stopped': return 'pm-status-badge-stopped'
    default: return 'pm-status-badge-idle'
  }
})

const statusDotClass = computed(() => {
  switch (store.state) {
    case 'running': return 'pm-status-dot-running'
    case 'paused': return 'pm-status-dot-paused'
    case 'stopped': return 'pm-status-dot-stopped'
    default: return 'pm-status-dot-idle'
  }
})

const difficultyBadgeClass = computed(() => {
  const difficulty = store.metadata.difficulty?.toLowerCase()
  if (difficulty?.includes('easy') || difficulty?.includes('beginner')) {
    return 'pm-badge-success'
  } else if (difficulty?.includes('intermediate') || difficulty?.includes('medium')) {
    return 'pm-badge-warning'
  } else if (difficulty?.includes('hard') || difficulty?.includes('expert') || difficulty?.includes('advanced')) {
    return 'pm-badge-error'
  }
  return 'pm-badge-neutral'
})
</script>
