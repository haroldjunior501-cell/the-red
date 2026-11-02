import { CommonActions, type NavigationProp, type ParamListBase } from '@react-navigation/native';

type ArenaNav = {
  navigate: (name: string, params?: object) => void;
  dispatch: NavigationProp<ParamListBase>['dispatch'];
  getState?: () => { routeNames?: string[] } | undefined;
  getParent?: () => ArenaNav | undefined;
};

/** Arena (Simulator) vit dans HomeStack (onglet Accueil). */
export function navigateToArena(navigation: ArenaNav) {
  const state = navigation.getState?.();
  if (state?.routeNames?.includes('Arena')) {
    navigation.navigate('Arena');
    return;
  }
  const parent = navigation.getParent?.();
  if (parent) {
    parent.navigate('Accueil', { screen: 'Arena' });
    return;
  }
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Accueil',
      params: { screen: 'Arena' },
    })
  );
}

export function navigateToFullRanking(navigation: ArenaNav) {
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Accueil',
      params: {
        screen: 'FullRanking',
      },
    })
  );
}

export function navigateToMatchDetail(navigation: ArenaNav) {
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Accueil',
      params: {
        screen: 'MatchDetail',
      },
    })
  );
}

export function navigateToFantasy(navigation: ArenaNav) {
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Fantasy',
    })
  );
}
