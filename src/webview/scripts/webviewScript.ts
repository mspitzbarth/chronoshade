// Main webview script for ChronoShade
// This will be compiled and inlined into the webview template

import { defaultTranslations } from '../translations/defaultTranslations';
import { timeUtilsCode } from '../utils/timeUtils';
import { validationUtilsCode } from '../utils/validationUtils';
import { domUtilsCode } from '../utils/domUtils';
import { cronUtilsCode } from '../utils/cronUtils';
import { WEBVIEW_CONSTANTS, DEFAULT_CITIES } from '../constants';

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
            useCronTimes: document.getElementById('useCronTimes'),
            dayTimeStart: document.getElementById('dayTimeStart'),
            nightTimeStart: document.getElementById('nightTimeStart'),
            dayCronExpression: document.getElementById('dayCronExpression'),
            nightCronExpression: document.getElementById('nightCronExpression'),
            latitude: document.getElementById('latitude'),
            longitude: document.getElementById('longitude'),
            sunriseOffset: document.getElementById('sunriseOffset'),
            sunsetOffset: document.getElementById('sunsetOffset'),
            detectLocation: document.getElementById('detectLocation'),
            citySelect: document.getElementById('citySelect'),
            switchSettings: document.getElementById('switchSettings'),
            manualTimes: document.getElementById('manualTimes'),
            locationTimes: document.getElementById('locationTimes'),
            cronTimes: document.getElementById('cronTimes'),
            previewDay: document.getElementById('previewDay'),
            previewNight: document.getElementById('previewNight'),
            switchToDay: document.getElementById('switchToDay'),
            switchToNight: document.getElementById('switchToNight'),
            saveSettings: document.getElementById('saveSettings'),
            status: document.getElementById('status'),
            currentTimeMarker: document.getElementById('currentTimeMarker'),
            timelineBar: document.getElementById('timelineBar'),
            dayThemeLabel: document.getElementById('dayThemeLabel'),
            nightThemeLabel: document.getElementById('nightThemeLabel'),
            scheduleTimeline: document.getElementById('scheduleTimeline')
        };

        // Utility Functions
        ${timeUtilsCode}
        
        ${domUtilsCode}
        
        ${cronUtilsCode}

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

            elements.useCronTimes.addEventListener('change', function() {
                if (this.checked) {
                    updateTimeSourceVisibility();
                    updateThemeStatusIndicator(currentSettings);
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

            elements.dayCronExpression.addEventListener('input', function(event) {
                validateCronInput(event);
                updateThemeStatusIndicator({
                    ...currentSettings,
                    useCronSchedule: true,
                    dayCronExpression: elements.dayCronExpression.value,
                    nightCronExpression: elements.nightCronExpression.value
                });
            });

            elements.nightCronExpression.addEventListener('input', function(event) {
                validateCronInput(event);
                updateThemeStatusIndicator({
                    ...currentSettings,
                    useCronSchedule: true,
                    dayCronExpression: elements.dayCronExpression.value,
                    nightCronExpression: elements.nightCronExpression.value
                });
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
            
            elements.citySelect.addEventListener('change', function() {
                const selectedCityName = this.value;
                if (selectedCityName) {
                    const city = ${JSON.stringify(DEFAULT_CITIES)}.find(c => c.name === selectedCityName);
                    if (city) {
                        elements.longitude.value = city.lng.toString();
                    }
                }
            });

            elements.detectLocationAndSave.addEventListener('click', function() {
                showStatus(t('Detecting location...'), 'info');
                vscode.postMessage({ command: 'detectLocationAndSave' });
            });
        }

        // Main Functions
        function handleSaveSettings() {
            const useLocation = elements.useLocationTimes.checked;
            const useCron = elements.useCronTimes.checked;
            const useManual = !useLocation && !useCron;

    // Logic removed: unnecessary location test blocking save.
    // Proceed directly to saving settings.
            
            if (useCron) {
                const dayCronValid = validateCronInput({ target: elements.dayCronExpression });
                const nightCronValid = validateCronInput({ target: elements.nightCronExpression });

                if (!dayCronValid || !nightCronValid) {
                    showStatus(t('Please fix cron expression errors before saving'), 'error');
                    return;
                }
            }

            if (useManual) {
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
            }
            
            const settings = {
                dayTheme: elements.dayTheme.value,
                nightTheme: elements.nightTheme.value,
                overrideThemeSwitch: elements.enableAutoSwitch.checked,
                dayTimeStart: elements.dayTimeStart.value,
                nightTimeStart: elements.nightTimeStart.value,
                dayCronExpression: elements.dayCronExpression.value ? elements.dayCronExpression.value.trim() : '${WEBVIEW_CONSTANTS.DEFAULT_DAY_CRON}',
                nightCronExpression: elements.nightCronExpression.value ? elements.nightCronExpression.value.trim() : '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_CRON}',
                useCronSchedule: useCron,
                useCronSchedule: useCron,
                useLocationBasedTimes: useLocation,
                latitude: parseFloat(elements.latitude.value) || 0,
                longitude: parseFloat(elements.longitude.value) || 0,
                sunriseOffset: parseInt(elements.sunriseOffset.value) || 0,
                sunsetOffset: parseInt(elements.sunsetOffset.value) || 0
            };

            vscode.postMessage({ command: 'saveSettings', ...settings });
            showStatus(t('Settings saved!'), 'success');
        }

        function updateTimeSourceVisibility() {
            const useLocation = elements.useLocationTimes.checked;
            const useCron = elements.useCronTimes.checked;

            elements.manualTimes.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', useLocation || useCron);
            elements.locationTimes.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', !useLocation);
            elements.cronTimes.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', !useCron);

            if (elements.scheduleTimeline) {
                elements.scheduleTimeline.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN}', useCron);
            }
        }

        function updateTimelineFromInputs() {
            if (elements.useCronTimes.checked) {
                return;
            }
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
                { selector: 'label[for="useCronTimes"]', key: 'Use cron expressions' },
                { selector: 'label[for="citySelect"]', key: 'Quick Select City' },
                { id: 'gpsCoordinatesLabel', key: 'GPS Coordinates' },
                { selector: '.timeline-header', key: 'Today\\'s Schedule' },
                { id: 'switchTimesLabel', key: 'Switch Times' },
                { selector: 'label[for="dayTimeStart"]', key: 'Day Start' },
                { selector: 'label[for="nightTimeStart"]', key: 'Night Start' },
                { id: 'cronExpressionsLabel', key: 'Cron Expressions' },
                { selector: 'label[for="dayCronExpression"]', key: 'Day Cron' },
                { selector: 'label[for="nightCronExpression"]', key: 'Night Cron' },
                { id: 'cronHelperText', key: 'Use standard 5-field cron syntax, e.g., 0 6 * * *' },
                { selector: 'label[for="latitude"]', key: 'Latitude' },
                { selector: 'label[for="longitude"]', key: 'Longitude' },
                { selector: 'label[for="sunriseOffset"]', key: 'Sunrise Offset (min)' },
                { selector: 'label[for="sunsetOffset"]', key: 'Sunset Offset (min)' },
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

        function populateCitySelect() {
            const citySelect = elements.citySelect;
            citySelect.innerHTML = \`<option value="">\${t('Select a city...')}</option>\`;
            
            const citiesByUTC = {
                'UTC-8': ${JSON.stringify(DEFAULT_CITIES.slice(0, 4))},
                'UTC-5': ${JSON.stringify(DEFAULT_CITIES.slice(4, 8))},
                'UTC+0': ${JSON.stringify(DEFAULT_CITIES.slice(8, 12))},
                'UTC+1': ${JSON.stringify(DEFAULT_CITIES.slice(12, 17))},
                'UTC+2': ${JSON.stringify(DEFAULT_CITIES.slice(17, 21))},
                'UTC+3': ${JSON.stringify(DEFAULT_CITIES.slice(21, 25))},
                'UTC+5': ${JSON.stringify(DEFAULT_CITIES.slice(25, 28))},
                'UTC+8': ${JSON.stringify(DEFAULT_CITIES.slice(28, 32))},
                'UTC+9': ${JSON.stringify(DEFAULT_CITIES.slice(32, 35))},
                'UTC+10': ${JSON.stringify(DEFAULT_CITIES.slice(35, 38))},
                'UTC+12': ${JSON.stringify(DEFAULT_CITIES.slice(38, 41))}
            };
            
            Object.entries(citiesByUTC).forEach(([utcOffset, cities]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = utcOffset;
                
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.name;
                    option.textContent = city.name;
                    optgroup.appendChild(option);
                });
                
                citySelect.appendChild(optgroup);
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
            
            populateCitySelect();
            
            elements.dayTheme.value = settings.dayTheme || '';
            elements.nightTheme.value = settings.nightTheme || '';
            elements.enableAutoSwitch.checked = settings.overrideThemeSwitch || false;
            
            const dayTime = settings.dayTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            const nightTime = settings.nightTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            const dayCron = settings.dayCronExpression || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_CRON}';
            const nightCron = settings.nightCronExpression || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_CRON}';
            
            elements.dayTimeStart.value = isValidTimeFormat(dayTime) ? dayTime : '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            elements.nightTimeStart.value = isValidTimeFormat(nightTime) ? nightTime : '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            
            elements.dayCronExpression.value = dayCron;
            elements.nightCronExpression.value = nightCron;

            const useCronSchedule = settings.useCronSchedule || false;
            const useLocationSchedule = !useCronSchedule && (settings.useLocationBasedTimes || false);

            elements.useCronTimes.checked = useCronSchedule;
            elements.useLocationTimes.checked = useLocationSchedule;
            elements.useManualTimes.checked = !useCronSchedule && !useLocationSchedule;
            elements.latitude.value = settings.latitude || '';
            elements.longitude.value = settings.longitude || '';
            elements.sunriseOffset.value = settings.sunriseOffset || 0;
            elements.sunsetOffset.value = settings.sunsetOffset || 0;
            
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
            
            if (nightStart < dayStart) {
                // Cross-midnight scenario: night time starts earlier in the day than day time
                // Night theme runs from night start to day start (same day)
                // Day theme runs from midnight to night start, and from day start to midnight
                // Example: Night Start 05:37, Day Start 14:57 = day 00:00-05:37, night 05:37-14:57, day 14:57-24:00
                
                // Day segment from midnight to night start  
                if (nightStart > 0) {
                    const daySegment1 = document.createElement('div');
                    daySegment1.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}';
                    daySegment1.style.left = '0%';
                    daySegment1.style.width = nightStartPercent + '%';
                    elements.timelineBar.appendChild(daySegment1);
                }
                
                // Night segment from night start to day start
                const nightWidth = dayStartPercent - nightStartPercent;
                const nightSegment = document.createElement('div');
                nightSegment.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}';
                nightSegment.style.left = nightStartPercent + '%';
                nightSegment.style.width = nightWidth + '%';
                elements.timelineBar.appendChild(nightSegment);
                
                // Day segment from day start to midnight
                if (dayStart < 24 * 60) {
                    const dayWidth2 = 100 - dayStartPercent;
                    const daySegment2 = document.createElement('div');
                    daySegment2.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}';
                    daySegment2.style.left = dayStartPercent + '%';
                    daySegment2.style.width = dayWidth2 + '%';
                    elements.timelineBar.appendChild(daySegment2);
                }
            } else {
                // Normal scenario: day starts before night
                
                // Night segment from midnight to day start (if day doesn't start at midnight)
                if (dayStart > 0) {
                    const nightSegment1 = document.createElement('div');
                    nightSegment1.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}';
                    nightSegment1.style.left = '0%';
                    nightSegment1.style.width = dayStartPercent + '%';
                    elements.timelineBar.appendChild(nightSegment1);
                }
                
                // Day segment from day start to night start
                const dayWidth = nightStartPercent - dayStartPercent;
                const daySegment = document.createElement('div');
                daySegment.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}';
                daySegment.style.left = dayStartPercent + '%';
                daySegment.style.width = dayWidth + '%';
                elements.timelineBar.appendChild(daySegment);
                
                // Night segment from night start to end of day
                if (nightStart < 24 * 60) {
                    const nightWidth = 100 - nightStartPercent;
                    const nightSegment2 = document.createElement('div');
                    nightSegment2.className = '${WEBVIEW_CONSTANTS.CSS_CLASSES.THEME_SEGMENT} ${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}';
                    nightSegment2.style.left = nightStartPercent + '%';
                    nightSegment2.style.width = nightWidth + '%';
                    elements.timelineBar.appendChild(nightSegment2);
                }
            }
        }
        
        function updateThemeSwatches() {
            // Theme swatches can be updated here if needed in the future
        }
        
        function updateThemeStatusIndicator(settings) {
            if (!elements.themeStatusIndicator) return;
            
            const now = new Date();
            let isNightTime = null;
            const useCron = settings.useCronSchedule || elements.useCronTimes?.checked;

            if (useCron) {
                const dayCron = (settings.dayCronExpression || elements.dayCronExpression?.value || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_CRON}').trim();
                const nightCron = (settings.nightCronExpression || elements.nightCronExpression?.value || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_CRON}').trim();

                if (dayCron && nightCron && chronoValidateCronExpression(dayCron) && chronoValidateCronExpression(nightCron)) {
                    const lastDay = chronoGetLastCronOccurrence(dayCron, now);
                    const lastNight = chronoGetLastCronOccurrence(nightCron, now);

                    if (lastDay || lastNight) {
                        const lastDayTime = lastDay ? lastDay.getTime() : Number.NEGATIVE_INFINITY;
                        const lastNightTime = lastNight ? lastNight.getTime() : Number.NEGATIVE_INFINITY;

                        if (lastNightTime !== lastDayTime) {
                            isNightTime = lastNightTime > lastDayTime;
                        }
                    }
                }
            }

            if (isNightTime === null) {
                const currentTime = now.toTimeString().slice(0, 5);
                const dayStart = settings.dayTimeStart || elements.dayTimeStart?.value || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
                const nightStart = settings.nightTimeStart || elements.nightTimeStart?.value || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';

                if (nightStart < dayStart) {
                    isNightTime = currentTime >= nightStart && currentTime < dayStart;
                } else {
                    isNightTime = currentTime >= nightStart || currentTime < dayStart;
                }
            }

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
                                dayCronExpression: elements.dayCronExpression.value ? elements.dayCronExpression.value.trim() : '${WEBVIEW_CONSTANTS.DEFAULT_DAY_CRON}',
                                nightCronExpression: elements.nightCronExpression.value ? elements.nightCronExpression.value.trim() : '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_CRON}',
                                useCronSchedule: elements.useCronTimes.checked,
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
                case 'locationDetected':
                    if (message.success) {
                        elements.latitude.value = message.latitude;
                        elements.longitude.value = message.longitude;
                        showStatus(message.message || t('Location detected!'), 'success');
                    } else {
                        showStatus(t('Location detection failed: {0}', message.error), 'error');
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
