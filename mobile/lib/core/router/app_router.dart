import 'package:go_router/go_router.dart';

import '../../features/splash/presentation/splash_page.dart';

final appRouter = GoRouter(
  initialLocation: SplashPage.routePath,
  routes: [
    GoRoute(
      path: SplashPage.routePath,
      builder: (context, state) => const SplashPage(),
    ),
  ],
);
