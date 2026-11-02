import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:goalya/app/goalya_app.dart';

void main() {
  testWidgets('Splash affiche GOALYA', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: GoalyaApp(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.textContaining('GOALYA'), findsOneWidget);
  });
}
