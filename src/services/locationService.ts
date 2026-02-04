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
  private static readonly API_URL = "http://ip-api.com/json";

  public static async detectLocation(): Promise<IpApiResponse> {
    try {
      const response = await fetch(LocationService.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as IpApiResponse;

      if (data.status === "fail") {
        throw new Error(data.message || "Failed to detect location.");
      }

      return data;
    } catch (error) {
      vscode.window.showErrorMessage(
        vscode.l10n.t("ChronoShade: Failed to detect location automatically. Error: {0}", String(error))
      );
      throw error;
    }
  }
}
