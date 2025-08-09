import * as vscode from "vscode";
import { getWebviewScript } from "./scripts/webviewScript";
import { getWebviewStyles } from "./styles/webviewStyles";

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  // Get the CSS content from the imported module
  const cssContent = getWebviewStyles();

  // Get the compiled JavaScript
  const jsContent = getWebviewScript();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChronoShade</title>
    <style>
        ${cssContent}
    </style>
</head>
<body>
    <div class="container">

        <div class="current-theme" id="currentTheme">
            <div class="theme-status-indicator" id="themeStatusIndicator"></div>
            <span id="currentThemeText">Current Theme: Loading...</span>
        </div>

        <div class="section">
            <div class="section-title">
                Manual Theme Control
            </div>
            <div class="quick-actions">
                <button class="button" id="switchToDay">Switch to Day</button>
                <button class="button" id="switchToNight">Switch to Night</button>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                Theme Selection
            </div>
            <div class="form-group">
                <label for="dayTheme">Day Theme</label>
                <div class="theme-option">
                    <div class="theme-preview-swatch" id="dayThemeSwatch"></div>
                    <select id="dayTheme">
                        <option value="">Select day theme...</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="nightTheme">Night Theme</label>
                <div class="theme-option">
                    <div class="theme-preview-swatch dark" id="nightThemeSwatch"></div>
                    <select id="nightTheme">
                        <option value="">Select night theme...</option>
                    </select>
                </div>
            </div>
            <div class="theme-preview">
                <button class="button secondary" id="previewDay">Preview Day</button>
                <button class="button secondary" id="previewNight">Preview Night</button>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                Auto-Switch Settings
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="enableAutoSwitch">
                <label for="enableAutoSwitch">Enable automatic theme switching</label>
            </div>
            
            <div id="switchSettings" class="hidden">
                <div class="form-group">
                    <label id="timeSourceLabel">Time Source</label>
                    <div class="checkbox-group">
                        <input type="radio" id="useManualTimes" name="timeSource" value="manual" checked>
                        <label for="useManualTimes">Manual time input</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="radio" id="useLocationTimes" name="timeSource" value="location">
                        <label for="useLocationTimes">Use GPS coordinates (automatic)</label>
                    </div>
                </div>
                <div class="schedule-timeline">
                    <div class="timeline-header">Today's Schedule</div>
                    <div class="timeline-bar" id="timelineBar">
                        <div class="timeline-marker" id="currentTimeMarker" style="left: 50%;"></div>
                    </div>
                    <div class="timeline-labels">
                        <span>12 AM</span>
                        <span>6 AM</span>
                        <span>12 PM</span>
                        <span>6 PM</span>
                        <span>12 AM</span>
                    </div>
                    <div class="timeline-legend">
                        <div class="legend-item">
                            <div class="legend-color day"></div>
                            <span id="dayThemeLabel">Day Theme</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color night"></div>
                            <span id="nightThemeLabel">Night Theme</span>
                        </div>
                    </div>
                </div>

                <div id="manualTimes">
                    <div class="form-group">
                        <label id="switchTimesLabel">Switch Times</label>
                        <div class="time-inputs">
                            <div>
                                <label for="dayTimeStart">Day Start</label>
                                <input type="time" id="dayTimeStart" value="06:00">
                                <div class="error-message" id="dayTimeError">Invalid time format</div>
                            </div>
                            <div>
                                <label for="nightTimeStart">Night Start</label>
                                <input type="time" id="nightTimeStart" value="18:00">
                                <div class="error-message" id="nightTimeError">Invalid time format</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="locationTimes" class="hidden">
                    <div class="form-group">
                        <label id="gpsCoordinatesLabel">GPS Coordinates</label>
                        <div class="time-inputs">
                            <div>
                                <label for="latitude">Latitude</label>
                                <input type="number" id="latitude" min="-90" max="90" step="0.000001" placeholder="e.g. 40.7128">
                                <div class="error-message" id="latitudeError">Invalid latitude</div>
                            </div>
                            <div>
                                <label for="longitude">Longitude</label>
                                <input type="number" id="longitude" min="-180" max="180" step="0.000001" placeholder="e.g. -74.0060">
                                <div class="error-message" id="longitudeError">Invalid longitude</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="section">
            <button class="button" id="saveSettings">Save Settings</button>
            <div id="status"></div>
        </div>
    </div>

    <script>
        ${jsContent}
    </script>
</body>
</html>`;
}

