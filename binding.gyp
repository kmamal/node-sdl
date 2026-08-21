{
	'variables': {
		# Resolved at configure time so that rebuilds that don't go through
		# scripts/build.mjs (e.g. electron-rebuild) also work. Downloads the
		# SDL headers and libs if they are missing.
		'sdl_inc%': '<!(node scripts/ensure-sdl.mjs include)',
		'sdl_lib%': '<!(node scripts/ensure-sdl.mjs lib)',
	},
	'targets': [{
		'target_name': 'sdl',
		'sources': [
			'src/native/module.cpp',
			'src/native/enums.cpp',
			'src/native/global.cpp',
			'src/native/events.cpp',
			'src/native/video.cpp',
			'src/native/window.cpp',
			'src/native/keyboard.cpp',
			'src/native/mouse.cpp',
			'src/native/touch.cpp',
			'src/native/joystick.cpp',
			'src/native/controller.cpp',
			'src/native/sensor.cpp',
			'src/native/audio.cpp',
			'src/native/clipboard.cpp',
			'src/native/power.cpp',
		],
		'dependencies': [
			"<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
		],
		'defines': [
			'NAPI_VERSION=<(napi_build_version)',
			'NODE_ADDON_API_DISABLE_DEPRECATED',
		],
		'cflags': [ '-Werror', '-Wall', '-Wextra' ],
		'conditions': [
			['OS == "linux"', {
				'cflags': [ '-D_REENTRANT' ],
				'cflags_cc': [ '-std=c++17' ],
				'include_dirs': [ '<(sdl_inc)' ],
				'libraries': [ '-L<(sdl_lib)', '-lSDL2' ],
				'link_settings': {
					'libraries': [ "-Wl,-rpath,'$$ORIGIN'" ],
				},
			}],
			['OS == "mac"', {
				'sources': [
					'src/native/cocoa-global.mm',
					'src/native/cocoa-window.mm',
				],
				'cflags': [ '-D_THREAD_SAFE' ],
				'xcode_settings': { 'OTHER_CFLAGS': [ '-std=c++17' ] },
				'include_dirs': [
					'<(sdl_inc)',
					'/opt/X11/include',
				],
				'libraries': [ '-L<(sdl_lib)', '-lSDL2' ],
				'link_settings': {
					'libraries': [ '-Wl,-rpath,@loader_path' ],
				},
			}],
			['OS == "win"', {
				'cflags': [ '-D_REENTRANT' ],
				'msvs_settings': {
					'VCCLCompilerTool': {
						'AdditionalOptions': [ '-std:c++17' ],
					},
				},
				'include_dirs': [ '<(sdl_inc)' ],
				'libraries': [ '-l<(sdl_lib)\\SDL2.lib' ],
			}],
		],
	}, {
		# Copy the addon and the SDL libraries to dist/, which is where
		# bindings.js loads them from
		'target_name': 'copy_dist',
		'type': 'none',
		'dependencies': [ 'sdl' ],
		'actions': [{
			'action_name': 'copy_dist',
			'inputs': [ '<(PRODUCT_DIR)/sdl.node' ],
			'outputs': [ '<(module_root_dir)/dist/sdl.node' ],
			'action': [ 'node', '<(module_root_dir)/scripts/copy-dist.mjs', '<(PRODUCT_DIR)' ],
		}],
	}],
}
