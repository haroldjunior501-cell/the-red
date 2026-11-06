import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, UNITED_RED } from '../constants/colors';
import {
  YOUTUBE_EMBED_ORIGIN,
  preferredYoutubeMode,
  youtubeEmbedHtml,
  youtubeIdFromUri,
  youtubeWatchUrl,
  type YoutubePlaybackMode,
} from '../utils/youtube';

export type YoutubePlayerModalProps = {
  visible: boolean;
  videoIdOrUrl: string | null;
  title?: string | null;
  subtitle?: string | null;
  /** Forcer un mode. Sinon : résumés → watch, reste → embed. */
  mode?: YoutubePlaybackMode;
  onClose: () => void;
};

export const YoutubePlayerModal = memo(function YoutubePlayerModal({
  visible,
  videoIdOrUrl,
  title,
  subtitle,
  mode,
  onClose,
}: YoutubePlayerModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const videoId = youtubeIdFromUri(videoIdOrUrl);
  const resolvedMode: YoutubePlaybackMode = mode ?? preferredYoutubeMode(title);
  const useWatch = resolvedMode === 'watch';

  const embedHtml = useMemo(
    () =>
      videoId && !useWatch
        ? youtubeEmbedHtml(videoId, { autoplay: true, mute: false, controls: true })
        : null,
    [videoId, useWatch]
  );
  const watchUrl = useMemo(
    () => (videoId && useWatch ? youtubeWatchUrl(videoId) : null),
    [videoId, useWatch]
  );

  const playerH = useWatch
    ? undefined
    : Math.min(Math.round(width * (9 / 16)), Math.round(height * 0.42));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#050203" />
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={22} color="#fff" />
          </Pressable>
          <View style={styles.topMeta}>
            <Text style={styles.kicker}>THE RED · LECTURE</Text>
            {title ? (
              <Text style={styles.topTitle} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {subtitle ? (
          <Text style={styles.subLine} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        <View style={[styles.playerWrap, playerH ? { height: playerH, flex: 0 } : { flex: 1 }]}>
          {embedHtml ? (
            <WebView
              source={{ html: embedHtml, baseUrl: YOUTUBE_EMBED_ORIGIN }}
              style={styles.webview}
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
          ) : watchUrl ? (
            <WebView
              source={{
                uri: watchUrl,
                headers: { Referer: 'https://m.youtube.com/' },
              }}
              style={styles.webview}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loading}>
                  <ActivityIndicator color={UNITED_RED} size="large" />
                </View>
              )}
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
          ) : (
            <View style={styles.fallback}>
              <MaterialCommunityIcons name="alert-circle-outline" size={36} color={UNITED_RED} />
              <Text style={styles.fallbackTx}>Vidéo indisponible</Text>
            </View>
          )}
        </View>

        {!useWatch ? (
          <View style={styles.info}>
            {title ? (
              <Text style={styles.infoTitle} numberOfLines={3}>
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.infoSub}>{subtitle}</Text> : null}
          </View>
        ) : null}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={styles.hint}>
            {useWatch
              ? 'Résumé · lecture YouTube dans THE RED'
              : 'Lecture intégrée · contenu officiel @manutd'}
          </Text>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050203' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMeta: { flex: 1 },
  kicker: {
    color: UNITED_RED,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  topTitle: {
    color: COLORS.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    marginTop: 2,
  },
  subLine: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  playerWrap: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  webview: { flex: 1, backgroundColor: '#000' },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050203',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fallbackTx: { color: COLORS.textMuted, fontSize: 13 },
  info: { paddingHorizontal: 16, paddingTop: 16 },
  infoTitle: {
    color: '#fff',
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    lineHeight: 24,
  },
  infoSub: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  hint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    textAlign: 'center',
  },
});
