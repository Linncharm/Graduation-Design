import { app, ipcMain } from 'electron'

ipcMain.on('restart-app', () => {
  app.relaunch()
  app.quit()
})

ipcMain.on('scrcpy-window-info', (event, data) => {
  console.log("received scrcpy-window-info in main process\n", JSON.stringify(data, null, 2));
  event.sender.send('scrcpy-window-info', data);
});
