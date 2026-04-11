import { StyleSheet, Text, View } from 'react-native';

import { rfs, vs } from '../../constants/scale';
import { type AppTheme, useAppTheme } from '../../constants/theme';

type CalcDisplayProps = {
  expression: string;
  result: string;
};

export function CalcDisplay({ expression, result }: CalcDisplayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const hasExpression = Boolean(expression.trim());

  return (
    <View style={styles.container}>
      {hasExpression ? (
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[
            styles.expression,
            {
              color: theme.colors.text.muted,
              fontFamily: theme.fonts.family.regular,
            },
          ]}
        >
          {expression}
        </Text>
      ) : null}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.4}
        numberOfLines={1}
        style={[
          styles.result,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.fonts.family.regular,
          },
        ]}
      >
        {result}
      </Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      width: '100%',
      paddingHorizontal: vs(4),
      paddingTop: vs(16),
      paddingBottom: vs(28),
      gap: vs(8),
    },
    expression: {
      fontSize: rfs(18),
      textAlign: 'right',
      maxWidth: '100%',
      opacity: theme.isDark ? 0.72 : 0.62,
      includeFontPadding: false,
    },
    result: {
      fontSize: rfs(56),
      textAlign: 'right',
      maxWidth: '100%',
      letterSpacing: -1,
      includeFontPadding: false,
    },
  });
}
