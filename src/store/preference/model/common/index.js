import { locale } from '$/locales/index.js'

const { adbPath, scrcpyPath, desktopPath }
  = window?.electron?.configs || {}

export default {
  label: 'preferences.common.name',
  field: 'common',

  children: {
    theme: {
      label: 'preferences.common.theme.name',
      field: 'theme',
      type: 'Select',
      value: 'system',
      placeholder: 'preferences.common.theme.placeholder',
      options: [
        {
          label: 'preferences.common.theme.options[0]',
          value: 'light',
        },
        {
          label: 'preferences.common.theme.options[1]',
          value: 'dark',
        },
        {
          label: 'preferences.common.theme.options[2]',
          value: 'system',
        },
      ],
      props: {
        clearable: false,
      },
    },
    language: {
      label: 'common.language.name',
      field: 'language',
      type: 'LanguageSelect',
      value: locale,
      placeholder: 'common.language.placeholder',
      options: [
        {
          label: 'common.language.zh-CN',
          value: 'zh-CN',
        },
        {
          label: 'common.language.zh-TW',
          value: 'zh-TW',
        },
        {
          label: 'common.language.en-US',
          value: 'en-US',
        },
        {
          label: 'common.language.ru-RU',
          value: 'ru-RU',
        },
      ],
    },
    savePath: {
      label: 'preferences.common.file.name',
      field: 'savePath',
      type: 'PathInput',
      value: desktopPath,
      placeholder: 'preferences.common.file.placeholder',
      tips: 'preferences.common.file.tips',
      properties: ['openDirectory'],
    },
    adbPath: {
      label: 'preferences.common.adb.name',
      field: 'adbPath',
      value: adbPath,
      type: 'PathInput',
      placeholder: 'preferences.common.adb.placeholder',
      tips: 'preferences.common.adb.tips',
      properties: ['openFile'],
      filters: [{ name: 'preferences.common.adb.name', extensions: ['*'] }],
    },
    scrcpyPath: {
      label: 'preferences.common.scrcpy.name',
      field: 'scrcpyPath',
      value: scrcpyPath,
      type: 'PathInput',
      placeholder: 'preferences.common.scrcpy.placeholder',
      tips: 'preferences.common.scrcpy.tips',
      properties: ['openFile'],
      filters: [{ name: 'preferences.common.scrcpy.name', extensions: ['*'] }],
    },
    scrcpyAppend: {
      label: 'preferences.common.scrcpy.append.name',
      field: 'scrcpyAppend',
      value: undefined,
      type: 'Input',
      placeholder: 'preferences.common.scrcpy.append.placeholder',
      tips: 'preferences.common.scrcpy.append.tips',
      props: {
        type: 'textarea',
        rows: 4,
      },
      span: 24,
    },
    autoConnect: {
      label: 'preferences.common.auto-connect.name',
      field: 'autoConnect',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.common.auto-connect.placeholder',
    },
    autoMirror: {
      label: 'preferences.common.auto-mirror.name',
      field: 'autoMirror',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.common.auto-mirror.placeholder',
    },
    floatControl: {
      label: 'preferences.common.floatControl.name',
      field: 'floatControl',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.common.floatControl.placeholder',
    },
    debug: {
      label: 'preferences.common.debug.name',
      field: 'debug',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.common.debug.placeholder',
      tips: 'preferences.common.debug.tips',
    },
  },
}
