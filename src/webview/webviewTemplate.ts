import * as vscode from "vscode";
import { getWebviewScript } from "./scripts/webviewScript";
import { getWebviewStyles } from "./styles/webviewStyles";
import { defaultTranslations } from "./translations/defaultTranslations";

const ICONS = {
    sun: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg>',
    moon: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.5 5.5 0 0 1 6.4 2.5a5.5 5.5 0 1 0 7.1 7.1z"/></svg>',
    eye: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z"/><circle cx="8" cy="8" r="2"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>',
    pin: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15s5-4.6 5-8.5a5 5 0 0 0-10 0C3 10.4 8 15 8 15z"/><circle cx="8" cy="6.5" r="1.8"/></svg>',
    code: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4"/></svg>',
    monitor: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="9" rx="1"/><path d="M5.5 14.5h5M8 11.5v3"/></svg>',
};

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function getWebviewContent(
    webview: vscode.Webview,
    translations: Record<string, string> = {}
): string {
    const strings: Record<string, string> = { ...defaultTranslations, ...translations };
    const t = (key: string) => escapeHtml(strings[key] || key);

    const timeSource = (id: string, value: string, icon: string, key: string, checked = false) => `
                    <label class="choice" for="${id}">
                        <input type="radio" id="${id}" name="timeSource" value="${value}"${checked ? " checked" : ""}>
                        <span class="choice-icon">${icon}</span>
                        <span class="choice-label">${t(key)}</span>
                    </label>`;

    const offsets = (suffix: string) => `
                    <div class="time-inputs">
                        <div class="field">
                            <label for="sunriseOffset${suffix}">${t("Sunrise Offset (min)")}</label>
                            <input type="number" id="sunriseOffset${suffix}" value="0" placeholder="+/- min">
                        </div>
                        <div class="field">
                            <label for="sunsetOffset${suffix}">${t("Sunset Offset (min)")}</label>
                            <input type="number" id="sunsetOffset${suffix}" value="0" placeholder="+/- min">
                        </div>
                    </div>`;

    const poolPicker = (kind: "day" | "night", label: string, helper: string) => `
                <div class="field">
                    <label id="${kind}ThemePoolLabel" for="${kind}ThemePoolSearch">${kind === "day" ? ICONS.sun : ICONS.moon}${t(label)}</label>
                    <div class="theme-pool-picker" id="${kind}ThemePoolPicker">
                        <div class="theme-pool-chips" id="${kind}ThemePoolChips"></div>
                        <input type="text" class="theme-pool-search" id="${kind}ThemePoolSearch" placeholder="${t("Type to add a theme...")}" autocomplete="off">
                        <div class="theme-pool-dropdown" id="${kind}ThemePoolDropdown" role="listbox"></div>
                    </div>
                    <div class="helper-text">${t(helper)}</div>
                </div>`;

    return `<!DOCTYPE html>
<html lang="${escapeHtml(vscode.env.language)}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
    <title>ChronoShade</title>
    <style>
        ${getWebviewStyles()}
    </style>
</head>
<body class="loading">
    <main class="container">

        <header class="hero day" id="currentTheme" aria-live="polite">
            <div class="hero-icon" id="themeStatusIndicator">${ICONS.sun}${ICONS.moon}</div>
            <div class="hero-body">
                <div class="hero-label">${t("Current theme")}</div>
                <div class="hero-title" id="currentThemeText">&nbsp;</div>
                <div class="hero-meta" id="nextSwitchText">&nbsp;</div>
            </div>
        </header>

        <div class="quick-actions" role="group" aria-label="${t("Manual Theme Control")}">
            <button type="button" class="button secondary" id="switchToDay">${ICONS.sun}<span>${t("Switch to Day")}</span></button>
            <button type="button" class="button secondary" id="switchToNight">${ICONS.moon}<span>${t("Switch to Night")}</span></button>
        </div>

        <section class="card">
            <h2 class="section-title">${t("Theme Selection")}</h2>
            <div class="segmented" id="themeModeToggle" role="tablist">
                <button type="button" class="segmented-btn active" id="themeModeSingle" data-mode="single" role="tab">${t("Single Theme")}</button>
                <button type="button" class="segmented-btn" id="themeModePool" data-mode="pool" role="tab">${t("Theme Pool")}</button>
            </div>

            <div id="themeSingleSettings">
                <div class="field">
                    <label for="dayTheme">${ICONS.sun}${t("Day Theme")}</label>
                    <div class="input-row">
                        <select id="dayTheme"><option value="">${t("Select day theme...")}</option></select>
                        <button type="button" class="icon-button" id="previewDay" title="${t("Preview Day")}" aria-label="${t("Preview Day")}">${ICONS.eye}</button>
                    </div>
                </div>
                <div class="field">
                    <label for="nightTheme">${ICONS.moon}${t("Night Theme")}</label>
                    <div class="input-row">
                        <select id="nightTheme"><option value="">${t("Select night theme...")}</option></select>
                        <button type="button" class="icon-button" id="previewNight" title="${t("Preview Night")}" aria-label="${t("Preview Night")}">${ICONS.eye}</button>
                    </div>
                </div>
            </div>

            <div id="themePoolSettings" class="hidden">
                ${poolPicker("day", "Day Theme Pool", "A new day theme is picked at random whenever ChronoShade switches to Day. Leave empty to always use the theme above.")}
                ${poolPicker("night", "Night Theme Pool", "A new night theme is picked at random whenever ChronoShade switches to Night. Leave empty to always use the theme above.")}
            </div>
        </section>

        <section class="card">
            <div class="card-header">
                <h2 class="section-title">${t("Auto-Switch Settings")}</h2>
                <input type="checkbox" class="switch" id="enableAutoSwitch" role="switch" aria-label="${t("Enable automatic theme switching")}">
            </div>
            <label class="switch-label" for="enableAutoSwitch">${t("Enable automatic theme switching")}</label>

            <div id="switchSettings" class="hidden">
                <div class="field">
                    <div class="field-label" id="timeSourceLabel">${t("Time Source")}</div>
                    <div class="choice-list" role="radiogroup" aria-labelledby="timeSourceLabel">
                        ${timeSource("useManualTimes", "manual", ICONS.clock, "Manual time input", true)}
                        ${timeSource("useLocationTimes", "location", ICONS.pin, "Use GPS coordinates (automatic)")}
                        ${timeSource("useCronTimes", "cron", ICONS.code, "Use cron expressions")}
                        ${timeSource("useSystemTheme", "system", ICONS.monitor, "Follow OS appearance (Light/Dark mode)")}
                    </div>
                </div>
                <div id="systemThemeNote" class="note hidden">${t("Not available over remote/SSH sessions or on Linux without GNOME settings - falls back to your other schedule if detection fails.")}</div>

                <div class="schedule-timeline" id="scheduleTimeline">
                    <div class="timeline-header">${t("Today's Schedule")}</div>
                    <div class="timeline-bar" id="timelineBar">
                        <div class="timeline-marker" id="currentTimeMarker"></div>
                    </div>
                    <div class="timeline-labels">
                        <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
                    </div>
                    <div class="timeline-legend">
                        <div class="legend-item"><span class="legend-color day"></span><span id="dayThemeLabel">${t("Day Theme")}</span></div>
                        <div class="legend-item"><span class="legend-color night"></span><span id="nightThemeLabel">${t("Night Theme")}</span></div>
                    </div>
                </div>

                <div id="manualTimes">
                    <div class="field-label" id="switchTimesLabel">${t("Switch Times")}</div>
                    <div class="time-inputs">
                        <div class="field">
                            <label for="dayTimeStart">${ICONS.sun}${t("Day Start")}</label>
                            <input type="time" id="dayTimeStart" value="06:00">
                            <div class="error-message" id="dayTimeError"></div>
                        </div>
                        <div class="field">
                            <label for="nightTimeStart">${ICONS.moon}${t("Night Start")}</label>
                            <input type="time" id="nightTimeStart" value="18:00">
                            <div class="error-message" id="nightTimeError"></div>
                        </div>
                    </div>
                    ${offsets("")}
                </div>

                <div id="cronTimes" class="hidden">
                    <div class="field-label" id="cronExpressionsLabel">${t("Cron Expressions")}</div>
                    <div class="time-inputs">
                        <div class="field">
                            <label for="dayCronExpression">${ICONS.sun}${t("Day Cron")}</label>
                            <input type="text" id="dayCronExpression" placeholder="0 6 * * *" spellcheck="false">
                            <div class="error-message" id="dayCronError"></div>
                        </div>
                        <div class="field">
                            <label for="nightCronExpression">${ICONS.moon}${t("Night Cron")}</label>
                            <input type="text" id="nightCronExpression" placeholder="0 18 * * *" spellcheck="false">
                            <div class="error-message" id="nightCronError"></div>
                        </div>
                    </div>
                    <div class="helper-text" id="cronHelperText">${t("Use standard 5-field cron syntax, e.g., 0 6 * * *")}</div>
                </div>

                <div id="locationTimes" class="hidden">
                    <button type="button" class="button secondary block" id="detectLocationAndSave">${ICONS.pin}<span id="detectLocationLabel">${t("Detect Location")}</span></button>
                    <div class="field">
                        <label for="citySelect">${t("Quick Select City")}</label>
                        <select id="citySelect"><option value="">${t("Select a city...")}</option></select>
                    </div>
                    <div class="field-label" id="gpsCoordinatesLabel">${t("GPS Coordinates")}</div>
                    <div class="time-inputs">
                        <div class="field">
                            <label for="latitude">${t("Latitude")}</label>
                            <input type="number" id="latitude" min="-90" max="90" step="0.000001" placeholder="40.7128">
                            <div class="error-message" id="latitudeError"></div>
                        </div>
                        <div class="field">
                            <label for="longitude">${t("Longitude")}</label>
                            <input type="number" id="longitude" min="-180" max="180" step="0.000001" placeholder="-74.0060">
                            <div class="error-message" id="longitudeError"></div>
                        </div>
                    </div>
                    ${offsets("Gps")}
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-status">
            <span id="status" class="status" role="status"></span>
            <span id="dirtyHint" class="dirty-hint">${t("Unsaved changes")}</span>
        </div>
        <button type="button" class="button" id="saveSettings">${t("Save Settings")}</button>
    </footer>

    <script>
        ${getWebviewScript(strings)}
    </script>
</body>
</html>`;
}
