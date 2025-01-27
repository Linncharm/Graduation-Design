import { app, ipcMain,BrowserWindow } from 'electron'

let floatingWindow = null;

ipcMain.on('restart-app', () => {
  app.relaunch()
  app.quit()
})

// 创建悬浮栏窗口
ipcMain.on('scrcpy-window-info', (event, data) => {
  console.log("received scrcpy-window-info in main process\n", JSON.stringify(data, null, 2));

  const { id, x, y, height, width } = data;

  // 创建新的BrowserWindow
  floatingWindow = new BrowserWindow({
    width: 100,
    height: 500,
    x: x + width - 10,
    y: y,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  floatingWindow.loadURL('data:text/html,<span>test</span>'); // 这里可以加载实际的HTML文件或URL
  event.sender.send('scrcpy-window-info', data);

})

// 关闭悬浮栏窗口
ipcMain.on('scrcpy-window-closed', (event, data) => {
  console.log("received scrcpy-window-closed in main process\n", JSON.stringify(data, null, 2));
  // 关闭悬浮栏窗口
  if (floatingWindow) {
    floatingWindow.close();
    floatingWindow = null;
  }
})

ipcMain.on('updated-window-info', (event, data) => {
  console.log("received updated-window-info in main process\n", JSON.stringify(data, null, 2));
})

ipcMain.on('language-change', (event, data) => {
  event.sender.send('language-change', data);
})
