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
  const device = devices.back;
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const locationService = LocationService.getInstance();
  const cameraService = CameraService.getInstance();
  const permissionService = PermissionService.getInstance();

  useEffect(() => {
    initializeCamera();
    return () => {
      locationService.stopWatchingLocation();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      
      // Check permissions
      const permissions = await permissionService.checkAllPermissions();
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

      // Check if location services are enabled
      const locationEnabled = await locationService.isLocationEnabled();
      setIsLocationEnabled(locationEnabled);

      if (locationEnabled) {
        // Get current location
        try {
          const location = await locationService.getCurrentLocation();
          setCurrentLocation(location);
        } catch (error) {
          console.warn('Failed to get initial location:', error);
        }

        // Start watching location
        locationService.watchLocation(
          (location) => {
            setCurrentLocation(location);
          },
          (error) => {
            console.warn('Location watch error:', error);
          }
        );
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      Alert.alert('Error', 'Failed to initialize camera');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!camera.current || !hasPermission) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      setIsLoading(true);
      
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });

      const imageMetadata: ImageMetadata = {
        uri: `file://${photo.path}`,
        width: photo.width,
        height: photo.height,
        timestamp: Date.now(),
        location: currentLocation || undefined,
      };

      onImageCaptured(imageMetadata);
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
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
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Camera not available</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
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
      />
      
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
  locationStatus: {
    position: 'absolute',
    top: 50,
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
