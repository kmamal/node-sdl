{
    'variables': {
        'werror%': 0,
    },
    'targets': [
        {
            'target_name':
            'sdl',
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
                'src/native/gamepad.cpp',
                'src/native/sensor.cpp',
                'src/native/audio.cpp',
                'src/native/clipboard.cpp',
                'src/native/power.cpp',
                'src/native/threads.cpp',
                'src/native/packed.cpp',
                'src/native/testing.cpp',
            ],
            'dependencies': [
                "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
            ],
            'defines': [
                # Node-API 9, which every supported Node.js (v22.16.0 and later) has
                'NAPI_VERSION=9',
                'NODE_ADDON_API_DISABLE_DEPRECATED',
                'NODE_API_SWALLOW_UNTHROWABLE_EXCEPTIONS',
            ],
            'cflags': ['-Wall', '-Wextra'],
            'conditions': [
                [
                    'werror == 1', {
                        'cflags': ['-Werror'],
                        'xcode_settings': {
                            'GCC_TREAT_WARNINGS_AS_ERRORS': 'YES',
                        },
                        'msvs_settings': {
                            'VCCLCompilerTool': {
                                'WarnAsError': 'true',
                            },
                        },
                    }
                ],
                [
                    'OS == "linux" or OS == "freebsd" or OS == "openbsd" or OS == "netbsd"', {
                        'cflags': ['-D_REENTRANT'],
                        'cflags_cc': ['-std=c++17'],
                        'include_dirs': ['$(SDL_INC)'],
                        'libraries': ['-L$(SDL_LIB)', '-lSDL3'],
                        'link_settings': {
                            'libraries': ["-Wl,-rpath,'$$ORIGIN'"],
                        },
                    }
                ],
                [
                    'OS == "mac"', {
                        'sources': [
                            'src/native/cocoa-global.mm',
                            'src/native/cocoa-window.mm',
                        ],
                        'defines': ['_THREAD_SAFE'],
                        'xcode_settings': {
                            'OTHER_CFLAGS': ['-std=c++17'],
                            'WARNING_CFLAGS': ['-Wall', '-Wextra'],
                        },
                        'include_dirs': [
                            '$(SDL_INC)',
                            '/opt/X11/include',
                        ],
                        'libraries': ['-L$(SDL_LIB)', '-lSDL3'],
                        'link_settings': {
                            'libraries': ['-Wl,-rpath,@loader_path'],
                        },
                    }
                ],
                [
                    'OS == "win"', {
                        'defines': ['_REENTRANT'],
                        'msvs_settings': {
                            'VCCLCompilerTool': {
                                'AdditionalOptions': ['-std:c++17'],
                                'WarningLevel': '4',
                                'DisableSpecificWarnings': ['4127'],
                            },
                        },
                        'include_dirs': ['<!(echo %SDL_INC%)'],
                        'libraries': ['-l<!(echo %SDL_LIB%)\\SDL3.lib'],
                    }
                ],
            ],
        }
    ],
}
