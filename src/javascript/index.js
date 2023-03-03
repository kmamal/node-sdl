import { isMainThread } from 'worker_threads'
if (!isMainThread) {
  throw new Error('@kmamal/sdl can only be used in the main thread')
}

import { initialize } from './bindings.js'

const info = initialize()

import { sdl } from './sdl.js'
import { video } from './video/index.js'
import { keyboard } from './keyboard/index.js'
import { mouse } from './mouse/index.js'
import { joystick } from './joystick/index.js'
import { controller } from './controller/index.js'
import { audio } from './audio/index.js'
import { clipboard } from './clipboard/index.js'

sdl.info = info
sdl.video = video
sdl.keyboard = keyboard
sdl.mouse = mouse
sdl.joystick = joystick
sdl.controller = controller
sdl.audio = audio
sdl.clipboard = clipboard

import './events/index.js'
import './audio/prevent-exit.js'
import './cleanup.js'

export default sdl
