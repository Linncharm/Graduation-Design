const path = require('node:path')
import net from 'node:net'
import { Bonjour } from 'bonjour-service'
import { electronAPI } from '@electron-toolkit/preload'
import { Adb } from '@devicefarmer/adbkit'

//import scrcpyPath from '../../resources/core/scrcpy.exe?asset&asarUnpack'
//const scrcpyPath = `D:G\\Graduation-Design\\Working\\resources\\core\\scrcpy.exe` // 暂时写死，后面再重构路径系统
const scrcpyPath = `D:\\Graduate-Design\\Graduation-Design\\resources\\core\\scrcpy.exe` // 暂时写死，后面再重构路径系统
import adbPath from '../../resources/core/adb.exe?asset&asarUnpack'
import { addContext } from './helpers/index.js'

// 一个设备数据类
export class DeviceData {
  constructor(name, address, port) {
    this.name = name
    this.address = address
    this.port = port
  }

  static fromMdnsService(service) {
    const ipv4Address = service.addresses?.find(addr => net.isIP(addr) === 4)
    if (!ipv4Address)
      return null

    return new DeviceData(
      service.name,
      ipv4Address,
      service.port,
    )
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
      shell: true,
    })
  }

  const pair = async (host, port, code) => {
    const { stderr, stdout } = await terminal(`pair ${String(host)}:${port} ${code}`)

    if (stderr) {
      throw stderr
    }

    return stdout
  }

  const connectCode = async (password,options)  => {
    const deviceScanner = new DeviceScanner()

    const scanForDevice = async () => {
      return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          deviceScanner.dispose()
          reject(new Error('Connection attempt timed out'))
        }, 60 * 1000)

        deviceScanner.startScanning(
          'adb-tls-pairing',
          (device) => {
            clearTimeout(timeoutHandle)
            resolve(device)
          },
        )
      })
    }

    const connectForDevice = async (device) => {
      return new Promise((resolve, reject) => {
        const scanner = new DeviceScanner()

        const timeoutHandle = setTimeout(() => {
          scanner.dispose()
          reject(new Error('Connection attempt timed out'))
        }, 30 * 1000)

        scanner.startScanning(
          'adb-tls-connect',
          (connectDevice) => {
            if (connectDevice.address === device.address) {
              clearTimeout(timeoutHandle)
              scanner.dispose()
              resolve(connectDevice)
            }
          },
        )
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
        console.error("设备连接错误",error)
      }
    } catch (error) {
      console.error("设备配对错误",error)
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
    connectCode,
  }
})


addContext('scrcpy', () => {
  const shell = (command) => {
    return new Promise((resolve, reject) => {
      const scrcpyProcess = exec(`${scrcpyPath} ${command}`, { env: { ...process.env, ADB: adbPath } });

      let stdout = '';
      let stderr = '';

      scrcpyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      scrcpyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      scrcpyProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`scrcpyProcess exited with code ${code}`);
          reject(new Error(stderr));
        } else {
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          resolve(stdout);
        }
      });

      scrcpyProcess.on('error', (error) => {
        console.error(`scrcpyProcess error: ${error}`);
        reject(error);
      });
    });
  };

  return {
    shell,
  };
});
