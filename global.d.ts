// global.d.ts
import { electronAPI } from '@electron-toolkit/preload'
import {i18n} from './src/renderer/src/locales/index'
import { ComponentCustomProperties } from 'vue'

interface AdbKit {
  getDevices: () => Promise<any>;
  shell: (id: string, command: string) => Promise<any>;
  kill: (...params: any[]) => Promise<void>;
  connect: (...params: any[]) => Promise<void>;
  disconnect: (...params: any[]) => Promise<void>;
  watch: (callback: (device: any) => void) => Promise<() => void>;
  connectCode: (password:string,options:any) => Promise<any>;

}

interface Scrcpy {
  shell: (command: string) => Promise<any>;
}

interface Window {
  adbkit: () => AdbKit;
  scrcpy: () => Scrcpy;
  electron: typeof electronAPI;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof i18n.global.t
  }
}
