import { Platform, Alert } from 'react-native';
import { request, check, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { CameraPermission } from '../types';

export class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Request camera permission
   */
  public async requestCameraPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) as Permission;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        this.showPermissionAlert('Camera', 'Camera permission is required to take photos.');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        this.showPermissionAlert('Camera', 'Camera permission is blocked. Please enable it in settings.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Request location permission
   */
  public async requestLocationPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      }) as Permission;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        this.showPermissionAlert('Location', 'Location permission is required for geo-tagging.');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        this.showPermissionAlert('Location', 'Location permission is blocked. Please enable it in settings.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Request photo library permission (for iOS)
   */
  public async requestPhotoLibraryPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true; // Android doesn't need this permission
    }

    try {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        this.showPermissionAlert('Photo Library', 'Photo library permission is required to access your photos.');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        this.showPermissionAlert('Photo Library', 'Photo library permission is blocked. Please enable it in settings.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting photo library permission:', error);
      return false;
    }
  }

  /**
   * Check all required permissions
   */
  public async checkAllPermissions(): Promise<CameraPermission> {
    const cameraPermission = await this.requestCameraPermission();
    const locationPermission = await this.requestLocationPermission();
    const photoLibraryPermission = await this.requestPhotoLibraryPermission();

    return {
      camera: cameraPermission,
      location: locationPermission,
    };
  }

  /**
   * Show permission alert
   */
  private showPermissionAlert(permission: string, message: string): void {
    Alert.alert(
      `${permission} Permission Required`,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => {
          // In a real app, you might want to open settings
          console.log('Open settings');
        }},
      ]
    );
  }

  /**
   * Check camera permission status without requesting
   */
  public async checkCameraPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) as Permission;

      console.log('Checking camera permission:', permission);
      const result = await check(permission);
      console.log('Camera permission result:', result);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  }

  /**
   * Check location permission status without requesting
   */
  public async checkLocationPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      }) as Permission;

      console.log('Checking location permission:', permission);
      const result = await check(permission);
      console.log('Location permission result:', result);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  /**
   * Check photo library permission status without requesting (iOS only)
   */
  public async checkPhotoLibraryPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return true; // Android doesn't need this permission
    }

    try {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking photo library permission:', error);
      return false;
    }
  }

  /**
   * Check if permissions are granted (without requesting them)
   */
  public async arePermissionsGranted(): Promise<CameraPermission> {
    try {
      const cameraPermission = await this.checkCameraPermission();
      const locationPermission = await this.checkLocationPermission();

      return {
        camera: cameraPermission,
        location: locationPermission,
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: false,
        location: false,
      };
    }
  }
}
