import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../providers/app_config_provider.dart';

final dioProvider = Provider<Dio>((ref) {
  final config = ref.watch(appConfigProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: config.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ),
  );
  dio.interceptors.add(
    LogInterceptor(requestBody: true, responseBody: true),
  );
  return dio;
});

/// Dio sans dépendance Riverpod (tests / isolates).
Dio createDio(AppConfig config) {
  return Dio(
    BaseOptions(
      baseUrl: config.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );
}
