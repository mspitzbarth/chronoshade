import * as vscode from "vscode";

interface SunriseSunsetResponse {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

export interface SunriseSunsetTimes {
  sunrise: string;
  sunset: string;
}

export class SunriseSunsetService {
  private static readonly API_BASE_URL = 'https://api.sunrise-sunset.org/json';
  
  /**
   * Fetch sunrise and sunset times for given coordinates
   */
  public static async getSunriseSunsetTimes(
    latitude: number,
    longitude: number
  ): Promise<SunriseSunsetTimes> {
    try {
      const url = `${this.API_BASE_URL}?lat=${latitude}&lng=${longitude}&formatted=0`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as SunriseSunsetResponse;
      
      if (data.status !== 'OK') {
        throw new Error(`API error: ${data.status}`);
      }
      
      // Convert UTC times to local time and format as HH:MM
      const sunrise = this.convertUtcToLocalTime(data.results.sunrise);
      const sunset = this.convertUtcToLocalTime(data.results.sunset);
      
      return { sunrise, sunset };
      
    } catch (error) {
      console.error('Error fetching sunrise/sunset data:', error);
      throw new Error(
        vscode.l10n.t('Failed to fetch sunrise/sunset times. Please check your internet connection and coordinates.')
      );
    }
  }
  
  /**
   * Convert UTC time string to local time in HH:MM format
   */
  private static convertUtcToLocalTime(utcTimeString: string): string {
    // Parse the UTC time string and convert to local timezone
    const utcDate = new Date(utcTimeString);
    
    // Get local time by using toLocaleTimeString with proper timezone handling
    const localTimeString = utcDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Validate the result
    if (!localTimeString || localTimeString === 'Invalid Date') {
      throw new Error('Failed to convert UTC time to local time');
    }
    
    return localTimeString;
  }
  
  /**
   * Validate latitude and longitude values
   */
  public static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && 
      latitude <= 90 && 
      longitude >= -180 && 
      longitude <= 180 &&
      !isNaN(latitude) && 
      !isNaN(longitude)
    );
  }
  
  /**
   * Get user-friendly error message for coordinate validation
   */
  public static getCoordinateValidationError(latitude: number, longitude: number): string {
    if (isNaN(latitude) || isNaN(longitude)) {
      return vscode.l10n.t('Latitude and longitude must be valid numbers.');
    }
    
    if (latitude < -90 || latitude > 90) {
      return vscode.l10n.t('Latitude must be between -90 and 90 degrees.');
    }
    
    if (longitude < -180 || longitude > 180) {
      return vscode.l10n.t('Longitude must be between -180 and 180 degrees.');
    }
    
    return '';
  }
}