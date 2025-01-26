<template>
  <el-table
    v-loading="loading"
    :element-loading-text="loadingText"
    :data="deviceList"
    style="width: 100%"
    border
    height="100%"
  >
    <template #empty>
      <el-empty description="设备列表为空" />
    </template>
    <el-table-column prop="id" label="设备 ID" >
      <template #default="{ row }">
        <div class="flex items-center">
          <span class="mr-2">{{ row.id }}</span>
          <el-tooltip content="复制设备ID" placement="top">
            <el-icon @click="copyToClipboard(row.id)" class="cursor-pointer text-gray-500 hover:text-blue-500">
              <CopyDocument />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="设备名称">
      <template #default="{ row }">
        <div v-if="row.$unauthorized" class="flex items-center">
          <el-tooltip content="请重新插拔设备并点击允许USB调试" placement="top-start">
            <el-icon class="mr-1 text-red-600 text-lg">
              <WarningFilled />
            </el-icon>
          </el-tooltip>
          设备未授权
        </div>
        <div v-else class="flex items-center">
          <span class="mr-2">{{ row.name }}</span>
          <el-tooltip content="复制设备名称" placement="top">
            <el-icon @click="copyToClipboard(row.name)" class="cursor-pointer text-gray-500 hover:text-blue-500">
              <CopyDocument />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="300" align="center">
      <template #default="{ row }">
        <el-button type="primary" :loading="row.$loading" @click="$emit('start', row)">
          {{ row.$loading ? '镜像中' : '开始镜像' }}
        </el-button>
        <el-button :disabled="!row.$loading" type="default" @click="$emit('screen-up', row)">
          点亮屏幕
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { getCurrentInstance } from 'vue';

// Define props
const { appContext } = getCurrentInstance();
const props = defineProps({
  loading: {
    type: Boolean,
    required: true
  },
  loadingText: {
    type: String,
    required: true
  },
  deviceList: {
    type: Array,
    required: true
  }
});
const globalMessage = appContext.config.globalProperties.$message;

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    globalMessage.success('复制成功');
  } catch (err) {
    globalMessage.error('复制失败');
  }
};

</script>

<style scoped>

</style>
