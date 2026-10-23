import * as vscode from "vscode";
import { ChronoShadeSidebar } from "./sidebar";
import { ConfigurationService } from "./services/configurationService";
import { ThemeSwitchService } from "./services/themeSwitchService";
import { StatusBarService } from "./services/statusBarService";
import { ReviewPromptService } from "./services/reviewPromptService";
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
      sidebarProvider,
      // Keep the view alive when collapsed so reopening it doesn't reload and flash.
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  StatusBarService.register(context);
  ReviewPromptService.maybeShowPrompt(context);

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
      StatusBarService.update();
    })
  );

  // Internal commands for sidebar interaction
  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.forceDayTheme", async () => {
      await ThemeSwitchService.applyDayTheme();
      StatusBarService.update();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.forceNightTheme", async () => {
      await ThemeSwitchService.applyNightTheme();
      StatusBarService.update();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("chronoShade.openMenu", async () => {
      const selection = await vscode.window.showQuickPick([
        { label: vscode.l10n.t("Switch to Day"), description: vscode.l10n.t("Apply your day theme now") },
        { label: vscode.l10n.t("Switch to Night"), description: vscode.l10n.t("Apply your night theme now") },
        { label: vscode.l10n.t("Check Theme Switch"), description: vscode.l10n.t("Force a check of the theme switch logic") },
        { label: vscode.l10n.t("Open Settings"), description: vscode.l10n.t("Configure ChronoShade") }
      ]);

      if (!selection) {
        return;
      }

      if (selection.label === vscode.l10n.t("Switch to Day")) {
        await vscode.commands.executeCommand("chronoShade.forceDayTheme");
      } else if (selection.label === vscode.l10n.t("Switch to Night")) {
        await vscode.commands.executeCommand("chronoShade.forceNightTheme");
      } else if (selection.label === vscode.l10n.t("Check Theme Switch")) {
        await vscode.commands.executeCommand("chronoShade.checkThemeSwitch");
      } else if (selection.label === vscode.l10n.t("Open Settings")) {
        vscode.commands.executeCommand("workbench.action.openSettings", "chronoShade");
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
      } else if (e.affectsConfiguration("chronoShade.systemThemeSync") && config.overrideThemeSwitch) {
        // Restart so the interval cadence (fast-poll for OS sync vs. normal) picks up the change
        startIntervalCheck();
      }

      StatusBarService.update();
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      StatusBarService.update();
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
  ThemeSwitchService.checkAndSwitchTheme().then(() => StatusBarService.update()).catch(console.error);

  const { systemThemeSync } = ConfigurationService.getConfiguration();
  const delay = systemThemeSync ? INTERVALS.SYSTEM_THEME_CHECK_INTERVAL : INTERVALS.THEME_CHECK_INTERVAL;

  intervalId = setInterval(() => {
    ThemeSwitchService.checkAndSwitchTheme().then(() => StatusBarService.update()).catch(console.error);
  }, delay);
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
