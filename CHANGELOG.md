# Changelog

## [1.1.0] - 2025-08-09

### Added

- **Manual Theme Control**: Two new buttons for instantly switching between day and night themes
  - Switch to Day button
  - Switch to Night button
- **Automatic Sunrise/Sunset Detection**: Integration with sunrisesunset.io API for automatic sunrise/sunset times
  - Latitude/longitude configuration settings
  - Automatic time fetching on VSCode initialization
  - Option to choose between manual time input or GPS coordinates
- **Enhanced Internationalization**: Full translation support for new features across all 15 supported languages
  - German, French, Spanish, Italian, Portuguese (BR)
  - Japanese, Chinese (Simplified & Traditional), Korean
  - Polish, Czech, Hungarian, Turkish, Bulgarian
- Configuration options for location-based theme switching
- User-friendly warnings when themes are not configured
- Real-time theme switching with immediate visual feedback

### Changed

- Improved UI layout with new Manual Theme Control section
- Enhanced error handling and user feedback
- Better code organization and linting compliance

### Fixed

- ESLint warnings for missing curly braces
- Improved code consistency across all source files

## [1.0.0] - 2025-08-08

### Added

- Initial release of ChronoShade extension
- Automatic theme switching based on time of day
- Configurable day and night themes
- Manual sunrise/sunset time configuration
- Visual timeline showing current time and theme schedule
- Theme preview functionality
- Complete internationalization support for 14 languages
- Activity bar integration with sidebar webview
- Auto-switch enable/disable functionality
- Time validation and error handling
- VSCode workbench integration
