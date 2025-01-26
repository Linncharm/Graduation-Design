const { windowManager } = require('./dist-commonjs/index.js');


const window = windowManager.getActiveWindow();
console.log(window);
