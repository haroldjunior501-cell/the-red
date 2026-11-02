import { Audio, type AVPlaybackSource } from 'expo-av';

export type SoundKey =
  | 'ambient'
  | 'match_start'
  | 'near_miss'
  | 'goal'
  | 'red_card'
  | 'penalty'
  | 'chaos'
  | 'end_match'
  | 'chat_boom';

/** Anciennes clés — compatibilité hooks existants */
export type LegacySoundKey = 'chat_explode' | 'chaos_loop' | 'historic' | 'viral_ping';

const SOUND_FILES: Record<SoundKey, AVPlaybackSource> = {
  ambient: require('../../assets/sounds/ambient.mp3'),
  match_start: require('../../assets/sounds/match_start.mp3'),
  near_miss: require('../../assets/sounds/near_miss.mp3'),
  goal: require('../../assets/sounds/goal.mp3'),
  red_card: require('../../assets/sounds/red_card.mp3'),
  penalty: require('../../assets/sounds/penalty.mp3'),
  chaos: require('../../assets/sounds/chaos.mp3'),
  end_match: require('../../assets/sounds/end_match.mp3'),
  chat_boom: require('../../assets/sounds/chat_boom.mp3'),
};

const HEAVY_KEYS = new Set<SoundKey>(['goal', 'red_card', 'chaos', 'match_start', 'end_match']);

const LEGACY_MAP: Record<LegacySoundKey, SoundKey> = {
  chat_explode: 'chat_boom',
  chaos_loop: 'chaos',
  historic: 'goal',
  viral_ping: 'match_start',
};

function resolveKey(key: SoundKey | LegacySoundKey): SoundKey {
  if (key in SOUND_FILES) return key as SoundKey;
  return LEGACY_MAP[key as LegacySoundKey];
}

class SoundService {
  private sounds: Partial<Record<SoundKey, Audio.Sound>> = {};
  private ambientSound: Audio.Sound | null = null;
  private chaosSound: Audio.Sound | null = null;
  private penaltyLoop: ReturnType<typeof setInterval> | null = null;
  private enabled = true;
  private heavyPlaying = false;

  async init(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });
      await this.preload(['goal', 'red_card', 'near_miss']);
    } catch (e) {
      console.warn('Audio init error:', e);
    }
  }

  private async preload(keys: SoundKey[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key]);
          this.sounds[key] = sound;
        } catch (e) {
          console.warn(`Failed to load sound: ${key}`, e);
        }
      })
    );
  }

  async play(key: SoundKey | LegacySoundKey, volume = 1.0): Promise<void> {
    if (!this.enabled) return;
    const resolved = resolveKey(key);
    if (HEAVY_KEYS.has(resolved) && this.heavyPlaying) return;

    try {
      if (HEAVY_KEYS.has(resolved)) this.heavyPlaying = true;

      let sound = this.sounds[resolved];
      if (!sound) {
        const { sound: created } = await Audio.Sound.createAsync(SOUND_FILES[resolved]);
        sound = created;
        this.sounds[resolved] = sound;
      }
      await sound.setVolumeAsync(volume);
      await sound.replayAsync();

      if (HEAVY_KEYS.has(resolved)) {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.heavyPlaying = false;
          }
        });
      }
    } catch (e) {
      console.warn(`Sound play error: ${resolved}`, e);
      if (HEAVY_KEYS.has(resolved)) this.heavyPlaying = false;
    }
  }

  async startAmbient(): Promise<void> {
    if (this.ambientSound || !this.enabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(SOUND_FILES.ambient, { isLooping: true, volume: 0.12 });
      this.ambientSound = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Ambient start error:', e);
    }
  }

  async stopAmbient(): Promise<void> {
    try {
      await this.ambientSound?.stopAsync();
      await this.ambientSound?.unloadAsync();
    } catch (e) {
      console.warn('Ambient stop error:', e);
    }
    this.ambientSound = null;
  }

  async startChaos(): Promise<void> {
    await this.stopAmbient();
    if (this.chaosSound || !this.enabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(SOUND_FILES.chaos, { isLooping: true, volume: 0.35 });
      this.chaosSound = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Chaos start error:', e);
    }
  }

  /** @deprecated alias */
  startChaosLoop(): Promise<void> {
    return this.startChaos();
  }

  async stopChaos(): Promise<void> {
    try {
      await this.chaosSound?.stopAsync();
      await this.chaosSound?.unloadAsync();
    } catch (e) {
      console.warn('Chaos stop error:', e);
    }
    this.chaosSound = null;
    await this.startAmbient();
  }

  stopChaosLoop(): Promise<void> {
    return this.stopChaos();
  }

  startPenaltyHeartbeat(): void {
    if (this.penaltyLoop) return;
    this.penaltyLoop = setInterval(() => {
      void this.play('penalty', 0.7);
    }, 900);
  }

  stopPenaltyHeartbeat(): void {
    if (this.penaltyLoop) {
      clearInterval(this.penaltyLoop);
      this.penaltyLoop = null;
    }
  }

  setEnabled(val: boolean): void {
    this.enabled = val;
    if (!val) {
      this.stopPenaltyHeartbeat();
      void this.stopAmbient();
      void this.stopChaos();
    }
  }

  async cleanup(): Promise<void> {
    this.stopPenaltyHeartbeat();
    await this.stopAmbient();
    await this.stopChaos();
    await Promise.all(
      Object.values(this.sounds).map(async (s) => {
        try {
          await s?.unloadAsync();
        } catch {
          /* ignore */
        }
      })
    );
    this.sounds = {};
    this.heavyPlaying = false;
  }
}

export const soundService = new SoundService();
