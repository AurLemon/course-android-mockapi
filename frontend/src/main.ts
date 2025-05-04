import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara'

import 'material-icons/iconfont/material-icons.css'
import './assets/styles/global.scss'
import './assets/styles/tailwind.css'

import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Lara,
  },
})

app.mount('#app')
