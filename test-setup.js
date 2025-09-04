#!/usr/bin/env node

/**
 * Test Setup Script for Geo-Tagging App
 * This script helps verify that the app is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Geo-Tagging App Setup Verification\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'App.tsx',
  'src/types/index.ts',
  'src/services/CameraService.ts',
  'src/services/LocationService.ts',
  'src/services/PermissionService.ts',
  'src/components/CameraView.tsx',
  'src/components/ImageGallery.tsx',
  'src/components/ImageDetailView.tsx',
  'ios/GeoTagging/Info.plist',
  'android/app/src/main/AndroidManifest.xml',
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react-native-vision-camera',
    'react-native-image-picker',
    '@react-native-community/geolocation',
    'react-native-permissions',
    'react-native-fs',
    'exif-js',
    'react-native-vector-icons'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
  allFilesExist = false;
}

// Check iOS permissions
console.log('\n🍎 Checking iOS permissions...');
try {
  const infoPlist = fs.readFileSync('ios/GeoTagging/Info.plist', 'utf8');
  const iosPermissions = [
    'NSCameraUsageDescription',
    'NSLocationWhenInUseUsageDescription',
    'NSPhotoLibraryUsageDescription'
  ];

  iosPermissions.forEach(permission => {
    if (infoPlist.includes(permission)) {
      console.log(`✅ ${permission}`);
    } else {
      console.log(`❌ ${permission} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading iOS Info.plist');
  allFilesExist = false;
}

// Check Android permissions
console.log('\n🤖 Checking Android permissions...');
try {
  const androidManifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
  const androidPermissions = [
    'android.permission.CAMERA',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE'
  ];

  androidPermissions.forEach(permission => {
    if (androidManifest.includes(permission)) {
      console.log(`✅ ${permission}`);
    } else {
      console.log(`❌ ${permission} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading Android manifest');
  allFilesExist = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 All checks passed! The app is ready to run.');
  console.log('\n📱 To run the app:');
  console.log('   iOS: npx react-native run-ios');
  console.log('   Android: npx react-native run-android');
} else {
  console.log('❌ Some checks failed. Please review the missing items above.');
}
console.log('='.repeat(50));
