import * as vscode from "vscode";

export interface IpApiResponse {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  message?: string; // For error messages
}

export class LocationService {
  private static readonly API_URL = "https://freeipapi.com/api/json";

  public static async detectLocation(): Promise<IpApiResponse> {
    try {
      const response = await fetch(LocationService.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: \${response.status}`);
      }
      const data = await response.json() as any;

      // Map freeipapi.com response to our existing IpApiResponse interface
      return {
        query: data.ipAddress || "",
        status: "success",
        country: data.countryName || "",
        countryCode: data.countryCode || "",
        region: data.regionName || "",
        regionName: data.regionName || "",
        city: data.cityName || "",
        zip: data.zipCode || "",
        lat: data.latitude || 0,
        lon: data.longitude || 0,
        timezone: data.timeZone || "",
        isp: "",
        org: "",
        as: ""
      };
    } catch (error) {
      const errorMessage = String(error);
      let userMessage = vscode.l10n.t("ChronoShade: Failed to detect location automatically. Error: {0}", errorMessage);

      if (errorMessage.includes("fetch failed")) {
        userMessage = vscode.l10n.t("ChronoShade: Location detection failed. Please ensure you have an active internet connection. If you are on a remote machine, automatic detection may be restricted by security policies.");
      }

      vscode.window.showErrorMessage(userMessage);
      throw error;
    }
  }
}
