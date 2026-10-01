# Building from source

If no prebuilt binaries exist for your platform, `@kmamal/sdl` tries to compile itself during installation.
For that to work, you need a few prerequisites:

First, install [node-addon-api](https://github.com/nodejs/node-addon-api) and [node-gyp](https://github.com/nodejs/node-gyp#installation) with all its dependencies.

On Mac, you also need `xquartz` so that SDL can find the X11 headers it needs.
Install it via homebrew with `brew install xquartz`.

You don't need to install any SDL libraries or headers.
The [@kmamal/build-sdl](https://github.com/kmamal/build-sdl) package downloads them automatically.
If `@kmamal/build-sdl` has no prebuilt library for your platform, it tries to compile one on the spot, which requires `cmake`.

## Using the system SDL

To build against an SDL that your system already has installed (or that a cross-compilation sysroot provides), set `NODE_SDL_SYSTEM=1`:

```bash
NODE_SDL_SYSTEM=1 npm install @kmamal/sdl
```

The install script then skips both the prebuilt binaries and the SDL download, asks `pkg-config` where the `sdl3` package's headers and libraries live, and compiles against those.
Nothing gets bundled: the resulting addon links to your SDL at runtime, so the dynamic loader must be able to find the library.
It can if `pkg-config` found the library in a standard location. Otherwise, use `LD_LIBRARY_PATH` or the equivalent for your platform.
`pkg-config` must be installed and able to find `sdl3`.
The install script honors the standard `pkg-config` environment variables (`PKG_CONFIG`, `PKG_CONFIG_PATH`, `PKG_CONFIG_SYSROOT_DIR`, ...), so you can use them to point it at a sysroot when cross-compiling.

If `pkg-config` can't find your SDL, or you want to use a specific one, set `SDL_INC` to the directory that holds the `SDL3/` headers and `SDL_LIB` to the directory that holds the library.
Each variable overrides the corresponding `pkg-config` answer, and the install script ignores both unless you also set `NODE_SDL_SYSTEM=1`:

```bash
NODE_SDL_SYSTEM=1 SDL_INC=/opt/sdl3/include SDL_LIB=/opt/sdl3/lib npm install @kmamal/sdl
```

## Contributing

If you want to contribute to this package, these npm scripts in `package.json` can help you:

- `npm run clean` deletes all folders that the build creates, as well as `node_modules`.
- `npm run download-release` downloads the prebuilt binaries. The install script tries this first.
- `npm run download-sdl` downloads the SDL headers and libraries from `@kmamal/build-sdl` so you can compile against them in later steps. The install script runs this second, after `download-release` fails.
- `npm run build` prepares the environment variables and calls `node-gyp` to build the package.
- `NODE_SDL_FROM_SOURCE=1 npm install` runs the install script normally, but skips the initial attempt to download the binaries and goes straight to building from source.
- `NODE_SDL_SYSTEM=1 npm install` skips both downloads and builds against the SDL that `pkg-config` finds on the system, as described above.

The scripts download the SDL headers and libs to `sdl/`, build in `build/`, and collect the final binaries into `dist/`.

I normally run `npm run clean` to start fresh, run `NODE_SDL_FROM_SOURCE=1 npm i` once to prepare everything, and then run `npm run build` to rebuild the package as I make changes.

Have fun!
