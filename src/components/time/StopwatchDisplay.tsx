import { StyleSheet, Text, View } from 'react-native';

import { rfs, s, vs } from '../../constants/scale';
import { type AppTheme, useAppTheme } from '../../constants/theme';
import { formatStopwatch } from '../../utils/format';

type StopwatchDisplayProps = {
  elapsed: number;
  laps: number[];
  isRunning: boolean;
};

export function StopwatchDisplay({
  elapsed,
  laps,
  isRunning,
}: StopwatchDisplayProps) {
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
            Stopwatch
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
            Precision timing
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
            {isRunning ? 'Running' : 'Paused'}
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
        {formatStopwatch(elapsed)}
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
            Laps
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
            {laps.length}
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
            Last lap
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
            {laps[0] ? formatStopwatch(laps[0]) : '--:--.--'}
          </Text>
        </View>
      </View>

      {laps.length ? (
        <View style={styles.lapsWrap}>
          {laps.slice(0, 3).map((lap, index) => (
            <View key={`${lap}-${index}`} style={styles.lapRow}>
              <Text
                style={[
                  styles.lapLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.regular,
                  },
                ]}
              >
                Lap {laps.length - index}
              </Text>
              <Text
                style={[
                  styles.lapValue,
                  {
                    color: theme.colors.text.primary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                {formatStopwatch(lap)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
      fontSize: rfs(42),
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
    lapsWrap: {
      gap: vs(10),
    },
    lapRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: s(12),
    },
    lapLabel: {
      fontSize: rfs(13),
    },
    lapValue: {
      fontSize: rfs(13),
    },
  });
}
