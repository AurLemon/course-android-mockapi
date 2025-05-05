import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'
import Lara from '@primeuix/themes/lara'

import 'primeicons/primeicons.css'
import 'material-icons/iconfont/material-icons.css'
import './assets/styles/global.scss'
import './assets/styles/tailwind.css'

import router from './router'
import App from './App.vue'

function generateHSLShades(h: number, s: number, baseL: number) {
  const steps = {
    50: baseL + 42,
    100: baseL + 35,
    200: baseL + 25,
    300: baseL + 15,
    400: baseL + 5,
    500: baseL,
    600: baseL - 7,
    700: baseL - 14,
    800: baseL - 21,
    900: baseL - 28,
    950: baseL - 35,
  }

  const shades: Record<string, string> = {}
  for (const [key, l] of Object.entries(steps)) {
    shades[key] = `hsl(${h}, ${s}%, ${Math.max(0, Math.min(100, l))}%)`
  }

  return shades
}

const primaryHSL = generateHSLShades(200, 55, 48)

const customLara = definePreset(Lara, {
  semantic: {
    primary: primaryHSL,
  },
})

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: customLara,
  },
})
app.use(ConfirmationService)
app.use(ToastService)

app.mount('#app')
