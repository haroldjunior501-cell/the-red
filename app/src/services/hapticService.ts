import * as Haptics from 'expo-haptics';

const wait = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

class HapticService {
  private enabled = true;

  async goal(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await wait(130);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await wait(90);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async matchStart(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async nearMiss(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await wait(60);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async redCard(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await wait(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  async penaltyBeat(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await wait(180);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async endMatch(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async chatBoom(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.selectionAsync();
  }

  /** @deprecated alias */
  async chatExplode(): Promise<void> {
    return this.chatBoom();
  }

  async chaosPulse(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.selectionAsync();
  }

  /** @deprecated alias */
  async chaosBeat(): Promise<void> {
    return this.chaosPulse();
  }

  async nationDominance(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  /** @deprecated alias */
  async historic(): Promise<void> {
    return this.goal();
  }

  async viralPing(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  setEnabled(val: boolean): void {
    this.enabled = val;
  }
}

export const hapticService = new HapticService();
