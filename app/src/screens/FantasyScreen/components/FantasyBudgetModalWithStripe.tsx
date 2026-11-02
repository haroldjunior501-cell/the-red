import * as Haptics from 'expo-haptics';
import React, { memo, useCallback } from 'react';
import { Alert } from 'react-native';
import type { FpPackId } from '../../../constants/fantasyEconomy';
import { getFpPack, totalPackFp } from '../../../constants/fantasyEconomy';
import type { QuickBoostId } from '../../../constants/quickBoosts';
import { getQuickBoost } from '../../../constants/quickBoosts';
import { useBudgetModalBalance } from '../../../hooks/useBudgetModalBalance';
import { useStripeFpPurchase } from '../../../hooks/useStripeFpPurchase';
import { notificationService } from '../../../services/notificationService';
import { BudgetModal } from './BudgetModal';

type Props = {
  visible: boolean;
  userId: string;
  economyBusy: boolean;
  stripeCardReady: boolean;
  stripeStatusMessage?: string;
  onClose: () => void;
  onEconomyRefresh: () => void;
};

export const FantasyBudgetModalWithStripe = memo(function FantasyBudgetModalWithStripe({
  visible,
  userId,
  economyBusy,
  stripeCardReady,
  stripeStatusMessage,
  onClose,
  onEconomyRefresh,
}: Props) {
  const balance = useBudgetModalBalance(userId, visible);

  const refreshAll = useCallback(() => {
    void balance.refresh();
    onEconomyRefresh();
  }, [balance, onEconomyRefresh]);

  const stripe = useStripeFpPurchase(userId, refreshAll);

  const onConvert = (fpCost: number, budgetGain: number) => {
    if (balance.fantasyPoints < fpCost) {
      Alert.alert(
        'FP insuffisants',
        `Il vous manque ${fpCost - balance.fantasyPoints} FP pour cette conversion.`
      );
      return;
    }

    void stripe.convertFp(fpCost, budgetGain).then((result) => {
      if (result.ok) {
        balance.applyBalances(result.fantasyPoints, result.fantasyBudget);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void notificationService.sendConversionSuccessNotif(budgetGain, result.fantasyBudget);
        return;
      }
      Alert.alert('Conversion', result.error);
    });
  };

  const onQuickBoost = (boostId: QuickBoostId) => {
    const boost = getQuickBoost(boostId);
    void stripe.purchaseQuickBoost(boostId).then((result) => {
      if (result.ok) {
        balance.applyBalances(balance.fantasyPoints, result.fantasyBudget);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (boost) void notificationService.sendQuickBoostNotif(boost.gain);
        return;
      }
      if (!result.cancelled) {
        Alert.alert('Paiement', result.error);
      }
    });
  };

  const onBuyPack = (packId: FpPackId) => {
    const pack = getFpPack(packId);
    void stripe.purchasePack(packId).then((result) => {
      if (result.ok) {
        void balance.refresh();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (pack) {
          void notificationService.sendFpPackPurchasedNotif(totalPackFp(pack), pack.name);
        }
        return;
      }
      if (!result.cancelled) {
        Alert.alert('Paiement', result.error);
      }
    });
  };

  return (
    <BudgetModal
      visible={visible}
      fantasyPoints={balance.fantasyPoints}
      budgetCapM={balance.budgetCapM}
      balanceSyncing={balance.syncing}
      busy={economyBusy || stripe.purchasing}
      stripeReady={stripeCardReady}
      stripeStatusMessage={stripeStatusMessage}
      onClose={onClose}
      onConvert={onConvert}
      onQuickBoost={onQuickBoost}
      onBuyPack={onBuyPack}
    />
  );
});
