<template>
  <el-config-provider :locale="locale">
    <div
      class="absolute inset-0 h-full flex flex-col px-4 pb-4 pt-1 space-y-4 overflow-hidden"
    >
      <div
        class="flex items-center flex-none border-b border-gray-200 dark:border-gray-700 pb-1"
      >
        <div class="flex-none">
          <el-segmented
            v-slot="{ item }"
            v-model="activeTab"
            :options="tabsModel"
            @change="onTabChange"
          >
            <div class="">
              {{ $t(item.label) }}
            </div>
          </el-segmented>
        </div>
        <div class="flex-1 w-0 flex items-center justify-end">
          <Quick />
        </div>
      </div>

      <div class="flex-1 h-0 overflow-auto">
        <template v-for="item of tabsModel" :key="item.value">
          <component
            :is="item.component"
            v-if="isRender(item)"
            v-show="item.value === activeTab"
          ></component>
        </template>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup>
import { i18n } from '$/locales/index.js'

import localeModel from '$/plugins/element-plus/locale.js'
import { usePreferenceStore } from '$/store/preference/index.js'
import { useUserStore } from '$/store/user/index.js'
import { useThemeStore } from '$/store/theme/index.js'
import { ElMessageBox } from 'element-plus'
import Device from './components/Device/index.vue'
import Preference from './components/Preference/index.vue'
import Quick from './components/Quick/index.vue'
import User from './components/User/index.vue'

const locale = computed(() => {
  const i18nLocale = i18n.global.locale.value

  const value = localeModel[i18nLocale]

  return value
})

const userStore = useUserStore()
const themeStore = useThemeStore()
const preferenceStore = usePreferenceStore()

// 检查登录状态
const checkLoginStatus = () => {
  if (!userStore.isLoggedIn) {
    // 未登录，显示登录组件
    return 'User'
  }
  return activeTab.value
}

const tabsModel = computed(() => {
  const baseTabs = [
    {
      label: 'device.list',
      value: 'Device',
      component: Device,
    }
  ]

  // 只有登录用户才能看到偏好设置
  if (userStore.isLoggedIn) {
    baseTabs.push({
      label: 'preferences.name',
      value: 'Preference',
      component: Preference,
    })
  }

  return baseTabs
})

const activeTab = ref(checkLoginStatus())
provide('activeTab', activeTab)

const renderTab = ref('')
const rendered = ref(true)
const renderSign = ref(false)

themeStore.init()
preferenceStore.init()

// 检查登录状态
userStore.checkLoginStatus()

// 如果未登录，强制显示登录界面
if (!userStore.isLoggedIn) {
  activeTab.value = 'User'
}

showTips()

async function showTips() {
  const { scrcpyPath } = window.electron?.configs || {}

  console.log('scrcpyPath', scrcpyPath, window.electron)

  if (scrcpyPath) {
    return false
  }

  ElMessageBox.alert(
    `<div>
      ${window.t('dependencies.lack.content', {
        name: '<a class="hover:underline text-primary-500" href="https://github.com/Genymobile/scrcpy" target="_blank">scrcpy</a>',
      })}
    <div>`,
    window.t('dependencies.lack.title'),
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: window.t('common.confirm'),
    },
  )
}

function isRender(item) {
  if (renderTab.value === item?.value) {
    return rendered.value
  }

  return true
}

async function reRender(other) {
  renderTab.value = other || activeTab.value

  rendered.value = false
  await nextTick()
  rendered.value = true

  renderTab.value = ''
}

function reRenderPost() {
  renderSign.value = true
}

async function onTabChange(value) {
  if (!renderSign.value) {
    return false
  }

  if (['Device', 'Preference'].includes(value)) {
    reRender()
  }

  renderSign.value = false
}

defineExpose({
  reRenderPost,
  reRender,
})
</script>

<style lang="postcss" scoped>
:deep() {
  .el-segmented {
    --el-border-radius-base: 5px;
    --el-segmented-bg-color: transparent;
    --el-segmented-item-selected-bg-color: var(--el-color-primary-light-9);
    --el-segmented-item-selected-color: rgba(var(--color-primary-500), 1);
  }
}
</style>
