const path = require('node:path')

import { electronAPI } from '@electron-toolkit/preload'
import { Adb } from '@devicefarmer/adbkit'

//import scrcpyPath from '../../resources/core/scrcpy.exe?asset&asarUnpack'
//const scrcpyPath = `D:G\\Graduation-Design\\Working\\resources\\core\\scrcpy.exe` // 暂时写死，后面再重构路径系统
const scrcpyPath = `D:\\Graduate-Design\\Graduation-Design\\resources\\core\\scrcpy.exe` // 暂时写死，后面再重构路径系统
import adbPath from '../../resources/core/adb.exe?asset&asarUnpack'
import { addContext } from './helpers/index.js'

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
  }
})

const { spawn } = require('node:child_process');

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
