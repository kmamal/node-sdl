import sdl from '../../src/javascript/index.js'

export const hasVideo = () => sdl.video.isAvailable()

export const hasAudio = () => sdl.audio.isAvailable()

export const hasPlayback = () => hasAudio() && sdl.audio.playback.devices.length > 1

export const hasRecording = () => hasAudio() && sdl.audio.recording.devices.length > 1

export const skip = (reason) => { console.warn(`SKIPPED: ${reason}`) }
