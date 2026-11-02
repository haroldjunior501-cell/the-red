/// Configuration runtime (remplacer par --dart-define ou flavors).
class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.wsBaseUrl,
    this.videoBackgroundAsset,
  });

  final String apiBaseUrl;
  final String wsBaseUrl;
  final String? videoBackgroundAsset;

  /// Android emulator → 10.0.2.2 ; iOS simulator → localhost ; device → IP LAN.
  static AppConfig fromEnvironment() {
    const api = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://10.0.2.2:3000/api',
    );
    const ws = String.fromEnvironment(
      'WS_BASE_URL',
      defaultValue: 'http://10.0.2.2:3000',
    );
    const video = String.fromEnvironment(
      'SPLASH_VIDEO_ASSET',
      defaultValue: '',
    );
    return AppConfig(
      apiBaseUrl: api,
      wsBaseUrl: ws,
      videoBackgroundAsset: video.isEmpty ? null : video,
    );
  }
}
