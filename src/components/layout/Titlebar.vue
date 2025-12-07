<template>
  <div class="titlebar h-8 bg-surface-900 flex items-center justify-between px-3 select-none"
       style="-webkit-app-region: drag;">
    <!-- Left: Logo & Title -->
    <div class="flex items-center gap-2">
      <div class="w-5 h-5 rounded bg-primary flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-primary-content">
          <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
        </svg>
      </div>
      <span class="text-sm font-medium text-text-primary">Piano Manager</span>
      <span class="text-xs text-text-muted ml-1">v{{ version }}</span>
    </div>

    <!-- Right: Window Controls -->
    <div class="flex items-center h-full" style="-webkit-app-region: no-drag;">
      <button @click="minimize"
              class="flex items-center justify-center h-full w-10 text-text-secondary hover:bg-surface-700 hover:text-text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
          <path d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" />
        </svg>
      </button>
      <button @click="maximize"
              class="flex items-center justify-center h-full w-10 text-text-secondary hover:bg-surface-700 hover:text-text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
          <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 0a.75.75 0 00-.75.75v10.5c0 .414.336.75.75.75h9a.75.75 0 00.75-.75V6.75a.75.75 0 00-.75-.75h-9z" clip-rule="evenodd" />
        </svg>
      </button>
      <button @click="close"
              class="flex items-center justify-center h-full w-10 text-text-secondary hover:bg-error hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
          <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const version = ref('1.0.1')

// Window controls - these will be handled by electron
function minimize() {
  // @ts-ignore
  if (window.electronAPI?.minimize) {
    // @ts-ignore
    window.electronAPI.minimize()
  }
}

function maximize() {
  // @ts-ignore
  if (window.electronAPI?.maximize) {
    // @ts-ignore
    window.electronAPI.maximize()
  }
}

function close() {
  // @ts-ignore
  if (window.electronAPI?.close) {
    // @ts-ignore
    window.electronAPI.close()
  }
}
</script>

<style scoped>
.titlebar {
  -webkit-user-select: none;
  user-select: none;
}
</style>
