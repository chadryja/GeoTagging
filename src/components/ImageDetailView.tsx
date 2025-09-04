import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { ImageMetadata } from '../types';

const { width, height } = Dimensions.get('window');

interface ImageDetailViewProps {
  image: ImageMetadata;
  onClose: () => void;
  onDelete?: (image: ImageMetadata) => void;
}

export const ImageDetailView: React.FC<ImageDetailViewProps> = ({ 
  image, 
  onClose, 
  onDelete 
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(image),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Details</Text>
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(image.timestamp)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{formatTime(image.timestamp)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dimensions:</Text>
            <Text style={styles.infoValue}>{image.width} × {image.height}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Size:</Text>
            <Text style={styles.infoValue}>{formatFileSize(image.fileSize)}</Text>
          </View>
        </View>

        {/* Location Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          {image.location ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Latitude:</Text>
                <Text style={styles.infoValue}>{image.location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Longitude:</Text>
                <Text style={styles.infoValue}>{image.location.longitude.toFixed(6)}</Text>
              </View>
              {image.location.altitude && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Altitude:</Text>
                  <Text style={styles.infoValue}>{image.location.altitude.toFixed(2)} m</Text>
                </View>
              )}
              {image.location.accuracy && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Accuracy:</Text>
                  <Text style={styles.infoValue}>±{image.location.accuracy.toFixed(2)} m</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location Time:</Text>
                <Text style={styles.infoValue}>{formatTime(image.location.timestamp)}</Text>
              </View>
              
              {/* Map Link */}
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => {
                  const url = `https://maps.google.com/?q=${image.location.latitude},${image.location.longitude}`;
                  Alert.alert(
                    'Open in Maps',
                    'This would open the location in Google Maps',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.mapButtonText}>📍 View on Map</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noLocationContainer}>
              <Text style={styles.noLocationText}>No location data available</Text>
              <Text style={styles.noLocationSubtext}>
                This image was taken without location services enabled
              </Text>
            </View>
          )}
        </View>

        {/* EXIF Data */}
        {image.exifData && Object.keys(image.exifData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXIF Data</Text>
            {Object.entries(image.exifData).map(([key, value]) => (
              <View key={key} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{key}:</Text>
                <Text style={styles.infoValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: 'white',
    margin: 16,
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
    height: height * 0.4,
    resizeMode: 'contain',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  mapButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
