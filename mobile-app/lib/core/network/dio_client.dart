// lib/core/network/dio_client.dart
import 'package:dio/dio.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';
import 'package:dio_cache_interceptor_hive_store/dio_cache_interceptor_hive_store.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive/hive.dart';

import 'api_config.dart';
import '../storage/hive_boxes.dart';

const _kAccessToken = 'abv_admin_token';
const _kRefreshToken = 'abv_refresh_token';
const _kGuestToken = 'abv_guest_token';

final dioProvider = Provider<Dio>((_) => throw UnimplementedError('overridden in main'));

Dio buildDioClient() {
  final dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: ApiConfig.connectTimeout,
    receiveTimeout: ApiConfig.receiveTimeout,
    sendTimeout: ApiConfig.sendTimeout,
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'ar',
    },
  ));

  // Cache GET requests on disk for offline browsing
  final cacheStore = HiveCacheStore(HiveBoxes.cacheBox);
  dio.interceptors.add(DioCacheInterceptor(
    options: CacheOptions(
      store: cacheStore,
      policy: CachePolicy.request,
      hitCacheOnErrorExcept: [401, 403],
      maxStale: const Duration(days: 7),
      priority: CachePriority.normal,
    ),
  ));

  // Auth + guest token injection + auto-refresh
  const secure = FlutterSecureStorage();
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await secure.read(key: _kAccessToken);
      if (token != null) options.headers['Authorization'] = 'Bearer $token';

      // Guest token (for carts and analytics)
      String? guest = await secure.read(key: _kGuestToken);
      guest ??= 'gt_${DateTime.now().millisecondsSinceEpoch}_${Hive.box('app').length}';
      await secure.write(key: _kGuestToken, value: guest);
      options.headers['X-Guest-Token'] = guest;

      handler.next(options);
    },
    onError: (e, handler) async {
      if (e.response?.statusCode == 401 && e.requestOptions.path != '/auth/admin/refresh') {
        final refresh = await secure.read(key: _kRefreshToken);
        if (refresh != null) {
          try {
            final r = await Dio(BaseOptions(baseUrl: ApiConfig.baseUrl)).post(
              '/auth/admin/refresh',
              data: {'refreshToken': refresh},
            );
            final newToken = r.data['data']['accessToken'] as String;
            await secure.write(key: _kAccessToken, value: newToken);
            final retry = e.requestOptions;
            retry.headers['Authorization'] = 'Bearer $newToken';
            final cloned = await dio.fetch(retry);
            return handler.resolve(cloned);
          } catch (_) {
            await secure.delete(key: _kAccessToken);
            await secure.delete(key: _kRefreshToken);
          }
        }
      }
      handler.next(e);
    },
  ));

  // Logging in debug
  // dio.interceptors.add(LogInterceptor(responseBody: true));

  return dio;
}