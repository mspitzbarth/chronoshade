// src/services/themeSwitchService.ts
import * as vscode from "vscode";
import { isValidTimeFormat } from "../utils";
import { ConfigurationService, ChronoShadeConfiguration } from "./configurationService";
import { SunriseSunsetService, SunriseSunsetTimes } from "../sunriseSunsetService";
import { LocationService } from "./locationService";
import { DEFAULTS, TIMEOUTS } from "../constants";
import { getLastCronOccurrence, validateCronExpression } from "../cronUtils";

export interface ThemeTimes {
  dayTimeStart: string;
  nightTimeStart: string;
}

export class ThemeSwitchService {
  private static cachedLocationTimes: { sunrise: string; sunset: string; cachedDate: string; latitude: number; longitude: number } | null = null;

  public static async checkAndSwitchTheme(): Promise<void> {
    const config = ConfigurationService.getConfiguration();

    if (!config.overrideThemeSwitch) {
      return;
    }


    let isNightTime: boolean | null = null;

    if (config.useCronSchedule) {
      isNightTime = this.determineIsNightTimeFromCron(config);
    }

    if (isNightTime === null) {
      const { dayTimeStart, nightTimeStart } = await this.getValidatedThemeTimes(config);
      isNightTime = this.determineIsNightTime(dayTimeStart, nightTimeStart);
    }

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
    // Check if location-based times should be used
    if (config.useLocationBasedTimes && !config.useCronSchedule) {
      try {
        let times = await this.getLocationBasedTimes(config);

        // If we failed to get times with existing config (maybe 0,0), try auto-detection
        if (!times && config.latitude === 0 && config.longitude === 0) {
          try {
            const autoLocation = await LocationService.detectLocation();
            if (autoLocation) {
              const { lat, lon } = autoLocation;

              // Invalidate cache if we have new coordinates? 
              // SunriseSunsetService.getSunriseSunsetTimes takes lat/lon directly.
              const autoTimes = await SunriseSunsetService.getSunriseSunsetTimes(lat, lon);
              times = { sunrise: autoTimes.sunrise, sunset: autoTimes.sunset };

              // Let user know? Maybe distinct log.
              console.log(vscode.l10n.t("[ChronoShade] Auto-detected location: {0}, {1}", lat, lon));
            }
          } catch (e) {
            // Ignore failure
          }
        }

        if (times) {
          dayTimeStart = times.sunrise;
          nightTimeStart = times.sunset;
        }
      } catch (error) {
        console.warn(vscode.l10n.t("[ChronoShade] Failed to fetch location-based times, falling back to manual times: {0}", String(error)));
      }
    }

    // Validate and sanitize time values
    if (!isValidTimeFormat(dayTimeStart)) {
      dayTimeStart = DEFAULTS.DAY_TIME_START;
    }

    if (!isValidTimeFormat(nightTimeStart)) {
      nightTimeStart = DEFAULTS.NIGHT_TIME_START;
    }

    // Apply offsets
    if (config.sunriseOffset !== 0) {
      dayTimeStart = this.addMinutesToTime(dayTimeStart, config.sunriseOffset);
    }

    if (config.sunsetOffset !== 0) {
      nightTimeStart = this.addMinutesToTime(nightTimeStart, config.sunsetOffset);
    }

    return { dayTimeStart, nightTimeStart };
  }

