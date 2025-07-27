# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [0.1.14] - Previous releases

For earlier releases, please refer to the git history.