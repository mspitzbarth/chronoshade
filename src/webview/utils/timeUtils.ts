// Time-related utility functions for the webview (as strings to be embedded)

export const timeUtilsCode = `
/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeStringToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n));
    return hours * 60 + minutes;
}

/**
 * Validate time format (HH:MM in 24-hour format)
 */
function isValidTimeFormat(timeStr) {
    if (!timeStr) {
        return false;
    }
    const timeMatch = timeStr.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
    if (!timeMatch) {
        return false;
    }
    
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Format time for display (convert 24h to 12h with AM/PM)
 */
function formatTimeLabel(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n));
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return displayHours + ' ' + period;
}
`;