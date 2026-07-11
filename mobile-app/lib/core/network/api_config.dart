// lib/core/network/api_config.dart
// Update this to your machine's LAN IP when running on physical device.
// `adb reverse tcp:3000 tcp:3000` lets you use `localhost` on Android.

class ApiConfig {
  // Override at build time:
  //   flutter run --dart-define=API_BASE_URL=https://api.abu-bishar.com/api/v1/abecp
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1/abecp', // Android emulator localhost
  );

  static const String cdnUrl = String.fromEnvironment(
    'CDN_URL',
    defaultValue: 'https://cdn.abu-bishar.com',
  );

  static const Duration connectTimeout = Duration(seconds: 8);
  static const Duration receiveTimeout = Duration(seconds: 12);
  static const Duration sendTimeout = Duration(seconds: 12);

  // App-wide constants
  static const String appName = 'أبو بشار';
  static const String currency = 'ر.ي';
  static const String phoneCountryCode = '+967';

  // Admin fallback (used by Admin panel inside the app)
  static const String defaultAdminEmail = 'tbashyalo566@gmail.com';
}