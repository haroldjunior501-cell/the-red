import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, UNITED_RED } from '../constants/colors';
import HomeStack from './HomeStack';
import HubScreen from '../screens/HubScreen';
import LiveStack from './LiveStack';
import FantasyScreen from '../screens/FantasyScreen';

function ProgrammePlaceholder() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.bgDeep,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      <MaterialCommunityIcons name="calendar-month" size={40} color={UNITED_RED} />
      <Text style={{ color: '#fff', fontWeight: '900', marginTop: 12, fontSize: 18 }}>Programme</Text>
      <Text style={{ color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
        Calendrier Manchester United — Premier League, Cups & Europe.
      </Text>
    </View>
  );
}

export type TabsParamList = {
  Accueil: undefined;
  Live: undefined;
  Hub: undefined;
  Fantasy: undefined;
  Programme: undefined;
};

export type TheRedTabsParamList = TabsParamList;

const Tab = createBottomTabNavigator<TabsParamList>();

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'android' ? 62 + insets.bottom : 74;
  const tabBarPaddingBottom = Platform.OS === 'android' ? insets.bottom + 4 : 8;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: 'rgba(218, 41, 28, 0.28)',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: tabBarPaddingBottom,
          elevation: 8,
        },
        tabBarActiveTintColor: UNITED_RED,
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800', paddingBottom: 2 },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveStack}
        options={{
          tabBarLabel: 'Live',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="broadcast" color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{
          tabBarLabel: 'Hub',
          freezeOnBlur: true,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="earth" color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tab.Screen
        name="Fantasy"
        component={FantasyScreen}
        options={{
          tabBarLabel: 'Fantasy',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="flash" color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tab.Screen
        name="Programme"
        component={ProgrammePlaceholder}
        options={{
          tabBarLabel: 'Programme',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-month-outline" color={color} size={size ?? 22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
