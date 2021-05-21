# Examples

These serve as a collection of common use-cases, as well as a sort-of tutorial if read in order.

## [0. Hello World](https://github.com/kmamal/node-sdl/tree/master/examples/0_hello_world)

Minimum amount of code necessary to show a window on the screen.

Note the event loop. It uses the blocking `sdl.events.wait()` function which is sufficient for this example, but doesn't play along nicely with other features you'd expect in Node.js. Try for example adding a call like `setTimeout(() => { console.log('test') }, 100)` before the for loop. The advantage of this type of event loop is that is is very light on the CPU while still reporting events as soon as they happen. It's appropriate for applications that only respond to user input, wuthout doing anything else in the background. Use with caution.

## [1. FPS Counter](https://github.com/kmamal/node-sdl/tree/master/examples/1_fps_counter)

Counts how many times per second we are able to draw to the screen. Our "drawing" here is very trivial: we just render the same empty buffer to the screen for every frame. Doing more work in th erender loop will of course drop your frame rate.

Note again the event loop. We check for any available events with `sdl.events.poll()`, handle all of them, and then move on to drawing. This event loop is best suited to applications that need to acheive high FPS while still handling input events as soon as possible. This is (again) a blocking event loop so it won't allow any async events as long as it's running. Another downside is that the CPU usage rises to 100%.

## [2. Relaxed Event Loop](https://github.com/kmamal/node-sdl/tree/master/examples/2_relaxed_event_loop)

One final example to demonstrate the third type of event-loop: This time we have replace the `for` loop with a call to `setInterval`. Finally we are able to handle async events as is the common expectation in Node.js. CPU usage has also improved. In this example we have set the interval to 100ms, which is a acceptable delay for most user interactions. Depending on the type of work you are doing in your event loop you might need a lower "idle" period (as low as `0`).

Now let's move on to drawing.

## [3. Raw Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/3_raw_drawing)

Fills a buffer with pixel data and draws it to the screen. Note that whenever the window's size changes the buffer has to be resized and refilled. Conversely, observe that if the content's of the screen stay the same, no drawinf at all is necessary.

## [4. Canvas Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/4_canvas_drawing)

Instead of filling the buffer by hand we can use the popular [`canvas`](https://www.npmjs.com/package/canvas) library which does the same thing using the familiar Canvas API. Note the pixel format that the canvas library's buffer uses.

## [5. (Indirect) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/5_indirect_webgl_drawing)

This is probably not a real use-case, but it serves to demonstrate why [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) was necessary. In this example we use the base [`gl`](https://github.com/stackgl/headless-gl#readme) library to fill a buffer with data. The idea is the same as in the previous example, but this time using the 3D WebGL API instead of the 2D Canvas API.

There are 2 problems:
1. The buffer we get is upside down. The `readPixels` function lets you specify a rectangle of pixels to copy, but its origin is at the lower left corner (what's called "cartesian coordinates") vs the more familiar upper left corner ("screen coordinates"). This is a minor annoyance since you can arrange you drawing code to accomodate this (as we did in this example).
1. To render anything this way, you have to send the data to the GPU, read back the result to memory, only to send it back to the GPU to be displayed. This is inelegant.

## [6. (Direct) WebGL Drawing](https://github.com/kmamal/node-sdl/tree/master/examples/6_webgl_drawing)

Same example, but this time with the [`@kmamal/gl`](https://github.com/kmamal/headless-gl#readme) library. Note that no call to `render` is necessary. It has instead been replaced by the call to `gl.swap()`.

## [7. WebGL+regl](https://github.com/kmamal/node-sdl/tree/master/examples/7_webgl_regl)

Uses the popular [`regl`](https://www.npmjs.com/package/regl) library to simplify some of that WebGL code.

// TODO: more
