import { createApp } from 'vue'
import App from './App.vue'

import plugins from './plugins/index.js'
import {i18n,t} from './locales'

import 'virtual:uno.css'
import './styles/index.js'

const app = createApp(App)

// 全局配置多语言
app.use(i18n)
window.t = t

app.use(plugins)

app.config.globalProperties.$electron = window.electron
app.config.globalProperties.$adb = window.adbkit()
app.config.globalProperties.$scrcpy = window.scrcpy()

app.mount('#app')
