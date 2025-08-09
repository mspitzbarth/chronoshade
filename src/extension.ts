import * as vscode from "vscode";
import { ChronoShadeSidebar } from "./sidebar";
import { isValidTimeFormat } from "./utils";
import { CONFIG_KEYS } from "./constants";
import { SunriseSunsetService } from "./sunriseSunsetService";

let checkInterval: NodeJS.Timeout | undefined;
let lastAppliedTheme: string | undefined;
let cachedLocationTimes: { sunrise: string; sunset: string; cachedDate: string } | null = null;

export async function activate(context: vscode.ExtensionContext) {
  console.log(vscode.l10n.t("ChronoShade extension activated!"));

  const sidebarProvider = new ChronoShadeSidebar(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "chronoShade.sidebar",
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );


  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.startIntervalCheck", startIntervalCheck)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.stopIntervalCheck", stopIntervalCheck)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.checkThemeSwitch", checkThemeSwitch)
  );


  // Always start interval check on activation, regardless of sidebar visibility
  const config = vscode.workspace.getConfiguration("chronoShade");
  if (config.get(CONFIG_KEYS.OVERRIDE_THEME_SWITCH)) {
    // If using location-based times, fetch sunrise/sunset on startup
    if (config.get(CONFIG_KEYS.USE_LOCATION_BASED_TIMES)) {
      await fetchAndCacheLocationTimes(config);
    }
    startIntervalCheck();
  }
}


function startIntervalCheck() {
  stopIntervalCheck(); // clear any existing interval
  checkThemeSwitch(); // run immediately
  checkInterval = setInterval(checkThemeSwitch, 60_000); // 1 minute
}

function stopIntervalCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = undefined;
  }
}

async function checkThemeSwitch() {
  console.log("Checking theme switch at:", new Date().toLocaleTimeString());

  const config = vscode.workspace.getConfiguration("chronoShade");

  if (!config.get(CONFIG_KEYS.OVERRIDE_THEME_SWITCH)) {
    console.log(vscode.l10n.t("[ChronoShade] Theme switching is disabled."));
    return;
  }

  let dayTimeStart = config.get<string>(CONFIG_KEYS.MANUAL_SUNRISE) || "06:00";
  let nightTimeStart = config.get<string>(CONFIG_KEYS.MANUAL_SUNSET) || "18:00";
  
  // Check if location-based times should be used
  const useLocationBasedTimes = config.get<boolean>(CONFIG_KEYS.USE_LOCATION_BASED_TIMES);
  if (useLocationBasedTimes) {
    try {
      const times = await getLocationBasedTimes(config);
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
    console.warn(vscode.l10n.t("[ChronoShade] Invalid day start time: {0}, using default 06:00", dayTimeStart));
    dayTimeStart = "06:00";
  }
  
  if (!isValidTimeFormat(nightTimeStart)) {
    console.warn(vscode.l10n.t("[ChronoShade] Invalid night start time: {0}, using default 18:00", nightTimeStart));
    nightTimeStart = "18:00";
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const theme =
    currentTime >= nightTimeStart || currentTime < dayTimeStart
      ? config.get(CONFIG_KEYS.NIGHT_THEME)
      : config.get(CONFIG_KEYS.DAY_THEME);

  try {
    await vscode.workspace
      .getConfiguration("workbench")
      .update("colorTheme", theme, true);
  } catch (err) {
    vscode.window.showErrorMessage(
      vscode.l10n.t("ChronoShade: Failed to switch theme. Please check your settings.")
    );
  }
}

async function getLocationBasedTimes(config: vscode.WorkspaceConfiguration) {
  const latitude = config.get<number>(CONFIG_KEYS.LATITUDE);
  const longitude = config.get<number>(CONFIG_KEYS.LONGITUDE);
  
  if (!latitude || !longitude || !SunriseSunsetService.validateCoordinates(latitude, longitude)) {
    console.warn(vscode.l10n.t("[ChronoShade] Invalid coordinates: lat={0}, lng={1}", latitude || 0, longitude || 0));
    return null;
  }
  
  // Check if we have cached times for today
  const today = new Date().toDateString();
  if (cachedLocationTimes && cachedLocationTimes.cachedDate === today) {
    console.log(vscode.l10n.t("[ChronoShade] Using cached location-based times"));
    return {
      sunrise: cachedLocationTimes.sunrise,
      sunset: cachedLocationTimes.sunset
    };
  }
  
  try {
    const times = await SunriseSunsetService.getSunriseSunsetTimes(latitude, longitude);
    // Cache the times for today
    cachedLocationTimes = {
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

async function fetchAndCacheLocationTimes(config: vscode.WorkspaceConfiguration) {
  try {
    console.log(vscode.l10n.t("[ChronoShade] Fetching location-based sunrise/sunset times on startup"));
    await getLocationBasedTimes(config);
    console.log(vscode.l10n.t("[ChronoShade] Successfully cached location-based times"));
  } catch (error) {
    console.warn(vscode.l10n.t("[ChronoShade] Failed to cache location-based times on startup: {0}", String(error)));
  }
}

export function deactivate() {
  stopIntervalCheck();
  console.log(vscode.l10n.t("ChronoShade extension deactivated."));
}
