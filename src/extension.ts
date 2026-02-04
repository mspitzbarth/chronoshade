import * as vscode from "vscode";
import { ChronoShadeSidebar } from "./sidebar";
import { ConfigurationService } from "./services/configurationService";
import { ThemeSwitchService } from "./services/themeSwitchService";
import { INTERVALS } from "./constants";


let intervalId: NodeJS.Timeout | undefined;


export async function activate(context: vscode.ExtensionContext) {
  console.log(vscode.l10n.t("ChronoShade extension activated!"));

  // Initialize services
  ConfigurationService.updateConfiguration({}); // Ensure defaults
  await ThemeSwitchService.fetchAndCacheLocationTimes();



  const sidebarProvider = new ChronoShadeSidebar(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "chronoShade.sidebar",
      sidebarProvider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.switchTheme", async () => {
      // Logic for quick pick theme switcher could go here
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.startIntervalCheck", () => {
      startIntervalCheck();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.stopIntervalCheck", () => {
      stopIntervalCheck();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.checkThemeSwitch", async () => {
      await ThemeSwitchService.checkAndSwitchTheme();
    })
  );

  // Internal commands for sidebar interaction
  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.forceDayTheme", async () => {
      await ThemeSwitchService.applyDayTheme();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.forceNightTheme", async () => {
      await ThemeSwitchService.applyNightTheme();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.openMenu", async () => {
      const selection = await vscode.window.showQuickPick([
        { label: "Check Theme Switch", description: "Force a check of the theme switch logic" },
        { label: "Open Settings", description: "Configure ChronoShade" }
      ]);

      if (selection) {
        if (selection.label === "Check Theme Switch") {
          await ThemeSwitchService.checkAndSwitchTheme();
        } else if (selection.label === "Open Settings") {
          vscode.commands.executeCommand("workbench.action.openSettings", "chronoShade");
        }
      }
    })
  );

  // Listen for configuration changes
  context.subscriptions.push(
    ConfigurationService.onConfigurationChanged(async (e) => {
      const config = ConfigurationService.getConfiguration();

      if (e.affectsConfiguration("chronoShade.overrideThemeSwitch")) {
        if (config.overrideThemeSwitch) {
          startIntervalCheck();
        } else {
          stopIntervalCheck();
        }
      }
    })
  );

  // Initial check
  const config = ConfigurationService.getConfiguration();
  if (config.overrideThemeSwitch) {
    startIntervalCheck();
  }
}

function startIntervalCheck() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  // Run immediately
  ThemeSwitchService.checkAndSwitchTheme().catch(console.error);

  intervalId = setInterval(() => {
    ThemeSwitchService.checkAndSwitchTheme().catch(console.error);
  }, INTERVALS.THEME_CHECK_INTERVAL);
}

function stopIntervalCheck() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

export function deactivate() {
  stopIntervalCheck();
  console.log(vscode.l10n.t("ChronoShade extension deactivated."));
}
