import { replaceIP, restoreIP } from '$/utils/index.js'
import { cloneDeep, get, pickBy, set } from 'lodash-es'

import { defineStore } from 'pinia'

import {
  getDefaultData,
  getOtherFields,
  getStoreData,
  getTopFields,
  mergeConfig,
  setStoreData,
} from './helpers/index.js'
import model from './model/index.js'

import command from '$/utils/command/index.js'

const { adbPath, scrcpyPath } = window.electron?.configs || {}

export const usePreferenceStore = defineStore({
  id: 'app-preference',
  state() {
    const deviceScope = restoreIP(
      window.appStore.get('scrcpy.deviceScope') || 'global',
    )

    const userScope = window.appStore.get('scrcpy.userScope') || 'default'

    const recordKeys = Object.values(model?.record?.children || {}).map(
      item => item.field,
    )

    const cameraKeys = Object.values(model?.camera?.children || {}).map(
      item => item.field,
    )

    const otgKeys = Object.values(model?.otg?.children || {}).map(
      item => item.field,
    )

    return {
      model: cloneDeep(model),
      data: { ...getDefaultData() },
      deviceScope,
      userScope,
      excludeKeys: [
        '--display-overlay',
        '--camera',
        '--video-code',
        '--audio-code',
        '--keyboard-inject',
        '--audio-record-format',
        ...getOtherFields('scrcpy'),
      ],
      recordKeys,
      cameraKeys,
      otgKeys,
    }
  },
  getters: {},
  actions: {
    getDefaultData,

    init(scope = this.deviceScope, userScope = this.userScope) {
      if (userScope && userScope !== 'global') {
        this.userScope = userScope
      }

      this.data = this.getData(scope, this.userScope)
      return this.data
    },
    setScope(value) {
      this.deviceScope = replaceIP(value)
      window.appStore.set('scrcpy.deviceScope', this.deviceScope)
      this.init()
    },
    setUserScope(username) {
      this.userScope = username
      window.appStore.set('scrcpy.userScope', username)
      window.appStore.set('user.userScope', username)
      this.init()
    },
    getUserScope() {
      return window.appStore.get('scrcpy.userScope') || 'global'
    },
    getUserConfig(username) {
      return window.appStore.get(`user.${username}`) || {}
    },
    setData(data, scope = this.deviceScope, userScope = this.userScope) {
      const pickData = pickBy(
        data,
        value => !!value || typeof value === 'number',
      )

      if (data.adbPath === adbPath) {
        delete pickData.adbPath
      }

      if (data.scrcpyPath === scrcpyPath) {
        delete pickData.scrcpyPath
      }

      setStoreData(pickData, replaceIP(scope), userScope)

      this.init(scope, userScope)
    },
    reset(scope, userScope = this.userScope) {
      if (!scope && !userScope) {
        window.appStore.clear()
      } else {
        const fields = getTopFields()

        fields.forEach((key) => {
          if (key === 'scrcpy') {
            if (userScope && userScope !== 'global') {
              // 重置用户特定的 scrcpy 配置
              const userScrcpy = window.appStore.get(`user.${userScope}.scrcpy`) || {}
              if (scope) {
                userScrcpy[scope] = {}
              } else {
                userScrcpy['global'] = {}
              }
              window.appStore.set(`user.${userScope}.scrcpy`, userScrcpy)
            } else {
              // 重置默认的 scrcpy 配置
              this.deviceScope = scope || 'global'
              window.appStore.set(`scrcpy.${replaceIP(scope || 'global')}`, {})
            }
            return false
          }

          if (userScope && userScope !== 'global') {
            // 重置用户特定的配置
            const userConfig = window.appStore.get(`user.${userScope}`) || {}
            userConfig[key] = {}
            window.appStore.set(`user.${userScope}`, userConfig)
          } else {
            // 重置默认配置
            window.appStore.set(key, {})
          }
        })
      }

      this.init(scope, userScope)
    },
    resetDeps(type) {
      switch (type) {
        case 'adb':
          window.appStore.set('common.adbPath', '')
          break
        case 'scrcpy':
          window.appStore.set('common.scrcpyPath', '')
          break
        default:
          window.appStore.set('common.adbPath', '')
          window.appStore.set('common.scrcpyPath', '')
          break
      }
      this.init()
    },
    getData(scope = this.deviceScope, userScope = this.userScope) {
      let value = mergeConfig(getDefaultData(), getStoreData())

      if (scope !== 'global') {
        value = mergeConfig(value, getStoreData(replaceIP(scope), userScope))
      }

      return value
    },

    scrcpyParameter(
      scope = this.deviceScope,
      { isRecord = false, isCamera = false, isOtg = false, excludes = [] } = {},
    ) {
      const data = typeof scope === 'object' ? scope : this.getData(scope)

      if (!data) {
        return ''
      }

      const params = Object.entries(data).reduce((obj, [key, value]) => {
        const shouldExclude
          = (!value && typeof value !== 'number')
          || this.excludeKeys.includes(key)
          || (!isRecord && this.recordKeys.includes(key))
          || (!isCamera && this.cameraKeys.includes(key))
          || (!isOtg && this.otgKeys.includes(key))
          || excludes.includes(key)
          || excludes.includes(`${key}=${value}`)

        if (shouldExclude) {
          return obj
        }

        obj[key] = value

        return obj
      }, {})

      let value = command.stringify(params)

      if (data.scrcpyAppend) {
        value += ` ${data.scrcpyAppend}`
      }

      return value
    },
    getModel(path) {
      const value = get(this.model, path)

      return value
    },
    setModel(path, value) {
      set(this.model, path, value)

      return this.model
    },
    resetModel(path) {
      if (!path) {
        this.model = cloneDeep(model)
        return true
      }

      set(this.model, path, cloneDeep(get(model, path)))

      return true
    },
  },
})
