import sdl from '@kmamal/sdl'

const window = sdl.video.createWindow({ title: "Hello, World!" })
window.on('*', console.log)
