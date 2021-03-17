{
	'targets': [
		{
			'target_name': 'test',
			'sources': [
				'src/binding.cpp',
				'src/sdl-helpers.cpp',
			],
			'cflags': [ '<!(sdl2-config --cflags)' ],
			'cflags_cc': [ '-std=c++17' ],
			'libraries': [ '<!(sdl2-config --libs)', ],
			'xcode_settings': {
				'OTHER_CFLAGS': [ '-std=c++17' ],
			},
		},
	],
}
