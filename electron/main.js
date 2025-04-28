import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import remote from '@electron/remote/main'
import contextMenu from 'electron-context-menu'
import { spawn } from 'child_process'
import fs from 'fs'
/** process.js 必须位于非依赖项的顶部 */
import { isPackaged } from './helpers/process.js'
import log from './helpers/log.js'
import './helpers/console.js'
import appStore from './helpers/store.js'

import { getLogoPath } from './configs/index.js'
import ipc from './ipc/index.js'
import control from '$control/electron/main.js'
import { loadPage } from './helpers/index.js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

log.initialize({ preload: true })

const debug = !!appStore.get('common.debug')

if (!debug) {
  log.warn(
    'Debug Tips:',
    'If you need to generate and view the running log, please start the debugging function on the preference setting page'
  )
}

// 初始化remote模块
remote.initialize()

contextMenu({
  showCopyImage: false,
  showSelectAll: false,
  showSearchWithGoogle: false,
  showSaveImageAs: true,
  showInspectElement: !isPackaged,
})

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │

process.env.DIST = path.join(__dirname, '../dist')

// 用户数据存储路径
const USER_DATA_PATH = path.join(app.getPath('userData'), 'users.json')
const WEB_SERVER_PATH = path.join(__dirname, '../server/index.js')
console.log("1!!",WEB_SERVER_PATH)

let mainWindow
let webServer

// 启动Web服务器
function startWebServer() {
  console.log("开始启动Web服务器...")
  console.log("服务器路径:", WEB_SERVER_PATH)

  webServer = spawn('node', [WEB_SERVER_PATH], {
    stdio: 'inherit'
  })

  webServer.on('error', (err) => {
    console.error('Web服务器启动失败:', err)
    log.error('Web服务器启动失败:', err)
  })

  webServer.on('close', (code) => {
    console.log(`Web服务器退出，退出码: ${code}`)
    log.info(`Web服务器退出，退出码: ${code}`)
  })

  console.log("Web服务器启动成功")
}

// 读取用户数据
const readUserData = () => {
  try {
    if (fs.existsSync(USER_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(USER_DATA_PATH, 'utf-8'))
    }
  } catch (error) {
    log.error('读取用户数据失败:', error)
  }
  return []
}

// 保存用户数据
const saveUserData = (users) => {
  try {
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify(users, null, 2))
  } catch (error) {
    log.error('保存用户数据失败:', error)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: getLogoPath(),
    show: false,
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      sandbox: false,
      spellcheck: false,
    },
  })

  remote.enable(mainWindow.webContents)
  remote.initialize()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  loadPage(mainWindow)

  ipc(mainWindow)

  control(mainWindow)
}

// 处理用户数据相关的IPC消息
ipcMain.handle('get-user-data', () => {
  return readUserData()
})

ipcMain.handle('save-user-data', (event, users) => {
  saveUserData(users)
})

app.whenReady().then(() => {
  console.log("Electron应用准备就绪")
  electronApp.setAppUserModelId('com.viarotel.escrcpy')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  console.log("准备启动Web服务器...")
  startWebServer()
  console.log("准备创建主窗口...")
  createWindow()


  // macOS 中应用被激活
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      return
    }

    app.dock.show()
    mainWindow.show()
  })
})

app.on('window-all-closed', () => {
  app.isQuiting = true
  if (webServer) {
    webServer.kill()
  }
  app.quit()
  mainWindow = null
})

// 处理异常
process.on('uncaughtException', (err) => {
  log.error('未捕获的异常:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  log.error('未处理的Promise拒绝:', reason)
})
