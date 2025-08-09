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