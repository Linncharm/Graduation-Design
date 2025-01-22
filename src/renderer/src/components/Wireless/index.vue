<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center flex-none space-x-2">
      <el-input v-model="formData.host" placeholder="192.168.0.1" class="w-72">
        <template #prepend>
          无线调试地址
        </template>
      </el-input>
      <div class="text-gray-500 text-sm">
        :
      </div>
      <el-input v-model.number="formData.port" type="number" placeholder="5555" class="w-24">
      </el-input>

      <el-button type="primary" :loading="connectLoading" @click="handleConnect">
        开始连接
      </el-button>
      <el-button type="primary" :loading="loading" @click="getDeviceData">
        刷新设备
      </el-button>
      <el-popover
        ref="popoverRef"
        trigger="click"
        placement="bottom"
        width="200"
      >
        <template #reference>
          <el-button
            type="primary"
            @click="handleQRConnect"
            :loading="qrCodeLoading"
            class="flex-none !border-none"
          >
            二维码连接
          </el-button>
        </template>
        <el-image :key="dataUrl" :src="dataUrl" class="!w-full" fit="contain"></el-image>
      </el-popover>
    </div>
    <div class="pt-4 flex-1 h-0 overflow-hidden">
      <DevicesTable
        :loading="loading"
        :loadingText="loadingText"
        :deviceList="deviceList1.filter(item => item.connectionType === 'wifi')"
        @start="handleStart"
        @screen-up="handleScreenUp"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { generateAdbPairingQR, sleep } from '@renderer/utils/index.js'
import storage from '@renderer/utils/storages'
import { getCurrentInstance } from 'vue'
import DevicesTable from '../DevicesTable/index.vue'

const { appContext } = getCurrentInstance()

const globalAdb = appContext.config.globalProperties.$adb
const globalScrcpy = appContext.config.globalProperties.$scrcpy
const globalMessage = appContext.config.globalProperties.$message

const adbCache = storage.get('adbCache') || {}

const popoverRef = ref()
const loading = ref(false)
const qrCodeLoading = ref(false)
const dataUrl = ref('')
const loadingText = ref('初始化中...')
const connectLoading = ref(false)
const deviceList1 = ref([])
const formData = ref({
  host: adbCache.host,
  port: adbCache.port,
})

const getDeviceData = async () => {
  loading.value = true
  await sleep(500)
  try {
    const data = await globalAdb.getDevices()
    console.log('!!!getDeviceData1.data', data)
    deviceList1.value = (data || [])
      .map(item => ({
        ...item,
        name: item.model ? item.model.split(':')[1] : '未授权设备',
        $loading: false,
        $stopLoading: false,
        $unauthorized: item.type === 'unauthorized',
        connectionType: item.id.includes(':') ? 'wifi' : 'usb',
      }))
    console.log('getDeviceData1.data', deviceList1.value)
  } catch (error) {
    if (error.message) {
      globalMessage.warning(error.message)
    }
    deviceList1.value = []
  }
  loading.value = false
  loadingText.value = '正在获取设备列表...'
}

const handleScreenUp = (row) => {
  globalAdb.shell(row.id, 'input keyevent KEYCODE_POWER')
}

const handleQRConnect = async () => {

  const data = await generateAdbPairingQR()
  console.log('data', data)
  dataUrl.value = data.dataUrl


  qrCodeLoading.value = true
  try {
    await globalAdb.connectCode(data.password)
  }
  catch (error) {
    console.warn(error.message)
  }
  await getDeviceData()
  qrCodeLoading.value = false
}


const handleConnect = async () => {
  if (!formData.value.host) {
    globalMessage.warning('无线调试地址不能为空')
    return false
  }
  connectLoading.value = true
  try {
    await globalAdb.connect(formData.value.host, formData.value.port || 5555)
    globalMessage.success('连接设备成功')
    storage.set('adbCache', formData.value)
  } catch (error) {
    if (error.message) {
      globalMessage.warning(error.message)
    }
  }
  connectLoading.value = false
}

const handleStop = async (row) => {
  row.$stopLoading = true
  const [host, port] = row.id.split(':')
  try {
    await globalAdb.disconnect(host, port)
    await sleep()
    globalMessage.success('断开连接成功')
  } catch (error) {
    if (error.message) {
      globalMessage.warning(error.message)
    }
  }
  row.$stopLoading = false
}

const handleStart = async (row) => {
  row.$loading = true
  try {
    await globalScrcpy.shell(`--serial=${row.id}`)
  } catch (error) {
    globalMessage.warning(error.message)
  }
  row.$loading = false
}

onMounted(() => {
  getDeviceData()
  globalAdb.watch(() => {
    getDeviceData()
  })
})
</script>

<style></style>
