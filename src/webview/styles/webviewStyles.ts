// Webview styles exported as TypeScript module
export function getWebviewStyles(): string {
  return `
/* ChronoShade Webview Styles — built on VS Code theme tokens so it fits every theme */

:root {
    --day: var(--vscode-charts-orange, #e8a33d);
    --night: var(--vscode-charts-blue, #4a90e2);
    --border: var(--vscode-widget-border, var(--vscode-panel-border, rgba(128, 128, 128, 0.35)));
    --card-bg: color-mix(in srgb, var(--vscode-foreground) 4%, transparent);
    --muted: var(--vscode-descriptionForeground);
    --radius: 6px;
    --radius-sm: 4px;
    --speed: 140ms;
}

@media (prefers-reduced-motion: reduce) {
    :root { --speed: 0ms; }
}

* { box-sizing: border-box; }

body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    font-weight: var(--vscode-font-weight);
    color: var(--vscode-foreground);
    background-color: var(--vscode-sideBar-background);
    padding: 0;
    margin: 0;
    line-height: 1.45;
}

/* Hold the first paint until settings are applied, then fade in once. */
body.loading .container,
body.loading .footer { opacity: 0; }
.container, .footer { transition: opacity 120ms ease-out; }

.container {
    padding: 12px 12px 4px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.hidden { display: none !important; }

:focus-visible {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: 1px;
}

/* Hero: what is active right now */
.hero {
    --phase: var(--day);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--radius);
    border: 1px solid color-mix(in srgb, var(--phase) 35%, transparent);
    background: linear-gradient(135deg,
        color-mix(in srgb, var(--phase) 18%, transparent),
        color-mix(in srgb, var(--phase) 4%, transparent));
    transition: border-color var(--speed), background var(--speed);
}

.hero.night { --phase: var(--night); }

.hero-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    color: var(--phase);
    background: color-mix(in srgb, var(--phase) 20%, transparent);
}

.hero-icon svg { width: 20px; height: 20px; grid-area: 1 / 1; transition: opacity var(--speed), transform var(--speed); }
.hero-icon svg:last-child { fill: currentColor; stroke: none; }
.hero.day .hero-icon svg:last-child,
.hero.night .hero-icon svg:first-child { opacity: 0; transform: scale(0.6) rotate(-30deg); }

.hero-body { min-width: 0; }

.hero-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
}

.hero-title {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.hero-meta {
    font-size: 11px;
    color: var(--muted);
}

/* Buttons */
.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: 1px solid var(--vscode-button-border, transparent);
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    transition: background-color var(--speed);
}

.button:hover { background-color: var(--vscode-button-hoverBackground); }

.button.secondary {
    background-color: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
}

.button.secondary:hover { background-color: var(--vscode-button-secondaryHoverBackground); }

.button.block { width: 100%; }
.button:disabled { opacity: 0.7; cursor: progress; }
.button.busy svg { animation: pulse 1s ease-in-out infinite; }

@keyframes pulse {
    50% { opacity: 0.3; transform: translateY(-2px); }
}

@media (prefers-reduced-motion: reduce) {
    .button.busy svg { animation: none; }
}

.quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.quick-actions .button { min-width: 0; }
.quick-actions .button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#switchToDay svg { color: var(--day); }
#switchToNight svg { color: var(--night); }

.icon-button {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--vscode-icon-foreground, var(--vscode-foreground));
    cursor: pointer;
}

.icon-button:hover { background: var(--vscode-toolbar-hoverBackground, rgba(128, 128, 128, 0.2)); }
.icon-button svg { width: 16px; height: 16px; }

/* Cards */
.card {
    padding: 12px;
    border-radius: var(--radius);
    background: var(--card-bg);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.section-title {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

/* Form fields */
.field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

label, .field-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--muted);
}

.field-label { margin-bottom: 4px; }

label svg { width: 12px; height: 12px; }
label[for="dayTheme"] svg, label[for="dayTimeStart"] svg, label[for="dayCronExpression"] svg, #dayThemePoolLabel svg { color: var(--day); }
label[for="nightTheme"] svg, label[for="nightTimeStart"] svg, label[for="nightCronExpression"] svg, #nightThemePoolLabel svg { color: var(--night); }

select, input[type="text"], input[type="number"], input[type="time"] {
    width: 100%;
    min-width: 0;
    height: 26px;
    padding: 2px 6px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, var(--border));
    border-radius: var(--radius-sm);
    font: inherit;
    font-size: 12px;
}

select {
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border-color: var(--vscode-dropdown-border, var(--border));
}

select:focus, input:focus {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: -1px;
}

input[type="time"]::-webkit-calendar-picker-indicator { filter: var(--vscode-icon-filter, none); cursor: pointer; }

.input-row { display: flex; align-items: center; gap: 4px; }

.time-inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 8px;
}

#manualTimes, #cronTimes, #locationTimes, #switchSettings { display: flex; flex-direction: column; gap: 10px; }

.helper-text { font-size: 11px; color: var(--muted); }

.note {
    font-size: 11px;
    color: var(--muted);
    padding: 6px 8px;
    border-left: 2px solid var(--vscode-textLink-foreground);
    background: var(--vscode-textBlockQuote-background);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.input-error {
    border-color: var(--vscode-inputValidation-errorBorder) !important;
    background-color: var(--vscode-inputValidation-errorBackground);
}

.error-message {
    color: var(--vscode-errorForeground);
    font-size: 11px;
    display: none;
}

.error-message.show { display: block; }

/* Segmented control */
.segmented {
    display: flex;
    padding: 2px;
    gap: 2px;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--vscode-foreground) 8%, transparent);
}

.segmented-btn {
    flex: 1;
    border: none;
    border-radius: 3px;
    padding: 4px 8px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    transition: background-color var(--speed), color var(--speed);
}

.segmented-btn:hover { color: var(--vscode-foreground); }

.segmented-btn.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
}

#themeSingleSettings, #themePoolSettings { display: flex; flex-direction: column; gap: 10px; }

/* Toggle switch (native checkbox, restyled) */
input.switch {
    appearance: none;
    position: relative;
    width: 30px;
    height: 16px;
    margin: 0;
    flex-shrink: 0;
    border-radius: 8px;
    background: color-mix(in srgb, var(--vscode-foreground) 25%, transparent);
    cursor: pointer;
    transition: background-color var(--speed);
}

input.switch::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--vscode-sideBar-background, #fff);
    transition: transform var(--speed);
}

input.switch:checked { background: var(--vscode-button-background); }
input.switch:checked::before { transform: translateX(14px); background: var(--vscode-button-foreground); }

.switch-label { cursor: pointer; margin-top: -6px; }

/* Time source radio cards */
.choice-list { display: flex; flex-direction: column; gap: 4px; }

.choice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--vscode-foreground);
    cursor: pointer;
    transition: border-color var(--speed), background-color var(--speed);
}

.choice:hover { background: var(--vscode-list-hoverBackground); }

.choice input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.choice-icon { display: grid; color: var(--muted); }
.choice-label { flex: 1; min-width: 0; }

.choice:has(input:checked) {
    border-color: var(--vscode-focusBorder);
    background: color-mix(in srgb, var(--vscode-focusBorder) 12%, transparent);
}

.choice:has(input:checked) .choice-icon { color: var(--vscode-focusBorder); }
.choice:has(input:focus-visible) { outline: 1px solid var(--vscode-focusBorder); }

/* Timeline */
.schedule-timeline {
    padding: 10px;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--vscode-foreground) 4%, transparent);
}

.timeline-header { font-size: 12px; font-weight: 600; margin-bottom: 8px; }

.timeline-bar {
    position: relative;
    height: 10px;
    border-radius: 5px;
    background: var(--night);
}

.timeline-marker {
    position: absolute;
    top: -4px;
    width: 3px;
    height: 18px;
    margin-left: -1.5px;
    border-radius: 2px;
    background: var(--vscode-foreground);
    box-shadow: 0 0 0 2px var(--vscode-sideBar-background);
    transition: left 300ms ease;
}

.timeline-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--muted);
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
}

.timeline-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-top: 6px;
    font-size: 11px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--muted);
}

.legend-item span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.legend-color { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-color.day { background: var(--day); }
.legend-color.night { background: var(--night); }

/* Theme pool picker */
.theme-pool-picker {
    position: relative;
    border: 1px solid var(--vscode-input-border, var(--border));
    border-radius: var(--radius-sm);
    background-color: var(--vscode-input-background);
    padding: 4px;
}

.theme-pool-picker:focus-within { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }

.theme-pool-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 4px;
}

.theme-pool-chips:empty { display: none; }

.theme-pool-chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    max-width: 100%;
    padding: 1px 2px 1px 8px;
    border-radius: 10px;
    background-color: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    font-size: 11px;
}

.theme-pool-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.theme-pool-chip-remove {
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 13px;
    line-height: 1;
    padding: 0 4px;
    opacity: 0.7;
    cursor: pointer;
}

.theme-pool-chip-remove:hover { opacity: 1; }

input.theme-pool-search {
    height: 22px;
    padding: 2px 4px;
    background-color: transparent;
    border: none;
}

input.theme-pool-search:focus { outline: none; }

/* Only open while the picker has focus, so closed pickers stay compact. */
.theme-pool-dropdown {
    display: none;
    position: absolute;
    z-index: 10;
    left: -1px;
    right: -1px;
    top: calc(100% + 2px);
    max-height: 180px;
    overflow-y: auto;
    background-color: var(--vscode-dropdown-background);
    border: 1px solid var(--vscode-dropdown-border, var(--border));
    border-radius: var(--radius-sm);
    box-shadow: 0 4px 12px var(--vscode-widget-shadow, rgba(0, 0, 0, 0.3));
}

.theme-pool-picker:focus-within .theme-pool-dropdown { display: block; }

.theme-pool-option {
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    color: var(--vscode-dropdown-foreground);
}

.theme-pool-option:hover, .theme-pool-option:first-child {
    background-color: var(--vscode-list-hoverBackground);
}

.theme-pool-empty { padding: 4px 8px; font-size: 11px; color: var(--muted); }

/* Sticky save bar */
.footer {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    margin-top: 8px;
    background: var(--vscode-sideBar-background);
    border-top: 1px solid var(--border);
}

.footer-status {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    display: grid;
}

.footer-status > * {
    grid-area: 1 / 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: opacity var(--speed);
}

.status { opacity: 0; }
.status.show { opacity: 1; }
.status.success { color: var(--vscode-testing-iconPassed, var(--vscode-terminal-ansiGreen)); }
.status.error { color: var(--vscode-errorForeground); }
.status.info { color: var(--vscode-textLink-foreground); }

.dirty-hint { opacity: 0; color: var(--muted); }
body.dirty .dirty-hint { opacity: 1; }
.status.show ~ .dirty-hint { opacity: 0; }

body.dirty #saveSettings { box-shadow: 0 0 0 2px color-mix(in srgb, var(--vscode-button-background) 35%, transparent); }
  `;
}
