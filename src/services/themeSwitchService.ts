// src/services/themeSwitchService.ts
import * as vscode from "vscode";
import { isValidTimeFormat } from "../utils";
import { ConfigurationService, ChronoShadeConfiguration } from "./configurationService";
import { SunriseSunsetService, SunriseSunsetTimes } from "../sunriseSunsetService";
import { DEFAULTS, TIMEOUTS } from "../constants";

export interface ThemeTimes {
  dayTimeStart: string;
  nightTimeStart: string;
}

export class ThemeSwitchService {
  private static cachedLocationTimes: { sunrise: string; sunset: string; cachedDate: string } | null = null;

  public static async checkAndSwitchTheme(): Promise<void> {
    console.log("Checking theme switch at:", new Date().toLocaleTimeString());

    const config = ConfigurationService.getConfiguration();

    if (!config.overrideThemeSwitch) {
      console.log(vscode.l10n.t("[ChronoShade] Theme switching is disabled."));
      return;
    }

    const { dayTimeStart, nightTimeStart } = await this.getValidatedThemeTimes(config);
    const isNightTime = this.determineIsNightTime(dayTimeStart, nightTimeStart);
    const theme = this.selectTheme(config, isNightTime);
    
    await this.applyTheme(theme);
  }

  public static async applyDayTheme(): Promise<void> {
    const config = ConfigurationService.getConfiguration();
    if (!config.dayTheme) {
      throw new Error(vscode.l10n.t("Please configure a day theme first in ChronoShade settings."));
    }
    await this.applyTheme(config.dayTheme);
  }

  public static async applyNightTheme(): Promise<void> {
    const config = ConfigurationService.getConfiguration();
    if (!config.nightTheme) {
      throw new Error(vscode.l10n.t("Please configure a night theme first in ChronoShade settings."));
    }
    await this.applyTheme(config.nightTheme);
  }

  public static async previewTheme(theme: string, duration: number = TIMEOUTS.PREVIEW_THEME_DURATION): Promise<string> {
    const currentTheme = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme") as string;

    await this.applyTheme(theme);

    setTimeout(async () => {
      await this.applyTheme(currentTheme);
    }, duration);

    return currentTheme;
  }

  private static async getValidatedThemeTimes(config: ChronoShadeConfiguration): Promise<ThemeTimes> {
    let dayTimeStart = config.manualSunrise;
    let nightTimeStart = config.manualSunset;
    
    // Check if location-based times should be used
    if (config.useLocationBasedTimes) {
      try {
        const times = await this.getLocationBasedTimes(config);
        if (times) {
          dayTimeStart = times.sunrise;
          nightTimeStart = times.sunset;
          console.log(vscode.l10n.t("[ChronoShade] Using location-based times: sunrise {0}, sunset {1}", dayTimeStart, nightTimeStart));
        }
      } catch (error) {
        console.warn(vscode.l10n.t("[ChronoShade] Failed to fetch location-based times, falling back to manual times: {0}", String(error)));
      }
    }
    
    // Validate and sanitize time values
    if (!isValidTimeFormat(dayTimeStart)) {
      console.warn(vscode.l10n.t("[ChronoShade] Invalid day start time: {0}, using default {1}", dayTimeStart, DEFAULTS.DAY_TIME_START));
      dayTimeStart = DEFAULTS.DAY_TIME_START;
    }
    
    if (!isValidTimeFormat(nightTimeStart)) {
      console.warn(vscode.l10n.t("[ChronoShade] Invalid night start time: {0}, using default {1}", nightTimeStart, DEFAULTS.NIGHT_TIME_START));
      nightTimeStart = DEFAULTS.NIGHT_TIME_START;
    }

    return { dayTimeStart, nightTimeStart };
  }

  private static determineIsNightTime(dayTimeStart: string, nightTimeStart: string): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Handle cross-midnight scenarios properly
    if (nightTimeStart < dayTimeStart) {
      // Cross-midnight scenario: night time is earlier than day time
      // Night runs from nightTimeStart (previous day) to dayTimeStart, 
      // then continues from midnight to nightTimeStart (current day)
      return currentTime <= nightTimeStart || currentTime < dayTimeStart;
    } else {
      // Normal scenario where day starts before night (e.g., 06:00 day, 18:00 night)
      return currentTime >= nightTimeStart || currentTime < dayTimeStart;
    }
  }

  private static selectTheme(config: ChronoShadeConfiguration, isNightTime: boolean): string {
    return isNightTime ? config.nightTheme : config.dayTheme;
  }

  private static async applyTheme(theme: string): Promise<void> {
    try {
      await vscode.workspace
        .getConfiguration("workbench")
        .update("colorTheme", theme, true);
    } catch (err) {
      throw new Error(vscode.l10n.t("ChronoShade: Failed to switch theme. Please check your settings."));
    }
  }

  private static async getLocationBasedTimes(config: ChronoShadeConfiguration): Promise<SunriseSunsetTimes | null> {
    const { latitude, longitude } = config;
    
    if (!latitude || !longitude || !SunriseSunsetService.validateCoordinates(latitude, longitude)) {
      console.warn(vscode.l10n.t("[ChronoShade] Invalid coordinates: lat={0}, lng={1}", latitude || 0, longitude || 0));
      return null;
    }
    
    // Check if we have cached times for today
    const today = new Date().toDateString();
    if (this.cachedLocationTimes && this.cachedLocationTimes.cachedDate === today) {
      console.log(vscode.l10n.t("[ChronoShade] Using cached location-based times"));
      return {
        sunrise: this.cachedLocationTimes.sunrise,
        sunset: this.cachedLocationTimes.sunset
      };
    }
    
    try {
      const times = await SunriseSunsetService.getSunriseSunsetTimes(latitude, longitude);
      // Cache the times for today
      this.cachedLocationTimes = {
        sunrise: times.sunrise,
        sunset: times.sunset,
        cachedDate: today
      };
      return times;
    } catch (error) {
      console.error(vscode.l10n.t("[ChronoShade] Error fetching sunrise/sunset times: {0}", String(error)));
      throw error;
    }
  }

  public static async fetchAndCacheLocationTimes(): Promise<void> {
    try {
      console.log(vscode.l10n.t("[ChronoShade] Fetching location-based sunrise/sunset times on startup"));
      const config = ConfigurationService.getConfiguration();
      await this.getLocationBasedTimes(config);
      console.log(vscode.l10n.t("[ChronoShade] Successfully cached location-based times"));
    } catch (error) {
      console.warn(vscode.l10n.t("[ChronoShade] Failed to cache location-based times on startup: {0}", String(error)));
    }
  }
}