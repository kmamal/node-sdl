# Examples

These serve as a collection of common use-cases, as well as a sort-of tutorial if read in order.

## [0. Hello World](https://github.com/kmamal/node-sdl/tree/master/examples/00-hello-world)

Minimum amount of code necessary to show a window on the screen.

Note the event loop. It uses the blocking `sdl.events.wait()` function which is sufficient for this example, but doesn't play along nicely with other features you'd expect in Node.js. Try for example adding a call like `setTimeout(() => { console.log('test') }, 100)` before the for loop. The advantage of this type of event loop is that is is very light on the CPU while still reporting events as soon as they happen. It's appropriate for applications that only respond to user input, without doing anything else in the background. Use with caution.

## [1. FPS Counter](https://github.com/kmamal/node-sdl/tree/master/examples/01-fps-counter)

Counts how many times per second we are able to draw to the screen. Our "drawing" here is very trivial: we just render the same empty buffer to the screen for every frame. Doing more work in the render loop will of course drop your frame rate.

Note again the event loop. We check for any available events with `sdl.events.poll()`, handle all of them, and then move on to drawing. This event loop is best suited to applications that need to achieve high FPS while still handling input events as soon as possible. This is (again) a blocking event loop so it won't allow any async events as long as it's running. Another downside is that the CPU usage rises to 100%.

## [2. Relaxed Event Loop](https://github.com/kmamal/node-sdl/tree/master/examples/02-relaxed-event-loop)

One final example to demonstrate the third type of event-loop: This time we have replaced the `for` loop with a call to `setInterval`. Finally we are able to handle async events as is the common expectation in Node.js. CPU usage has also improved. In this example we have set the interval to 100ms, which is a acceptable delay for most user interactions. Depending on the type of work you are doing in your event loop you might need a lower "idle" period (as low as `0`).

## [3. Raw Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/03-raw-drawing)

Fills a buffer with pixel data and draws it to the screen. Note that whenever the window's size changes the buffer has to be resized and refilled. Conversely, observe that if the content's of the screen stay the same, no drawing at all is necessary.

## [4. Canvas Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/04-canvas-drawing)

Instead of filling the buffer by hand we can use the popular [`canvas`](https://www.npmjs.com/package/canvas) library which does the same thing using the familiar Canvas API. Note the pixel format that the canvas library's buffer uses.

## [5. (Indirect) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/05-indirect-webgl-drawing)

This is probably not a real use-case, but it serves to demonstrate why [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) was necessary. In this example we use the base [`gl`](https://github.com/stackgl/headless-gl#readme) library to fill a buffer with data. The idea is the same as in the previous example, but this time using the 3D WebGL API instead of the 2D Canvas API.

There are 2 problems:
1. The buffer we get is upside down. The `readPixels` function lets you specify a rectangle of pixels to copy, but its origin is at the lower left corner (what's called "cartesian coordinates") vs the more familiar upper left corner ("screen coordinates"). This is only a minor annoyance since you can arrange you drawing code to accommodate this (as we did in this example).
1. To render anything this way, you have to send the data to the GPU, then read back the result to memory, only to send it back to the GPU to be displayed. This is inelegant.

## [6. (Direct) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/06-webgl-drawing)

Same example, but this time with the [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) library. Note that the call to `render` is gone. It has instead been replaced by the call to `gl.swap()`.

## [7. WebGL+regl](https://github.com/kmamal/node-sdl/tree/master/examples/07-webgl-regl)

Uses the popular [`regl`](https://www.npmjs.com/package/regl) library to simplify some of that WebGL code.

## [8. FFmpeg video/image loading](https://github.com/kmamal/node-sdl/tree/master/examples/08-ffmpeg)

There are many ways to load static assets into your application. In this example we use FFmpeg (through the [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) package) to decode an image and a video into raw pixels that we can render to the screen.

## [9. Sine wave](https://github.com/kmamal/node-sdl/tree/master/examples/09-sine-wave)

Plays a 440Hz sine wave for 3 seconds. Note that there is no event loop at all since we don't react to any user input, and instead there's a call to `setTimeout` at the end to keep the process alive while the sound plays.

## [10. Mic Waveform](https://github.com/kmamal/node-sdl/tree/master/examples/10-mic-waveform)

Listens to the mic and plots the volume of recorded audio on the screen. Note how we have reduced the value of the `buffered` option to get audio samples more frequently (and with smaller delays) from the hardware.

## [11. Echo effect](https://github.com/kmamal/node-sdl/tree/master/examples/11-echo)

Use headphones for this one or you'll end up in a feedback loop. Listens to the mic and then plays back what it recorded plus an echo effect.

## [12. Clipboard mutator](https://github.com/kmamal/node-sdl/tree/master/examples/12-clipboard-mutator)

Applies random changes to whatever text has been copied to the clipboard.

## [13. Packaging for distribution](https://github.com/kmamal/node-sdl/tree/master/examples/13-packaging)

Eventually you might want to make your application available for download somewhere. Publishing as an npm package is an option, but requires that you users are already familiar with Node.js. A more traditional option is to just include all your dependencies in a `.zip` file and distribute that. This example shows how you would setup a project for exactly this use-case. I'm using [`@kmamal/publisher`](https://github.com/kmamal/publisher#readme) here, but other packagers should work as well. There's also a github workflow file that builds and bundles the project for all supported platforms.


// TODO: more
