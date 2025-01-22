<template>
  <el-config-provider :locale="locale">
    <div class="absolute inset-0 px-4 pb-4 h-full overflow-hidden">
      <el-button @click="handleLanguageChange"> 切换语言 </el-button>

      <el-tabs v-model="activeTab" class="el-tabs-flex">
        <el-tab-pane
          v-for="(item, index) of tabsModel"
          :key="index"
          :label="$t(item.label)"
          :name="item.prop"
          lazy
        >
          <component :is="componentMap[item.prop]" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, ref } from 'vue'
import { i18n } from './locales/index.js'
import Wired from './components/Wired/index.vue'
import Wireless from './components/Wireless/index.vue'
import Advanced from './components/Advanced/index.vue'

import enUs from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const { appContext } = getCurrentInstance()
const globalElectron = appContext.config.globalProperties.$electron

const localeModel = {
  'en-US': enUs,
  'zh-CN': zhCn
}

const handleLanguageChange = () => {
  const newLocale = i18n.global.locale === 'en-US' ? 'zh-CN' : 'en-US'
  //globalElectron.ipcRenderer.send('language-change', newLocale)
  i18n.global.locale = newLocale
}

const locale = computed(() => {
  const i18nLocale = i18n.global.locale

  return localeModel[i18nLocale]
})

//将字符串映射到组件
const componentMap = {
  Wired,
  Wireless,
  Advanced
}

const tabsModel = ref([
  {
    label: 'tabs.wired',
    prop: 'Wired'
  },
  {
    label: 'tabs.wireless',
    prop: 'Wireless'
  },
  {
    label: 'tabs.advanced',
    prop: 'Advanced'
  }
])

const activeTab = ref('Wired')

onMounted(() => {
  console.log('App mounted')
  // TODO 重构为进程间通信
  // globalElectron.ipcRenderer.on('language-change', (_event, data) => {
  //   console.log('language-change', data)
  //   i18n.global.locale = data
  // })
})
</script>
