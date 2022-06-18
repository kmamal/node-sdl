{
	'targets': [
		{
			'target_name': 'sdl',
			'sources': [
				'src/native/binding.cpp',
				'src/native/sdl-helpers.cpp',
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
						],
					},
					'copies': [
						{
							'destination': '<(module_root_dir)/build/Release',
							'files': [
								'<(module_root_dir)/deps/linux/libSDL2-2.0.so.0',
							],
						},
					],
				} ],
				[ 'OS=="mac"', {
					'sources': [
						'src/native/cocoa-window.mm',
					],
					'libraries': [ '<!(sdl2-config --libs)', ],
					'xcode_settings': {
						'OTHER_CFLAGS': [ '-std=c++17', '<!(sdl2-config --cflags)' ],
					},
					'link_settings': {
						'libraries': [
							'-Wl,-rpath,@loader_path',
						],
					},
					'copies': [
						{
							'destination': '<(module_root_dir)/build/Release',
							'files': [
								'<(module_root_dir)/deps/mac/libSDL2-2.0.0.dylib',
							],
						},
					],
				} ],
				[ 'OS=="win"', {
					'sources': [
						'src/native/asprintf.c',
					],
					'cflags': [ '-D_REENTRANT' ],
					'include_dirs': [ '..\\SDL2\\include' ],
					'libraries': [ '-l..\\SDL2\\lib\\x64\\SDL2.lib' ],
					'msbuild_settings': {
						'ClCompile': {
							'LanguageStandard': 'stdcpp17',
						},
					},
					'copies': [
						{
							'destination': '<(module_root_dir)/build/Release',
							'files': [
								'<(module_root_dir)/deps/windows/SDL2.dll',
							],
						},
					],
				} ],
			],
		},
	],
	'conditions': [
		[ 'OS=="mac"', {
			'targets': [
				{
					'target_name': "action_after_build",
					'type': 'none',
					'dependencies': [ 'sdl' ],
					'actions': [
						{
							'action_name': "fixing_dylib",
							'inputs': [ '<(module_root_dir)/build/Release/sdl.node' ],
							'outputs': [ 'foo' ],
							'action': [
								'install_name_tool',
								'-change',
								'/usr/local/opt/sdl2/lib/libSDL2-2.0.0.dylib',
								'@rpath/libSDL2-2.0.0.dylib',
								'<(module_root_dir)/build/Release/sdl.node'
							],
						},
					],
				},
			],
		}],
	],
}
