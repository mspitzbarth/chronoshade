import * as vscode from "vscode";

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChronoShade</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: 0;
            margin: 0;
            line-height: 1.5;
        }

        .container {
            max-width: 100%;
            padding: 16px;
        }

        .section {
            margin-bottom: 24px;
            padding: 0;
            background: transparent;
            border: none;
        }

        .section-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-widget-border);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .form-group {
            margin-bottom: 12px;
        }

        label {
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            font-weight: 500;
        }

        select, input[type="text"], input[type="number"], input[type="time"] {
            width: 100%;
            padding: 4px 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-size: 12px;
            font-family: var(--vscode-font-family);
            box-sizing: border-box;
        }

        select:focus, input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            border-color: var(--vscode-focusBorder);
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            padding: 8px 0;
        }

        input[type="checkbox"] {
            width: auto;
            margin: 0;
        }

        .checkbox-group label {
            margin: 0;
            font-size: 12px;
            cursor: pointer;
        }

        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 14px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
            font-family: var(--vscode-font-family);
            margin-right: 8px;
            margin-bottom: 8px;
            font-weight: normal;
        }

        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .button:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .current-theme {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
            padding: 8px;
            background-color: var(--vscode-textBlockQuote-background);
            border-radius: 2px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .theme-status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: var(--vscode-descriptionForeground);
            flex-shrink: 0;
        }
        
        .theme-status-indicator.day {
            background-color: #ff9500;
        }
        
        .theme-status-indicator.night {
            background-color: #4a90e2;
        }

        .time-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }


        .theme-preview {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .error {
            color: var(--vscode-errorForeground);
            font-size: 11px;
            margin-top: 4px;
        }

        .success {
            color: var(--vscode-terminal-ansiGreen);
            font-size: 11px;
            margin-top: 4px;
        }

        .info {
            color: var(--vscode-terminal-ansiBlue);
            font-size: 11px;
            margin-top: 4px;
        }

        .hidden {
            display: none;
        }





        .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }

        .quick-action-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-widget-border);
            padding: 6px 12px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
            font-family: var(--vscode-font-family);
            font-weight: normal;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .quick-action-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }

        .theme-option {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .theme-preview-swatch {
            width: 16px;
            height: 16px;
            border-radius: 2px;
            border: 1px solid var(--vscode-widget-border);
            display: inline-block;
            position: relative;
        }

        .theme-preview-swatch::after {
            content: '';
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 50%;
            background: #ff9500;
        }

        .theme-preview-swatch.dark::after {
            background: #4a90e2;
        }

        .schedule-timeline {
            background-color: var(--vscode-editor-background);
            border-radius: 4px;
            padding: 12px;
            margin: 12px 0;
        }

        .timeline-header {
            font-size: 12px;
            font-weight: 600;
            color: var(--vscode-foreground);
            margin-bottom: 8px;
        }

        .timeline-bar {
            height: 20px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 2px;
            position: relative;
            margin: 8px 0;
            overflow: hidden;
        }

        .timeline-marker {
            position: absolute;
            top: -2px;
            width: 2px;
            height: 24px;
            background-color: white;
            border-radius: 1px;
            z-index: 20;
        }

        .theme-segment {
            position: absolute;
            top: 0;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: normal;
            color: rgba(255, 255, 255, 0.8);
            z-index: 5;
        }

        .theme-segment.day {
            background: #ff9500;
        }

        .theme-segment.night {
            background: #4a90e2;
        }

        .timeline-legend {
            display: flex;
            gap: 12px;
            margin-top: 6px;
            font-size: 11px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--vscode-descriptionForeground);
        }

        .legend-color {
            width: 10px;
            height: 10px;
            border-radius: 1px;
        }

        .legend-color.day {
            background: #ff9500;
        }

        .legend-color.night {
            background: #4a90e2;
        }

        .timeline-labels {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .input-error {
            border-color: var(--vscode-inputValidation-errorBorder) !important;
            background-color: var(--vscode-inputValidation-errorBackground);
        }

        .error-message {
            color: var(--vscode-errorForeground);
            font-size: 10px;
            margin-top: 2px;
            display: none;
        }

        .error-message.show {
            display: block;
        }
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

            </div>
        </div>

        <div class="section">
            <button class="button" id="saveSettings">Save Settings</button>
            <div id="status"></div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentSettings = {};
        let currentLanguage = 'en';
        let translations = {};

        // DOM elements
        const elements = {
            currentTheme: document.getElementById('currentTheme'),
            currentThemeText: document.getElementById('currentThemeText'),
            themeStatusIndicator: document.getElementById('themeStatusIndicator'),
            dayTheme: document.getElementById('dayTheme'),
            nightTheme: document.getElementById('nightTheme'),
            dayThemeSwatch: document.getElementById('dayThemeSwatch'),
            nightThemeSwatch: document.getElementById('nightThemeSwatch'),
            enableAutoSwitch: document.getElementById('enableAutoSwitch'),
            dayTimeStart: document.getElementById('dayTimeStart'),
            nightTimeStart: document.getElementById('nightTimeStart'),
            switchSettings: document.getElementById('switchSettings'),
            manualTimes: document.getElementById('manualTimes'),
            previewDay: document.getElementById('previewDay'),
            previewNight: document.getElementById('previewNight'),
            saveSettings: document.getElementById('saveSettings'),
            status: document.getElementById('status'),
            currentTimeMarker: document.getElementById('currentTimeMarker'),
            timelineBar: document.getElementById('timelineBar'),
            dayThemeLabel: document.getElementById('dayThemeLabel'),
            nightThemeLabel: document.getElementById('nightThemeLabel')
        };

        // Event listeners
        elements.enableAutoSwitch.addEventListener('change', function() {
            elements.switchSettings.classList.toggle('hidden', !this.checked);
            updateLocationVisibility();
        });



        // Input validation and timeline updates
        elements.dayTimeStart.addEventListener('input', function(event) {
            validateTimeInput(event);
            // Update settings with current input values
            const updatedSettings = {
                ...currentSettings,
                dayTimeStart: elements.dayTimeStart.value,
                nightTimeStart: elements.nightTimeStart.value
            };
            updateTimeline(updatedSettings);
        });
        elements.nightTimeStart.addEventListener('input', function(event) {
            validateTimeInput(event);
            // Update settings with current input values  
            const updatedSettings = {
                ...currentSettings,
                dayTimeStart: elements.dayTimeStart.value,
                nightTimeStart: elements.nightTimeStart.value
            };
            updateTimeline(updatedSettings);
        });

        // Theme selection updates
        elements.dayTheme.addEventListener('change', function() {
            updateThemeSwatches();
            const updatedSettings = {
                ...currentSettings,
                dayTheme: elements.dayTheme.value,
                nightTheme: elements.nightTheme.value
            };
            updateTimeline(updatedSettings);
        });
        elements.nightTheme.addEventListener('change', function() {
            updateThemeSwatches();
            const updatedSettings = {
                ...currentSettings,
                dayTheme: elements.dayTheme.value,
                nightTheme: elements.nightTheme.value
            };
            updateTimeline(updatedSettings);
        });

        elements.previewDay.addEventListener('click', function() {
            const theme = elements.dayTheme.value;
            if (theme) {
                vscode.postMessage({ command: 'previewTheme', theme: theme });
            }
        });

        elements.previewNight.addEventListener('click', function() {
            const theme = elements.nightTheme.value;
            if (theme) {
                vscode.postMessage({ command: 'previewTheme', theme: theme });
            }
        });

        elements.saveSettings.addEventListener('click', function() {
            // Validate all time inputs before saving
            const dayTimeValid = validateTimeInput({ target: elements.dayTimeStart });
            const nightTimeValid = validateTimeInput({ target: elements.nightTimeStart });
            
            if (!dayTimeValid || !nightTimeValid) {
                showStatus(t('Please fix time format errors before saving'), 'error');
                return;
            }
            
            // Additional validation: ensure times are different
            if (elements.dayTimeStart.value === elements.nightTimeStart.value) {
                showStatus(t('Day and night times cannot be the same'), 'error');
                return;
            }
            
            // Additional validation: ensure day starts before night
            const dayStartMinutes = timeStringToMinutes(elements.dayTimeStart.value);
            const nightStartMinutes = timeStringToMinutes(elements.nightTimeStart.value);
            
            if (dayStartMinutes >= nightStartMinutes) {
                showStatus(t('Day start time must be earlier than night start time'), 'error');
                return;
            }
            
            const settings = {
                dayTheme: elements.dayTheme.value,
                nightTheme: elements.nightTheme.value,
                overrideThemeSwitch: elements.enableAutoSwitch.checked,
                dayTimeStart: elements.dayTimeStart.value,
                nightTimeStart: elements.nightTimeStart.value
            };

            vscode.postMessage({ command: 'saveSettings', ...settings });
            showStatus(t('Settings saved!'), 'success');
        });

        function updateLocationVisibility() {
            // Location functionality removed - always show manual times
        }

        // Localization functions
        function t(key, ...args) {
            let translation = translations[key] || key;
            // Simple placeholder replacement for {0}, {1}, etc.
            args.forEach((arg, index) => {
                translation = translation.replace(new RegExp('\\\\{' + index + '\\\\}', 'g'), arg);
            });
            return translation;
        }

        async function loadTranslations(language) {
            const defaultTranslations = {
                'Current Theme: Loading...': 'Current Theme: Loading...',
                'Theme Selection': 'Theme Selection',
                'Day Theme': 'Day Theme',
                'Select day theme...': 'Select day theme...',
                'Night Theme': 'Night Theme',
                'Select night theme...': 'Select night theme...',
                'Preview Day': 'Preview Day',
                'Preview Night': 'Preview Night',
                'Auto-Switch Settings': 'Auto-Switch Settings',
                'Enable automatic theme switching': 'Enable automatic theme switching',
                'Today\\'s Schedule': 'Today\\'s Schedule',
                'Switch Times': 'Switch Times',
                'Day Start': 'Day Start',
                'Night Start': 'Night Start',
                'Save Settings': 'Save Settings',
                'Invalid time format': 'Invalid time format',
                'Time is required': 'Time is required',
                'Use format HH:MM (24-hour)': 'Use format HH:MM (24-hour)',
                'Hours must be 0-23': 'Hours must be 0-23',
                'Minutes must be 0-59': 'Minutes must be 0-59',
                'Please fix time format errors before saving': 'Please fix time format errors before saving',
                'Day and night times cannot be the same': 'Day and night times cannot be the same',
                'Day start time must be earlier than night start time': 'Day start time must be earlier than night start time',
                'Settings saved!': 'Settings saved!',
                'Current Theme: {0}': 'Current Theme: {0}'
            };

            translations = defaultTranslations;
            currentLanguage = language || 'en';

            // Try to get translations from extension if not English
            if (currentLanguage !== 'en') {
                vscode.postMessage({ 
                    command: 'getTranslations', 
                    language: currentLanguage 
                });
            } else {
                updateUIText();
            }
        }

        function updateUIText() {
            // Update static text elements
            const textElements = [
                { id: 'currentThemeText', key: 'Current Theme: Loading...', keepCurrentTheme: true },
                { selector: '.section-title', index: 0, key: 'Theme Selection' },
                { selector: 'label[for="dayTheme"]', key: 'Day Theme' },
                { selector: 'option[value=""]', index: 0, key: 'Select day theme...' },
                { selector: 'label[for="nightTheme"]', key: 'Night Theme' },
                { selector: 'option[value=""]', index: 1, key: 'Select night theme...' },
                { id: 'previewDay', key: 'Preview Day' },
                { id: 'previewNight', key: 'Preview Night' },
                { selector: '.section-title', index: 1, key: 'Auto-Switch Settings' },
                { selector: 'label[for="enableAutoSwitch"]', key: 'Enable automatic theme switching' },
                { selector: '.timeline-header', key: 'Today\\'s Schedule' },
                { id: 'switchTimesLabel', key: 'Switch Times' },
                { selector: 'label[for="dayTimeStart"]', key: 'Day Start' },
                { selector: 'label[for="nightTimeStart"]', key: 'Night Start' },
                { id: 'saveSettings', key: 'Save Settings' }
            ];

            textElements.forEach(element => {
                let el;
                if (element.id) {
                    el = document.getElementById(element.id);
                } else if (element.selector) {
                    const elements = document.querySelectorAll(element.selector);
                    el = elements[element.index || 0];
                }
                
                if (el) {
                    if (element.keepCurrentTheme && el.id === 'currentThemeText') {
                        // Special handling for current theme display
                        const currentThemeMatch = el.textContent.match(/: (.+)$/);
                        const themeName = currentThemeMatch ? currentThemeMatch[1] : 'Unknown';
                        el.textContent = t('Current Theme: {0}', themeName);
                    } else {
                        el.textContent = t(element.key);
                    }
                }
            });
        }

        function populateThemeSelects(themes) {
            const daySelect = elements.dayTheme;
            const nightSelect = elements.nightTheme;
            
            // Clear existing options except the first one
            daySelect.innerHTML = \`<option value="">\${t('Select day theme...')}</option>\`;
            nightSelect.innerHTML = \`<option value="">\${t('Select night theme...')}</option>\`;
            
            themes.forEach(theme => {
                const dayOption = document.createElement('option');
                dayOption.value = theme;
                dayOption.textContent = theme;
                daySelect.appendChild(dayOption);
                
                const nightOption = document.createElement('option');
                nightOption.value = theme;
                nightOption.textContent = theme;
                nightSelect.appendChild(nightOption);
            });
        }

        function updateUI(settings) {
            currentSettings = settings;
            
            // Load translations if language has changed
            if (settings.language && settings.language !== currentLanguage) {
                loadTranslations(settings.language);
            }
            
            // Update current theme display
            elements.currentThemeText.textContent = t('Current Theme: {0}', settings.currentTheme || 'Unknown');
            updateThemeStatusIndicator(settings);
            
            
            // Populate theme dropdowns
            if (settings.themes) {
                populateThemeSelects(settings.themes);
            }
            
            // Set form values
            elements.dayTheme.value = settings.dayTheme || '';
            elements.nightTheme.value = settings.nightTheme || '';
            elements.enableAutoSwitch.checked = settings.overrideThemeSwitch || false;
            // Set default values and validate them
            const dayTime = settings.dayTimeStart || '06:00';
            const nightTime = settings.nightTimeStart || '18:00';
            
            // Ensure the time values are properly formatted
            elements.dayTimeStart.value = isValidTimeFormat(dayTime) ? dayTime : '06:00';
            elements.nightTimeStart.value = isValidTimeFormat(nightTime) ? nightTime : '18:00';
            
            // Update theme swatches and buttons
            updateThemeSwatches();
            
            // Update timeline
            updateTimeline(settings);
            
            // Update visibility
            elements.switchSettings.classList.toggle('hidden', !elements.enableAutoSwitch.checked);
            updateLocationVisibility();
        }

        function showStatus(message, type = 'success') {
            elements.status.textContent = message;
            elements.status.className = type;
            setTimeout(() => {
                elements.status.textContent = '';
                elements.status.className = '';
            }, 3000);
        }



        function timeStringToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(n => parseInt(n));
            return hours * 60 + minutes;
        }

        function updateTimeline(settings) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const currentPercent = (currentMinutes / (24 * 60)) * 100;
            
            elements.currentTimeMarker.style.left = currentPercent + '%';
            
            // Update timeline labels
            const dayStart = settings.dayTimeStart || '06:00';
            const nightStart = settings.nightTimeStart || '18:00';
            
            
            // Create theme segments
            createThemeSegments(settings);
            
            // Update legend with theme names
            elements.dayThemeLabel.textContent = settings.dayTheme || 'Day Theme';
            elements.nightThemeLabel.textContent = settings.nightTheme || 'Night Theme';
        }
        
        function createThemeSegments(settings) {
            // Clear existing segments
            const existingSegments = elements.timelineBar.querySelectorAll('.theme-segment');
            existingSegments.forEach(segment => segment.remove());
            
            const dayStartTime = settings.dayTimeStart || '06:00';
            const nightStartTime = settings.nightTimeStart || '18:00';
            
            const dayStart = timeStringToMinutes(dayStartTime);
            const nightStart = timeStringToMinutes(nightStartTime);
            
            // Calculate percentages (0-100% of the day)
            const dayStartPercent = (dayStart / (24 * 60)) * 100;
            const nightStartPercent = (nightStart / (24 * 60)) * 100;
            
            // Night theme: 00:00 to day start (only if day doesn't start at midnight)
            if (dayStart > 0) {
                const nightSegment1 = document.createElement('div');
                nightSegment1.className = 'theme-segment night';
                nightSegment1.style.left = '0%';
                nightSegment1.style.width = dayStartPercent + '%';
                elements.timelineBar.appendChild(nightSegment1);
            }
            
            // Day theme: day start to night start
            if (dayStart < nightStart) {
                const dayWidth = nightStartPercent - dayStartPercent;
                const daySegment = document.createElement('div');
                daySegment.className = 'theme-segment day';
                daySegment.style.left = dayStartPercent + '%';
                daySegment.style.width = dayWidth + '%';
                elements.timelineBar.appendChild(daySegment);
            }
            
            // Night theme: night start to midnight (only if night doesn't start at midnight)
            if (nightStart < 24 * 60 && nightStart > 0) {
                const nightWidth = 100 - nightStartPercent;
                const nightSegment2 = document.createElement('div');
                nightSegment2.className = 'theme-segment night';
                nightSegment2.style.left = nightStartPercent + '%';
                nightSegment2.style.width = nightWidth + '%';
                elements.timelineBar.appendChild(nightSegment2);
            }
        }

        function formatTimeLabel(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(n => parseInt(n));
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            return displayHours + ' ' + period;
        }

        function isValidTimeFormat(timeStr) {
            if (!timeStr) return false;
            const timeMatch = timeStr.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
            if (!timeMatch) return false;
            
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
        }
        
        function updateThemeSwatches() {
            // Theme swatches can be updated here if needed in the future
        }
        
        function updateThemeStatusIndicator(settings) {
            if (!elements.themeStatusIndicator) return;
            
            // Determine if current theme should be day or night based on current time and settings
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            const dayStart = settings.dayTimeStart || elements.dayTimeStart?.value || '06:00';
            const nightStart = settings.nightTimeStart || elements.nightTimeStart?.value || '18:00';
            
            const isNightTime = currentTime >= nightStart || currentTime < dayStart;
            
            // Clear existing classes
            elements.themeStatusIndicator.classList.remove('day', 'night');
            
            // Add appropriate class based on time
            if (isNightTime) {
                elements.themeStatusIndicator.classList.add('night');
            } else {
                elements.themeStatusIndicator.classList.add('day');
            }
        }

        function validateTimeInput(event) {
            const input = event.target;
            const errorElement = input.id === 'dayTimeStart' ? 
                document.getElementById('dayTimeError') : 
                document.getElementById('nightTimeError');
            
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



        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateThemes':
                    updateUI(message.settings);
                    break;
                case 'updateCurrentTheme':
                    elements.currentThemeText.textContent = t('Current Theme: {0}', message.currentTheme || 'Unknown');
                    updateThemeStatusIndicator({ currentTheme: message.currentTheme });
                    break;
                case 'translations':
                    if (message.translations) {
                        translations = { ...translations, ...message.translations };
                        updateUIText();
                    }
                    break;
            }
        });

        // Request initial data
        vscode.postMessage({ command: 'getThemes' });
        
        // Set up periodic theme update check
        setInterval(() => {
            vscode.postMessage({ command: 'getCurrentTheme' });
        }, 2000); // Check every 2 seconds
    </script>
</body>
</html>`;
}