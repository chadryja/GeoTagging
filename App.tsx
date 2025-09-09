/**
 * Geo-Tagging App
 * A React Native app for capturing and managing geo-tagged images
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CameraView } from './src/components/CameraView';
import { ImageGallery } from './src/components/ImageGallery';
import { ImageDetailView } from './src/components/ImageDetailView';
import { CameraService } from './src/services/CameraService';
import { PermissionService } from './src/services/PermissionService';
import { ImageMetadata, AppState } from './src/types';

type AppScreen = 'gallery' | 'camera' | 'detail';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('gallery');
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [appState, setAppState] = useState<AppState>({
    images: [],
    currentLocation: null,
    isLoading: false,
    error: null,
    permissions: { camera: false, location: false },
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const cameraService = CameraService.getInstance();
  const permissionService = PermissionService.getInstance();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      console.log('Checking permissions...');
      const permissions = await permissionService.arePermissionsGranted();
      console.log('Permission check result:', permissions);
      setAppState(prev => ({ ...prev, permissions }));
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('Requesting permissions...');
      const permissions = await permissionService.checkAllPermissions();
      console.log('Permission request result:', permissions);
      setAppState(prev => ({ ...prev, permissions }));
      
      // Show alert with permission status
      Alert.alert(
        'Permission Status',
        `Camera: ${permissions.camera ? 'Granted' : 'Denied'}\nLocation: ${permissions.location ? 'Granted' : 'Denied'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to check permissions');
    }
  };

  const handleImageCaptured = async (image: ImageMetadata) => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `geo_image_${timestamp}.jpg`;
      
      // Save image with metadata
      await cameraService.saveImageWithMetadata(image, filename);
      
      // Refresh gallery
      setRefreshTrigger(prev => prev + 1);
      
      // Go back to gallery
      setCurrentScreen('gallery');
      
      Alert.alert('Success', 'Image saved successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleImagePress = (image: ImageMetadata) => {
    setSelectedImage(image);
    setCurrentScreen('detail');
  };

  const handleDeleteImage = async (image: ImageMetadata) => {
    try {
      await cameraService.deleteImage(image.uri);
      setRefreshTrigger(prev => prev + 1);
      setCurrentScreen('gallery');
      Alert.alert('Success', 'Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'camera':
        return (
          <CameraView
            onImageCaptured={handleImageCaptured}
            onClose={() => setCurrentScreen('gallery')}
          />
        );
      
      case 'detail':
        return selectedImage ? (
          <ImageDetailView
            image={selectedImage}
            onClose={() => setCurrentScreen('gallery')}
            onDelete={handleDeleteImage}
          />
        ) : null;
      
      case 'gallery':
      default:
        return (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Geo-Tagging</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Text style={styles.permissionButtonText}>Request Permissions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.cameraButton,
                    !appState.permissions.camera && styles.disabledButton
                  ]}
                  onPress={() => {
                    console.log('Camera button pressed, current permissions:', appState.permissions);
                    setCurrentScreen('camera');
                  }}
                  disabled={false} // Allow camera button to work, handle permissions in camera view
                >
                  <Text style={styles.cameraButtonText}>📷</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Permission Status Debug */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Camera: {appState.permissions.camera ? '✅' : '❌'} | 
                Location: {appState.permissions.location ? '✅' : '❌'}
              </Text>
            </View>
            
            {appState.isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}
            
            <ImageGallery
              onImagePress={handleImagePress}
              refreshTrigger={refreshTrigger}
            />
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cameraButtonText: {
    fontSize: 24,
  },
  permissionButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default App;
