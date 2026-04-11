import { useEffect } from 'react';

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowsLeftRightIcon,
  CalculatorIcon,
  ClockIcon,
  DotsThreeCircleIcon,
} from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useCalculatorStore } from '../../src/store/calculatorStore';
import { useNotesStore } from '../../src/store/notesStore';

export default function HomeScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const styles = createStyles(theme);
  const history = useCalculatorStore((state) => state.history);
  const notes = useNotesStore((state) => state.notes);
  const hydrateNotes = useNotesStore((state) => state.hydrate);
  const quickActions = [
    {
      ...copy.home.quickActions[0],
      route: '/(tabs)/converter',
      icon: ArrowsLeftRightIcon,
    },
    {
      ...copy.home.quickActions[1],
      route: '/(tabs)/calculator',
      icon: CalculatorIcon,
    },
    {
      ...copy.home.quickActions[2],
      route: '/(tabs)/time',
      icon: ClockIcon,
    },
    {
      ...copy.home.quickActions[3],
      route: '/(tabs)/more',
      icon: DotsThreeCircleIcon,
    },
  ] as const;

  useEffect(() => {
    void hydrateNotes();
  }, [hydrateNotes]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{copy.home.title}</Text>

        <Card style={styles.summaryCard}>
          <View style={styles.metricGrid}>
            {[
              [copy.home.sectionTitle, quickActions.length],
              [copy.home.notesLabel, notes.length],
              [copy.home.historyLabel, history.length],
            ].map(([label, value]) => (
              <View key={String(label)} style={styles.metricBlock}>
                <Text style={styles.metricNumber}>{value}</Text>
                <Text style={styles.metricCaption}>{label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>{copy.home.sectionTitle}</Text>

        <View style={styles.actionList}>
          {quickActions.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
            >
              <View style={styles.actionIconWrap}>
                <item.icon
                  color={theme.colors.brand.success}
                  size={rfs(22)}
                  weight="duotone"
                />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.app,
    },
    content: {
      paddingHorizontal: s(20),
      paddingTop: vs(20),
      paddingBottom: vs(32),
      gap: vs(18),
    },
    pageTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(28),
      letterSpacing: -0.4,
    },
    summaryCard: {
      gap: vs(10),
    },
    metricGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(12),
    },
    metricBlock: {
      flex: 1,
      gap: vs(4),
    },
    metricNumber: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(24),
    },
    metricCaption: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(12),
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
    },
    actionList: {
      gap: vs(12),
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(14),
      borderRadius: vs(22),
      borderWidth: 1,
      padding: s(18),
      backgroundColor: theme.colors.surface.card,
      borderColor: theme.colors.border.subtle,
      opacity: 1,
    },
    actionCardPressed: {
      opacity: 0.9,
    },
    actionIconWrap: {
      width: vs(50),
      height: vs(50),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#1A2F49' : '#EEF4F8',
    },
    actionTextWrap: {
      flex: 1,
      gap: vs(4),
    },
    actionTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(17),
    },
    actionSubtitle: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(20),
    },
  });
}
