## Platform Guides

### Android

#### Building APK for Physical Device

**Method 1: EAS Build (Recommended)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview

# Wait ~10-15 minutes for cloud build
# Download APK and install on phone
```

**Method 2: Local Build (Advanced)**
```bash
# Requires Android Studio installed

# Prebuild native Android project
npx expo prebuild -p android

# Navigate to android folder
cd android

# Build APK
.\gradlew assembleRelease

# Find APK at:
# android\app\build\outputs\apk\release\app-release.apk
```

**Method 3: Development Build with Hot Reload (Emulator)**
```bash
# One-time setup: Build and install development client
# Make sure Android emulator is running first
npm run android

# This builds the native app and installs it on your emulator
# Takes a few minutes the first time
# Close the Metro bundler that auto-starts after this completes

# Daily development workflow (fast!)
npm run dev   # alias for: npm start

# Then in Metro terminal:
# - Press 'a' to open on Android (or auto-connects if app already open)
# - Changes hot reload instantly (seconds, not minutes)

# What requires rebuild vs hot reload:
# - Hot reloads (no rebuild needed):
#   • All JavaScript/TypeScript code changes
#   • React component changes
#   • Style changes
#   • Asset changes (images, etc.)
#
# - Requires rebuild (npm run android again):
#   • Adding new native expo packages
#   • Changes to app.json config
#   • Android manifest changes
#   • Gradle dependency changes

# Pro tip: Keep npm run dev running while coding for instant feedback
```

**Method 4: Development Build on Physical Device**
```bash
# Option A: Via USB (fastest)
# 1. Enable USB debugging on phone (Settings → Developer Options)
# 2. Connect phone via USB
# 3. Verify connection: adb devices
# 4. Build and install: npm run android
# 5. Start Metro: npm run dev
# App auto-connects or scan QR code with the installed app (NOT Expo Go)

# Option B: Via APK (manual install)
# 1. Build debug APK:
npx expo prebuild -p android
cd android
.\gradlew assembleDebug
cd ..
# APK location: android\app\build\outputs\apk\debug\app-debug.apk

# 2. Transfer APK to phone (email, drive, or adb install)
# 3. Install APK on phone (allow unknown sources if prompted)
# 4. Start Metro: npm run dev
# 5. Open app on phone - should auto-connect, or scan QR code

# Important: Phone must be on same WiFi network as computer for hot reload
# If connection fails, check firewall allows port 8081
```
