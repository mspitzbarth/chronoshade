// src/services/statusBarService.ts
import * as vscode from "vscode";
import { ConfigurationService } from "./configurationService";
import { isValidTimeFormat } from "../utils";

export class StatusBarService {
  private static item: vscode.StatusBarItem | undefined;

  public static register(context: vscode.ExtensionContext): void {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = "chronoShade.openMenu";
    context.subscriptions.push(this.item);
    this.update();
    this.item.show();
  }

  public static update(): void {
    if (!this.item) {
      return;
    }

    const config = ConfigurationService.getConfiguration();
    const currentTheme = vscode.workspace.getConfiguration("workbench").get<string>("colorTheme");
    const isNight = currentTheme === config.nightTheme && currentTheme !== config.dayTheme;

    this.item.text = isNight
      ? vscode.l10n.t("\u{1F319} Night")
      : vscode.l10n.t("☀ Day");

    const sourceLabel = this.getSourceLabel(config);
    const lines = [vscode.l10n.t("ChronoShade: {0}", sourceLabel)];

    if (!config.systemThemeSync && !config.useCronSchedule && !config.useLocationBasedTimes) {
      const nextSwitch = this.getNextManualSwitch(config.manualSunrise, config.manualSunset);
      if (nextSwitch) {
        lines.push(vscode.l10n.t("Next switch: {0}", nextSwitch));
      }
    }

    lines.push(vscode.l10n.t("Click to open the ChronoShade menu"));
    this.item.tooltip = lines.join("\n");
  }

  private static getSourceLabel(config: ReturnType<typeof ConfigurationService.getConfiguration>): string {
    if (!config.overrideThemeSwitch) {
      return vscode.l10n.t("Automatic switching disabled");
    }
    if (config.systemThemeSync) {
      return vscode.l10n.t("Synced with OS appearance");
    }
    if (config.useCronSchedule) {
      return vscode.l10n.t("Cron schedule");
    }
    if (config.useLocationBasedTimes) {
      return vscode.l10n.t("GPS location");
    }
    return vscode.l10n.t("Manual times");
  }

  private static getNextManualSwitch(sunrise: string, sunset: string): string | null {
    if (!isValidTimeFormat(sunrise) || !isValidTimeFormat(sunset)) {
      return null;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sunriseMinutes = this.toMinutes(sunrise);
    const sunsetMinutes = this.toMinutes(sunset);

    const upcoming = [sunriseMinutes, sunsetMinutes]
      .filter((minutes) => minutes > currentMinutes)
      .sort((a, b) => a - b);

    const nextMinutes = upcoming.length > 0 ? upcoming[0] : Math.min(sunriseMinutes, sunsetMinutes);
    return this.fromMinutes(nextMinutes);
  }

  private static toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private static fromMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}
