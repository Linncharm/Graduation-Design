<!--<script setup>-->
<!--import {getCurrentInstance,onMounted} from 'vue'-->
<!--import {windowManager} from 'node-window-manager'-->
<!--import { ipcMain } from 'electron'-->
<!--const {appContext} = getCurrentInstance()-->

<!--const globalElectron = appContext.config.globalProperties.$electron-->
<!--onMounted(()=>{-->
<!--  globalElectron.ipcMain.on('scrcpy-window-info', (event, data) => {-->
<!--    const {id} = data-->
<!--    const windows = windowManager.getWindows();-->

<!--    const {x,y,height,width} = windows.find(window => window.id === id).getBounds()-->

<!--    // popup的左上角坐标-->
<!--    let startX = x+width-->
<!--    let startY = y-->

<!--    // popup的右下角坐标-->
<!--    let endX = x+width+100-->
<!--    let endY = y+height-->

<!--    // 调用 Electron 创建窗口并显示页面-->
<!--    globalElectron.createWindow({-->
<!--      x: startX,-->
<!--      y: startY,-->
<!--      width: endX - startX,  // 设置窗口的宽度-->
<!--      height: endY - startY,  // 设置窗口的高度-->
<!--      url: 'path_to_your_demo_page.html',  // 这里可以是你页面的路径或URL-->
<!--    })-->

<!--  });-->
<!--})-->



<!--</script>-->

<!--<template>-->

<!--</template>-->

<!--<style scoped>-->

<!--</style>-->
