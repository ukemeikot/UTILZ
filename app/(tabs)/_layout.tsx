import { useMemo } from 'react';

import { Tabs } from 'expo-router';
import {
  ArrowsLeftRightIcon,
  CalculatorIcon,
  ClockIcon,
  DotsThreeCircleIcon,
  HouseIcon,
} from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppCopy } from '../../src/constants/copy';
import { useAppTheme } from '../../src/constants/theme';
import { vs } from '../../src/constants/scale';

export default function TabsLayout() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const tabBarHeight = vs(85) + insets.bottom;
  const tabScreenOptions = useMemo(
    () => ({
      lazy: true,
      freezeOnBlur: true,
      headerShown: false,
      headerStyle: {
        backgroundColor: theme.colors.background.screen,
      },
      headerTintColor: theme.colors.text.primary,
      headerTitleStyle: {
        ...theme.fonts.typography.sectionHeader,
        color: theme.colors.text.primary,
      },
      tabBarActiveTintColor: theme.colors.brand.success,
      tabBarInactiveTintColor: theme.colors.text.muted,
      tabBarStyle: {
        backgroundColor: theme.colors.background.screen,
        borderTopColor: theme.colors.border.subtle,
        borderTopWidth: 1,
        height: tabBarHeight,
        paddingTop: vs(10),
        paddingBottom: insets.bottom > 0 ? insets.bottom : vs(20),
      },
      tabBarLabelStyle: {
        ...theme.fonts.typography.tabLabel,
        fontSize: 11,
        lineHeight: 14,
        marginBottom: insets.bottom > 0 ? 0 : vs(5),
      },
      tabBarItemStyle: {
        paddingTop: vs(4),
        paddingBottom: vs(2),
      },
      sceneStyle: {
        backgroundColor: theme.colors.background.app,
      },
    }),
    [
      insets.bottom,
      tabBarHeight,
      theme.colors.background.app,
      theme.colors.background.screen,
      theme.colors.border.subtle,
      theme.colors.brand.success,
      theme.colors.text.muted,
      theme.colors.text.primary,
      theme.fonts.typography.sectionHeader,
      theme.fonts.typography.tabLabel,
    ],
  );

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: copy.tabs.home,
          tabBarIcon: ({ color, focused }) => (
            <HouseIcon
              color={color}
              size={focused ? 30 : 24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: copy.tabs.calculator,
          tabBarLabel: copy.tabs.calculatorShort,
          tabBarIcon: ({ color, focused }) => (
            <CalculatorIcon
              color={color}
              size={focused ? 30 : 24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="converter"
        options={{
          title: copy.tabs.converter,
          tabBarIcon: ({ color, focused }) => (
            <ArrowsLeftRightIcon
              color={color}
              size={focused ? 30 : 24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="time"
        options={{
          title: copy.tabs.time,
          tabBarIcon: ({ color, focused }) => (
            <ClockIcon
              color={color}
              size={focused ? 30 : 24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: copy.tabs.more,
          tabBarIcon: ({ color, focused }) => (
            <DotsThreeCircleIcon
              color={color}
              size={focused ? 30 : 24}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
