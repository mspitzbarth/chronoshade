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
`;