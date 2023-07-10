import { createApp, VueElement } from 'vue';

// Components
import AppBase from '@/App.vue';

// Plugins
import router from '@plugin/router'

// Styles
import '@assets/tailwind.css';

class Base {
    static _app: ReturnType<typeof createApp>

    static init() {
        Base._app = createApp(AppBase)
        Base._app.use(router)
        Base._app.mount("#app").$nextTick(() => {
            postMessage({ payload: 'removeLoading' }, '*')
        })
    }
}

Base.init()

export default Base
