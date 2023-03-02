import { isMainThread } from 'worker_threads'
if (!isMainThread) {
  throw new Error('@kmamal/sdl can only be used in the main thread')
}

import { initialize } from './bindings'

const info = initialize()

import { sdl } from './sdl'
import { video } from './video'
import { keyboard } from './keyboard'
import { mouse } from './mouse'
import { joystick } from './joystick'
import { controller } from './controller'
import { audio } from './audio'
import { clipboard } from './clipboard'

sdl.info = info
sdl.video = video
sdl.keyboard = keyboard
sdl.mouse = mouse
sdl.joystick = joystick
sdl.controller = controller
sdl.audio = audio
sdl.clipboard = clipboard

import './events'
import './audio/prevent-exit'
import './cleanup'

export default sdl
