import * as vscode from "vscode";
import { ChronoShadeSidebar } from "./sidebar";
import { isValidTimeFormat } from "./utils";
import { CONFIG_KEYS } from "./constants";

let checkInterval: NodeJS.Timeout | undefined;
let lastAppliedTheme: string | undefined;

export function activate(context: vscode.ExtensionContext) {
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


export function deactivate() {
  stopIntervalCheck();
  console.log(vscode.l10n.t("ChronoShade extension deactivated."));
}
