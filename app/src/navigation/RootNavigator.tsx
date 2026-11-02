import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Country } from '../constants/countries';
import SplashScreen from '../screens/onboarding/SplashScreen';
import CountrySelectScreen from '../screens/onboarding/CountrySelectScreen';
import FlagAnimScreen from '../screens/onboarding/FlagAnimScreen';
import AppGuideScreen from '../screens/onboarding/AppGuideScreen';
import AuthLoginScreen from '../screens/onboarding/AuthHubScreen/AuthLoginScreen';
import AuthSignUpScreen from '../screens/onboarding/AuthHubScreen/AuthSignUpScreen';
import AppTabs from './AppTabs';
import LegalDocumentScreen from '../screens/ProfileScreen/LegalDocumentScreen';
import type { LegalDocumentKey } from '../constants/legalUrls';
import { useUserStore } from '../store/useUserStore';

export type RootStackParamList = {
  Splash: undefined;
  CountrySelect: undefined;
  FlagAnim: { country: Country };
  AuthSignUp: undefined;
  AuthLogin: undefined;
  AppGuide: undefined;
  MainApp: undefined;
  LegalDocument: { url: string; title: string; legalKey?: LegalDocumentKey };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const userId = useUserStore((s) => s.userId);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userId ? 'MainApp' : 'Splash'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050203' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="CountrySelect" component={CountrySelectScreen} />
        <Stack.Screen name="FlagAnim" component={FlagAnimScreen} />
        <Stack.Screen name="AuthSignUp" component={AuthSignUpScreen} />
        <Stack.Screen name="AuthLogin" component={AuthLoginScreen} />
        <Stack.Screen name="AppGuide" component={AppGuideScreen} />
        <Stack.Screen name="MainApp" component={AppTabs} />
        <Stack.Screen
          name="LegalDocument"
          component={LegalDocumentScreen}
          options={{ animation: 'slide_from_right', gestureEnabled: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
