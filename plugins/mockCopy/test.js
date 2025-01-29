//import { windowManager } from './dist/index.js';
const {windowManager,Window} = require('./dist-commonjs/index.js')

const window = windowManager.getActiveWindow();
const a = window.getBounds();
console.log(window,a);
