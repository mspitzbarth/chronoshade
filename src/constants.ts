export const CONFIG_KEYS = {
  DAY_THEME: "dayTheme",
  NIGHT_THEME: "nightTheme",
  MANUAL_SUNRISE: "manualSunrise",
  MANUAL_SUNSET: "manualSunset",
  OVERRIDE_THEME_SWITCH: "overrideThemeSwitch",
  USE_LOCATION_BASED_TIMES: "useLocationBasedTimes",
  LATITUDE: "latitude",
  LONGITUDE: "longitude",
};

// Timing constants
export const TIMEOUTS = {
  PREVIEW_THEME_DURATION: 5000,     // 5 seconds for theme preview
  THEME_UPDATE_DELAY: 500,          // 500ms delay for UI updates
  WEBVIEW_INIT_DELAY: 1000,         // 1 second delay for webview initialization
} as const;

export const INTERVALS = {
  THEME_CHECK_INTERVAL: 60_000,     // 1 minute interval for theme checking
} as const;

// Default values
export const DEFAULTS = {
  DAY_TIME_START: "06:00",
  NIGHT_TIME_START: "18:00",
  DAY_THEME: "Default Light+",
  NIGHT_THEME: "Default Dark+",
  LATITUDE: 0,
  LONGITUDE: 0,
} as const;
