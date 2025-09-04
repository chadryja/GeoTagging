import Geolocation from '@react-native-community/geolocation';
import { LocationData } from '../types';

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get current location with high accuracy
   */
  public getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy || undefined,
            timestamp: position.timestamp,
          };
          resolve(locationData);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  /**
   * Watch location changes
   */
  public watchLocation(
    onLocationUpdate: (location: LocationData) => void,
    onError?: (error: Error) => void
  ): number {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy || undefined,
          timestamp: position.timestamp,
        };
        onLocationUpdate(locationData);
      },
      (error) => {
        if (onError) {
          onError(new Error(`Location watch error: ${error.message}`));
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    );

    return this.watchId;
  }

  /**
   * Stop watching location
   */
  public stopWatchingLocation(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Check if location services are enabled
   */
  public isLocationEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 1000, maximumAge: 0 }
      );
    });
  }
}
