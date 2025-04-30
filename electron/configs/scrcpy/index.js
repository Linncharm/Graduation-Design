import { extraResolve } from '$electron/helpers/index.js'
import which from 'which'

export const getScrcpyPath = () => {
  switch (process.platform) {
    // windows 平台
    case 'win32':
      return extraResolve('win/scrcpy/scrcpy.exe')
    // mac 平台
    case 'darwin':
      return extraResolve('mac/scrcpy/scrcpy')
    default:
      return which.sync('scrcpy', { nothrow: true })
  }
}

export const scrcpyPath = getScrcpyPath()
