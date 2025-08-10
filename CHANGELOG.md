# Changelog

## [1.1.2] - 2025-08-10

### Fixed

- **Timeline Visualization for Cross-Midnight Scenarios**: Fixed timeline schedule display when night time occurs before day time
  - Resolved issue where timeline showed completely blue (night) segments with invalid widths
  - Timeline now correctly visualizes cross-midnight schedules (e.g., day 13:00, night 03:18)
  - Fixed negative segment width calculations that caused rendering issues
  - Timeline segments now properly display: Night (midnight to night start) → Day (night start to day start) → Night (day start to midnight)
- **Theme Status Indicator Logic**: Updated theme detection logic to match extension behavior
  - Fixed inconsistent theme status display in cross-midnight scenarios
  - Theme indicator now correctly shows current active theme based on time
- **Cross-Midnight Time Validation**: Removed restrictive validation that prevented valid time configurations
  - Users can now set any combination of day/night times without "day must come before night" errors
  - Maintains validation to prevent identical day/night times
  - Supports all valid cross-midnight scenarios including extreme cases

## [1.1.1] - 2025-08-10

### Fixed

- **Cross-Midnight Theme Scheduling**: Resolved scheduler logic for night times that occur before day start times
  - Previously failed when night time was set before day time (e.g., night at 23:00, day at 07:00)
  - Theme switching now correctly handles scenarios where night mode spans midnight
  - Night theme properly activates from 23:00-23:59 and continues through 00:00-06:59
  - Maintains backward compatibility with normal day/night cycles (day before night)
- Fixed validation issue for GPS coordinates where sunset occurs after midnight
  - Previously caused "Day start time must be earlier than night start time" error
  - Now correctly handles scenarios where sunset is after midnight (e.g., 01:18 AM) and sunrise is later (e.g., 06:46 AM)
  - Validation still prevents identical day/night times but allows valid after-midnight sunset scenarios

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
