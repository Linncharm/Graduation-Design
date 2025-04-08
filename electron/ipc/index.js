import appEvents from './app/index.js'
import handles from './handles/index.js'
import shortcuts from './shortcuts/index.js'
import theme from './theme/index.js'
import tray from './tray/index.js'

export default (mainWindow) => {
  appEvents(mainWindow)
  handles(mainWindow)
  tray(mainWindow)
  theme(mainWindow)
  shortcuts(mainWindow)
}
