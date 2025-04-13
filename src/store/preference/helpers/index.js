import { cloneDeep, keyBy, mergeWith, uniq } from 'lodash-es'
import model from '../model/index.js'

export function getTopFields(data = model) {
  return uniq(Object.values(data).map(item => item.field))
}

const topFields = getTopFields()

export function getModelMap(data = model) {
  const value = Object.entries(data).reduce((obj, [parentId, parentItem]) => {
    const children
      = Object.entries(parentItem?.children || {})?.map(([id, item]) => ({
        ...item,
        parentField: parentItem.field,
        parentId,
        id,
      })) || []

    const subData = keyBy(children, 'field')

    obj = {
      ...obj,
      ...subData,
    }

    return obj
  }, {})

  return value
}

export function getDefaultData(parentId, iteratee) {
  const modelMap = getModelMap()

  iteratee = iteratee ?? (value => value)

  const value = Object.entries(modelMap).reduce((obj, [key, data]) => {
    if (!parentId || data.parentId === parentId) {
      obj[key] = iteratee(data.value)
    }
    return obj
  }, {})

  return value
}

export const getStoreData = (scope, userScope) => {
  const value = {}

  topFields.forEach((key) => {
    const storeValue = window.appStore.get(key) || {}

    // 如果有用户特定的配置，优先使用
    if (userScope && userScope !== 'global') {
      const userConfig = window.appStore.get(`user.${userScope}`) || {}
      if (userConfig[key]) {
        Object.assign(value, userConfig[key])
      }
    }

    // 对于 scrcpy 配置，需要特殊处理
    if (key === 'scrcpy') {
      // 先获取用户特定的 scrcpy 配置
      if (userScope && userScope !== 'global') {
        const userScrcpy = window.appStore.get(`user.${userScope}.scrcpy`) || {}
        // 先获取用户特定的全局配置
        Object.assign(value, userScrcpy['global'] || {})
        // 再获取用户特定的设备配置
        if (scope && scope !== 'global') {
          Object.assign(value, userScrcpy[scope] || {})
        }
      } else {
        // 如果没有用户特定配置，使用默认的 scrcpy 配置
        Object.assign(value, storeValue['global'] || {})
        if (scope && scope !== 'global') {
          Object.assign(value, storeValue[scope] || {})
        }
      }
      return
    }

    // 对于非 scrcpy 配置，如果没有用户特定配置，使用默认配置
    if (!value[key]) {
      Object.assign(value, storeValue)
    }
  })

  return value
}

export function setStoreData(data, scope, userScope) {
  const modelMap = getModelMap()

  const storeModel = topFields.reduce((obj, key) => {
    obj[key] = {}
    return obj
  }, {})

  Object.entries(data).forEach(([key, value]) => {
    const { parentField } = modelMap?.[key] || {}

    if (!parentField) {
      return
    }

    storeModel[parentField][key] = value
  })

  const storeList = Object.entries(storeModel).reduce((arr, [field, value]) => {
    // 如果有用户特定的配置
    if (userScope && userScope !== 'global') {
      if (field === 'scrcpy') {
        // 获取用户现有的 scrcpy 配置
        const userScrcpy = window.appStore.get(`user.${userScope}.scrcpy`) || {}

        // 更新用户特定的 scrcpy 配置
        if (scope && scope !== 'global') {
          userScrcpy[scope] = value
        } else {
          userScrcpy['global'] = value
        }

        // 保存更新后的用户 scrcpy 配置
        arr.push({
          field: `user.${userScope}.scrcpy`,
          value: userScrcpy
        })
      } else {
        // 获取用户现有的配置
        const userConfig = window.appStore.get(`user.${userScope}`) || {}

        // 更新用户特定的配置
        userConfig[field] = value

        // 保存更新后的用户配置
        arr.push({
          field: `user.${userScope}`,
          value: userConfig
        })
      }
    } else {
      // 如果没有用户特定配置，使用默认的存储方式
      if (field === 'scrcpy') {
        arr.push({
          field: `scrcpy.${scope || 'global'}`,
          value
        })
      } else {
        arr.push({
          field,
          value
        })
      }
    }
    return arr
  }, [])

  storeList.forEach((item) => {
    window.appStore.set(item.field, item.value)
  })
}

export function mergeConfig(object, sources) {
  const cloneObject = cloneDeep(object)
  const cloneSources = cloneDeep(sources)

  const customizer = (objValue, srcValue, key) => {
    let value

    if (srcValue) {
      value = srcValue
    }
    else if (objValue) {
      value = objValue
    }

    return value
  }

  const value = mergeWith(cloneObject, cloneSources, customizer)

  return value
}

export const getOtherFields = (excludeKey = '') => {
  const modelMap = getModelMap()
  const value = Object.values(modelMap).reduce((arr, item) => {
    if (item.parentField !== excludeKey) {
      arr.push(item.field)
    }
    return arr
  }, [])

  return value
}
