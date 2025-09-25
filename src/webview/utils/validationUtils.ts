// Validation utility functions for the webview (as strings to be embedded)

export const validationUtilsCode = `
/**
 * Validate time input and show/hide error messages
 */
function validateTimeInput(event) {
    const input = event.target;
    const errorElement = input.id === 'dayTimeStart' ? 
        document.getElementById('dayTimeError') : 
        document.getElementById('nightTimeError');
    
    if (!errorElement) return false;
    
    let isValid = true;
    let errorMessage = t('Invalid time format');
    
    if (input.value === '') {
        isValid = false;
        errorMessage = t('Time is required');
    } else {
        // Check for basic time format
        const timeMatch = input.value.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
        if (!timeMatch) {
            isValid = false;
            errorMessage = t('Use format HH:MM (24-hour)');
        } else {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            
            // Additional validation for edge cases
            if (hours > 23) {
                isValid = false;
                errorMessage = t('Hours must be 0-23');
            } else if (minutes > 59) {
                isValid = false;
                errorMessage = t('Minutes must be 0-59');
            }
        }
    }
    
    errorElement.textContent = errorMessage;
    
    if (!isValid) {
        input.classList.add('input-error');
        errorElement.classList.add('show');
    } else {
        input.classList.remove('input-error');
        errorElement.classList.remove('show');
    }
    
    return isValid;
}

/**
 * Validate coordinate input (latitude/longitude)
 */
function validateCoordinateInput(event, type) {
    const input = event.target;
    const value = parseFloat(input.value);
    const errorElement = input.id + 'Error';
    const errorEl = document.getElementById(errorElement);
    
    if (!errorEl) return false;
    
    let isValid = true;
    let errorMessage = '';
    
    if (input.value === '') {
        isValid = false;
        errorMessage = type === 'latitude' ? t('Latitude is required') : t('Longitude is required');
    } else if (isNaN(value)) {
        isValid = false;
        errorMessage = t('Must be a valid number');
    } else if (type === 'latitude' && (value < -90 || value > 90)) {
        isValid = false;
        errorMessage = t('Latitude must be between -90 and 90');
    } else if (type === 'longitude' && (value < -180 || value > 180)) {
        isValid = false;
        errorMessage = t('Longitude must be between -180 and 180');
    }
    
    errorEl.textContent = errorMessage;
    
    if (!isValid) {
        input.classList.add('input-error');
        errorEl.classList.add('show');
    } else {
        input.classList.remove('input-error');
        errorEl.classList.remove('show');
    }
    
    return isValid;
}

/**
 * Validate cron expression input fields
 */
function validateCronInput(event) {
    const input = event.target;
    const errorElement = input.id === 'dayCronExpression' ?
        document.getElementById('dayCronError') :
        document.getElementById('nightCronError');

    if (!errorElement) return false;

    let isValid = true;
    let errorMessage = t('Invalid cron expression');
    const value = (input.value || '').trim();

    if (value === '') {
        isValid = false;
        errorMessage = t('Cron expression is required');
    } else if (!chronoValidateCronExpression(value)) {
        isValid = false;
        errorMessage = t('Cron expression syntax is invalid');
    }

    errorElement.textContent = errorMessage;

    if (!isValid) {
        input.classList.add('input-error');
        errorElement.classList.add('show');
    } else {
        input.classList.remove('input-error');
        errorElement.classList.remove('show');
    }

    return isValid;
}
`;
