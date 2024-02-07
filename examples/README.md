# Examples

These serve as a collection of common use-cases, as well as a sort-of tutorial if read in order.

## [0. Hello World](https://github.com/kmamal/node-sdl/tree/master/examples/00-hello-world)

Minimum amount of code necessary to show a window on the screen.

## [1. FPS Counter](https://github.com/kmamal/node-sdl/tree/master/examples/01-fps-counter)

Counts how many times per second we are able to draw to the screen. Our "drawing" here is very trivial: we just render the same empty buffer to the screen for every frame. Doing more work in the render loop will of course drop your frame rate.

## [2. Raw Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/02-raw-drawing)

Fills a buffer with pixel data and draws it to the screen. Note that whenever the window's size changes the buffer has to be resized and refilled. Conversely, observe that if the content's of the screen stay the same, no drawing at all is necessary.

## [3. Canvas Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/03-canvas-drawing)

Instead of filling the buffer by hand we can use the popular [`canvas`](https://www.npmjs.com/package/canvas) library which does the same thing using the familiar Canvas API. Note the pixel format that the canvas library's buffer uses.

## [4. (Indirect) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/04-indirect-webgl-drawing)

This is probably not a real use-case, but it serves to demonstrate why [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) was necessary. In this example we use the base [`gl`](https://github.com/stackgl/headless-gl#readme) library to fill a buffer with data. The idea is the same as in the previous example, but this time using the 3D WebGL API instead of the 2D Canvas API.

There are 2 problems:
1. The buffer we get is upside down. The `readPixels` function lets you specify a rectangle of pixels to copy, but its origin is at the lower left corner (what's called "cartesian coordinates") vs the more familiar upper left corner ("screen coordinates"). This is only a minor annoyance since you can arrange you drawing code to accommodate this (as we did in this example).
1. To render anything this way, you have to send the data to the GPU, then read back the result to memory, only to send it back to the GPU to be displayed. This is inelegant.

(Note also that we had to set `accelerated: false` for the window because `gl` interferes with hardware-accelerated windows.)

## [5. (Direct) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/05-webgl-drawing)

Same example, but this time with the [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) library. Note that the call to `render` is gone. It has instead been replaced by the call to `gl.swap()`. Note also that, because the window is double-buffered, we need to call `gl.swap()` twice when the window is resized.

## [6. WebGL+regl](https://github.com/kmamal/node-sdl/tree/master/examples/06-webgl-regl)

Uses the popular [`regl`](https://www.npmjs.com/package/regl) library to simplify some of that WebGL code.

## [7. FFmpeg video/image loading](https://github.com/kmamal/node-sdl/tree/master/examples/07-ffmpeg)

There are many ways to load static assets into your application. In this example we use FFmpeg (through the [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) package) to decode an image and a video into raw pixels that we can render to the screen.

## [8. Sine wave](https://github.com/kmamal/node-sdl/tree/master/examples/08-sine-wave)

Plays a 440Hz sine wave for 3 seconds.

## [9. Mic Waveform](https://github.com/kmamal/node-sdl/tree/master/examples/09-mic-waveform)

Listens to the mic and plots the volume of recorded audio on the screen. Note how we have reduced the value of the `buffered` option to get audio samples more frequently (and with smaller delays) from the hardware.

## [10. Echo effect](https://github.com/kmamal/node-sdl/tree/master/examples/10-echo)

Use headphones for this one or you'll end up in a feedback loop. Listens to the mic and then plays back what it recorded plus an echo effect.

## [11. FFmpeg audio loading](https://github.com/kmamal/node-sdl/tree/master/examples/11-ffmpeg-audio)

This is like example #7, but this time with audio files. Again we are going to use [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) to decode a .wav file into a raw PCM buffer we can use for playback.

## [12. Audio rendering thread](https://github.com/kmamal/node-sdl/tree/master/examples/12-audio-thread)

You can only use `@kmamal/sdl` from the main thread of your Node.js program, but you might still want to offload computationally expensive tasks to worker threads. This example shows how an audio rendering thread might be implemented.

## [13. Changing audio driver dynamically](https://github.com/kmamal/node-sdl/tree/master/examples/13-audio-driver)
Once SDL has been initialized (which happens automatically when you import `@kmamal/sdl`) you can no longer change the audio or video driver.
Your only option is to restart the process, passing different values to the `SDL_VIDEODRIVER` and `SDL_AUDIODRIVER` environment variables.
This example shows how you could implement an audio player, that can change audio drivers without closing it's main window.
It does this by keeping the audio playback in a child process, separate from the main window.

## [14. Clipboard mutator](https://github.com/kmamal/node-sdl/tree/master/examples/14-clipboard-mutator)

Applies random changes to whatever text has been copied to the clipboard.

## [15. Packaging to a ZIP](https://github.com/kmamal/node-sdl/tree/master/examples/15-packaging)

Eventually you might want to make your application available for download somewhere. Publishing as an npm package is an option, but requires that you users are already familiar with Node.js. A more traditional option is to just include all your dependencies in a `.zip` file and distribute that. This example shows how you would setup a project for exactly this use-case. I'm using [`@kmamal/packager`](https://github.com/kmamal/packager#readme) here, but other packagers should work as well. There's also a [github workflow file](https://github.com/kmamal/node-sdl/tree/master/examples/15-packaging/.github/workflows/build.yml) that builds and bundles the project for all supported platforms.

## [16. Packaging using PKG](https://github.com/kmamal/node-sdl/tree/master/examples/16-pkg)

This is an alternative packaging method using the [`@yao-pkg/pkg`](https://www.npmjs.com/package/@yao-pkg/pkg) package (a fork of the original [`vercel/pkg`](https://github.com/vercel/pkg)). One important thing to keep in mind is that ES modules are not yet supported by `pkg` so we have to use the old CommonJS modules. Another important detail is that SDL is dynamically linked, so you need to distribute the library files along with the executable.


// TODO: more
