import { StyleSheet, Text, View } from 'react-native';

import { rfs, s, vs } from '../../constants/scale';
import { type AppTheme, useAppTheme } from '../../constants/theme';
import { formatDuration } from '../../utils/format';

type TimerDisplayProps = {
  seconds: number;
  isRunning: boolean;
  configuredMinutes: number;
};

export function TimerDisplay({
  seconds,
  isRunning,
  configuredMinutes,
}: TimerDisplayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text
            style={[
              styles.eyebrow,
              {
                color: theme.colors.text.muted,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            Countdown
          </Text>
          <Text
            style={[
              styles.heading,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.semiBold,
              },
            ]}
          >
            Focus timer
          </Text>
        </View>
        <View
          style={[
            styles.statePill,
            isRunning ? styles.statePillActive : styles.statePillIdle,
          ]}
        >
          <Text
            style={[
              styles.stateText,
              {
                color: isRunning
                  ? theme.colors.text.inverse
                  : theme.colors.text.secondary,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            {isRunning ? 'Active' : 'Ready'}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.time,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.fonts.family.extraBold,
          },
        ]}
      >
        {formatDuration(seconds)}
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text
            style={[
              styles.metricLabel,
              {
                color: theme.colors.text.muted,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            Session
          </Text>
          <Text
            style={[
              styles.metricValue,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.bold,
              },
            ]}
          >
            {configuredMinutes} min
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text
            style={[
              styles.metricLabel,
              {
                color: theme.colors.text.muted,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            Status
          </Text>
          <Text
            style={[
              styles.metricValueSmall,
              {
                color: theme.colors.brand.success,
                fontFamily: theme.fonts.family.semiBold,
              },
            ]}
          >
            {seconds === 0 ? 'Done' : isRunning ? 'Counting' : 'Paused'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      borderRadius: vs(28),
      padding: vs(20),
      backgroundColor: theme.isDark ? '#122238' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      gap: vs(18),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(12),
      alignItems: 'flex-start',
    },
    eyebrow: {
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      marginBottom: vs(4),
    },
    heading: {
      fontSize: rfs(18),
    },
    statePill: {
      borderRadius: 999,
      paddingHorizontal: s(12),
      paddingVertical: vs(8),
      borderWidth: 1,
    },
    statePillActive: {
      backgroundColor: theme.colors.brand.success,
      borderColor: theme.colors.brand.success,
    },
    statePillIdle: {
      backgroundColor: theme.isDark ? '#1D324E' : '#EEF3F8',
      borderColor: theme.colors.border.subtle,
    },
    stateText: {
      fontSize: rfs(12),
    },
    time: {
      fontSize: rfs(40),
      letterSpacing: -1.2,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: s(10),
    },
    metricCard: {
      flex: 1,
      borderRadius: vs(18),
      paddingHorizontal: s(14),
      paddingVertical: vs(14),
      backgroundColor: theme.isDark ? '#1A304B' : '#F2F6FA',
      gap: vs(6),
    },
    metricLabel: {
      fontSize: rfs(12),
    },
    metricValue: {
      fontSize: rfs(24),
    },
    metricValueSmall: {
      fontSize: rfs(16),
    },
  });
}
