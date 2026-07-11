// lib/main.dart — Bootstrap
// Initializes Hive, sets up providers, runs the app.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

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

  // Init Firebase (FCM for push notifications)
  if (kFirebaseEnabled) {
    await Firebase.initializeApp();
  }

  // Build Dio HTTP client
  final dio = buildDioClient();

  runApp(ProviderScope(
    overrides: [
      dioProvider.overrideWithValue(dio),
    ],
    child: const AbuBisharApp(),
  ));
}

class AbuBisharApp extends ConsumerStatefulWidget {
  const AbuBisharApp({super.key});

  @override
  ConsumerState<AbuBisharApp> createState() => _AbuBisharAppState();
}

class _AbuBisharAppState extends ConsumerState<AbuBisharApp> {
  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'أبو بشار',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.dark, // Default to gold-on-black signature look
      routerConfig: router,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('ar'), Locale('en')],
      locale: const Locale('ar'),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
    );
  }
}

const bool kFirebaseEnabled = bool.fromEnvironment('FIREBASE_ENABLED');