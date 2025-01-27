<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center flex-none">
      <el-button type="primary" @click="getDeviceData">
        刷新设备
      </el-button>
      <el-button type="warning" @click="handleReset">
        重启服务
      </el-button>
    </div>
    <div class="pt-4 flex-1 h-0 overflow-hidden">
      <DevicesTable
        :loading="loading"
        :loadingText="loadingText"
        :deviceList="deviceList.filter(item => item.connectionType === 'usb')"
        @start="handleStart"
        @screen-up="handleScreenUp"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { sleep } from '@renderer/utils/index.js';
import { getCurrentInstance } from 'vue';
import DevicesTable from '../DevicesTable/index.vue'
import storage from '@renderer/utils/storages/index.js'
// import { windowManager } from '../../../../../plugins/mock/dist/index.js'

const { appContext } = getCurrentInstance();

const globalAdb = appContext.config.globalProperties.$adb;
const globalScrcpy = appContext.config.globalProperties.$scrcpy;
const globalElectron = appContext.config.globalProperties.$electron;

const isShowButton = ref(false);
const buttonPosition = ref({ x: 0, y: 0 });

const loading = ref(false);
const loadingText = ref('初始化中...');
const deviceList = ref([]);

const buttonStyle = ref({
  position: 'absolute',
  left: `${buttonPosition.value.x}px`,
  top: `${buttonPosition.value.y}px`,
  cursor: 'move'
});

const getDeviceData = async () => {
  loading.value = true;
  await sleep(500);
  try {
    const data = await globalAdb.getDevices();
    deviceList.value = (data || [])
      .map(item => ({
        ...item,
        name: item.model ? item.model.split(':')[1] : '未授权设备',
        $loading: false,
        $unauthorized: item.type === 'unauthorized',
        connectionType: item.id.includes(':') ? 'wifi' : 'usb',
        // TODO: 关于id更为严格的判定？
      }));
    console.log('getDeviceData.data', deviceList.value);
  } catch (error) {
    if (error) {
      globalElectron.ipcRenderer.send('show-message', { type: 'warning', message: error.message });
    }
    deviceList.value = [];
  }
  loading.value = false;
  loadingText.value = '正在获取设备列表...';
};

const handleScreenUp = (row) => {
  globalAdb.shell(row.id, 'input keyevent KEYCODE_POWER');
};

const handleReset = () => {
  globalElectron.ipcRenderer.send('restart-app');
};

const addScrcpyConfigs = () => {
  const configs = storage.get('scrcpyCache') || {}
  const value = Object.entries(configs)
    .reduce((arr, [key, value]) => {
      if (!value) {
        return arr
      }
      if (key === 'lang') {
        return arr
      }
      if (typeof value === 'boolean') {
        arr.push(key)
      }
      else {
        arr.push(`${key}=${value}`)
      }
      return arr
    }, [])
    .join(' ')

  console.log('addScrcpyConfigs.value', value)

  return value
}

const handleStart = async (row) => {
  row.$loading = true;
  try {
    const scrcpyTitle = 'Test-Device';
    const result = await globalScrcpy.shell(`--serial=${row.id} ${addScrcpyConfigs()} --window-title=${scrcpyTitle}`);
  } catch (error) {
    if (error.message) {
      globalElectron.ipcRenderer.send('show-message', { type: 'warning', message: error.message });
      row.$loading = false;
    }
  }finally {
    row.$loading = false;
  }

};

onMounted(() => {
  getDeviceData();
  globalAdb.watch(() => {
    getDeviceData();
  });
});
</script>

<style></style>
