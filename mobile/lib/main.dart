import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/goalya_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Firebase : après `flutterfire configure`, décommenter :
  // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(
    const ProviderScope(
      child: GoalyaApp(),
    ),
  );
}
