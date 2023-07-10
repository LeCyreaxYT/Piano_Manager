<template>
    <div class="relative top-0 left-0 h-full w-full select-none">
      <div class="flex flex-row gap-4 h-full pb-2">
        <div class="basis-5/6 h-full pb-10">
          <label for="noten" class="block mb-2 text-sm font-medium text-white">Noten (VirtualPiano.net)</label>
          <textarea id="noten" v-model="notesRaw" class="inline-block p-2.5 w-full h-full text-sm rounded-md border bg-zinc-800 border-gray-600 placeholder-gray-400 text-white resize-none" placeholder="Packe hier die Song Noten rein..">
            {{ notesRaw }}
          </textarea>
        </div>

        <div class="basis-1/6">
          <label for="noten" class="block mb-2 text-sm font-medium text-white">Buttons</label>

          <button class="bg-gray-500 hover:bg-gray-400 text-white font-bold text-sm py-2 px-2 mb-3 rounded w-full" @click="clearNotes">Zurücksetzen</button>
          <button class="bg-gray-500 hover:bg-gray-400 text-white font-bold text-sm py-2 px-2 mb-3 rounded w-full h-14" @click="startPianoBot">Start</button>
          <button class="bg-gray-500 hover:bg-gray-400 text-white font-bold text-sm py-2 px-2 mb-3 rounded w-full h-14" @click="pausePianoBot">Pause</button>
          <button class="bg-gray-500 hover:bg-gray-400 text-white font-bold text-sm py-2 px-2 mb-3 rounded w-full h-14" @click="stopPianoBot">Stop</button>
          <button class="bg-gray-500 hover:bg-gray-400 text-white font-bold text-sm py-2 px-2 mb-3 rounded w-full h-14" @click="loadPianoBot">Noten Laden</button>
          <button class="bg-gray-500 hover:bg-gray-400 text-white font-bold text-sm py-2 px-2 mb-3 rounded w-full h-14" @click="savePianoBot">Noten Speichern</button>

          <div>
            <input type="checkbox" class="form-checkbox h-5 w-5 text-gray-600" id="checkbox1"> 
            <label class="text-white pl-2 text-sm" for="checkbox1">Loop</label>
          </div>
        </div>
      </div>
      
      <div class="relative bottom-3 flex flex-row items-start justify-start gap-2 select-none" v-if="errorMessages">
        <p class="text-sm text-red-500">Fehlermeldungen:</p>
        <p class="text-sm text-white">{{ errorMessages }}</p>
      </div>
      <div class="relative bottom-3 flex flex-row items-end justify-end gap-4 select-none" v-else>
        <p class="text-white text-sm" v-if="state === 'stopped'">Status: <span class="text-red-500">Stopped</span></p>
        <p class="text-white text-sm" v-else-if="state === 'paused'">Status: <span class="text-yellow-500">Paused</span></p>
        <p class="text-white text-sm" v-else>Status: <span class="text-green-500">Running</span></p>

        <p class="text-white text-sm">Spielzeit: <span class="text-green-500">{{ playtime }}</span></p>
        <p class="text-white text-sm">Noten: <span class="text-green-500">{{ notesCount }}</span></p>
        <p class="text-white text-sm">Version: <span class="text-green-500">{{ version}}</span></p>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Home',

  data() {
    return {
      state: "stopped",
      playtime: "00:00:00",
      notesCount: 0,
      version: "1.0.0",

      notesRaw: "",
      nodes: [],

      errorMessages: "",
      isTimeoutActive: null as NodeJS.Timeout | null
    }
  },

  watch: {
    notesRaw: function (val) {
      this.$nextTick(function () {
        if (this.isTimeoutActive) {
          clearTimeout(this.isTimeoutActive)
        }

        this.isTimeoutActive = setTimeout(() => {
          window.api.syncData({
            notesRaw: val
          })
        }, 1000)
      })
  
    }
  },

  methods: {
    clearNotes() {
      this.notesRaw = ""

      this.$nextTick(function () {
        window.api.syncData({
          notesRaw: ""
        })
      })
    },

    startPianoBot() {
      window.api.startPianoBot()
    },

    pausePianoBot() {
      window.api.pausePianoBot()
    },

    stopPianoBot() {
      window.api.stopPianoBot()
    },

    loadPianoBot() {
      window.api.loadPianoBot()
    },

    savePianoBot() {
      window.api.savePianoBot()
    }
  },

  computed: {

  },

  async mounted() {
    window.api.syncDataResponse((data: any) => {
      this.state = data.state
      this.playtime = data.playtime
      this.notesCount = data.notesCount
      this.version = data.version

      this.nodes = data.nodes
      this.errorMessages = data.errorMessages
    })

    window.api.requestSyncResponse((data: any) => {
      this.notesRaw = data.notesRaw;
    })
    window.api.requestSync();
  },

  unmounted() {

  },
})
</script>

<style lang="scss">

</style>
