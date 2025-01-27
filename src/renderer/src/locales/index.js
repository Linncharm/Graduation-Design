import { createI18n } from 'vue-i18n'
import en from './modules/en_US.json'
import zh from './modules/zh-CN.json'
import localStorage from '@renderer/utils/storages/localStorage.js'

const messages = {
  en: en,
  zh: zh
};

// 获取缓存的语言设置
export const locale = localStorage.get('scrcpyCache')['lang'] || window.navigator.language

export const i18n = createI18n({
  allowComposition: false,
  messages,
  locale,
  fallbackLocale: 'en-US',
  fallbackWarn: false,
  missingWarn: false,
})

export const t = i18n.global.t
