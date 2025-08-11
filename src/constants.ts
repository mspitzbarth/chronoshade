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

// Default cities for quick GPS selection
export const DEFAULT_CITIES = [
  // UTC-8
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "Seattle", lat: 47.6062, lng: -122.3321 },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
  
  // UTC-5
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Miami", lat: 25.7617, lng: -80.1918 },
  { name: "Bogotá", lat: 4.7110, lng: -74.0721 },
  
  // UTC+0
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Dublin", lat: 53.3498, lng: -6.2603 },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393 },
  { name: "Reykjavik", lat: 64.1466, lng: -21.9426 },
  
  // UTC+1
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  
  // UTC+2
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Athens", lat: 37.9838, lng: 23.7275 },
  { name: "Helsinki", lat: 60.1699, lng: 24.9384 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  
  // UTC+3
  { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Riyadh", lat: 24.7136, lng: 46.6753 },
  { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
  { name: "Kuwait City", lat: 29.3759, lng: 47.9774 },
  
  // UTC+5
  { name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Tashkent", lat: 41.2995, lng: 69.2401 },
  { name: "Islamabad", lat: 33.7294, lng: 73.0931 },
  
  // UTC+8
  { name: "Beijing", lat: 39.9042, lng: 116.4074 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Perth", lat: -31.9505, lng: 115.8605 },
  
  // UTC+9
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Seoul", lat: 37.5665, lng: 126.9780 },
  { name: "Osaka", lat: 34.6937, lng: 135.5023 },
  
  // UTC+10
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
  { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
  
  // UTC+12
  { name: "Auckland", lat: -36.8485, lng: 174.7633 },
  { name: "Wellington", lat: -41.2924, lng: 174.7787 },
  { name: "Fiji", lat: -17.7134, lng: 178.0650 }
] as const;
