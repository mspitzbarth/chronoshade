// DOM utility functions for the webview (as strings to be embedded)

export const domUtilsCode = `
let statusTimer;

/**
 * Show status message with different types (success, error, info).
 * A single timer means a newer message is never cleared early by an older one.
 */
function showStatus(message, type = 'success') {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;

    clearTimeout(statusTimer);
    statusElement.textContent = message;
    statusElement.className = 'status show ' + type;
    statusTimer = setTimeout(() => {
        statusElement.className = 'status ' + type;
    }, 3000);
}
`;
