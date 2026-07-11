#!/usr/bin/env bash
# ============================================================================
#  أبو بشار — Deploy & Build helper
#  Usage:  ./scripts/deploy.sh [command]
#  Commands:
#    setup       — Initial flutter pub get + generate files
#    gen         — Run code generation (freezed, json_serializable, hive)
#    lint        — Format + analyze
#    test        — Run all tests
#    apk         — Build release APK (split-per-abi)
#    aab         — Build AAB for Play Store
#    ipa         — Build iOS .ipa (requires macOS + signing)
#    apk-debug   — Build debug APK + install to connected device
#    clean       — Clean all build artifacts
#    --help      — Show this help
# ============================================================================

set -e
cd "$(dirname "$0")/.."

API_URL="${API_BASE_URL:-https://api.abu-bishar.com/api/v1/abecp}"
CDN_URL="${CDN_URL:-https://cdn.abu-bishar.com}"

print_banner() {
  echo ""
  echo "╔════════════════════════════════════════╗"
  echo "║   🏪 أبو بشار — Deploy Helper          ║"
  echo "╚════════════════════════════════════════╝"
  echo ""
}

print_banner

CMD="${1:-setup}"
case "$CMD" in
  setup)
    echo "📦 Installing dependencies..."
    flutter pub get
    echo "🔧 Generating code (freezed/json/hive)..."
    dart run build_runner build --delete-conflicting-outputs
    echo ""
    echo "✅ Setup complete!"
    echo "   Next: ./scripts/deploy.sh apk"
    ;;

  gen)
    echo "🔧 Running build_runner..."
    dart run build_runner build --delete-conflicting-outputs
    ;;

  lint)
    echo "🎨 Checking formatting..."
    dart format --output=none --set-exit-if-changed lib/
    echo "🔍 Analyzing..."
    flutter analyze --no-pub
    ;;

  test)
    echo "🧪 Running tests..."
    flutter test --no-pub
    ;;

  apk)
    echo "📱 Building release APKs (arm64-v8a, armeabi-v7a, universal)..."
    flutter build apk --release --split-per-abi \
      --dart-define=API_BASE_URL="$API_URL" \
      --dart-define=CDN_URL="$CDN_URL"
    echo ""
    echo "✅ Build complete!"
    echo "   📂 $(pwd)/build/app/outputs/flutter-apk/"
    ls -lh build/app/outputs/flutter-apk/*.apk 2>/dev/null
    ;;

  aab)
    echo "📦 Building App Bundle for Play Store..."
    flutter build appbundle --release \
      --dart-define=API_BASE_URL="$API_URL" \
      --dart-define=CDN_URL="$CDN_URL"
    echo ""
    echo "✅ AAB built!"
    echo "   📂 $(pwd)/build/app/outputs/bundle/release/app-release.aab"
    ;;

  ipa)
    if [[ "$OSTYPE" != "darwin"* ]]; then
      echo "❌ iOS builds require macOS + Xcode + signing identity"
      echo "   Use GitHub Actions 'build-ios' job instead"
      exit 1
    fi
    echo "🍎 Building iOS (this takes ~10 min)..."
    cd ios && pod install && cd ..
    flutter build ios --release --no-codesign \
      --dart-define=API_BASE_URL="$API_URL" \
      --dart-define=CDN_URL="$CDN_URL"
    echo ""
    echo "✅ iOS build complete!"
    echo "   📂 $(pwd)/build/ios/iphoneos/"
    ;;

  apk-debug)
    echo "🐛 Building debug APK + installing to device..."
    flutter build apk --debug
    flutter install
    ;;

  clean)
    echo "🧹 Cleaning..."
    flutter clean
    rm -rf .dart_tool build .flutter-plugins
    dart pub get
    echo "✅ Clean!"
    ;;

  --help|help)
    grep "^  [a-z]" "$0" | sed 's/^/  /'
    ;;

  *)
    echo "Unknown command: $CMD"
    echo "Try: ./scripts/deploy.sh --help"
    exit 1
    ;;
esac