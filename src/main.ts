import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Components
import AppBase from '@/App.vue'

// Plugins
import router from '@plugin/router'

// Styles
import '@assets/tailwind.css'
import '@assets/styles.css'

// Stores
import { usePianoBotStore, useSettingsStore } from '@store/index'

class Base {
  static _app: ReturnType<typeof createApp>
  static _pinia: ReturnType<typeof createPinia>

  static init() {
    // Create Pinia instance
    Base._pinia = createPinia()

    // Create Vue app
    Base._app = createApp(AppBase)
    Base._app.use(Base._pinia)
    Base._app.use(router)

    // Mount app
    Base._app.mount('#app').$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')

      // Initialize stores after mount
      const pianoBotStore = usePianoBotStore()
      const settingsStore = useSettingsStore()

      // Load saved settings
      settingsStore.loadSettings()

      // Initialize electron listeners
      pianoBotStore.initElectronListeners()
    })
  }
}

Base.init()

export default Base
