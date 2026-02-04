# Changelog

## [1.4.1] - 2026-02-04

### Fixed

- **Configuration Error**: Resolved "Unable to write to User Settings" error caused by missing offset configuration passed from the webview.
- **UI Crash**: Fixed a bug where the "Detect Location" button was not properly initialized, causing the settings UI to become unresponsive.
- **Settings Persistence**: Ensured sunrise/sunset offsets are correctly saved when using GPS location features.

## [1.4.0] - 2026-01-31

### Changed

- **Automatic Location Detection**: When valid GPS coordinates are not provided (lat/lon are 0), the extension now automatically detects your approximate location based on your IP address to calculate accurate sunrise/sunset times without manual configuration.

## [1.3.0] - 2025-09-25

### Added

- **Cron Scheduling**: Configure day and night theme changes with cron expressions, including new settings and sidebar controls for managing complex schedules.

## [1.2.0] - 2025-08-11

### Added

- **Quick City Selection Dropdown**: Added dropdown with 36 major cities worldwide for easy GPS coordinate selection
  - Cities organized by UTC time zones (UTC-8 through UTC+12) with clear subheaders
  - Includes major cities: Los Angeles, New York, London, Paris, Tokyo, Sydney, and many more
  - Automatically populates latitude/longitude fields when city is selected
  - Provides convenient alternative to manual coordinate entry

### Fixed

- **GPS-Based Theme Switching**: Completely resolved issues with location-based automatic theme switching

  - Fixed incorrect timezone conversion that was causing GPS times to be calculated wrong
  - Resolved GPS coordinate caching bug where different locations shared the same cached sunrise/sunset times
  - GPS coordinates now correctly fetch and apply location-specific sunrise/sunset times
  - Theme switching now works properly when using GPS coordinates from any location
  - Immediate theme application after saving GPS settings with proper day/night detection

- **Location-Based Time Caching**: Fixed caching system to be location-aware
  - Cache now includes coordinates as part of the cache key
  - Different locations no longer share incorrect cached times
  - Cache properly invalidates when switching between different GPS coordinates

### Improved

- **Enhanced GPS Time Fetching**: Improved reliability and accuracy of GPS-based sunrise/sunset times
  - Better error handling for GPS coordinate validation and API failures
  - More robust UTC to local time conversion using proper timezone detection
  - Immediate theme switching after GPS location changes

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
