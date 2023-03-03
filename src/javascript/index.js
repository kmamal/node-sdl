import { isMainThread } from 'worker_threads'
import Bindings from './bindings.js'

import { video } from './video/index.js'
import { keyboard } from './keyboard/index.js'
import { mouse } from './mouse/index.js'
import { joystick } from './joystick/index.js'
import { controller } from './controller/index.js'
import { audio } from './audio/index.js'
import { clipboard } from './clipboard/index.js'

import './events/index.js'
import './audio/prevent-exit.js'
import './cleanup.js'

if (!isMainThread) {
  throw new Error('@kmamal/sdl can only be used in the main thread')
}

const info = Bindings.initialize()

export {
  info,
  video,
  keyboard,
  mouse,
  joystick,
  controller,
  audio,
  clipboard,
}