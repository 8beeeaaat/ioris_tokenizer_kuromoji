# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-07-27

### Added

- CLAUDE.md file with comprehensive project guidance for Claude Code integration
- Detailed API reference section in README.md with TypeScript types and examples
- Enhanced "How It Works" section explaining tokenizer behavior and linguistic processing
- Example transformations showing input/output of the tokenization process
- Development section with build, test, and code quality commands
- Use cases section highlighting practical applications (karaoke, music apps, etc.)
- Requirements section with specific version dependencies

### Changed

- **Enhanced README.md**: Complete overhaul with improved structure and detailed explanations
- Updated usage examples to reflect current @ioris/core API (`createParagraph` instead of `Paragraph` constructor)
- Improved feature descriptions with bullet-point formatting and clear benefits
- Enhanced custom rules documentation with practical examples
- Better organization of documentation sections for improved readability

### Technical

- Added comprehensive development guidelines in CLAUDE.md for future contributors
- Documented high-level architecture patterns and core components
- Included testing strategy and special considerations for lyrics processing
- Enhanced project overview with focus on timeline-based processing and rule-based segmentation

## [0.3.0] - 2025-07-27

### Changed

- Updated @ioris/core dependency from ^0.2.0 to ^0.3.0 for latest features and improvements
- Refactored build configuration with enhanced TypeScript settings and module resolution
- Improved tokenizer implementation with better code organization and maintainability

### Technical

- Updated development dependencies: Biome 2.1.2, esbuild 0.25.8, TypeScript 5.8.3, Vitest 3.2.4
- Enhanced CI/CD pipelines with Node.js 24.x support for better performance and compatibility
- Streamlined test suite with improved test structure and reduced complexity
- Updated build system configuration for better module handling and optimization

### Fixed

- Improved TypeScript configuration for better type checking and module resolution
- Enhanced build process reliability and output consistency

## [0.2.0] - 2024-12-28

### Changed

- **BREAKING**: Migrated to ESM-only package format, dropping CommonJS support
- Updated @ioris/core dependency to ^0.3.2 (ESM-only)
- Modernized TypeScript configuration with "bundler" module resolution
- Updated Node.js CI workflows to use version 24.x

### Added

- Comprehensive README.md with usage examples and API documentation
- Support for new @ioris/core createParagraph API (replacing Paragraph constructor)

### Technical

- Enhanced build system with JSON import attributes for Node.js ESM compatibility
- Updated development tooling: Biome 2.1.2, TypeScript 5.8.3, Vitest 3.2.4
- Improved test coverage and updated test assertions for new API
- Removed CommonJS build artifacts and dual module support

### Fixed

- TypeScript import resolution errors for @ioris/core types
- Test compatibility with new @ioris/core data structures
- Build configuration for ESM-only environment

## [0.1.14] - 2024-12-27

### Improvements

- Minor improvements and bug fixes
- Dependency updates for security and performance

## [0.1.13] - 2024-12-26

### Updates

- Internal refactoring and optimization
- Updated build processes

## [0.1.12] - 2024-12-25

### Enhancements

- Package configuration improvements
- Enhanced compatibility

## [0.1.11] and earlier

For releases prior to 0.1.12, please refer to the git history and release tags.
