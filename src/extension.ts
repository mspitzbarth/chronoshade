import * as vscode from "vscode";
import { ChronoShadeSidebar } from "./sidebar";
import { ConfigurationService } from "./services/configurationService";
import { ThemeSwitchService } from "./services/themeSwitchService";
import { INTERVALS } from "./constants";

let checkInterval: NodeJS.Timeout | undefined;

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
    vscode.commands.registerCommand("chronoShade.checkThemeSwitch", () => ThemeSwitchService.checkAndSwitchTheme())
  );


  // Always start interval check on activation, regardless of sidebar visibility
  const config = ConfigurationService.getConfiguration();
  if (config.overrideThemeSwitch) {
    // If using location-based times, fetch sunrise/sunset on startup
    if (config.useLocationBasedTimes) {
      await ThemeSwitchService.fetchAndCacheLocationTimes();
    }
    startIntervalCheck();
  }
}


function startIntervalCheck() {
  stopIntervalCheck(); // clear any existing interval
  ThemeSwitchService.checkAndSwitchTheme(); // run immediately
  checkInterval = setInterval(() => ThemeSwitchService.checkAndSwitchTheme(), INTERVALS.THEME_CHECK_INTERVAL);
}

function stopIntervalCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = undefined;
  }
}


export function deactivate() {
  stopIntervalCheck();
  console.log(vscode.l10n.t("ChronoShade extension deactivated."));
}
