<template>
  <div class="relative top-0 left-0 h-full w-full select-none">
    <div class="w-full bg-zinc-900/80 rounded-md py-2 px-3 mb-4">
      <div class="flex flex-col items-start justify-between">
        <p class="text-white text-base font-bold mb-4">Hotkeys (Comming Soon)</p>

        <!-- Start -->
        <div class="flex flex-row items-center justify-center gap-2 mb-4">
          <p class="text-white text-sm pr-2">Start</p>
          <input type="text" v-model="start" class="inline-block p-1 w-28 text-sm rounded-md border bg-zinc-800 border-gray-600 placeholder-gray-400 text-white" placeholder="Key" />
        </div>

        <!-- Pause -->
        <div class="flex flex-row items-center justify-center gap-2 mb-4">
          <p class="text-white text-sm">Pause</p>
          <input type="text" v-model="pause" class="inline-block p-1 w-28 text-sm rounded-md border bg-zinc-800 border-gray-600 placeholder-gray-400 text-white" placeholder="Key" />
        </div>

        <!-- Stop -->
        <div class="flex flex-row items-center justify-center gap-2">
          <p class="text-white text-sm pr-2">Stop</p>
          <input type="text" v-model="stop" class="inline-block p-1 w-28 text-sm rounded-md border bg-zinc-800 border-gray-600 placeholder-gray-400 text-white" placeholder="Key" />
        </div>

      </div>
    </div>

    <div class="w-full bg-zinc-900/80 rounded-md py-2 px-3">
      <div class="flex flex-col items-start justify-between">
        <p class="text-white text-base font-bold mb-4">Bot Settings</p>

        <div class="flex flex-row items-center justify-center gap-2 mb-4">
          <p class="text-white text-sm pr-3">BPM</p>
          <input type="number" v-model="bpm" class="inline-block p-1 w-28 text-sm rounded-md border bg-zinc-800 border-gray-600 placeholder-gray-400 text-white" placeholder="1 - 999" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Settings',

  data() {
    return {
      start: "",
      pause: "",
      stop: "",

      bpm: 0,
    }
  },

  watch: {
    start() {
      window.api.syncData({
        startHotkey: this.start
      })
    },

    pause() {
      window.api.syncData({
        pauseHotkey: this.start
      })
    },

    stop() {
      window.api.syncData({
        stopHotkey: this.start
      })
    },

    bpm() {
      window.api.syncData({
        bpm: this.bpm
      })
    }
  },

  methods: {
    
  },

  computed: {

  },


  async mounted() {
    window.api.requestSyncResponse((data: any) => {
      this.start = data.startHotkey
      this.pause = data.pauseHotkey
      this.stop = data.stopHotkey

      this.bpm = data.bpm
    })

    window.api.requestSync();
  },

  unmounted() {
  },
})
</script>

<style lang="scss">

</style>
