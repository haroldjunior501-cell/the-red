import 'package:flutter/material.dart';

/// Palette immersive (nuit / stade / néons discrets).
class AppTheme {
  static ThemeData dark() {
    const seed = Color(0xFF0B1020);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF3DDC97),
        brightness: Brightness.dark,
        surface: seed,
      ),
      scaffoldBackgroundColor: seed,
      fontFamily: 'Roboto',
    );
  }
}
