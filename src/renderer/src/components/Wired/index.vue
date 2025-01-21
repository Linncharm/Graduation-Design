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
import { isIPWithPort, sleep } from '@renderer/utils/index.js';
import { getCurrentInstance } from 'vue';
import DevicesTable from '../DevicesTable/index.vue'

const { appContext } = getCurrentInstance();

const globalAdb = appContext.config.globalProperties.$adb;
const globalScrcpy = appContext.config.globalProperties.$scrcpy;
const globalElectron = appContext.config.globalProperties.$electron;
const globalMessage = appContext.config.globalProperties.$message;

const loading = ref(false);
const loadingText = ref('初始化中...');
const deviceList = ref([]);

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    globalMessage.success('复制成功');
  } catch (err) {
    globalMessage.error('复制失败');
  }
};



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

const handleStart = async (row) => {
  row.$loading = true;
  try {
    const result = await globalScrcpy.shell(`-s ${row.id}`);
    console.log('result', result);
  } catch (error) {
    if (error.message) {
      globalElectron.ipcRenderer.send('show-message', { type: 'warning', message: error.message });
      row.$loading = false;
    }
  }finally {
    console.log('finally');
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