  private static addMinutesToTime(time: string, minutesToAdd: number): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + minutesToAdd);

    // Format back to HH:MM
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private static determineIsNightTime(dayTimeStart: string, nightTimeStart: string): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    let isNightTime: boolean;

    // Handle cross-midnight scenarios properly
    if (nightTimeStart < dayTimeStart) {
      // Cross-midnight scenario: night time is earlier in the day than day time
      // This means night theme runs from nightTimeStart to dayTimeStart (same day)
      // Example: Night Start 05:37, Day Start 14:57 = night from 5:37 AM to 2:57 PM
      isNightTime = currentTime >= nightTimeStart && currentTime < dayTimeStart;
    } else {
      // Normal scenario where day starts before night (e.g., 06:00 day, 18:00 night)
      isNightTime = currentTime >= nightTimeStart || currentTime < dayTimeStart;
    }

    return isNightTime;
  }

  private static selectTheme(config: ChronoShadeConfiguration, isNightTime: boolean): string {
    return isNightTime ? config.nightTheme : config.dayTheme;
  }

  private static determineIsNightTimeFromCron(config: ChronoShadeConfiguration): boolean | null {
    const dayExpression = config.dayCronExpression;
    const nightExpression = config.nightCronExpression;

    if (!validateCronExpression(dayExpression) || !validateCronExpression(nightExpression)) {
      console.warn(
        vscode.l10n.t(
          "[ChronoShade] Invalid cron expression detected. Falling back to manual schedule."
        )
      );
      return null;
    }

    const now = new Date();
    const lastDay = getLastCronOccurrence(dayExpression, now);
    const lastNight = getLastCronOccurrence(nightExpression, now);

    if (!lastDay && !lastNight) {
      console.warn(
        vscode.l10n.t(
          "[ChronoShade] Cron expressions produced no occurrences within the lookback window. Falling back to manual schedule."
        )
      );
      return null;
    }

    const lastDayTime = lastDay ? lastDay.getTime() : Number.NEGATIVE_INFINITY;
    const lastNightTime = lastNight ? lastNight.getTime() : Number.NEGATIVE_INFINITY;

    if (lastNightTime === lastDayTime) {
      return null;
    }

    return lastNightTime > lastDayTime;
  }

  private static async applyTheme(theme: string): Promise<void> {
    try {
      const currentTheme = vscode.workspace.getConfiguration("workbench").get("colorTheme");

      if (currentTheme !== theme) {
        await vscode.workspace
          .getConfiguration("workbench")
          .update("colorTheme", theme, true);
      }
    } catch (err) {
      throw new Error(vscode.l10n.t("ChronoShade: Failed to switch theme. Please check your settings."));
    }
  }

  private static async getLocationBasedTimes(config: ChronoShadeConfiguration): Promise<SunriseSunsetTimes | null> {
    const { latitude, longitude, useCronSchedule } = config;

    if (useCronSchedule) {
      return null;
    }

    if (!latitude || !longitude || !SunriseSunsetService.validateCoordinates(latitude, longitude)) {
      return null;
    }

    // Check if we have cached times for today and the same coordinates
    const today = new Date().toDateString();
    if (this.cachedLocationTimes &&
      this.cachedLocationTimes.cachedDate === today &&
      this.cachedLocationTimes.latitude === latitude &&
      this.cachedLocationTimes.longitude === longitude) {
      return {
        sunrise: this.cachedLocationTimes.sunrise,
        sunset: this.cachedLocationTimes.sunset
      };
    }

    try {
      const times = await SunriseSunsetService.getSunriseSunsetTimes(latitude, longitude);
      // Cache the times for today and these coordinates
      this.cachedLocationTimes = {
        sunrise: times.sunrise,
        sunset: times.sunset,
        cachedDate: today,
        latitude: latitude,
        longitude: longitude
      };
      return times;
    } catch (error) {
      console.error(vscode.l10n.t("[ChronoShade] Error fetching sunrise/sunset times: {0}", String(error)));
      throw error;
    }
  }

  public static async fetchAndCacheLocationTimes(): Promise<void> {
    try {
      const config = ConfigurationService.getConfiguration();
      // Trigger the getValidatedThemeTimes flow which now includes auto-detection logic implicitly
      // or we can just call getLocationBasedTimes. 
      // Actually, getValidatedThemeTimes is private and returns times, it doesn't cache them in the same way 
      // or rely on the same structure. 
      // cachedLocationTimes is used by getLocationBasedTimes.

      // If we want to support auto-location at startup:
      if (config.useLocationBasedTimes && config.latitude === 0 && config.longitude === 0) {
        try {
          const autoLoc = await LocationService.detectLocation();
          if (autoLoc) {
            // We have auto-location. Similar to before, we don't save it to config here 
            // to keep it "magic" / transient or avoid side effects during simple check.
            // But we can let the next call to getValidatedThemeTimes handle usage if we wanted to pass it.
            // Actually, fetchAndCacheLocationTimes calls getLocationBasedTimes, which calls getValidatedThemeTimes? 
            // No, fetchAndCacheLocationTimes calls getLocationBasedTimes directly.

            // Let's look at getLocationBasedTimes in this file.
            // It calls fetchAutoLocation if 0,0.
            // So we don't strictly need to do anything here except ensure getLocationBasedTimes works.
          }
        } catch (e) {
          // Ignore auto-detect failure here
        }
      }

      await this.getLocationBasedTimes(config);
    } catch (error) {
      // Silently fail - will fetch times when needed
    }
  }

}
