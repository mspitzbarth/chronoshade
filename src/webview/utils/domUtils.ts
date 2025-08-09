// DOM utility functions for the webview (as strings to be embedded)

export const domUtilsCode = `
/**
 * Show status message with different types (success, error, info)
 */
function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = type;
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = '';
    }, 3000);
}
`;