// Constants for the webview

export const WEBVIEW_CONSTANTS = {
    // Default time values
    DEFAULT_DAY_START: '06:00',
    DEFAULT_NIGHT_START: '18:00',
    
    // CSS classes
    CSS_CLASSES: {
        HIDDEN: 'hidden',
        INPUT_ERROR: 'input-error',
        SHOW: 'show',
        THEME_SEGMENT: 'theme-segment',
        DAY: 'day',
        NIGHT: 'night'
    },
    
    // Status message display duration
    STATUS_DISPLAY_DURATION: 3000,
    
    // Theme check interval
    THEME_CHECK_INTERVAL: 2000,
    
    // Preview revert delay
    PREVIEW_REVERT_DELAY: 5000,
    
    // Timeline update delay
    TIMELINE_UPDATE_DELAY: 500
} as const;