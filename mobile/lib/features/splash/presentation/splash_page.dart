import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_config.dart';
import '../../../core/providers/app_config_provider.dart';
import 'widgets/goalya_logo_mark.dart';
import 'widgets/video_background_shell.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  static const routePath = '/';

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final AppConfig config = ref.watch(appConfigProvider);

    return Scaffold(
      body: VideoBackgroundShell(
        assetPath: config.videoBackgroundAsset,
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const GoalyaLogoMark(size: 128),
                  const SizedBox(height: 36),
                  FadeTransition(
                    opacity: Tween<double>(begin: 0.85, end: 1).animate(
                      CurvedAnimation(parent: _pulse, curve: Curves.easeInOut),
                    ),
                    child: Text(
                      'Synchronisé avec le mondial',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                  SizedBox(
                    height: 120,
                    child: _SplashMotion(controller: _pulse),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'API · ${config.apiBaseUrl}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.35),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Zone prête pour Lottie (`lottie` dans [pubspec]) ; ici pulse synchronisé avec le logo.
class _SplashMotion extends StatelessWidget {
  const _SplashMotion({required this.controller});

  final AnimationController controller;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: controller,
        builder: (context, child) {
          final t = CurvedAnimation(
            parent: controller,
            curve: Curves.easeInOut,
          ).value;
          final scale = 0.92 + t * 0.14;
          return Transform.scale(
            scale: scale,
            child: child,
          );
        },
        child: Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: const Color(0xFF3DDC97).withValues(alpha: 0.45),
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF3DDC97).withValues(alpha: 0.2),
                blurRadius: 28,
              ),
            ],
          ),
          alignment: Alignment.center,
          child: const Icon(
            Icons.sports_soccer,
            size: 44,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
