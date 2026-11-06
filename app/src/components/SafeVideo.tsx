import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';
import {
  YOUTUBE_EMBED_ORIGIN,
  preferredYoutubeMode,
  youtubeEmbedHtml,
  youtubeIdFromUri,
  youtubeWatchUrl,
  type YoutubePlaybackMode,
} from '../utils/youtube';

type Source = number | { uri: string };

type Props = {
  source: Source;
  style?: StyleProp<ViewStyle>;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  onEnd?: () => void;
  /** Titre pour choisir embed vs watch (résumés → watch). */
  titleHint?: string | null;
  /** Forcer le mode de lecture YouTube. */
  youtubeMode?: YoutubePlaybackMode;
};

/**
 * MP4 → HTML5.
 * YouTube → embed si autorisé, sinon page m.youtube.com (résumés @manutd).
 */
export const SafeVideo = memo(function SafeVideo({
  source,
  style,
  shouldPlay = true,
  isLooping = false,
  isMuted = true,
  onEnd,
  titleHint,
  youtubeMode,
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

  const ytId = uri ? youtubeIdFromUri(uri) : null;
  const mode: YoutubePlaybackMode = youtubeMode ?? preferredYoutubeMode(titleHint);
  const useWatch = mode === 'watch';

  const ytHtml = useMemo(() => {
    if (!ytId || !shouldPlay || useWatch) return null;
    return youtubeEmbedHtml(ytId, { autoplay: true, mute: isMuted, loop: isLooping, controls: true });
  }, [ytId, shouldPlay, useWatch, isMuted, isLooping]);

  const watchUrl = ytId && shouldPlay && useWatch ? youtubeWatchUrl(ytId) : null;

  const html = useMemo(() => {
    if (!uri || ytId) return null;
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
  }, [uri, ytId, shouldPlay, isLooping, isMuted]);

  if (ytId) {
    if (!shouldPlay) {
      return <View style={[styles.box, style]} collapsable={false} />;
    }

    if (ytHtml) {
      return (
        <View style={[styles.box, style]} collapsable={false}>
          <WebView
            source={{ html: ytHtml, baseUrl: YOUTUBE_EMBED_ORIGIN }}
            style={StyleSheet.absoluteFill}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            bounces={false}
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
            mixedContentMode="always"
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
          />
        </View>
      );
    }

    if (watchUrl) {
      return (
        <View style={[styles.box, style]} collapsable={false}>
          <WebView
            source={{
              uri: watchUrl,
              headers: { Referer: 'https://m.youtube.com/' },
            }}
            style={StyleSheet.absoluteFill}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            bounces={false}
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
            mixedContentMode="always"
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            onShouldStartLoadWithRequest={(req) => {
              const u = req.url ?? '';
              if (u.startsWith('about:')) return true;
              if (/youtube\.com|youtu\.be|google\.com|googlevideo\.com|ytimg\.com|gstatic\.com/i.test(u)) {
                return true;
              }
              if (/^intent:|^market:|^vnd\.youtube/i.test(u)) return false;
              return false;
            }}
          />
        </View>
      );
    }

    return <View style={[styles.box, style]} collapsable={false} />;
  }

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
