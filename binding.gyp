{
	'targets': [
		{
			'target_name': 'sdl',
			'sources': [
				'src/binding.cpp',
				'src/sdl-helpers.cpp',
			],
			'defines': [
				'NAPI_VERSION=<(napi_build_version)'
			],
			'cflags_cc': [ '-std=c++17' ],
			'conditions': [
				[ 'OS=="linux"', {
					'cflags': [ '<!(sdl2-config --cflags)' ],
					'libraries': [ '<!(sdl2-config --libs)', ],
					'link_settings': {
						'libraries': [
							'-Wl,-rpath,\'$$ORIGIN\'',
							'-Wl,-rpath,\'$$ORIGIN\'/..'
						],
					}
				} ],
				[ 'OS=="mac"', {
					'sources': [
						'src/cocoa-window.mm',
					],
					'libraries': [ '<!(sdl2-config --libs)', ],
					'xcode_settings': {
						'OTHER_CFLAGS': [ '-std=c++17', '<!(sdl2-config --cflags)' ],
					},
					'link_settings': {
						'libraries': [
							'-Wl,-rpath,@loader_path',
							'-Wl,-rpath,@loader_path/..',
						],
					}
				} ],
				[ 'OS=="win"', {
					'sources': [
						'src/asprintf.c',
					],
					'cflags': [ '-D_REENTRANT' ],
					'include_dirs': [ 'SDL2\\include' ],
					'libraries': [ '-l..\\SDL2\\lib\\x64\\SDL2.lib' ],
					'msbuild_settings': {
						'ClCompile': {
							'LanguageStandard': 'stdcpp17',
						},
					},
				} ],
			],
		},
	],
}
