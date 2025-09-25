// src/sidebar.ts
import * as vscode from "vscode";
import { CONFIG_KEYS, TIMEOUTS, DEFAULTS } from "./constants";
import { getWebviewContent } from "./webview";
import { SunriseSunsetService } from "./sunriseSunsetService";
import { isValidTimeFormat } from "./utils";
import { ConfigurationService } from "./services/configurationService";
import { ThemeSwitchService } from "./services/themeSwitchService";
import { validateCronExpression } from "./cronUtils";
import { 
  WebviewMessage, 
  SaveSettingsMessage, 
  TestLocationMessage, 
  PreviewThemeMessage, 
  SwitchThemeMessage,
  GetTranslationsMessage
} from "./types";

export class ChronoShadeSidebar implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = getWebviewContent(webviewView.webview, this._extensionUri);

    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      const config = vscode.workspace.getConfiguration("chronoShade");

      switch (message.command) {
        case "getThemes":
          await this.handleGetThemes(config, webviewView);
          break;
        case "previewTheme":
          await this.handlePreviewTheme((message as PreviewThemeMessage).theme);
          break;
        case "switchTheme":
          await this.handleSwitchTheme((message as SwitchThemeMessage).theme);
          break;
        case "saveSettings":
          await this.handleSaveSettings(config, message as SaveSettingsMessage);
          break;
        case "startIntervalCheck":
          vscode.commands.executeCommand("chronoShade.startIntervalCheck");
          break;
        case "getCurrentTheme":
          await this.handleGetCurrentTheme(webviewView);
          break;
        case "getTranslations":
          await this.handleGetTranslations((message as GetTranslationsMessage).language, webviewView);
          break;
        case "forceDayTheme":
          await this.handleForceDayTheme();
          break;
        case "forceNightTheme":
          await this.handleForceNightTheme();
          break;
        case "testLocation":
          const testMsg = message as TestLocationMessage;
          await this.handleTestLocation(testMsg.latitude, testMsg.longitude, webviewView, testMsg.saveAfterFetch);
          break;
        case "disableAutoSwitch":
          await this.handleDisableAutoSwitch(config);
          break;
        default:
          break;
      }
    });

    setTimeout(() => {
      webviewView.webview.postMessage({ command: "getThemes" });
    }, TIMEOUTS.WEBVIEW_INIT_DELAY);
  }

  private async handleGetThemes(
    _config: vscode.WorkspaceConfiguration,
    webviewView: vscode.WebviewView
  ) {
    const currentTheme = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme");

    const themes = await vscode.extensions.all
      .filter((ext) => ext.packageJSON.contributes?.themes)
      .flatMap((ext) =>
        ext.packageJSON.contributes.themes.map((t: any) => t.label)
      );

    const config = ConfigurationService.getConfiguration();
    const useCronSchedule = config.useCronSchedule;
    const useLocationBasedTimes = useCronSchedule ? false : config.useLocationBasedTimes;
    const settings = {
      currentTheme,
      themes,
      dayTheme: config.dayTheme,
      nightTheme: config.nightTheme,
      overrideThemeSwitch: config.overrideThemeSwitch,
      dayTimeStart: config.manualSunrise,
      nightTimeStart: config.manualSunset,
      dayCronExpression: config.dayCronExpression,
      nightCronExpression: config.nightCronExpression,
      useCronSchedule: useCronSchedule,
      useLocationBasedTimes,
      latitude: config.latitude,
      longitude: config.longitude,
      language: vscode.env.language,
    };

    webviewView.webview.postMessage({ command: "updateThemes", settings });
  }

  private async handlePreviewTheme(theme: string) {
    try {
      const previousTheme = await ThemeSwitchService.previewTheme(theme);
      vscode.window.showInformationMessage(
        vscode.l10n.t("Previewing theme: {0}. Reverting in 5 seconds...", theme)
      );
      
      setTimeout(() => {
        vscode.window.showInformationMessage(
          vscode.l10n.t("Reverted back to: {0}", previousTheme || "Previous Theme")
        );
      }, TIMEOUTS.PREVIEW_THEME_DURATION);
    } catch (error) {
      vscode.window.showErrorMessage(
        vscode.l10n.t("Failed to preview theme: {0}", String(error))
      );
    }
  }

  private async handleSwitchTheme(theme: string) {
    try {
      await vscode.workspace
        .getConfiguration("workbench")
        .update("colorTheme", theme, true);

      vscode.window.showInformationMessage(
        vscode.l10n.t("Switched to theme: {0}", theme)
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        vscode.l10n.t("Failed to switch theme: {0}", String(error))
      );
    }
  }

  private async handleSaveSettings(
    _config: vscode.WorkspaceConfiguration,
    message: SaveSettingsMessage
  ) {
    const useCronSchedule = message.useCronSchedule;
    const useLocationBasedTimes = !useCronSchedule && message.useLocationBasedTimes;

    if (useCronSchedule) {
      if (!validateCronExpression(message.dayCronExpression) || !validateCronExpression(message.nightCronExpression)) {
        vscode.window.showErrorMessage(
          vscode.l10n.t("ChronoShade: Invalid cron expression. Please provide valid cron syntax for day and night schedules.")
        );
        return;
      }
    } else {
      const dayTimeValid = isValidTimeFormat(message.dayTimeStart);
      const nightTimeValid = isValidTimeFormat(message.nightTimeStart);
      
      if (!dayTimeValid || !nightTimeValid) {
        vscode.window.showErrorMessage(
          "ChronoShade: Invalid time format. Please use HH:MM format (24-hour)."
        );
        return;
      }
      
      if (message.dayTimeStart === message.nightTimeStart) {
        vscode.window.showErrorMessage(
          "ChronoShade: Day and night times cannot be the same."
        );
        return;
      }
    }

    const sanitizedDayCron = message.dayCronExpression?.trim() || DEFAULTS.DAY_CRON_EXPRESSION;
    const sanitizedNightCron = message.nightCronExpression?.trim() || DEFAULTS.NIGHT_CRON_EXPRESSION;

    await ConfigurationService.updateConfiguration({
      dayTheme: message.dayTheme,
      nightTheme: message.nightTheme,
      manualSunrise: message.dayTimeStart,
      manualSunset: message.nightTimeStart,
      overrideThemeSwitch: message.overrideThemeSwitch,
      useCronSchedule,
      dayCronExpression: sanitizedDayCron,
      nightCronExpression: sanitizedNightCron,
      useLocationBasedTimes,
      latitude: message.latitude,
      longitude: message.longitude,
    });

    if (message.overrideThemeSwitch) {
      vscode.commands.executeCommand("chronoShade.startIntervalCheck");
    } else {
      vscode.commands.executeCommand("chronoShade.stopIntervalCheck");
    }

    // Trigger immediate theme check after saving new times
    if (message.overrideThemeSwitch) {
      await vscode.commands.executeCommand("chronoShade.checkThemeSwitch");
      
      // If using GPS coordinates, wait a moment for the GPS times to be fetched and then check again
      if (message.useLocationBasedTimes) {
        setTimeout(async () => {
          await vscode.commands.executeCommand("chronoShade.checkThemeSwitch");
        }, 2000); // Wait 2 seconds for GPS times to be fetched and cached
      }
    }

    // Update current theme display after a short delay to allow theme switch
    setTimeout(() => {
      if (this._view) {
        this.handleGetCurrentTheme(this._view);
      }
    }, TIMEOUTS.THEME_UPDATE_DELAY);

    vscode.window.showInformationMessage(
      vscode.l10n.t("ChronoShade settings saved successfully!")
    );
  }
  
  private async handleGetCurrentTheme(webviewView: vscode.WebviewView) {
    const currentTheme = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme");
    
    webviewView.webview.postMessage({ 
      command: "updateCurrentTheme", 
      currentTheme 
    });
  }

  private async handleGetTranslations(language: string, webviewView: vscode.WebviewView) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      let filePath = path.join(this._extensionUri.fsPath, 'l10n', `webview.l10n.${language}.json`);
      
      // Fallback to English if language file doesn't exist
      try {
        await fs.access(filePath);
      } catch {
        filePath = path.join(this._extensionUri.fsPath, 'l10n', 'webview.l10n.json');
      }
      
      const translationsContent = await fs.readFile(filePath, 'utf8');
      const translations = JSON.parse(translationsContent);
      
      webviewView.webview.postMessage({
        command: 'translations',
        translations
      });
    } catch (error) {
      console.error('Failed to load webview translations:', error);
      // Send empty translations object to prevent webview from waiting
      webviewView.webview.postMessage({
        command: 'translations',
        translations: {}
      });
    }
  }


  private async handleForceDayTheme() {
    try {
      await ThemeSwitchService.applyDayTheme();
      const config = ConfigurationService.getConfiguration();
      vscode.window.showInformationMessage(
        vscode.l10n.t("Switched to day theme: {0}", config.dayTheme)
      );

      // Update current theme display after a short delay
      setTimeout(() => {
        if (this._view) {
          this.handleGetCurrentTheme(this._view);
        }
      }, TIMEOUTS.THEME_UPDATE_DELAY);
    } catch (error) {
      vscode.window.showWarningMessage(String(error));
    }
  }

  private async handleForceNightTheme() {
    try {
      await ThemeSwitchService.applyNightTheme();
      const config = ConfigurationService.getConfiguration();
      vscode.window.showInformationMessage(
        vscode.l10n.t("Switched to night theme: {0}", config.nightTheme)
      );

      // Update current theme display after a short delay
      setTimeout(() => {
        if (this._view) {
          this.handleGetCurrentTheme(this._view);
        }
      }, TIMEOUTS.THEME_UPDATE_DELAY);
    } catch (error) {
      vscode.window.showWarningMessage(String(error));
    }
  }

  private async handleTestLocation(
    latitude: number, 
    longitude: number, 
    webviewView: vscode.WebviewView,
    saveAfterFetch?: boolean
  ) {
    try {
      // Validate coordinates
      if (!SunriseSunsetService.validateCoordinates(latitude, longitude)) {
        const error = SunriseSunsetService.getCoordinateValidationError(latitude, longitude);
        vscode.window.showErrorMessage(error);
        return;
      }

      // Show progress message
      vscode.window.showInformationMessage(
        vscode.l10n.t("Fetching sunrise/sunset times for your location...")
      );

      // Fetch times
      const times = await SunriseSunsetService.getSunriseSunsetTimes(latitude, longitude);
      
      // Show success message
      vscode.window.showInformationMessage(
        vscode.l10n.t("Location test successful! Sunrise: {0}, Sunset: {1}", times.sunrise, times.sunset)
      );

      // Update the webview with the fetched times (for preview)
      webviewView.webview.postMessage({
        command: 'locationTestResult',
        success: true,
        times: times,
        saveAfterFetch: saveAfterFetch
      });

    } catch (error) {
      console.error('Location test failed:', error);
      vscode.window.showErrorMessage(
        vscode.l10n.t("Location test failed: {0}", String(error))
      );
      
      webviewView.webview.postMessage({
        command: 'locationTestResult',
        success: false,
        error: String(error)
      });
    }
  }

  private async handleDisableAutoSwitch(_config: vscode.WorkspaceConfiguration) {
    // Disable automatic theme switching
    await ConfigurationService.updateSingleValue('overrideThemeSwitch', false);
    
    // Stop interval check
    vscode.commands.executeCommand("chronoShade.stopIntervalCheck");
    
    // Show confirmation message
    vscode.window.showInformationMessage(
      vscode.l10n.t("Automatic theme switching disabled")
    );
  }

}
