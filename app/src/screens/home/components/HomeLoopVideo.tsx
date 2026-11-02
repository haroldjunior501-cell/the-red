import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

export type HomeLoopVideoProps = {
  /** `require('...mp4')` module id */
  source: number;
  style?: StyleProp<ViewStyle>;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
};

/**
 * Fond vidéo compatible Expo Go.
 * `expo-av` Video plante (ViewManager ExpoVideoView manquant) sur certaines builds ;
 * on lit donc le fichier local dans une WebView HTML5.
 */
export const HomeLoopVideo = memo(function HomeLoopVideo({
  source,
  style,
  shouldPlay = true,
  isLooping = true,
  isMuted = true,
}: HomeLoopVideoProps) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(source);
        await asset.downloadAsync();
        if (!cancelled) setUri(asset.localUri ?? asset.uri);
      } catch {
        if (!cancelled) setUri(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const html = useMemo(() => {
    if (!uri) return null;
    const safeUri = uri.replace(/"/g, '%22');
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; background:#050203; overflow:hidden; }
    video { width:100%; height:100%; object-fit:cover; background:#050203; }
  </style>
</head>
<body>
  <video
    id="v"
    src="${safeUri}"
    ${shouldPlay ? 'autoplay' : ''}
    ${isMuted ? 'muted' : ''}
    ${isLooping ? 'loop' : ''}
    playsinline
    webkit-playsinline
    preload="auto"
  ></video>
  <script>
    var v = document.getElementById('v');
    v.muted = ${isMuted ? 'true' : 'false'};
    v.loop = ${isLooping ? 'true' : 'false'};
    function tryPlay(){ if(${shouldPlay ? 'true' : 'false'}){ v.play().catch(function(){}); } }
    v.addEventListener('loadeddata', tryPlay);
    tryPlay();
  </script>
</body>
</html>`;
  }, [uri, shouldPlay, isLooping, isMuted]);

  return (
    <View collapsable={false} style={[StyleSheet.absoluteFill, styles.bg, style]} pointerEvents="none">
      {html ? (
        <WebView
          source={{ html }}
          style={StyleSheet.absoluteFill}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={false}
          scrollEnabled={false}
          bounces={false}
          setSupportMultipleWindows={false}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          pointerEvents="none"
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  bg: { backgroundColor: '#050203' },
});
