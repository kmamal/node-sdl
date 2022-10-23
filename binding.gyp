{
	'targets': [
		{
			'target_name': 'sdl',
			'sources': [
				'src/native/binding.cpp',
				'src/native/sdl-helpers.cpp',
			],
			'defines': [ 'NAPI_VERSION=<(napi_build_version)' ],
			'cflags': [ '-D_REENTRANT' ],
			'conditions': [
				[ 'OS=="linux"', {
					'cflags_cc': [ '-std=c++17' ],
					'include_dirs': [
						'<(module_root_dir)/SDL/build/include',
						'<(module_root_dir)/SDL/include',
					],
					'libraries': [
						'-L<(module_root_dir)/SDL/build/build/.libs',
						'-lSDL2',
					],
					'link_settings': {
						'libraries': [ "-Wl,-rpath,'$$ORIGIN'" ],
					}
				} ],
				[ 'OS=="mac"', {
					'sources': [ 'src/native/cocoa-window.mm' ],
					'libraries': [ '<!(sdl2-config --libs)' ],
					'xcode_settings': {
						'OTHER_CFLAGS': [ '-std=c++17', '<!(sdl2-config --cflags)' ],
					},
					'link_settings': {
						'libraries': [ '-Wl,-rpath,@loader_path' ],
					}
				} ],
				[ 'OS=="win"', {
					'sources': [ 'src/native/asprintf.c' ],
					'include_dirs': [ '.\\SDL\\include' ],
					'libraries': [ '-l.\\lib\\SDL2.lib' ],
					'msbuild_settings': {
						'ClCompile': {
							'LanguageStandard': 'stdcpp17',
						},
					}
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
	]
}
