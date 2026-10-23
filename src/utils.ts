// src/utils.ts
// Utility functions for ChronoShade extension
// This file contains helper functions for time validation and formatting

export function isValidTimeFormat(timeStr: string): boolean {
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

export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(n => parseInt(n));
  return hours * 60 + minutes;
}

export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Picks a theme to apply for a given phase (day/night). When a pool of
 * multiple themes is configured, one is chosen at random; an empty pool
 * falls back to the single configured theme, keeping existing single-theme
 * setups behaving exactly as before.
 *
 * If `currentTheme` is already a valid pick it is kept, so repeated checks
 * within the same phase (and other VS Code windows sharing the global
 * colorTheme setting) don't keep re-rolling and flipping the theme.
 */
export function pickThemeFromPool(pool: readonly string[], fallbackTheme: string, currentTheme?: string): string {
  const candidates = pool.filter((theme) => theme && theme.trim().length > 0);
  if (candidates.length === 0) {
    return fallbackTheme;
  }
  if (currentTheme && candidates.includes(currentTheme)) {
    return currentTheme;
  }
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}