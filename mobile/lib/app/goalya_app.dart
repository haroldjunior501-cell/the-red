import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/router/app_router.dart';
import '../core/theme/app_theme.dart';

class GoalyaApp extends ConsumerWidget {
  const GoalyaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'GOALYA',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(),
      routerConfig: appRouter,
    );
  }
}
