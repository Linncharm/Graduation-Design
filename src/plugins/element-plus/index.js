import * as ElementPlusIcons from '@element-plus/icons-vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import ElementPlus from "element-plus";

import EleTooltipButton from './expands/EleTooltipButton/index.vue'

import 'element-plus/theme-chalk/el-loading.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-badge.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './restyle.css'

export default {
  install(app) {
    for (const [key, component] of Object.entries(ElementPlusIcons)) {
      app.component(key, component)
    }

    ElMessage.loading = (message, options = {}) =>
      ElMessage({
        duration: 0,
        ...options,
        message,
        icon: EleIconLoading,
      })

    app.use(ElementPlus)
    app.use(ElMessage)
    app.use(ElMessageBox)
    app.use(ElLoading)

    app.component('EleTooltipButton', EleTooltipButton)
  },
}
