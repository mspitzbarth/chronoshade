// src/services/configurationService.ts
import * as vscode from "vscode";
import { CONFIG_KEYS, DEFAULTS } from "../constants";

export interface ChronoShadeConfiguration {
  dayTheme: string;
  nightTheme: string;
  manualSunrise: string;
  manualSunset: string;
  overrideThemeSwitch: boolean;
  useLocationBasedTimes: boolean;
  latitude: number;
  longitude: number;
}

export class ConfigurationService {
  private static readonly SECTION = "chronoShade";
  
  public static getConfiguration(): ChronoShadeConfiguration {
    const config = vscode.workspace.getConfiguration(this.SECTION);
    
    return {
      dayTheme: config.get(CONFIG_KEYS.DAY_THEME) || DEFAULTS.DAY_THEME,
      nightTheme: config.get(CONFIG_KEYS.NIGHT_THEME) || DEFAULTS.NIGHT_THEME,
      manualSunrise: config.get(CONFIG_KEYS.MANUAL_SUNRISE) || DEFAULTS.DAY_TIME_START,
      manualSunset: config.get(CONFIG_KEYS.MANUAL_SUNSET) || DEFAULTS.NIGHT_TIME_START,
      overrideThemeSwitch: config.get(CONFIG_KEYS.OVERRIDE_THEME_SWITCH) || false,
      useLocationBasedTimes: config.get(CONFIG_KEYS.USE_LOCATION_BASED_TIMES) || false,
      latitude: config.get(CONFIG_KEYS.LATITUDE) || DEFAULTS.LATITUDE,
      longitude: config.get(CONFIG_KEYS.LONGITUDE) || DEFAULTS.LONGITUDE,
    };
  }

  public static async updateConfiguration(updates: Partial<ChronoShadeConfiguration>): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.SECTION);
    
    const updatePromises = Object.entries(updates).map(([key, value]) => {
      const configKey = this.getConfigKey(key as keyof ChronoShadeConfiguration);
      return config.update(configKey, value, true);
    });
    
    await Promise.all(updatePromises);
  }

  public static async updateSingleValue<K extends keyof ChronoShadeConfiguration>(
    key: K,
    value: ChronoShadeConfiguration[K]
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.SECTION);
    const configKey = this.getConfigKey(key);
    await config.update(configKey, value, true);
  }

  private static getConfigKey(key: keyof ChronoShadeConfiguration): string {
    const keyMap: Record<keyof ChronoShadeConfiguration, string> = {
      dayTheme: CONFIG_KEYS.DAY_THEME,
      nightTheme: CONFIG_KEYS.NIGHT_THEME,
      manualSunrise: CONFIG_KEYS.MANUAL_SUNRISE,
      manualSunset: CONFIG_KEYS.MANUAL_SUNSET,
      overrideThemeSwitch: CONFIG_KEYS.OVERRIDE_THEME_SWITCH,
      useLocationBasedTimes: CONFIG_KEYS.USE_LOCATION_BASED_TIMES,
      latitude: CONFIG_KEYS.LATITUDE,
      longitude: CONFIG_KEYS.LONGITUDE,
    };
    
    return keyMap[key];
  }

  public static onConfigurationChanged(
    callback: (e: vscode.ConfigurationChangeEvent) => void
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.SECTION)) {
        callback(e);
      }
    });
  }
}