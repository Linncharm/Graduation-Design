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
    <el-table-column prop="id" label="设备 ID" />
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
        <span v-else class="">{{ row.name }}</span>
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
import { defineProps } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';

// Define props
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



</script>

<style scoped>

</style>
