import { StyleSheet, Text, View } from 'react-native';

import { rfs, vs } from '../../constants/scale';
import { type AppTheme, useAppTheme } from '../../constants/theme';
import type { ConverterResult } from '../../types/converter.types';
import { formatCompactNumber } from '../../utils/format';

type ConversionResultProps = {
  title: string;
  results: ConverterResult[];
};

export function ConversionResult({
  title,
  results,
}: ConversionResultProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.fonts.family.semiBold,
          },
        ]}
      >
        {title}
      </Text>
      <View style={styles.list}>
        {results.map((result) => (
          <View key={result.label} style={styles.row}>
            <View style={styles.rowText}>
              <Text
                style={[
                  styles.name,
                  {
                    color: theme.colors.text.primary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                {result.label}
              </Text>
              <Text
                style={[
                  styles.symbol,
                  {
                    color: theme.colors.text.muted,
                    fontFamily: theme.fonts.family.regular,
                  },
                ]}
              >
                {result.symbol}
              </Text>
            </View>
            <Text
              style={[
                styles.value,
                {
                  color: theme.colors.brand.success,
                  fontFamily: theme.fonts.family.semiBold,
                },
              ]}
            >
              {formatCompactNumber(result.value, 4)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      borderRadius: vs(24),
      padding: vs(18),
      backgroundColor: theme.colors.surface.card,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      gap: vs(14),
    },
    title: {
      fontSize: rfs(16),
    },
    list: {
      gap: vs(12),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowText: {
      gap: vs(2),
      flexShrink: 1,
    },
    name: {
      fontSize: rfs(14),
    },
    symbol: {
      fontSize: rfs(12),
    },
    value: {
      fontSize: rfs(15),
    },
  });
}
