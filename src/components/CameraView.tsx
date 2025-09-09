import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { LocationService } from '../services/LocationService';
import { CameraService } from '../services/CameraService';
import { PermissionService } from '../services/PermissionService';
import { ImageMetadata, LocationData } from '../types';

const { width, height } = Dimensions.get('window');

interface CameraViewProps {
  onImageCaptured: (image: ImageMetadata) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onImageCaptured, onClose }) => {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);

  const locationService = LocationService.getInstance();
  const cameraService = CameraService.getInstance();
  const permissionService = PermissionService.getInstance();

  useEffect(() => {
    initializeCamera();
    return () => {
      locationService.stopWatchingLocation();
    };
  }, []);

  // Handle device changes
  useEffect(() => {
    console.log('Device changed:', device);
    if (device && hasPermission) {
      setCameraInitialized(true);
    }
  }, [device, hasPermission]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing camera...');
      console.log('Available devices:', devices);
      console.log('Back device:', device);
      
      // First check current permission status
      const currentPermissions = await permissionService.arePermissionsGranted();
      console.log('Current permissions:', currentPermissions);
      
      // If permissions are not granted, request them
      if (!currentPermissions.camera || !currentPermissions.location) {
        console.log('Requesting permissions...');
        const permissions = await permissionService.checkAllPermissions();
        console.log('Permission request result:', permissions);
        setHasPermission(permissions.camera && permissions.location);

        if (!permissions.camera) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          onClose();
          return;
        }

        if (!permissions.location) {
          Alert.alert('Permission Required', 'Location permission is required for geo-tagging.');
          onClose();
          return;
        }
      } else {
        console.log('Permissions already granted');
        setHasPermission(true);
      }

      // Wait a bit for camera devices to be available
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Check if camera device is available
      console.log('Checking camera device availability...');
      console.log('Devices after wait:', devices);
      console.log('Back device after wait:', device);
      
      if (!device) {
        console.error('No camera device available');
        Alert.alert('Camera Error', 'No camera device found. Please check if your device has a camera.');
        onClose();
        return;
      }

      // Check if location services are enabled
      console.log('Checking location services...');
      const locationEnabled = await locationService.isLocationEnabled();
      setIsLocationEnabled(locationEnabled);
      console.log('Location enabled:', locationEnabled);

      if (locationEnabled) {
        // Get current location
        try {
          console.log('Getting current location...');
          const location = await locationService.getCurrentLocation();
          setCurrentLocation(location);
          console.log('Location obtained:', location);
        } catch (error) {
          console.warn('Failed to get initial location:', error);
        }

        // Start watching location
        locationService.watchLocation(
          (location) => {
            console.log('Location updated:', location);
            setCurrentLocation(location);
          },
          (error) => {
            console.warn('Location watch error:', error);
          }
        );
      }
      
      setCameraInitialized(true);
      console.log('Camera initialization completed successfully');
    } catch (error) {
      console.error('Camera initialization error:', error);
      Alert.alert('Error', 'Failed to initialize camera: ' + (error as Error).message);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    console.log('Take photo called, camera:', !!camera.current, 'hasPermission:', hasPermission);
    
    if (!camera.current) {
      Alert.alert('Error', 'Camera not initialized. Please try again.');
      return;
    }
    
    if (!hasPermission) {
      Alert.alert('Error', 'Camera permission not granted. Please retry.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Taking photo...');
      
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      console.log('Photo captured:', photo);

      const imageMetadata: ImageMetadata = {
        uri: `file://${photo.path}`,
        width: photo.width,
        height: photo.height,
        timestamp: Date.now(),
        location: currentLocation || undefined,
      };

      console.log('Image metadata created:', imageMetadata);
      onImageCaptured(imageMetadata);
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      setIsLoading(true);
      const imageMetadata = await cameraService.pickImageFromGallery();
      
      if (currentLocation) {
        const geoTaggedImage = cameraService.addLocationToImage(imageMetadata, currentLocation);
        onImageCaptured(geoTaggedImage);
      } else {
        onImageCaptured(imageMetadata);
      }
    } catch (error) {
      console.error('Gallery pick error:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={initializeCamera}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { marginTop: 10, backgroundColor: '#666' }]} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device || !cameraInitialized) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {!device ? 'Camera not available' : 'Initializing camera...'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={initializeCamera}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { marginTop: 10, backgroundColor: '#666' }]} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        enableZoomGesture={true}
        enableFpsGraph={false}
      />
      
      {/* Debug Status */}
      <View style={styles.debugStatus}>
        <Text style={styles.debugText}>
          Device: {device ? '✅' : '❌'} | 
          Permission: {hasPermission ? '✅' : '❌'} | 
          Init: {cameraInitialized ? '✅' : '❌'}
        </Text>
      </View>

      {/* Location Status */}
      <View style={styles.locationStatus}>
        <Text style={styles.locationText}>
          {isLocationEnabled 
            ? currentLocation 
              ? `📍 ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
              : '📍 Getting location...'
            : '📍 Location disabled'
          }
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.captureButton, isLoading && styles.captureButtonDisabled]} 
          onPress={takePhoto}
          disabled={isLoading}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  debugStatus: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 6,
  },
  locationStatus: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
