import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ImageMetadata, LocationData } from '../types';
import RNFS from 'react-native-fs';
import EXIF from 'exif-js';

export class CameraService {
  private static instance: CameraService;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Take photo with camera
   */
  public async takePhoto(): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          reject(new Error(response.errorMessage || 'Camera cancelled'));
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const imageMetadata: ImageMetadata = {
            uri: asset.uri || '',
            width: asset.width || 0,
            height: asset.height || 0,
            fileSize: asset.fileSize,
            timestamp: Date.now(),
          };

          resolve(imageMetadata);
        } else {
          reject(new Error('No image captured'));
        }
      });
    });
  }

  /**
   * Pick image from gallery
   */
  public async pickImageFromGallery(): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          reject(new Error(response.errorMessage || 'Gallery picker cancelled'));
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const imageMetadata: ImageMetadata = {
            uri: asset.uri || '',
            width: asset.width || 0,
            height: asset.height || 0,
            fileSize: asset.fileSize,
            timestamp: Date.now(),
          };

          resolve(imageMetadata);
        } else {
          reject(new Error('No image selected'));
        }
      });
    });
  }

  /**
   * Add location data to image metadata
   */
  public addLocationToImage(
    imageMetadata: ImageMetadata,
    location: LocationData
  ): ImageMetadata {
    return {
      ...imageMetadata,
      location,
    };
  }

  /**
   * Save image with metadata to device storage
   */
  public async saveImageWithMetadata(
    imageMetadata: ImageMetadata,
    filename: string
  ): Promise<string> {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const imagePath = `${documentsPath}/${filename}`;

      // Copy the image to our app directory
      await RNFS.copyFile(imageMetadata.uri, imagePath);

      // Create metadata file
      const metadataPath = `${documentsPath}/${filename}.json`;
      const metadata = {
        ...imageMetadata,
        path: imagePath,
        savedAt: Date.now(),
      };

      await RNFS.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

      return imagePath;
    } catch (error) {
      throw new Error(`Failed to save image: ${error}`);
    }
  }

  /**
   * Load saved images from device storage
   */
  public async loadSavedImages(): Promise<ImageMetadata[]> {
    try {
      const documentsPath = RNFS.DocumentDirectoryPath;
      const files = await RNFS.readDir(documentsPath);
      
      const imageFiles = files.filter(file => 
        file.name.endsWith('.json') && 
        !file.name.includes('.json.json')
      );

      const images: ImageMetadata[] = [];
      
      for (const file of imageFiles) {
        try {
          const content = await RNFS.readFile(file.path, 'utf8');
          const metadata = JSON.parse(content);
          images.push(metadata);
        } catch (error) {
          console.warn(`Failed to load metadata for ${file.name}:`, error);
        }
      }

      return images.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      throw new Error(`Failed to load saved images: ${error}`);
    }
  }

  /**
   * Delete image and its metadata
   */
  public async deleteImage(imagePath: string): Promise<void> {
    try {
      const metadataPath = `${imagePath}.json`;
      
      // Delete the image file
      if (await RNFS.exists(imagePath)) {
        await RNFS.unlink(imagePath);
      }
      
      // Delete the metadata file
      if (await RNFS.exists(metadataPath)) {
        await RNFS.unlink(metadataPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  /**
   * Extract EXIF data from image
   */
  public async extractEXIFData(imageUri: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // For React Native, we'll use a simplified approach
      // In a real app, you might want to use react-native-exif or similar
      resolve({});
    });
  }
}
