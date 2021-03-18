# @kmamal/sdl

This package uses SDL2 bindings to make Node.js create windows, receive input events, and play or record audio. If you use it together with [@kmamal/gl](https://github.com/kmamal/headless-gl) you can draw on those windows with WebGL.

It should work on Linux, Mac, and Windows.

## Usage

1. Install SDL2 on your system: https://www.libsdl.org/download-2.0.php
2. Install this package via `npm install @kmamal/sdl`
3. Use it in your js files with `const SDL = require('@kmamal/sdl')`

## Example

```js
const SDL = require('@kmamal/sdl')

const window = new SDL.Window({ title: 'Hello, World!' })

setInterval(() => {
  let event
  while(event = SDL.waitEvent()) {
    //
  }
}, 1e3)
```

There are more examples in /////

## API

### `class SDL.Window(options?)`

Creates a new window. The options object can have the following properties:

* `title` will appear in the title bar
* `width`
* `height`
* `x`
* `y`
* `fullscreen` default `false`
* `resizable` default `true`
* `borderless` default `false`
* `opengl` default `false`


#### `property window.width {get,set}`

#### `method window.show()`

#### `method window.hide()`

#### `method window.destroy()`

### `function SDL.pollEvent()`

### `function SDL.waitEvent(timeout?)`

### `namespace SDL.Audio`

This object holds the audio-related functions

#### `function SDL.Audio.start()`

#### `function SDL.Audio.stop()`

#### `function SDL.Audio.getQueuedSize()`

#### `function SDL.Audio.queue()`

### `function SDL.setLogger()`

### `enum SDL.PixelFormat`

### `enum SDL.AudioFormat`
