// Main webview script for ChronoShade
// This will be compiled and inlined into the webview template

import { defaultTranslations } from '../translations/defaultTranslations';
import { timeUtilsCode } from '../utils/timeUtils';
import { validationUtilsCode } from '../utils/validationUtils';
import { domUtilsCode } from '../utils/domUtils';
import { WEBVIEW_CONSTANTS } from '../constants';

// Export the main webview script function
export function getWebviewScript(): string {
    return `
        const vscode = acquireVsCodeApi();
        let currentSettings = {};
        let currentLanguage = 'en';
        let translations = ${JSON.stringify(defaultTranslations, null, 2)};

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
            useManualTimes: document.getElementById('useManualTimes'),
            useLocationTimes: document.getElementById('useLocationTimes'),
            dayTimeStart: document.getElementById('dayTimeStart'),
            nightTimeStart: document.getElementById('nightTimeStart'),
            latitude: document.getElementById('latitude'),
            longitude: document.getElementById('longitude'),
            switchSettings: document.getElementById('switchSettings'),
            manualTimes: document.getElementById('manualTimes'),
            locationTimes: document.getElementById('locationTimes'),
            previewDay: document.getElementById('previewDay'),
            previewNight: document.getElementById('previewNight'),
            switchToDay: document.getElementById('switchToDay'),
            switchToNight: document.getElementById('switchToNight'),
            saveSettings: document.getElementById('saveSettings'),
            status: document.getElementById('status'),
            currentTimeMarker: document.getElementById('currentTimeMarker'),
            timelineBar: document.getElementById('timelineBar'),
            dayThemeLabel: document.getElementById('dayThemeLabel'),
            nightThemeLabel: document.getElementById('nightThemeLabel')
        };

        // Utility Functions
        ${timeUtilsCode}
        
        ${domUtilsCode}
        
        ${validationUtilsCode}

        // Event Listeners Setup
        function setupEventListeners() {
            elements.enableAutoSwitch.addEventListener('change', function() {
                elements.switchSettings.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', !this.checked);
                updateTimeSourceVisibility();
            });

            elements.useManualTimes.addEventListener('change', function() {
                if (this.checked) {
                    updateTimeSourceVisibility();
                }
            });

            elements.useLocationTimes.addEventListener('change', function() {
                if (this.checked) {
                    updateTimeSourceVisibility();
                }
            });

            elements.switchToDay.addEventListener('click', function() {
                vscode.postMessage({ command: 'forceDayTheme' });
                elements.enableAutoSwitch.checked = false;
                elements.switchSettings.classList.add('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}');
                vscode.postMessage({ command: 'disableAutoSwitch' });
                showStatus(t('Day theme applied. Automatic theme switching disabled.'), 'info');
            });

            elements.switchToNight.addEventListener('click', function() {
                vscode.postMessage({ command: 'forceNightTheme' });
                elements.enableAutoSwitch.checked = false;
                elements.switchSettings.classList.add('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}');
                vscode.postMessage({ command: 'disableAutoSwitch' });
                showStatus(t('Night theme applied. Automatic theme switching disabled.'), 'info');
            });

            elements.saveSettings.addEventListener('click', handleSaveSettings);

            // Input validation and timeline updates
            elements.dayTimeStart.addEventListener('input', function(event) {
                validateTimeInput(event);
                updateTimelineFromInputs();
            });

            elements.nightTimeStart.addEventListener('input', function(event) {
                validateTimeInput(event);
                updateTimelineFromInputs();
            });

            // Theme selection updates
            elements.dayTheme.addEventListener('change', function() {
                updateThemeSwatches();
                updateTimelineFromInputs();
            });

            elements.nightTheme.addEventListener('change', function() {
                updateThemeSwatches();
                updateTimelineFromInputs();
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
        }

        // Main Functions
        function handleSaveSettings() {
            if (elements.useLocationTimes.checked) {
                const lat = parseFloat(elements.latitude.value);
                const lng = parseFloat(elements.longitude.value);
                
                if (isNaN(lat) || isNaN(lng)) {
                    showStatus('Please enter valid latitude and longitude values', 'error');
                    return;
                }
                
                showStatus('Fetching sunrise/sunset times...', 'info');
                
                vscode.postMessage({ 
                    command: 'testLocation', 
                    latitude: lat, 
                    longitude: lng,
                    saveAfterFetch: true
                });
                return;
            }
            
            const dayTimeValid = validateTimeInput({ target: elements.dayTimeStart });
            const nightTimeValid = validateTimeInput({ target: elements.nightTimeStart });
            
            if (!dayTimeValid || !nightTimeValid) {
                showStatus(t('Please fix time format errors before saving'), 'error');
                return;
            }
            
            if (elements.dayTimeStart.value === elements.nightTimeStart.value) {
                showStatus(t('Day and night times cannot be the same'), 'error');
                return;
            }
            
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
                nightTimeStart: elements.nightTimeStart.value,
                useLocationBasedTimes: elements.useLocationTimes.checked,
                latitude: parseFloat(elements.latitude.value) || 0,
                longitude: parseFloat(elements.longitude.value) || 0
            };

            vscode.postMessage({ command: 'saveSettings', ...settings });
            showStatus(t('Settings saved!'), 'success');
        }

        function updateTimeSourceVisibility() {
            const useLocation = elements.useLocationTimes.checked;
            elements.manualTimes.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', useLocation);
            elements.locationTimes.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', !useLocation);
        }

        function updateTimelineFromInputs() {
            const updatedSettings = {
                ...currentSettings,
                dayTimeStart: elements.dayTimeStart.value,
                nightTimeStart: elements.nightTimeStart.value,
                dayTheme: elements.dayTheme.value,
                nightTheme: elements.nightTheme.value
            };
            updateTimeline(updatedSettings);
        }

        // Localization functions
        function t(key, ...args) {
            let translation = translations[key] || key;
            args.forEach((arg, index) => {
                translation = translation.replace(new RegExp('\\\\{' + index + '\\\\}', 'g'), arg);
            });
            return translation;
        }

        async function loadTranslations(language) {
            translations = ${JSON.stringify(defaultTranslations, null, 2)};
            currentLanguage = language || 'en';

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
            const textElements = [
                { id: 'currentThemeText', key: 'Current Theme: Loading...', keepCurrentTheme: true },
                { selector: '.section-title', index: 0, key: 'Manual Theme Control' },
                { id: 'switchToDay', key: 'Switch to Day' },
                { id: 'switchToNight', key: 'Switch to Night' },
                { selector: '.section-title', index: 1, key: 'Theme Selection' },
                { selector: 'label[for="dayTheme"]', key: 'Day Theme' },
                { selector: 'option[value=""]', index: 0, key: 'Select day theme...' },
                { selector: 'label[for="nightTheme"]', key: 'Night Theme' },
                { selector: 'option[value=""]', index: 1, key: 'Select night theme...' },
                { id: 'previewDay', key: 'Preview Day' },
                { id: 'previewNight', key: 'Preview Night' },
                { selector: '.section-title', index: 2, key: 'Auto-Switch Settings' },
                { selector: 'label[for="enableAutoSwitch"]', key: 'Enable automatic theme switching' },
                { id: 'timeSourceLabel', key: 'Time Source' },
                { selector: 'label[for="useManualTimes"]', key: 'Manual time input' },
                { selector: 'label[for="useLocationTimes"]', key: 'Use GPS coordinates (automatic)' },
                { id: 'gpsCoordinatesLabel', key: 'GPS Coordinates' },
                { selector: '.timeline-header', key: 'Today\\'s Schedule' },
                { id: 'switchTimesLabel', key: 'Switch Times' },
                { selector: 'label[for="dayTimeStart"]', key: 'Day Start' },
                { selector: 'label[for="nightTimeStart"]', key: 'Night Start' },
                { selector: 'label[for="latitude"]', key: 'Latitude' },
                { selector: 'label[for="longitude"]', key: 'Longitude' },
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
            
            if (settings.language && settings.language !== currentLanguage) {
                loadTranslations(settings.language);
            }
            
            elements.currentThemeText.textContent = t('Current Theme: {0}', settings.currentTheme || 'Unknown');
            updateThemeStatusIndicator(settings);
            
            if (settings.themes) {
                populateThemeSelects(settings.themes);
            }
            
            elements.dayTheme.value = settings.dayTheme || '';
            elements.nightTheme.value = settings.nightTheme || '';
            elements.enableAutoSwitch.checked = settings.overrideThemeSwitch || false;
            
            const dayTime = settings.dayTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            const nightTime = settings.nightTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            
            elements.dayTimeStart.value = isValidTimeFormat(dayTime) ? dayTime : '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            elements.nightTimeStart.value = isValidTimeFormat(nightTime) ? nightTime : '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            
            elements.useLocationTimes.checked = settings.useLocationBasedTimes || false;
            elements.useManualTimes.checked = !settings.useLocationBasedTimes;
            elements.latitude.value = settings.latitude || '';
            elements.longitude.value = settings.longitude || '';
            
            updateThemeSwatches();
            updateTimeline(settings);
            
            elements.switchSettings.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', !elements.enableAutoSwitch.checked);
            updateTimeSourceVisibility();
        }

        function updateTimeline(settings) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const currentPercent = (currentMinutes / (24 * 60)) * 100;
            
            elements.currentTimeMarker.style.left = currentPercent + '%';
            
            createThemeSegments(settings);
            
            elements.dayThemeLabel.textContent = settings.dayTheme || 'Day Theme';
            elements.nightThemeLabel.textContent = settings.nightTheme || 'Night Theme';
        }
        
        function createThemeSegments(settings) {
            const existingSegments = elements.timelineBar.querySelectorAll('.${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT}');
            existingSegments.forEach(segment => segment.remove());
            
            const dayStartTime = settings.dayTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            const nightStartTime = settings.nightTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            
            const dayStart = timeStringToMinutes(dayStartTime);
            const nightStart = timeStringToMinutes(nightStartTime);
            
            const dayStartPercent = (dayStart / (24 * 60)) * 100;
            const nightStartPercent = (nightStart / (24 * 60)) * 100;
            
            if (dayStart > 0) {
                const nightSegment1 = document.createElement('div');
                nightSegment1.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}';
                nightSegment1.style.left = '0%';
                nightSegment1.style.width = dayStartPercent + '%';
                elements.timelineBar.appendChild(nightSegment1);
            }
            
            if (dayStart < nightStart) {
                const dayWidth = nightStartPercent - dayStartPercent;
                const daySegment = document.createElement('div');
                daySegment.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}';
                daySegment.style.left = dayStartPercent + '%';
                daySegment.style.width = dayWidth + '%';
                elements.timelineBar.appendChild(daySegment);
            }
            
            if (nightStart < 24 * 60 && nightStart > 0) {
                const nightWidth = 100 - nightStartPercent;
                const nightSegment2 = document.createElement('div');
                nightSegment2.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}';
                nightSegment2.style.left = nightStartPercent + '%';
                nightSegment2.style.width = nightWidth + '%';
                elements.timelineBar.appendChild(nightSegment2);
            }
        }
        
        function updateThemeSwatches() {
            // Theme swatches can be updated here if needed in the future
        }
        
        function updateThemeStatusIndicator(settings) {
            if (!elements.themeStatusIndicator) return;
            
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            const dayStart = settings.dayTimeStart || elements.dayTimeStart?.value || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            const nightStart = settings.nightTimeStart || elements.nightTimeStart?.value || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            
            const isNightTime = currentTime >= nightStart || currentTime < dayStart;
            
            elements.themeStatusIndicator.classList.remove('${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}', '${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}');
            
            if (isNightTime) {
                elements.themeStatusIndicator.classList.add('${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}');
            } else {
                elements.themeStatusIndicator.classList.add('${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}');
            }
        }

        // Message handling
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
                case 'locationTestResult':
                    if (message.success) {
                        elements.dayTimeStart.value = message.times.sunrise;
                        elements.nightTimeStart.value = message.times.sunset;
                        
                        const updatedSettings = {
                            ...currentSettings,
                            dayTimeStart: message.times.sunrise,
                            nightTimeStart: message.times.sunset
                        };
                        updateTimeline(updatedSettings);
                        
                        if (message.saveAfterFetch) {
                            const settings = {
                                dayTheme: elements.dayTheme.value,
                                nightTheme: elements.nightTheme.value,
                                overrideThemeSwitch: elements.enableAutoSwitch.checked,
                                dayTimeStart: message.times.sunrise,
                                nightTimeStart: message.times.sunset,
                                useLocationBasedTimes: elements.useLocationTimes.checked,
                                latitude: parseFloat(elements.latitude.value) || 0,
                                longitude: parseFloat(elements.longitude.value) || 0
                            };

                            vscode.postMessage({ command: 'saveSettings', ...settings });
                            showStatus(t('Settings saved with GPS times!'), 'success');
                        } else {
                            showStatus('GPS times fetched successfully!', 'success');
                        }
                    } else {
                        showStatus('Failed to fetch GPS times: ' + (message.error || 'Unknown error'), 'error');
                    }
                    break;
            }
        });

        // Initialize
        setupEventListeners();
        vscode.postMessage({ command: 'getThemes' });
        
        setInterval(() => {
            vscode.postMessage({ command: 'getCurrentTheme' });
        }, ${WEBVIEW_CONSTANTS.THEME_CHECK_INTERVAL});
    `;
}