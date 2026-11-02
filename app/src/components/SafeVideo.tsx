import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

type Source = number | { uri: string };

type Props = {
  source: Source;
  style?: StyleProp<ViewStyle>;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  onEnd?: () => void;
};

/** Vidéo compatible Expo Go (WebView) — évite ExpoVideoView manquant. */
export const SafeVideo = memo(function SafeVideo({
  source,
  style,
  shouldPlay = true,
  isLooping = false,
  isMuted = true,
  onEnd,
}: Props) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          if (!cancelled) setUri(asset.localUri ?? asset.uri);
        } else if (source?.uri) {
          if (!cancelled) setUri(source.uri);
        }
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
    const safe = uri.replace(/"/g, '%22');
    return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>html,body{margin:0;width:100%;height:100%;background:#000;overflow:hidden}video{width:100%;height:100%;object-fit:cover}</style>
</head><body>
<video id="v" src="${safe}" ${shouldPlay ? 'autoplay' : ''} ${isMuted ? 'muted' : ''} ${isLooping ? 'loop' : ''} playsinline webkit-playsinline></video>
<script>
var v=document.getElementById('v');
v.muted=${isMuted ? 'true' : 'false'};
v.loop=${isLooping ? 'true' : 'false'};
function play(){if(${shouldPlay ? 'true' : 'false'})v.play().catch(function(){})}
v.addEventListener('loadeddata',play);
v.addEventListener('ended',function(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage('ended')});
play();
</script></body></html>`;
  }, [uri, shouldPlay, isLooping, isMuted]);

  return (
    <View style={[styles.box, style]} collapsable={false}>
      {html ? (
        <WebView
          source={{ html }}
          style={StyleSheet.absoluteFill}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          onMessage={(e) => {
            if (e.nativeEvent.data === 'ended') onEnd?.();
          }}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: { backgroundColor: '#000', overflow: 'hidden' },
});
