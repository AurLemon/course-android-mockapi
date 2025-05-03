import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/styles/global.scss'
import './assets/styles/tailwind.css'
import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount("#app")
