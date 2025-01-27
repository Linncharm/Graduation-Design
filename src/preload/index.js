import { ipcRenderer } from 'electron'
import net from 'node:net'
import { Bonjour } from 'bonjour-service'
import { electronAPI } from '@electron-toolkit/preload'
import { Adb } from '@devicefarmer/adbkit'
import { windowManager } from '../../plugins/mock/dist/index.js'
import { EventEmitter } from 'events'
import adbPath from '../../resources/core/adb.exe?asset&asarUnpack'
import { addContext } from './helpers/index.js'

const scrcpyPath = `D:\\Graduation-Design\\Working\\resources\\core\\scrcpy.exe` // 暂时写死，后面再重构路径系统

// 一个设备数据类
export class DeviceData {
  constructor(name, address, port) {
    this.name = name
    this.address = address
    this.port = port
  }

  static fromMdnsService(service) {
    const ipv4Address = service.addresses?.find((addr) => net.isIP(addr) === 4)
    if (!ipv4Address) return null

    return new DeviceData(service.name, ipv4Address, service.port)
  }
}

// 一个设备扫描类
export class DeviceScanner {
  constructor() {
    this.bonjour = null
    this.scanner = null
  }

  async startScanning(type, callback) {
    this.bonjour = new Bonjour()

    return new Promise((resolve, reject) => {
      this.scanner = this.bonjour.find({ type }, (service) => {
        const device = DeviceData.fromMdnsService(service)
        if (device) {
          callback(device)
        }
      })
    })
  }

  dispose() {
    if (this.scanner) {
      this.scanner.stop()
      this.scanner = null
    }
    if (this.bonjour) {
      this.bonjour.destroy()
      this.bonjour = null
    }
  }
}

// TODO 编写一个ScrcpyWindow类，用于管理scrcpy窗口的创建和销毁，以及窗口的状态管理（位置信息）
class ScrcpyWindow extends EventEmitter {
  constructor(scrcpyPath, adbPath) {
    super()
    this.scrcpyPath = scrcpyPath // 暂时写死
    this.adbPath = adbPath // 暂时写死
    this.scrcpyProcess = null
    this.window = null
    this.windowBounds = null
    this.checkIsClosedIntervalId = null // 用于保存定时器ID
    this.checkScrcpyWindowIntervalId = null
  }

