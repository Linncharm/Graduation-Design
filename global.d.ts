// global.d.ts
import { electronAPI } from '@electron-toolkit/preload'

interface AdbKit {
  getDevices: () => Promise<any>;
  shell: (id: string, command: string) => Promise<any>;
  kill: (...params: any[]) => Promise<void>;
  connect: (...params: any[]) => Promise<void>;
  disconnect: (...params: any[]) => Promise<void>;
  watch: (callback: (device: any) => void) => Promise<() => void>;
}

interface Scrcpy {
  shell: (command: string) => Promise<any>;
}

interface Window {
  adbkit: () => AdbKit;
  scrcpy: () => Scrcpy;
  electron: typeof electronAPI;
}
