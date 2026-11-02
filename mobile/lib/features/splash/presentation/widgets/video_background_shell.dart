import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

/// Fond vidéo optionnel ; si [assetPath] est null, affiche un dégradé immersif.
class VideoBackgroundShell extends StatefulWidget {
  const VideoBackgroundShell({
    super.key,
    required this.child,
    this.assetPath,
  });

  final Widget child;
  final String? assetPath;

  @override
  State<VideoBackgroundShell> createState() => _VideoBackgroundShellState();
}

class _VideoBackgroundShellState extends State<VideoBackgroundShell> {
  VideoPlayerController? _controller;

  @override
  void initState() {
    super.initState();
    final path = widget.assetPath;
    if (path != null && path.isNotEmpty) {
      _controller = VideoPlayerController.asset(path)
        ..setLooping(true)
        ..initialize().then((_) {
          if (mounted) {
            setState(() {});
            _controller?.play();
          }
        });
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = _controller;
    return Stack(
      fit: StackFit.expand,
      children: [
        if (c != null && c.value.isInitialized)
          FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: c.value.size.width,
              height: c.value.size.height,
              child: VideoPlayer(c),
            ),
          )
        else
          const _GradientBackdrop(),
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withValues(alpha: 0.35),
                Colors.black.withValues(alpha: 0.75),
              ],
            ),
          ),
        ),
        widget.child,
      ],
    );
  }
}

class _GradientBackdrop extends StatelessWidget {
  const _GradientBackdrop();

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0B1020),
            Color(0xFF152238),
            Color(0xFF0E1A2E),
          ],
        ),
      ),
    );
  }
}
