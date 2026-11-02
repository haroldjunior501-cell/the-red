import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config/app_config.dart';

/// Client Socket.IO namespace `/live` — à brancher après auth Firebase.
class LiveSocketClient {
  LiveSocketClient(this._config);

  final AppConfig _config;
  io.Socket? _socket;

  void connect({void Function(dynamic data)? onLiveEvent}) {
    _socket = io.io(
      '${_config.wsBaseUrl}/live',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setPath('/socket.io')
          .build(),
    );
    _socket!.connect();
    _socket!.onConnect((_) {
      if (kDebugMode) {
        // ignore: avoid_print
        print('[GOALYA] Socket connecté: ${_config.wsBaseUrl}/live');
      }
    });
    _socket!.on('live:event', (data) => onLiveEvent?.call(data));
  }

  void dispose() {
    _socket?.dispose();
    _socket = null;
  }
}
