{
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
				'include_dirs': [ '$(SDL_INC)' ],
				'libraries': [ '-L$(SDL_LIB)', '-lSDL2' ],
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
					'$(SDL_INC)',
					'/opt/X11/include',
				],
				'libraries': [ '-L$(SDL_LIB)', '-lSDL2' ],
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
				'include_dirs': [ '<!(echo %SDL_INC%)' ],
				'libraries': [ '-l<!(echo %SDL_LIB%)\\SDL2.lib' ],
			}],
		],
	}],
}
