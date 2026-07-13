import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'

import '@ionic/vue/css/ionic.bundle.css'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(IonicVue)
app.use(router)

router.isReady().then(() => app.mount('#app'))
