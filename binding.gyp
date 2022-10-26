{
	'variables' : {
		'sdl_inc': '<!(echo $SDL_INC)',
		'sdl_lib': '<!(echo $SDL_LIB)',
	},
	'targets': [{
		'target_name': 'sdl',
		'sources': [
			'src/native/binding.cpp',
			'src/native/sdl-helpers.cpp',
		],
		'defines': [ 'NAPI_VERSION=<(napi_build_version)' ],
		'cflags': [ '-D_REENTRANT' ],
		'conditions': [
			['OS=="linux"', {
				'cflags_cc': [ '-std=c++17' ],
				'include_dirs': [ '<(sdl_inc)' ],
				'libraries': [ '-L<(sdl_lib)', '-lSDL2' ],
				'link_settings': {
					'libraries': [ "-Wl,-rpath,'$$ORIGIN'" ],
				},
			}],
			['OS=="mac"', {
				'sources': [ 'src/native/cocoa-window.mm' ],
				'include_dirs': [ '<(sdl_inc)' ],
				'libraries': [ '-L<(sdl_lib)', '-lSDL2' ],
				'xcode_settings': {
					'OTHER_CFLAGS': [ '-std=c++17', '<!(sdl2-config --cflags)' ],
				},
				'link_settings': {
					'libraries': [ '-Wl,-rpath,@loader_path' ],
				},
			}],
			['OS=="win"', {
				'sources': [ 'src/native/asprintf.c' ],
				'include_dirs': [ '<(sdl_inc)' ],
				'libraries': [ '-L<(sdl_lib)', '-lSDL2' ],
				'msbuild_settings': {
					'ClCompile': {
						'LanguageStandard': 'stdcpp17',
					},
				}
			}],
		],
	}],
}