  async create(command) {
    return new Promise((resolve, reject) => {
      this.scrcpyProcess = exec(
        `${this.scrcpyPath} ${command}`,
        { env: { ...process.env, ADB: this.adbPath } },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            reject(error)
          }
          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
        }
      )

      this.checkScrcpyWindow()  // 第一次checkScrcpyWindow
        .then((window) => {

          this.window = window
          // TODO 绑定监听器
          // this.on('checkWindowClose', () => this.handleScrcpyWindowIsClose(this.window));
          resolve(this.window)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async checkScrcpyWindow(checkType) {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const checkInterval = checkType === 'Bounds' ? 1 : 500 // 每隔500毫秒检查一次,如果是位置就间隔0,已经有1000毫秒的间隔了
      const timeout = 10000 // 最大等待时间10秒

      const checkScrcpyWindowIntervalId = setInterval(() => {

        // // 检查 this.window 是否为 null
        // if (checkType === 'Bounds' && !this.window) {
        //   clearInterval(intervalId);
        //   reject(new Error('窗口已关闭'));
        //   return;
        // }

        let windows = windowManager.getWindows()
        const scrcpyWindow = windows.find((window) => window.getTitle() === 'Test-Device')

        if (scrcpyWindow) {
          if (checkType !== 'Bounds') {
            clearInterval(checkScrcpyWindowIntervalId)
          }
          let Bounds = scrcpyWindow.getBounds()
          let { x, y, height, width } = Bounds
          let { id } = scrcpyWindow
          if (checkType !== 'Bounds') {
            this.windowBounds = Bounds
            ipcRenderer.send('scrcpy-window-info', { id, x, y, height, width })
            console.log(`窗口位置：(${x}, ${y}), 宽度：${width}, 高度：${height}`)
            console.log('renderer process send scrcpy-window-info', { id, x, y, height, width })
          } else {
            if (this.windowBounds && this.windowBounds.x === Bounds.x && this.windowBounds.y === Bounds.y && this.windowBounds.height === Bounds.height && this.windowBounds.width === Bounds.width) {
              console.log('窗口位置未变化')
              resolve(scrcpyWindow)
            }else {
              this.windowBounds = Bounds
              ipcRenderer.send('updated-window-info', { id, x, y, height, width })
              console.log(`新窗口位置：(${x}, ${y}), 宽度：${width}, 高度：${height}`)
              console.log('renderer process send updated-window-info', { id, x, y, height, width })
            }

          }
          resolve(scrcpyWindow)
        } else if (Date.now() - start >= timeout) {
          clearInterval(checkScrcpyWindowIntervalId)
          console.error('查找窗口超时')
          reject(new Error('查找窗口超时'))
        } else {
          console.log('未找到窗口, 继续查找')
        }
      }, checkInterval)
    })
  }

  async checkScrcpyWindowBound(checkType) {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const checkInterval = checkType === 'Bounds' ? 1 : 500 // 每隔500毫秒检查一次,如果是位置就间隔0,已经有1000毫秒的间隔了
      const timeout = 10000 // 最大等待时间10秒

      this.checkScrcpyWindowIntervalId = setInterval(() => {

        // // 检查 this.window 是否为 null
        // if (checkType === 'Bounds' && !this.window) {
        //   clearInterval(intervalId);
        //   reject(new Error('窗口已关闭'));
        //   return;
        // }

        let windows = windowManager.getWindows()
        const scrcpyWindow = windows.find((window) => window.getTitle() === 'Test-Device')

        if (scrcpyWindow) {
          if (checkType !== 'Bounds') {
            clearInterval(this.checkScrcpyWindowIntervalId)
          }
          let Bounds = scrcpyWindow.getBounds()
          let { x, y, height, width } = Bounds
          let { id } = scrcpyWindow
          if (checkType !== 'Bounds') {
            this.windowBounds = Bounds
            ipcRenderer.send('scrcpy-window-info', { id, x, y, height, width })
            console.log(`窗口位置：(${x}, ${y}), 宽度：${width}, 高度：${height}`)
            console.log('renderer process send scrcpy-window-info', { id, x, y, height, width })
          } else {
            if (this.windowBounds && this.windowBounds.x === Bounds.x && this.windowBounds.y === Bounds.y && this.windowBounds.height === Bounds.height && this.windowBounds.width === Bounds.width) {
              console.log('窗口位置未变化')
              resolve(scrcpyWindow)
            }else {
              this.windowBounds = Bounds
              ipcRenderer.send('updated-window-info', { id, x, y, height, width })
              console.log(`新窗口位置：(${x}, ${y}), 宽度：${width}, 高度：${height}`)
              console.log('renderer process send updated-window-info', { id, x, y, height, width })
            }

          }
          resolve(scrcpyWindow)
        } else if (Date.now() - start >= timeout) {
          clearInterval(this.checkScrcpyWindowIntervalId)
          console.error('查找窗口超时')
          reject(new Error('查找窗口超时'))
        } else {
          console.log('未找到窗口, 继续查找')
        }
      }, checkInterval)
    })
  }

  handleScrcpyWindowIsCreated(window) {

  }

  handleScrcpyWindowIsClose(window) {
    if (!window.isWindow()) {
      ipcRenderer.send('scrcpy-window-closed', { id: window.id })
      if (this.checkIsClosedIntervalId || this.checkScrcpyWindowIntervalId) {
        clearInterval(this.checkScrcpyWindowIntervalId)
        clearInterval(this.checkIsClosedIntervalId) // 清除定时器

        this.checkIsClosedIntervalId = null
        this.checkScrcpyWindowIntervalId = null
      }
    }
  }

  handleScrcpyWindowIsMoved(window, tempX, tempY) {
    ipcRenderer.send('scrcpy-window-info', {
      id: window.id,
      x: window.x,
      y: window.y,
      height: window.height,
      width: window.width
    })
  }

  // 定期检查窗口是否关闭以及窗口位置是否变化
  startWindowCheck() {
    const checkInterval = 1000 // 每隔1000毫秒检查一次 // TODO 能否改为更底层的调用方式（Windows自带api）

    this.checkIsClosedIntervalId = setInterval(() => {
      if (!this.window || !this.window.isWindow()) {
        //this.emit('checkWindowClose');
        this.handleScrcpyWindowIsClose(this.window)
      }
      if (this.window) {
        this.checkScrcpyWindowBound('Bounds') // 第二次checkScrcpyWindow，定时器可能起冲突
          .then((window) => {
            this.window = window
          })
          .catch((error) => {
            console.error('窗口检查失败', error)
          })
      }

    }, checkInterval)
  }

  destroy() {
    if (this.scrcpyProcess) {
      this.scrcpyProcess.kill()
      this.scrcpyProcess = null
    }
    if (this.window) {
      this.window.close()
      this.window = null
    }
  }
}

