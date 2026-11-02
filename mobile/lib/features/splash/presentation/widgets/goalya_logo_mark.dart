import 'package:flutter/material.dart';

/// Logo textuel GOALYA — remplacer par `Image.asset` quand le branding est prêt.
class GoalyaLogoMark extends StatelessWidget {
  const GoalyaLogoMark({super.key, this.size = 120});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size * 0.35,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF3DDC97), width: 2),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF3DDC97).withValues(alpha: 0.25),
                blurRadius: 24,
              ),
            ],
          ),
          child: Text(
            'GOALYA',
            style: TextStyle(
              fontSize: size * 0.18,
              fontWeight: FontWeight.w800,
              letterSpacing: 4,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Coupe du monde · aventure personnelle',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.72),
            fontSize: 13,
            height: 1.3,
          ),
        ),
      ],
    );
  }
}
