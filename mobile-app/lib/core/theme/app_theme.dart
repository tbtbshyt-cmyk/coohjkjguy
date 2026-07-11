// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color gold = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFE5C04B);
  static const Color goldDark = Color(0xFF947418);
  static const Color ink = Color(0xFF0A0A0A);
  static const Color inkSoft = Color(0xFF141414);
  static const Color inkCard = Color(0xFF1A1A1A);
  static const Color muted = Color(0xFFA0AEC0);
  static const Color success = Color(0xFF51CF66);
  static const Color danger = Color(0xFFFF6B6B);
}

class AppTheme {
  static ThemeData light() => _build(Brightness.light);
  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness b) {
    final isDark = b == Brightness.dark;
    final base = isDark ? ThemeData.dark() : ThemeData.light();
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.gold,
      brightness: b,
      primary: AppColors.gold,
      secondary: AppColors.goldLight,
      surface: isDark ? AppColors.inkSoft : Colors.white,
    );

    return base.copyWith(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: isDark ? AppColors.ink : const Color(0xFFF7F7F7),
      textTheme: GoogleFonts.notoSansArabicTextTheme(base.textTheme).apply(
        bodyColor: isDark ? Colors.white : Colors.black87,
        displayColor: isDark ? Colors.white : Colors.black87,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: isDark ? AppColors.inkSoft : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.notoSansArabic(
          color: isDark ? Colors.white : Colors.black87,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: isDark ? AppColors.inkCard : Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.ink,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.notoSansArabic(fontWeight: FontWeight.bold, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.gold,
          side: const BorderSide(color: AppColors.gold, width: 1),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? AppColors.inkCard : Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold, width: 2)),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.gold.withOpacity(0.1),
        labelStyle: GoogleFonts.notoSansArabic(color: AppColors.goldDark, fontWeight: FontWeight.bold),
        side: BorderSide.none,
      ),
      dividerColor: isDark ? Colors.white12 : Colors.black12,
    );
  }
}