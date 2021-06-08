// import sdl from '@kmamal/sdl'
import sdl from '../../src/javascript/index.js'

const window = sdl.video.createWindow({ title: "Hello, World!" })

window.on('hover', () => console.log('in'))
window.on('leave', () => console.log('out'))
