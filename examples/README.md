# Examples

These examples cover common use cases.
Someday they may also work as a tutorial when you read them in order.

## [0. Hello World](https://github.com/kmamal/node-sdl/tree/master/examples/00-hello-world)

Shows a window on the screen with the minimum necessary code.

## [1. FPS Counter](https://github.com/kmamal/node-sdl/tree/master/examples/01-fps-counter)

Counts how many times per second we can draw to the screen.
The "drawing" is trivial: every frame renders the same empty buffer.
Any extra work in the render loop lowers your frame rate.

## [2. Raw Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/02-raw-drawing)

Fills a buffer with pixel data and draws it to the screen.
Whenever the window's size changes, we must resize and refill the buffer.
When the contents of the screen stay the same, we need no drawing at all.

## [3. Scaling](https://github.com/kmamal/node-sdl/tree/master/examples/03-scaling)

When the buffer's dimensions differ from the window's, the library scales the buffer, and may stretch it, to fit.
By default it samples the nearest neighbor, but an optional argument to `window.render()` changes that.
This example stretches a 4-pixel buffer over the entire window with linear filtering.

## [4. Aspect Ratio](https://github.com/kmamal/node-sdl/tree/master/examples/04-aspect-ratio)

When the buffer's dimensions differ from the window's, the library scales the buffer, and may stretch it, to fit.
That distorts the image's aspect ratio, which you usually don't want.
To prevent the distortion, we calculate the `dstRect` property and set it.
Because this example displays pixel art, we also scale only by integer multiples of the image's dimensions.

## [5. Canvas Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/05-canvas-drawing)

Instead of filling the buffer by hand, we can use the [`@napi-rs/canvas`](https://www.npmjs.com/package/@napi-rs/canvas) library, which fills it through the familiar Canvas API.
Look at the pixel format that the canvas library's buffer uses.

## [6. (Indirect) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/06-indirect-webgl-drawing)

You probably wouldn't use this approach in a real application, but it shows why we needed [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme).
Here the base [`gl`](https://github.com/stackgl/headless-gl#readme) library fills a buffer with data.
The idea matches the previous example, but it uses the 3D WebGL API instead of the 2D Canvas API.

This approach has two problems:

1. The buffer arrives upside down.
The `readPixels` function copies a rectangle of pixels, but it measures from the lower left corner ("cartesian coordinates") instead of the more familiar upper left corner ("screen coordinates").
This is a minor annoyance, because you can arrange your drawing code to compensate, as this example does.
1. The data makes a wasteful round trip.
You send it to the GPU, read the result back into memory, and then send it to the GPU again for display.

Note also that we had to set `accelerated: false` for the window, because `gl` interferes with hardware-accelerated windows.

## [7. (Direct) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/07-webgl-drawing)

This example repeats the previous one with the [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) library.
The call to `render` is gone, and `gl.swap()` replaces it.
The window is double-buffered, so we must call `gl.swap()` twice when the window is resized.

## [8. WebGL+regl](https://github.com/kmamal/node-sdl/tree/master/examples/08-webgl-regl)

Uses the popular [`regl`](https://www.npmjs.com/package/regl) library to simplify the WebGL code.

## [9. FFmpeg video/image loading](https://github.com/kmamal/node-sdl/tree/master/examples/09-ffmpeg-video)

You can load static assets into your application in many ways.
This example uses FFmpeg, through the [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) package, to decode an image and a video into raw pixels that we render to the screen.

## [10. Joystick monitor](https://github.com/kmamal/node-sdl/tree/master/examples/10-joystick)

Opens all connected joystick devices and monitors their state.

## [11. Gamepad monitor](https://github.com/kmamal/node-sdl/tree/master/examples/11-gamepad)

Opens all connected gamepad devices and monitors their state.

## [12. Sine wave](https://github.com/kmamal/node-sdl/tree/master/examples/12-sine-wave)

Plays a 440Hz sine wave for 3 seconds.

## [13. Mic Waveform](https://github.com/kmamal/node-sdl/tree/master/examples/13-mic-waveform)

Listens to the mic and plots the volume of the recorded audio on the screen.
We lowered the `buffered` option so that the hardware delivers audio samples more often and with smaller delays.

## [14. Echo effect](https://github.com/kmamal/node-sdl/tree/master/examples/14-echo)

Listens to the mic and plays back the recording with an echo effect.
Wear headphones for this one, or you will create a feedback loop.

## [15. FFmpeg audio loading](https://github.com/kmamal/node-sdl/tree/master/examples/15-ffmpeg-audio)

This example repeats example 9 with audio files.
We again use [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static), this time to decode a .wav file into a raw PCM buffer for playback.

## [16. Audio rendering thread](https://github.com/kmamal/node-sdl/tree/master/examples/16-audio-thread)

You can use `@kmamal/sdl` only from the main thread of your Node.js program, but you may still want to move expensive computations to worker threads.
This example shows how to implement an audio rendering thread.

## [17. Changing audio driver dynamically](https://github.com/kmamal/node-sdl/tree/master/examples/17-audio-driver)
SDL initializes automatically when you import `@kmamal/sdl`, and after that you can't change the audio or video driver.
To change drivers, you must restart the process with different values for the `SDL_VIDEODRIVER` and `SDL_AUDIODRIVER` environment variables.
This example shows how to build an audio player that changes audio drivers without closing its main window.
It keeps the audio playback in a child process, separate from the main window.

## [18. Clipboard mutator](https://github.com/kmamal/node-sdl/tree/master/examples/18-clipboard-mutator)

Applies random changes to whatever text has been copied to the clipboard.

## [19. Packaging to a ZIP](https://github.com/kmamal/node-sdl/tree/master/examples/19-packaging)

Eventually you will want to make your application available for download.
You could publish an npm package, but then your users must already know Node.js.
The traditional alternative is to put all your dependencies in a `.zip` file and distribute that.
This example shows how to set up a project for that purpose.
It uses [`@kmamal/packager`](https://github.com/kmamal/packager#readme), but other packagers should work as well.
A [GitHub workflow file](https://github.com/kmamal/node-sdl/tree/master/examples/19-packaging/.github/workflows/build.yml) also builds and bundles the project for all supported platforms.

## [20. Packaging using PKG](https://github.com/kmamal/node-sdl/tree/master/examples/20-pkg)

This example packages the application with [`@yao-pkg/pkg`](https://www.npmjs.com/package/@yao-pkg/pkg), a fork of the original [`vercel/pkg`](https://github.com/vercel/pkg).
Because `pkg` does not yet support ES modules, we use the older CommonJS modules.
SDL is dynamically linked, so you must distribute the library files along with the executable.

## [21. Packaging using PKG and Webpack](https://github.com/kmamal/node-sdl/tree/master/examples/21-pkg-webpack)

To use ES modules in our code, we must first transform the code before we pass it to `pkg`.
This example resembles the previous one, except that we first run webpack to bundle the project into the `build` folder, and then run `pkg` on that folder.
The build folder needs its own `package.json` file.


// TODO: more
