import sdl from '../../src/javascript/index.js'

const window = sdl.video.createWindow({ title: "Hello, World!" })
window.on('*', console.log)
