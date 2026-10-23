// src/services/systemThemeService.ts
import { exec } from "child_process";

export type SystemTheme = "light" | "dark";

const EXEC_TIMEOUT_MS = 2000;

interface ExecFailure extends Error {
  code?: number | string | null;
  killed?: boolean;
  signal?: NodeJS.Signals | null;
  stderr?: string;
}

function execAsync(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: EXEC_TIMEOUT_MS }, (error, stdout, stderr) => {
      if (error) {
        (error as ExecFailure).stderr = stderr;
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

export function parseWindowsLightThemeValue(stdout: string): SystemTheme | null {
  const match = stdout.match(/AppsUseLightTheme\s+REG_DWORD\s+(0x[0-9a-fA-F]+)/);
  if (!match) {
    return null;
  }
  return parseInt(match[1], 16) === 0 ? "dark" : "light";
}

export function parseGnomeColorScheme(stdout: string): SystemTheme | null {
  const value = stdout.trim().toLowerCase();
  if (!value) {
    return null;
  }
  return value.includes("prefer-dark") ? "dark" : "light";
}

export function parseGnomeGtkTheme(stdout: string): SystemTheme | null {
  const value = stdout.trim().toLowerCase();
  if (!value) {
    return null;
  }
  return value.includes("dark") ? "dark" : "light";
}

/**
 * "defaults read" exits with code 1 and a "does not exist" message when the
 * key is genuinely absent, which is exactly what happens in Light mode -
 * that case can be confidently read as "light". Anything else (a timeout, a
 * killed process, a spawn error) is inconclusive and must NOT be treated as
 * a confirmed Light reading, or a single slow/contended exec call (more
 * likely now that detection polls every 15s) would flip the theme even
 * though the OS setting never actually changed.
 */
export function classifyMacDefaultsFailure(failure: {
  code?: number | string | null;
  killed?: boolean;
  signal?: string | null;
  stderr?: string;
}): SystemTheme | null {
  const timedOut = failure.killed === true || Boolean(failure.signal);
  const missingKey = failure.code === 1 && !timedOut && /does not exist/i.test(failure.stderr || "");
  return missingKey ? "light" : null;
}

async function getMacTheme(): Promise<SystemTheme | null> {
  try {
    const stdout = await execAsync("defaults read -g AppleInterfaceStyle");
    return stdout.trim().toLowerCase() === "dark" ? "dark" : "light";
  } catch (error) {
    return classifyMacDefaultsFailure(error as ExecFailure);
  }
}

async function getWindowsTheme(): Promise<SystemTheme | null> {
  try {
    const stdout = await execAsync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme'
    );
    return parseWindowsLightThemeValue(stdout);
  } catch {
    return null;
  }
}

async function getLinuxTheme(): Promise<SystemTheme | null> {
  try {
    const stdout = await execAsync("gsettings get org.gnome.desktop.interface color-scheme");
    const parsed = parseGnomeColorScheme(stdout);
    if (parsed) {
      return parsed;
    }
  } catch {
    // Key may not exist on older GNOME versions; fall through to gtk-theme.
  }

  try {
    const stdout = await execAsync("gsettings get org.gnome.desktop.interface gtk-theme");
    return parseGnomeGtkTheme(stdout);
  } catch {
    return null;
  }
}

/**
 * Detects the OS-level Light/Dark appearance setting. Returns null when the
 * platform is unsupported, the required tooling is missing, or detection
 * otherwise fails (e.g. a headless/remote session) - callers should fall
 * back to another schedule in that case rather than treating it as an error.
 */
export async function getSystemTheme(): Promise<SystemTheme | null> {
  switch (process.platform) {
    case "darwin":
      return getMacTheme();
    case "win32":
      return getWindowsTheme();
    case "linux":
      return getLinuxTheme();
    default:
      return null;
  }
}
