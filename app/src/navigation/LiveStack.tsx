import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveScreen from '../screens/LiveScreen';
import MatchDetailScreen from '../screens/LiveScreen/MatchDetailScreen';
import type { LiveMatch } from '../types/live.types';

export type LiveStackParamList = {
  LiveHome: undefined;
  MatchDetail: { match: LiveMatch };
};

const Stack = createNativeStackNavigator<LiveStackParamList>();

export default function LiveStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0c0507' } }}
    >
      <Stack.Screen name="LiveHome" component={LiveScreen} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
    </Stack.Navigator>
  );
}
