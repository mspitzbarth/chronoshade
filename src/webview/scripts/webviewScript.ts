// Main webview script for ChronoShade
// This will be compiled and inlined into the webview template

import { timeUtilsCode } from '../utils/timeUtils';
import { validationUtilsCode } from '../utils/validationUtils';
import { domUtilsCode } from '../utils/domUtils';
import { cronUtilsCode } from '../utils/cronUtils';
import { WEBVIEW_CONSTANTS, DEFAULT_CITIES } from '../constants';

const HIDDEN = WEBVIEW_CONSTANTS.CSS_CLASSES.HIDDEN;

// Export the main webview script function. Translations are resolved by the
// extension and inlined, so the first paint is already in the right language.
export function getWebviewScript(translations: Record<string, string>): string {
    return `
        const vscode = acquireVsCodeApi();
        const translations = ${JSON.stringify(translations).replace(/</g, '\\u003c')};
        const CITIES = ${JSON.stringify(DEFAULT_CITIES)};
        let currentSettings = {};
        let activeTheme = '';

        // DOM elements
        const elements = {
            currentTheme: document.getElementById('currentTheme'),
            currentThemeText: document.getElementById('currentThemeText'),
            nextSwitchText: document.getElementById('nextSwitchText'),
            dayTheme: document.getElementById('dayTheme'),
            nightTheme: document.getElementById('nightTheme'),
            enableAutoSwitch: document.getElementById('enableAutoSwitch'),
            useManualTimes: document.getElementById('useManualTimes'),
            useLocationTimes: document.getElementById('useLocationTimes'),
            useCronTimes: document.getElementById('useCronTimes'),
            useSystemTheme: document.getElementById('useSystemTheme'),
            systemThemeNote: document.getElementById('systemThemeNote'),
            themeModeSingle: document.getElementById('themeModeSingle'),
            themeModePool: document.getElementById('themeModePool'),
            themeSingleSettings: document.getElementById('themeSingleSettings'),
            themePoolSettings: document.getElementById('themePoolSettings'),
            dayThemePoolChips: document.getElementById('dayThemePoolChips'),
            dayThemePoolSearch: document.getElementById('dayThemePoolSearch'),
            dayThemePoolDropdown: document.getElementById('dayThemePoolDropdown'),
            nightThemePoolChips: document.getElementById('nightThemePoolChips'),
            nightThemePoolSearch: document.getElementById('nightThemePoolSearch'),
            nightThemePoolDropdown: document.getElementById('nightThemePoolDropdown'),
            dayTimeStart: document.getElementById('dayTimeStart'),
            nightTimeStart: document.getElementById('nightTimeStart'),
            dayCronExpression: document.getElementById('dayCronExpression'),
            nightCronExpression: document.getElementById('nightCronExpression'),
            latitude: document.getElementById('latitude'),
            longitude: document.getElementById('longitude'),
            sunriseOffset: document.getElementById('sunriseOffset'),
            sunsetOffset: document.getElementById('sunsetOffset'),
            sunriseOffsetGps: document.getElementById('sunriseOffsetGps'),
            sunsetOffsetGps: document.getElementById('sunsetOffsetGps'),
            detectLocationAndSave: document.getElementById('detectLocationAndSave'),
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

        function t(key, ...args) {
            let translation = translations[key] || key;
            args.forEach((arg, index) => {
                translation = translation.split('{' + index + '}').join(arg);
            });
            return translation;
        }

        function setDirty(dirty) {
            document.body.classList.toggle('dirty', dirty);
        }

        // Single theme vs. theme pool is a mutually exclusive choice covering
        // both day and night, so only one of the two panels is ever visible.
        let themeMode = 'single';

        function setThemeMode(mode) {
            themeMode = mode;

            elements.themeModeSingle.classList.toggle('active', mode === 'single');
            elements.themeModePool.classList.toggle('active', mode === 'pool');
            elements.themeModeSingle.setAttribute('aria-selected', mode === 'single');
            elements.themeModePool.setAttribute('aria-selected', mode === 'pool');
            elements.themeSingleSettings.classList.toggle('${HIDDEN}', mode !== 'single');
            elements.themePoolSettings.classList.toggle('${HIDDEN}', mode !== 'pool');
        }

        function requestLocationTimes(lat, lng) {
            if (!isNaN(lat) && !isNaN(lng)) {
                vscode.postMessage({ command: 'testLocation', latitude: lat, longitude: lng, saveAfterFetch: false });
            }
        }

        function setDetecting(busy) {
            elements.detectLocationAndSave.disabled = busy;
            elements.detectLocationAndSave.classList.toggle('busy', busy);
            document.getElementById('detectLocationLabel').textContent = t(busy ? 'Detecting location...' : 'Detect Location');
        }

        function applyManualOverride(command, message) {
            vscode.postMessage({ command });
            vscode.postMessage({ command: 'disableAutoSwitch' });
            elements.enableAutoSwitch.checked = false;
            elements.switchSettings.classList.add('${HIDDEN}');
            showStatus(t(message), 'info');
            updateHero();
        }

        // Event Listeners Setup
        function setupEventListeners() {
            // Any user edit marks the form dirty; programmatic updates don't fire these events.
            document.querySelector('.container').addEventListener('input', () => setDirty(true));
            document.querySelector('.container').addEventListener('change', () => setDirty(true));

            elements.enableAutoSwitch.addEventListener('change', function() {
                elements.switchSettings.classList.toggle('${HIDDEN}', !this.checked);
                updateTimeSourceVisibility();
                updateHero();
            });

            [elements.useManualTimes, elements.useLocationTimes, elements.useCronTimes, elements.useSystemTheme].forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        updateTimeSourceVisibility();
                        updateTimelineFromInputs();
                        updateHero();
                    }
                });
            });

            elements.themeModeSingle.addEventListener('click', () => { setThemeMode('single'); setDirty(true); });
            elements.themeModePool.addEventListener('click', () => { setThemeMode('pool'); setDirty(true); });

            elements.switchToDay.addEventListener('click', () =>
                applyManualOverride('forceDayTheme', 'Day theme applied. Automatic theme switching disabled.'));
            elements.switchToNight.addEventListener('click', () =>
                applyManualOverride('forceNightTheme', 'Night theme applied. Automatic theme switching disabled.'));

            elements.saveSettings.addEventListener('click', handleSaveSettings);

            [elements.dayTimeStart, elements.nightTimeStart].forEach(input => {
                input.addEventListener('input', event => {
                    validateTimeInput(event);
                    updateTimelineFromInputs();
                    updateHero();
                });
            });

            [elements.dayCronExpression, elements.nightCronExpression].forEach(input => {
                input.addEventListener('input', event => {
                    validateCronInput(event);
                    updateHero();
                });
            });

            [elements.dayTheme, elements.nightTheme].forEach(select => {
                select.addEventListener('change', () => {
                    updateTimelineFromInputs();
                    updateHero();
                });
            });

            elements.previewDay.addEventListener('click', () => {
                if (elements.dayTheme.value) {
                    vscode.postMessage({ command: 'previewTheme', theme: elements.dayTheme.value });
                }
            });

            elements.previewNight.addEventListener('click', () => {
                if (elements.nightTheme.value) {
                    vscode.postMessage({ command: 'previewTheme', theme: elements.nightTheme.value });
                }
            });

            elements.citySelect.addEventListener('change', function() {
                const city = CITIES.find(c => c.name === this.value);
                if (city) {
                    elements.latitude.value = city.lat.toString();
                    elements.longitude.value = city.lng.toString();
                    requestLocationTimes(city.lat, city.lng);
                }
            });

            [elements.latitude, elements.longitude].forEach(input => {
                input.addEventListener('change', () =>
                    requestLocationTimes(parseFloat(elements.latitude.value), parseFloat(elements.longitude.value)));
            });

            elements.detectLocationAndSave.addEventListener('click', () => {
                setDetecting(true);
                vscode.postMessage({ command: 'detectLocationAndSave' });
            });

            // Keep the duplicated offset fields in sync
            [[elements.sunriseOffset, elements.sunriseOffsetGps], [elements.sunsetOffset, elements.sunsetOffsetGps]].forEach(([a, b]) => {
                a.addEventListener('input', () => { b.value = a.value; });
                b.addEventListener('input', () => { a.value = b.value; });
            });
        }

        // Main Functions
        function handleSaveSettings() {
            const useLocation = elements.useLocationTimes.checked;
            const useCron = elements.useCronTimes.checked;
            const useSystem = elements.useSystemTheme.checked;
            const useManual = !useLocation && !useCron && !useSystem;

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
                useLocationBasedTimes: useLocation,
                systemThemeSync: useSystem,
                latitude: parseFloat(elements.latitude.value) || 0,
                longitude: parseFloat(elements.longitude.value) || 0,
                sunriseOffset: parseInt(useLocation ? elements.sunriseOffsetGps.value : elements.sunriseOffset.value) || 0,
                sunsetOffset: parseInt(useLocation ? elements.sunsetOffsetGps.value : elements.sunsetOffset.value) || 0,
                dayThemePool: themeMode === 'pool' ? dayThemePoolPicker.getSelected() : [],
                nightThemePool: themeMode === 'pool' ? nightThemePoolPicker.getSelected() : []
            };

            currentSettings = { ...currentSettings, ...settings };
            vscode.postMessage({ command: 'saveSettings', ...settings });
        }

        function updateTimeSourceVisibility() {
            const useLocation = elements.useLocationTimes.checked;
            const useCron = elements.useCronTimes.checked;
            const useSystem = elements.useSystemTheme.checked;

            elements.manualTimes.classList.toggle('${HIDDEN}', useLocation || useCron || useSystem);
            elements.locationTimes.classList.toggle('${HIDDEN}', !useLocation);
            elements.cronTimes.classList.toggle('${HIDDEN}', !useCron);
            elements.systemThemeNote.classList.toggle('${HIDDEN}', !useSystem);
            elements.scheduleTimeline.classList.toggle('${HIDDEN}', useCron || useSystem);
        }

        function updateTimelineFromInputs() {
            updateTimeline({
                dayTimeStart: elements.dayTimeStart.value,
                nightTimeStart: elements.nightTimeStart.value,
                dayTheme: elements.dayTheme.value,
                nightTheme: elements.nightTheme.value
            });
        }

        function fillSelect(select, placeholder, values) {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(new Option(placeholder, ''));
            values.forEach(value => fragment.appendChild(new Option(value, value)));
            select.replaceChildren(fragment);
        }

        // Chip-based multi-select for theme pools: type to filter installed
        // themes, click (or Enter) to add, x (or Backspace on empty) to remove.
        function createThemePoolPicker(kind) {
            const chipsEl = elements[kind + 'ThemePoolChips'];
            const searchEl = elements[kind + 'ThemePoolSearch'];
            const dropdownEl = elements[kind + 'ThemePoolDropdown'];
            let selected = [];
            let matches = [];

            function setSelection(values) {
                selected = values;
                renderChips();
                renderDropdown();
                setDirty(true);
            }

            function renderChips() {
                chipsEl.replaceChildren(...selected.map(theme => {
                    const chip = document.createElement('span');
                    chip.className = 'theme-pool-chip';

                    const label = document.createElement('span');
                    label.textContent = theme;
                    label.title = theme;

                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'theme-pool-chip-remove';
                    removeBtn.textContent = '\\u00d7';
                    removeBtn.setAttribute('aria-label', t('Remove {0}', theme));
                    removeBtn.addEventListener('click', () => setSelection(selected.filter(picked => picked !== theme)));

                    chip.append(label, removeBtn);
                    return chip;
                }));
            }

            function renderDropdown() {
                const query = searchEl.value.toLowerCase();
                matches = (currentSettings.themes || [])
                    .filter(theme => !selected.includes(theme) && theme.toLowerCase().includes(query))
                    .slice(0, 50);

                if (matches.length === 0) {
                    const empty = document.createElement('div');
                    empty.className = 'theme-pool-empty';
                    empty.textContent = t('No matching themes');
                    dropdownEl.replaceChildren(empty);
                    return;
                }

                dropdownEl.replaceChildren(...matches.map(theme => {
                    const option = document.createElement('div');
                    option.className = 'theme-pool-option';
                    option.setAttribute('role', 'option');
                    option.textContent = theme;
                    // mousedown + preventDefault keeps focus in the search box
                    option.addEventListener('mousedown', event => {
                        event.preventDefault();
                        add(theme);
                    });
                    return option;
                }));
            }

            function add(theme) {
                searchEl.value = '';
                setSelection(selected.concat([theme]));
            }

            searchEl.addEventListener('input', renderDropdown);
            searchEl.addEventListener('keydown', event => {
                if (event.key === 'Enter' && matches.length > 0) {
                    event.preventDefault();
                    add(matches[0]);
                } else if (event.key === 'Backspace' && searchEl.value === '' && selected.length > 0) {
                    setSelection(selected.slice(0, -1));
                } else if (event.key === 'Escape') {
                    searchEl.blur();
                }
            });

            return {
                getSelected: () => selected.slice(),
                setSelected: values => {
                    selected = (values || []).slice();
                    renderChips();
                    renderDropdown();
                }
            };
        }

        const dayThemePoolPicker = createThemePoolPicker('day');
        const nightThemePoolPicker = createThemePoolPicker('night');

        function populateCitySelect() {
            const groups = [
                ['UTC-8', 0, 4], ['UTC-5', 4, 8], ['UTC+0', 8, 12], ['UTC+1', 12, 17],
                ['UTC+2', 17, 21], ['UTC+3', 21, 25], ['UTC+5', 25, 28], ['UTC+8', 28, 32],
                ['UTC+9', 32, 35], ['UTC+10', 35, 38], ['UTC+12', 38, 41]
            ];
            const fragment = document.createDocumentFragment();
            fragment.appendChild(new Option(t('Select a city...'), ''));
            groups.forEach(([label, start, end]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = label;
                CITIES.slice(start, end).forEach(city => optgroup.appendChild(new Option(city.name, city.name)));
                fragment.appendChild(optgroup);
            });
            elements.citySelect.replaceChildren(fragment);
        }

        function updateUI(settings) {
            currentSettings = settings;
            activeTheme = settings.currentTheme || '';

            fillSelect(elements.dayTheme, t('Select day theme...'), settings.themes || []);
            fillSelect(elements.nightTheme, t('Select night theme...'), settings.themes || []);

            elements.dayTheme.value = settings.dayTheme || '';
            elements.nightTheme.value = settings.nightTheme || '';
            elements.enableAutoSwitch.checked = settings.overrideThemeSwitch || false;

            const dayTime = settings.dayTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            const nightTime = settings.nightTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';

            elements.dayTimeStart.value = isValidTimeFormat(dayTime) ? dayTime : '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            elements.nightTimeStart.value = isValidTimeFormat(nightTime) ? nightTime : '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';
            elements.dayCronExpression.value = settings.dayCronExpression || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_CRON}';
            elements.nightCronExpression.value = settings.nightCronExpression || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_CRON}';

            const useCronSchedule = settings.useCronSchedule || false;
            const useLocationSchedule = !useCronSchedule && (settings.useLocationBasedTimes || false);
            const useSystemTheme = !useCronSchedule && !useLocationSchedule && (settings.systemThemeSync || false);

            elements.useCronTimes.checked = useCronSchedule;
            elements.useLocationTimes.checked = useLocationSchedule;
            elements.useSystemTheme.checked = useSystemTheme;
            elements.useManualTimes.checked = !useCronSchedule && !useLocationSchedule && !useSystemTheme;
            elements.latitude.value = settings.latitude || '';
            elements.longitude.value = settings.longitude || '';
            elements.sunriseOffset.value = settings.sunriseOffset || 0;
            elements.sunsetOffset.value = settings.sunsetOffset || 0;
            elements.sunriseOffsetGps.value = settings.sunriseOffset || 0;
            elements.sunsetOffsetGps.value = settings.sunsetOffset || 0;

            const dayThemePool = settings.dayThemePool || [];
            const nightThemePool = settings.nightThemePool || [];
            dayThemePoolPicker.setSelected(dayThemePool);
            nightThemePoolPicker.setSelected(nightThemePool);
            setThemeMode(dayThemePool.length > 0 || nightThemePool.length > 0 ? 'pool' : 'single');

            elements.switchSettings.classList.toggle('${HIDDEN}', !elements.enableAutoSwitch.checked);
            updateTimeSourceVisibility();
            updateTimelineFromInputs();
            updateHero();
            setDirty(false);

            // Everything is in its final state: reveal in one step instead of re-laying out in view.
            requestAnimationFrame(() => document.body.classList.remove('loading'));
        }

        function minutesToPercent(minutes) {
            return (minutes / (24 * 60)) * 100;
        }

        // One gradient instead of absolutely positioned segments; handles the
        // cross-midnight case (night start earlier than day start) for free.
        function updateTimeline(settings) {
            const now = new Date();
            elements.currentTimeMarker.style.left = minutesToPercent(now.getHours() * 60 + now.getMinutes()) + '%';

            const dayPct = minutesToPercent(timeStringToMinutes(settings.dayTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}'));
            const nightPct = minutesToPercent(timeStringToMinutes(settings.nightTimeStart || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}'));
            const dayFirst = dayPct < nightPct;
            const [from, to] = dayFirst ? [dayPct, nightPct] : [nightPct, dayPct];
            const outer = dayFirst ? 'var(--night)' : 'var(--day)';
            const inner = dayFirst ? 'var(--day)' : 'var(--night)';
            elements.timelineBar.style.background = 'linear-gradient(to right, ' +
                outer + ' ' + from + '%, ' + inner + ' ' + from + '% ' + to + '%, ' + outer + ' ' + to + '%)';

            elements.dayThemeLabel.textContent = settings.dayTheme || t('Day Theme');
            elements.nightThemeLabel.textContent = settings.nightTheme || t('Night Theme');
        }

        // Is it night according to the schedule currently in the form?
        function isNightBySchedule(now) {
            if (elements.useCronTimes.checked) {
                const dayCron = elements.dayCronExpression.value.trim();
                const nightCron = elements.nightCronExpression.value.trim();

                if (chronoValidateCronExpression(dayCron) && chronoValidateCronExpression(nightCron)) {
                    const lastDay = chronoGetLastCronOccurrence(dayCron, now);
                    const lastNight = chronoGetLastCronOccurrence(nightCron, now);
                    const lastDayTime = lastDay ? lastDay.getTime() : Number.NEGATIVE_INFINITY;
                    const lastNightTime = lastNight ? lastNight.getTime() : Number.NEGATIVE_INFINITY;

                    if ((lastDay || lastNight) && lastNightTime !== lastDayTime) {
                        return lastNightTime > lastDayTime;
                    }
                }
            }

            const currentTime = now.toTimeString().slice(0, 5);
            const dayStart = elements.dayTimeStart.value || '${WEBVIEW_CONSTANTS.DEFAULT_DAY_START}';
            const nightStart = elements.nightTimeStart.value || '${WEBVIEW_CONSTANTS.DEFAULT_NIGHT_START}';

            return nightStart < dayStart
                ? currentTime >= nightStart && currentTime < dayStart
                : currentTime >= nightStart || currentTime < dayStart;
        }

        function updateHero() {
            const now = new Date();
            const nightThemes = [elements.nightTheme.value].concat(nightThemePoolPicker.getSelected());
            const dayThemes = [elements.dayTheme.value].concat(dayThemePoolPicker.getSelected());

            // Prefer what is actually applied; fall back to the schedule for unrelated themes.
            const isNight = nightThemes.includes(activeTheme) ? true
                : dayThemes.includes(activeTheme) ? false
                : isNightBySchedule(now);

            elements.currentTheme.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.DAY}', !isNight);
            elements.currentTheme.classList.toggle('${WEBVIEW_CONSTANTS.CSS_CLASSES.NIGHT}', isNight);
            elements.currentThemeText.textContent = activeTheme || t('Unknown');
            elements.currentThemeText.title = activeTheme;

            let meta = isNight ? t('Night') : t('Day');
            if (!elements.enableAutoSwitch.checked) {
                meta += ' · ' + t('Automatic switching is off');
            } else if (elements.useSystemTheme.checked) {
                meta += ' · ' + t('Follow OS appearance (Light/Dark mode)');
            } else if (!elements.useCronTimes.checked) {
                meta += ' · ' + (isNightBySchedule(now)
                    ? t('Switches to Day at {0}', elements.dayTimeStart.value)
                    : t('Switches to Night at {0}', elements.nightTimeStart.value));
            }
            elements.nextSwitchText.textContent = meta;
        }

        // Message handling
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateThemes':
                    updateUI(message.settings);
                    break;
                case 'updateCurrentTheme':
                    if (message.currentTheme !== activeTheme) {
                        activeTheme = message.currentTheme || '';
                        updateHero();
                    }
                    break;
                case 'settingsSaved':
                    setDirty(false);
                    showStatus(t('Settings saved!'), 'success');
                    break;
                case 'locationTestResult':
                    if (message.success) {
                        elements.dayTimeStart.value = message.times.sunrise;
                        elements.nightTimeStart.value = message.times.sunset;
                        updateTimelineFromInputs();
                        updateHero();
                        showStatus(t('Sunrise {0} · Sunset {1}', message.times.sunrise, message.times.sunset), 'success');
                    } else {
                        showStatus(t('Failed to fetch GPS times: {0}', message.error || t('Unknown')), 'error');
                    }
                    break;
                case 'locationDetected':
                    setDetecting(false);
                    if (message.success) {
                        elements.latitude.value = message.latitude;
                        elements.longitude.value = message.longitude;
                        elements.citySelect.value = '';
                        showStatus(message.message || t('Location detected!'), 'success');
                        requestLocationTimes(message.latitude, message.longitude);
                    } else {
                        showStatus(t('Location detection failed: {0}', message.error), 'error');
                    }
                    break;
            }
        });

        // Initialize
        populateCitySelect();
        setupEventListeners();
        vscode.postMessage({ command: 'getThemes' });

        // Theme changes are pushed by the extension; only the clock needs a local tick.
        setInterval(() => {
            updateTimelineFromInputs();
            updateHero();
        }, 60 * 1000);
    `;
}
