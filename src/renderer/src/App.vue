<template>
  <div class="absolute inset-0 px-4 pb-4 h-full overflow-hidden">
    <el-tabs v-model="activeTab" class="el-tabs-flex">
      <el-tab-pane
        v-for="(item, index) of tabsModel"
        :key="index"
        :label="item.label"
        :name="item.prop"
        lazy
      >
        <component :is="componentMap[item.prop]" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Wired from './components/Wired/index.vue'
import Wireless from './components/Wireless/index.vue'
import Advanced from './components/Advanced/index.vue'

//将字符串映射到组件
const componentMap = {
  Wired,
  Wireless,
  Advanced,
}

const tabsModel = ref([
  {
    label: '有线模式',
    prop: 'Wired',
  },
  {
    label: '无线模式',
    prop: 'Wireless',
  },
  {
    label: '高级配置',
    prop: 'Advanced',
  },
])

const activeTab = ref('Wired')
</script>
