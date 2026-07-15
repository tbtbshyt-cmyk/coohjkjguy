// lib/main.dart — Bootstrap (minimal, builds clean)
// Initializes Hive, sets up providers, runs the app.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app/router.dart';
import 'core/theme/app_theme.dart';
import 'core/storage/hive_boxes.dart';
import 'core/network/dio_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait on phones (RTL full screen)
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  // Init Hive (disk cache + offline catalog)
  await Hive.initFlutter();
  await HiveBoxes.init();

  runApp(const ProviderScope(
    child: AbuBisharApp(),
  ));
}

class AbuBisharApp extends ConsumerWidget {
  const AbuBisharApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'أبو بشار',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.light,
      routerConfig: appRouter,
      builder: (context, child) {
        // Force RTL
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
