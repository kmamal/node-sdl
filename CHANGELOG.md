# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.11.9] - 2025-07-18

### Fixed

- Fixed some cases where the bindings were raising exceptions even though the situation was expected and non-fatal.
  - When getting the `name`, `guid`, or `path` property for joystick devices.
  - When getting the `name`, `guid`, `path`, or `mapping` property for controller devices.
  - When getting the `name` property for displays.

## [v0.11.8] - 2025-06-26

### Changed

- Upgraded SDL to v2.32.8.

## [v0.11.7] - 2025-03-14

### Added

- Started keeping this changelog.

[unreleased]: https://github.com/kmamal/node-sdl/compare/v0.11.9...HEAD
[v0.11.9]: https://github.com/kmamal/node-sdl/compare/v0.11.8...v0.11.9
[v0.11.8]: https://github.com/kmamal/node-sdl/compare/v0.11.7...v0.11.8
[v0.11.7]: https://github.com/kmamal/node-sdl/releases/tag/v0.11.7
