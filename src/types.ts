// src/types.ts
// Type definitions for ChronoShade extension

export interface ThemeConfig {
  dayTheme: string;
  nightTheme: string;
  manualSunrise: string;
  manualSunset: string;
  overrideThemeSwitch: boolean;
  useCronSchedule?: boolean;
  dayCronExpression?: string;
  nightCronExpression?: string;
}

// Message types for webview communication
export interface BaseMessage {
  command: string;
}

export interface GetThemesMessage extends BaseMessage {
  command: "getThemes";
}

export interface PreviewThemeMessage extends BaseMessage {
  command: "previewTheme";
  theme: string;
}

export interface SwitchThemeMessage extends BaseMessage {
  command: "switchTheme";
  theme: string;
}

export interface SaveSettingsMessage extends BaseMessage {
  command: "saveSettings";
  dayTheme: string;
  nightTheme: string;
  dayTimeStart: string;
  nightTimeStart: string;
  dayCronExpression: string;
  nightCronExpression: string;
  useCronSchedule: boolean;
  overrideThemeSwitch: boolean;
  useLocationBasedTimes: boolean;
  latitude: number;
  longitude: number;
}

export interface StartIntervalCheckMessage extends BaseMessage {
  command: "startIntervalCheck";
}

export interface GetCurrentThemeMessage extends BaseMessage {
  command: "getCurrentTheme";
}

export interface GetTranslationsMessage extends BaseMessage {
  command: "getTranslations";
  language: string;
}

export interface ForceDayThemeMessage extends BaseMessage {
  command: "forceDayTheme";
}

export interface ForceNightThemeMessage extends BaseMessage {
  command: "forceNightTheme";
}

export interface TestLocationMessage extends BaseMessage {
  command: "testLocation";
  latitude: number;
  longitude: number;
  saveAfterFetch?: boolean;
}

export interface DisableAutoSwitchMessage extends BaseMessage {
  command: "disableAutoSwitch";
}

export type WebviewMessage = 
  | GetThemesMessage
  | PreviewThemeMessage
  | SwitchThemeMessage
  | SaveSettingsMessage
  | StartIntervalCheckMessage
  | GetCurrentThemeMessage
  | GetTranslationsMessage
  | ForceDayThemeMessage
  | ForceNightThemeMessage
  | TestLocationMessage
  | DisableAutoSwitchMessage;

// Response message types
export interface UpdateThemesResponse extends BaseMessage {
  command: "updateThemes";
  settings: {
    currentTheme: string;
    themes: string[];
    dayTheme: string;
    nightTheme: string;
    overrideThemeSwitch: boolean;
    dayTimeStart: string;
    nightTimeStart: string;
    dayCronExpression: string;
    nightCronExpression: string;
    useCronSchedule: boolean;
    useLocationBasedTimes: boolean;
    latitude: number;
    longitude: number;
    language: string;
  };
}

export interface UpdateCurrentThemeResponse extends BaseMessage {
  command: "updateCurrentTheme";
  currentTheme: string;
}

export interface TranslationsResponse extends BaseMessage {
  command: "translations";
  translations: Record<string, string>;
}

export interface LocationTestResultResponse extends BaseMessage {
  command: "locationTestResult";
  success: boolean;
  times?: { sunrise: string; sunset: string };
  error?: string;
  saveAfterFetch?: boolean;
}

export type WebviewResponse = 
  | UpdateThemesResponse
  | UpdateCurrentThemeResponse
  | TranslationsResponse
  | LocationTestResultResponse;
