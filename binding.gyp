{
	'targets': [{
		'target_name': 'sdl',
		'sources': [
			'src/native/binding.cpp',
			'src/native/sdl-helpers.cpp',
		],
		'defines': [ 'NAPI_VERSION=<(napi_build_version)' ],
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
				'sources': [ 'src/native/cocoa-window.mm' ],
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
				'sources': [ 'src/native/asprintf.c' ],
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
