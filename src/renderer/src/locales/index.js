import { createI18n } from 'vue-i18n'
import en from './modules/en_US.json'
import zh from './modules/zh-CN.json'

const messages = {
  en: en,
  zh: zh
};

export const locale = window.navigator.language

export const i18n = createI18n({
  allowComposition: false,
  messages,
  locale,
  fallbackLocale: 'en-US',
  fallbackWarn: false,
  missingWarn: false,
})

export const t = i18n.global.t
