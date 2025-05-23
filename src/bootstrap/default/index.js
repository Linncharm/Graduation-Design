import { createApp, toRaw } from 'vue'

import icons from '$/icons/index.js'

import { i18n, t } from '$/locales/index.js'

import plugins from '$/plugins/index.js'

import store from '$/store/index.js'

import { replaceIP, restoreIP } from '$/utils/index.js'

import '$/utils/console.js'

import 'virtual:uno.css'
import '$/styles/index.js'
import ElementPlus from "element-plus";

export default (App) => {
  const app = createApp(App)
  app.use(ElementPlus)

  app.use(store)

  app.use(plugins)

  app.use(icons)

  app.use(i18n)
  window.t = t

  app.config.globalProperties.$path = window.nodePath
  app.config.globalProperties.$appStore = window.appStore
  app.config.globalProperties.$appLog = window.appLog
  app.config.globalProperties.$electron = window.electron

  app.config.globalProperties.$adb = window.adbkit
  app.config.globalProperties.$scrcpy = window.scrcpy

  app.config.globalProperties.$replaceIP = replaceIP
  app.config.globalProperties.$restoreIP = restoreIP

  app.config.globalProperties.$toRaw = toRaw

  app.mount('#app').$nextTick(() => {
    // Remove Preload scripts loading
    postMessage({ payload: 'removeLoading' }, '*')
  })
}
