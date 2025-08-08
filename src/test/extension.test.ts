import * as assert from "assert";
import * as vscode from "vscode";
import { activate, deactivate } from "../extension";

suite("ChronoShade Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  let context: vscode.ExtensionContext;

  suiteSetup(async () => {
    context = { subscriptions: [] } as unknown as vscode.ExtensionContext;
    activate(context);
  });

  suiteTeardown(() => {
    deactivate();
  });

  test("Check if ChronoShade is activated", async () => {
    const extension = vscode.extensions.getExtension(
      "markusmorita.chronoshade"
    );
    assert.ok(extension, "ChronoShade extension should be installed");

    if (extension && !extension.isActive) {
      await extension.activate();
    }

    assert.strictEqual(
      extension?.isActive,
      true,
      "ChronoShade should be activated"
    );
  });

  test("Manual sunrise/sunset settings", async () => {
    const config = vscode.workspace.getConfiguration("chronoShade");
    await config.update("manualSunrise", "06:30", true);
    await config.update("manualSunset", "18:30", true);

    const storedSunrise = config.get<string>("manualSunrise");
    const storedSunset = config.get<string>("manualSunset");
    assert.strictEqual(
      storedSunrise,
      "06:30",
      "Manual sunrise time should be correctly stored and retrieved"
    );
    assert.strictEqual(
      storedSunset,
      "18:30",
      "Manual sunset time should be correctly stored and retrieved"
    );
  });

  test("Theme switching settings are saved correctly", async () => {
    const config = vscode.workspace.getConfiguration("chronoShade");

    await config.update("dayTheme", "Light+", true);
    await config.update("nightTheme", "Dark+", true);
    await config.update("overrideThemeSwitch", true, true);
    await config.update("manualSunrise", "07:00", true);
    await config.update("manualSunset", "19:00", true);

    assert.strictEqual(config.get<string>("dayTheme"), "Light+");
    assert.strictEqual(config.get<string>("nightTheme"), "Dark+");
    assert.strictEqual(config.get<boolean>("overrideThemeSwitch"), true);
    assert.strictEqual(config.get<string>("manualSunrise"), "07:00");
    assert.strictEqual(config.get<string>("manualSunset"), "19:00");
  });

  test("Theme should switch correctly based on time", async () => {
    const config = vscode.workspace.getConfiguration("chronoShade");

    await config.update("dayTheme", "Light+", true);
    await config.update("nightTheme", "Dark+", true);
    await config.update("manualSunrise", "07:00", true);
    await config.update("manualSunset", "19:00", true);
    await config.update("overrideThemeSwitch", true, true);

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const expectedTheme =
      currentHour >= 19 || currentHour < 7 ? "Dark+" : "Light+";

    const appliedTheme = vscode.workspace
      .getConfiguration("workbench")
      .get<string>("colorTheme");
    assert.strictEqual(
      appliedTheme,
      expectedTheme,
      `Theme should be ${expectedTheme} based on time`
    );
  });
});