const util = require('node:util')
// 异步调用一个子进程的exec方法
const exec = util.promisify(require('node:child_process').exec)

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
addContext('electron', electronAPI)

addContext('api', api)

addContext('adbkit', () => {
  const client = Adb.createClient({ bin: adbPath })
  console.log('client', client)

  const getDevices = async () => await client.listDevicesWithPaths()
  const getOriginalDevices = async () => await client.listDevices()
  const shell = async (id, command) => await client.getDevice(id).shell(command)
  const kill = async (...params) => await client.kill(...params)
  const connect = async (...params) => await client.connect(...params)
  const disconnect = async (...params) => await client.disconnect(...params)
  const watch = async (callback) => {
    const tracker = await client.trackDevices()
    tracker.on('add', (device) => {
      callback(device)
    })

    tracker.on('remove', (device) => {
      callback(device)
    })

    tracker.on('end', (ret) => {
      callback(ret)
    })

    tracker.on('error', (err) => {
      callback(err)
    })

    const close = () => tracker.end()

    return close
  }
  const terminal = async (command) => {
    return exec(`"${adbPath}" ${command}`, {
      env: { ...process.env },
      shell: true
    })
  }

  const pair = async (host, port, code) => {
    const { stderr, stdout } = await terminal(`pair ${String(host)}:${port} ${code}`)

    if (stderr) {
      throw stderr
    }

    return stdout
  }

  const connectCode = async (password, options) => {
    const deviceScanner = new DeviceScanner()

    const scanForDevice = async () => {
      return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          deviceScanner.dispose()
          reject(new Error('Connection attempt timed out'))
        }, 60 * 1000)

        deviceScanner.startScanning('adb-tls-pairing', (device) => {
          clearTimeout(timeoutHandle)
          resolve(device)
        })
      })
    }

    const connectForDevice = async (device) => {
      return new Promise((resolve, reject) => {
        const scanner = new DeviceScanner()

        const timeoutHandle = setTimeout(() => {
          scanner.dispose()
          reject(new Error('Connection attempt timed out'))
        }, 30 * 1000)

        scanner.startScanning('adb-tls-connect', (connectDevice) => {
          if (connectDevice.address === device.address) {
            clearTimeout(timeoutHandle)
            scanner.dispose()
            resolve(connectDevice)
          }
        })
      })
    }

    try {
      // 配对设备
      const device = await scanForDevice()
      console.log('QR code device', device)
      await pair(device.address, device.port, password)

      try {
        // 连接设备
        const connectedDevice = await connectForDevice(device)
        await connect(connectedDevice.address, connectedDevice.port)
      } catch (error) {
        console.error('设备连接错误', error)
      }
    } catch (error) {
      console.error('设备配对错误', error)
    }
  }

  window.addEventListener('beforeunload', () => {
    kill()
  })

  return {
    getDevices,
    getOriginalDevices,
    shell,
    kill,
    connect,
    disconnect,
    watch,
    terminal,
    pair,
    connectCode
  }
})

// 创建ScrcpyWindow实例
const scrcpyWindowInstance = new ScrcpyWindow(scrcpyPath, adbPath)
addContext('scrcpy', () => {
  const shell = (command) => {
    return new Promise((resolve, reject) => {
      scrcpyWindowInstance
        .create(command)
        .then((window) => {
          console.log('窗口已创建:', window)
          scrcpyWindowInstance.startWindowCheck() // 启动窗口检查 确保检查的是最新窗口
          resolve(window)
        })
        .catch((error) => {
          console.error('窗口创建失败:', error)
          reject(error)
        })

      // TODO: 添加进程启动时的判断逻辑
    })
  }

  return {
    shell
  }
})
