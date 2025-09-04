export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export interface ImageMetadata {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  timestamp: number;
  location?: LocationData;
  exifData?: any;
}

export interface GeoTaggedImage extends ImageMetadata {
  id: string;
  name: string;
  path: string;
  isGeoTagged: boolean;
}

export interface CameraPermission {
  camera: boolean;
  location: boolean;
}

export interface AppState {
  images: GeoTaggedImage[];
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  permissions: CameraPermission;
}
