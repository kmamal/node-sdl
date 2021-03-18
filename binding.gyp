{
	'targets': [
		{
			'target_name': 'test',
			'sources': [
				'src/binding.cpp',
				'src/sdl-helpers.cpp',
			],
			'cflags_cc': [ '-std=c++17' ],
			'conditions': [
				[ 'OS=="linux"', {
					'cflags': [ '<!(sdl2-config --cflags)' ],
					'libraries': [ '<!(sdl2-config --libs)', ],
				} ],
				[ 'OS=="mac"', {
					'sources': [
						'src/cocoa-window.mm',
					],
					'cflags': [ '<!(sdl2-config --cflags)' ],
					'libraries': [ '<!(sdl2-config --libs)', ],
					'xcode_settings': {
						'OTHER_CFLAGS': [ '-std=c++17' ],
					},
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
