// src/sidebar.ts
import * as vscode from "vscode";
import { CONFIG_KEYS } from "./constants";
import { getWebviewContent } from "./webview";
import { SunriseSunsetService } from "./sunriseSunsetService";

let lastAppliedTheme: string | undefined;

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

    webviewView.webview.onDidReceiveMessage(async (message) => {
      const config = vscode.workspace.getConfiguration("chronoShade");

      switch (message.command) {
        case "getThemes":
          await this.handleGetThemes(config, webviewView);
          break;
        case "previewTheme":
          await this.handlePreviewTheme(message.theme);
          break;
        case "switchTheme":
          await this.handleSwitchTheme(message.theme);
          break;
        case "saveSettings":
          await this.handleSaveSettings(config, message);
          break;
        case "startIntervalCheck":
          vscode.commands.executeCommand("chronoShade.startIntervalCheck");
          break;
        case "getCurrentTheme":
          await this.handleGetCurrentTheme(webviewView);
          break;
        case "getTranslations":
          await this.handleGetTranslations(message.language, webviewView);
          break;
        case "forceDayTheme":
          await this.handleForceDayTheme();
          break;
        case "forceNightTheme":
          await this.handleForceNightTheme();
          break;
        case "testLocation":
          await this.handleTestLocation(message.latitude, message.longitude, webviewView, message.saveAfterFetch);
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
    }, 1000);
  }

  private async handleGetThemes(
    config: vscode.WorkspaceConfiguration,
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

    const settings = {
      currentTheme,
      themes,
      dayTheme: config.get(CONFIG_KEYS.DAY_THEME),
      nightTheme: config.get(CONFIG_KEYS.NIGHT_THEME),
      overrideThemeSwitch: config.get(CONFIG_KEYS.OVERRIDE_THEME_SWITCH),
      dayTimeStart: config.get(CONFIG_KEYS.MANUAL_SUNRISE),
      nightTimeStart: config.get(CONFIG_KEYS.MANUAL_SUNSET),
      useLocationBasedTimes: config.get(CONFIG_KEYS.USE_LOCATION_BASED_TIMES),
      latitude: config.get(CONFIG_KEYS.LATITUDE),
      longitude: config.get(CONFIG_KEYS.LONGITUDE),
      language: vscode.env.language,
    };

    webviewView.webview.postMessage({ command: "updateThemes", settings });
  }

  private async handlePreviewTheme(theme: string) {
    lastAppliedTheme = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme") as string;

    await vscode.workspace
      .getConfiguration("workbench")
      .update("colorTheme", theme, true);

    vscode.window.showInformationMessage(
      vscode.l10n.t("Previewing theme: {0}. Reverting in 5 seconds...", theme)
    );

    setTimeout(async () => {
      await vscode.workspace
        .getConfiguration("workbench")
        .update("colorTheme", lastAppliedTheme, true);
      vscode.window.showInformationMessage(
        vscode.l10n.t("Reverted back to: {0}", lastAppliedTheme || "Previous Theme")
      );
    }, 5000);
  }

  private async handleSwitchTheme(theme: string) {
    await vscode.workspace
      .getConfiguration("workbench")
      .update("colorTheme", theme, true);

    vscode.window.showInformationMessage(
      vscode.l10n.t("Switched to theme: {0}", theme)
    );
  }

  private async handleSaveSettings(
    config: vscode.WorkspaceConfiguration,
    message: any
  ) {
    // Validate time formats server-side
    const dayTimeValid = this.isValidTimeFormat(message.dayTimeStart);
    const nightTimeValid = this.isValidTimeFormat(message.nightTimeStart);
    
    if (!dayTimeValid || !nightTimeValid) {
      vscode.window.showErrorMessage(
        "ChronoShade: Invalid time format. Please use HH:MM format (24-hour)."
      );
      return;
    }
    
    // Ensure times are different
    if (message.dayTimeStart === message.nightTimeStart) {
      vscode.window.showErrorMessage(
        "ChronoShade: Day and night times cannot be the same."
      );
      return;
    }
    
    // Ensure day starts before night
    const dayStartMinutes = this.timeStringToMinutes(message.dayTimeStart);
    const nightStartMinutes = this.timeStringToMinutes(message.nightTimeStart);
    
    if (dayStartMinutes >= nightStartMinutes) {
      vscode.window.showErrorMessage(
        "ChronoShade: Day start time must be earlier than night start time."
      );
      return;
    }

    await config.update(CONFIG_KEYS.DAY_THEME, message.dayTheme, true);
    await config.update(CONFIG_KEYS.NIGHT_THEME, message.nightTheme, true);
    await config.update(CONFIG_KEYS.MANUAL_SUNRISE, message.dayTimeStart, true);
    await config.update(
      CONFIG_KEYS.MANUAL_SUNSET,
      message.nightTimeStart,
      true
    );
    await config.update(
      CONFIG_KEYS.OVERRIDE_THEME_SWITCH,
      message.overrideThemeSwitch,
      true
    );
    await config.update(
      CONFIG_KEYS.USE_LOCATION_BASED_TIMES,
      message.useLocationBasedTimes,
      true
    );
    await config.update(CONFIG_KEYS.LATITUDE, message.latitude, true);
    await config.update(CONFIG_KEYS.LONGITUDE, message.longitude, true);

    if (message.overrideThemeSwitch) {
      vscode.commands.executeCommand("chronoShade.startIntervalCheck");
    } else {
      vscode.commands.executeCommand("chronoShade.stopIntervalCheck");
    }

    // Trigger immediate theme check after saving new times
    if (message.overrideThemeSwitch) {
      vscode.commands.executeCommand("chronoShade.checkThemeSwitch");
    }

    // Update current theme display after a short delay to allow theme switch
    setTimeout(() => {
      if (this._view) {
        this.handleGetCurrentTheme(this._view);
      }
    }, 500);

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

  private timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n));
    return hours * 60 + minutes;
  }

  private async handleForceDayTheme() {
    const config = vscode.workspace.getConfiguration("chronoShade");
    const dayTheme = config.get(CONFIG_KEYS.DAY_THEME);
    
    if (!dayTheme) {
      vscode.window.showWarningMessage(
        vscode.l10n.t("Please configure a day theme first in ChronoShade settings.")
      );
      return;
    }

    await vscode.workspace
      .getConfiguration("workbench")
      .update("colorTheme", dayTheme, true);

    vscode.window.showInformationMessage(
      vscode.l10n.t("Switched to day theme: {0}", dayTheme)
    );

    // Update current theme display after a short delay
    setTimeout(() => {
      if (this._view) {
        this.handleGetCurrentTheme(this._view);
      }
    }, 500);
  }

  private async handleForceNightTheme() {
    const config = vscode.workspace.getConfiguration("chronoShade");
    const nightTheme = config.get(CONFIG_KEYS.NIGHT_THEME);
    
    if (!nightTheme) {
      vscode.window.showWarningMessage(
        vscode.l10n.t("Please configure a night theme first in ChronoShade settings.")
      );
      return;
    }

    await vscode.workspace
      .getConfiguration("workbench")
      .update("colorTheme", nightTheme, true);

    vscode.window.showInformationMessage(
      vscode.l10n.t("Switched to night theme: {0}", nightTheme)
    );

    // Update current theme display after a short delay
    setTimeout(() => {
      if (this._view) {
        this.handleGetCurrentTheme(this._view);
      }
    }, 500);
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

  private async handleDisableAutoSwitch(config: vscode.WorkspaceConfiguration) {
    // Disable automatic theme switching
    await config.update(CONFIG_KEYS.OVERRIDE_THEME_SWITCH, false, true);
    
    // Stop interval check
    vscode.commands.executeCommand("chronoShade.stopIntervalCheck");
    
    // Show confirmation message
    vscode.window.showInformationMessage(
      vscode.l10n.t("Automatic theme switching disabled")
    );
  }

  private isValidTimeFormat(timeStr: string): boolean {
    if (!timeStr) {
      return false;
    }
    const timeMatch = timeStr.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
    if (!timeMatch) {
      return false;
    }
    
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }
}
