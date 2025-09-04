import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraService } from '../services/CameraService';
import { ImageMetadata } from '../types';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 2; // 2 columns with margins

interface ImageGalleryProps {
  onImagePress: (image: ImageMetadata) => void;
  refreshTrigger?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ onImagePress, refreshTrigger }) => {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cameraService = CameraService.getInstance();

  useEffect(() => {
    loadImages();
  }, [refreshTrigger]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const savedImages = await cameraService.loadSavedImages();
      setImages(savedImages);
    } catch (err) {
      setError('Failed to load images');
      console.error('Error loading images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (image: ImageMetadata) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cameraService.deleteImage(image.uri);
              await loadImages(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderImageItem = ({ item }: { item: ImageMetadata }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => onImagePress(item)}
      onLongPress={() => deleteImage(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
      
      <View style={styles.imageInfo}>
        <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        
        {item.location && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        
        {!item.location && (
          <Text style={styles.noLocationText}>No location data</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading images...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadImages}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No images found</Text>
        <Text style={styles.emptySubtext}>Take some photos to see them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Photos ({images.length})</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadImages}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

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
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  imageContainer: {
    width: imageSize,
    marginBottom: 16,
    marginHorizontal: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: imageSize,
    resizeMode: 'cover',
  },
  imageInfo: {
    padding: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  locationInfo: {
    marginTop: 4,
  },
  locationText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  noLocationText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
