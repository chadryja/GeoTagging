# Geo-Tagging App

A React Native TypeScript application for capturing and managing geo-tagged images with timestamping functionality.

## Features

- 📷 **Camera Integration**: Take photos with high-quality camera interface
- 📍 **GPS Location Services**: Automatic geo-tagging with precise coordinates
- ⏰ **Timestamping**: Automatic timestamp recording for all images
- 🖼️ **Image Gallery**: View and manage captured images
- 📱 **Cross-Platform**: Works on both iOS and Android
- 🔒 **Permission Management**: Proper handling of camera and location permissions
- 💾 **Local Storage**: Images and metadata stored locally on device

## Technical Stack

- **React Native 0.81.1** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **React Native Vision Camera 4.7.2** - Modern camera implementation
- **React Native Image Picker 7.1.0** - Gallery access
- **React Native Geolocation 3.2.1** - GPS location services
- **React Native Permissions 4.1.5** - Permission management
- **React Native FS 2.20.0** - File system operations

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GeoTagging
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   - Ensure Android SDK is installed
   - No additional setup required

## Running the App

### iOS
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## Permissions

### iOS Permissions (Info.plist)
- `NSCameraUsageDescription`: Camera access for taking photos
- `NSLocationWhenInUseUsageDescription`: Location access for geo-tagging
- `NSPhotoLibraryUsageDescription`: Photo library access for selecting images

### Android Permissions (AndroidManifest.xml)
- `CAMERA`: Camera access
- `ACCESS_FINE_LOCATION`: Precise location access
- `ACCESS_COARSE_LOCATION`: Approximate location access
- `READ_EXTERNAL_STORAGE`: Read storage access
- `WRITE_EXTERNAL_STORAGE`: Write storage access
- `READ_MEDIA_IMAGES`: Media images access

## Project Structure

```
src/
├── components/
│   ├── CameraView.tsx          # Camera interface component
│   ├── ImageGallery.tsx        # Image gallery component
│   └── ImageDetailView.tsx     # Image detail view component
├── services/
│   ├── CameraService.ts        # Camera and image handling
│   ├── LocationService.ts      # GPS location services
│   └── PermissionService.ts    # Permission management
└── types/
    └── index.ts                # TypeScript type definitions
```

## Key Components

### CameraView
- Full-screen camera interface
- Real-time location display
- Photo capture with geo-tagging
- Gallery access

### ImageGallery
- Grid view of captured images
- Image metadata display
- Delete functionality
- Refresh capability

### ImageDetailView
- Detailed image information
- Location coordinates
- Timestamp data
- EXIF data display

## Services

### CameraService
- Image capture and processing
- Metadata management
- File storage operations
- EXIF data handling

### LocationService
- GPS location tracking
- High-accuracy positioning
- Location watching
- Service availability checking

### PermissionService
- Permission request handling
- Cross-platform permission management
- User-friendly permission dialogs

## Usage

1. **Launch the app** - The app starts with the image gallery
2. **Grant permissions** - Allow camera and location access when prompted
3. **Take photos** - Tap the camera button to capture geo-tagged images
4. **View images** - Browse captured images in the gallery
5. **View details** - Tap any image to see detailed information including location
6. **Manage images** - Delete unwanted images with long press

## Features in Detail

### Geo-Tagging
- Automatic GPS coordinate capture
- High-accuracy location services
- Real-time location display
- Location metadata storage

### Timestamping
- Automatic timestamp recording
- Precise capture time tracking
- Human-readable date/time display
- Metadata preservation

### Image Management
- Local storage on device
- Metadata preservation
- Image compression
- File organization

## Testing

### iOS Testing
1. Run on iOS Simulator or physical device
2. Test camera functionality
3. Verify location permissions
4. Test image capture and storage
5. Verify geo-tagging accuracy

### Android Testing
1. Run on Android Emulator or physical device
2. Test camera functionality
3. Verify location permissions
4. Test image capture and storage
5. Verify geo-tagging accuracy

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Check camera permissions
   - Ensure device has camera hardware
   - Restart the app

2. **Location not available**
   - Check location permissions
   - Ensure location services are enabled
   - Test in outdoor environment

3. **Images not saving**
   - Check storage permissions
   - Ensure sufficient device storage
   - Restart the app

### Debug Mode
- Enable React Native debugger
- Check console logs for errors
- Verify permission states
- Test on physical devices

## Future Enhancements

- [ ] Cloud storage integration
- [ ] Image sharing functionality
- [ ] Map view integration
- [ ] Batch image operations
- [ ] Image editing capabilities
- [ ] Export functionality
- [ ] Backup and restore

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.