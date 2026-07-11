# 📱 Mobile App — أبو بشار

Flutter 3 mobile app for أبو بشار.

## Stack
- **Flutter 3** (Dart 3)
- **Riverpod** for state management
- **Hive** for offline-first storage (8 boxes, encrypted)
- **Dio** with disk cache interceptor
- **freezed** + **json_serializable** for models
- **GoRouter** with auth-aware redirects
- **cached_network_image** for fast scrolling
- **firebase_messaging** for push notifications
- **mobile_scanner** for QR codes
- **Noto Sans Arabic** font
- **Arabic RTL** + number/date locale

## Develop
```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1/abecp
```

## Build
```bash
./scripts/deploy.sh apk    # split-per-abi APKs (8-10 MB each)
./scripts/deploy.sh aab    # AAB for Play Store
./scripts/deploy.sh ipa    # iOS (macOS only)
```

## Push to GitHub
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
./scripts/push-to-github.sh tbtbshyt-cmyk coohjkjguy
```

## Auto-Build APKs
After pushing, GitHub Actions runs `.github/workflows/flutter-build.yml` and produces:
- `app-arm64-v8a-release.apk` (10 MB)
- `app-armeabi-v7a-release.apk` (8 MB)
- `app-release.apk` (universal)
- `app-release.aab` (Play Store)
- `Runner.ipa` (iOS)
