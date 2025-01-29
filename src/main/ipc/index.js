import { app, ipcMain,BrowserWindow } from 'electron'
const path = require('path');

ipcMain.on('restart-app', () => {
  app.relaunch()
  app.quit()
})

let floatingWindow = null;

// 创建悬浮栏窗口
ipcMain.on('scrcpy-window-info', (event, data) => {
  // console.log("received scrcpy-window-info in main process\n", JSON.stringify(data, null, 2));

  const { id, x, y, height, width } = data;

  // 创建新的BrowserWindow
  floatingWindow = new BrowserWindow({
    width: 100,
    height: 100,
    x: x + width - 10,
    y: y,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 加载本地HTML文件
  floatingWindow.loadFile('@renderer/../floatingWindow.html');

  event.sender.send('scrcpy-window-info', data);
});

ipcMain.on('toggle-expand', () => {
    console.log("expand")
    // 展开窗口为原来的大小
    floatingWindow.setSize(50, 500);
    floatingWindow.webContents.send('expand-window');
});

ipcMain.on('toggle-collapse', () => {
    console.log("collapse")
    // 收缩窗口为三角形
    floatingWindow.setSize(50, 100);
    //floatingWindow.webContents.send('contract-window');
    floatingWindow.webContents.send('collapse-window');
});

// 关闭悬浮栏窗口
ipcMain.on('scrcpy-window-closed', (event, data) => {
  // console.log("received scrcpy-window-closed in main process\n", JSON.stringify(data, null, 2));
  // 关闭悬浮栏窗口
  console.log("close floating window",Date.now());
  // TODO 关闭慢的原因是需要花时间检测主屏幕的关闭，可以考虑延迟关闭,或底层api回调
  if (floatingWindow) {
    floatingWindow.close();
    floatingWindow = null;
  }
})

ipcMain.on('updated-window-info', (event, data) => {
  // console.log("received updated-window-info in main process\n", JSON.stringify(data, null, 2));
  const { x, y, height, width } = data;
  if (floatingWindow) {
    floatingWindow.setBounds({
      x: x + width - 10,
      y: y,
      width: 100,
      height: 500
    })
  }
})

ipcMain.on('language-change', (event, data) => {
  event.sender.send('language-change', data);
})
