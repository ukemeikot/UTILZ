import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { rfs, vs } from '../../constants/scale';
import { type AppTheme, useAppTheme } from '../../constants/theme';

type CalcButtonProps = {
  label?: string;
  children?: ReactNode;
  variant?: 'number' | 'operator' | 'action';
  onPress: () => void;
};

export function CalcButton({
  label,
  children,
  variant = 'number',
  onPress,
}: CalcButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const variants = {
    number: {
      backgroundColor: theme.isDark ? '#1B2333' : '#F3F6F9',
      color: theme.colors.text.primary,
      borderColor: theme.isDark ? '#2A3347' : '#E2E9F0',
    },
    operator: {
      backgroundColor: theme.colors.brand.success,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.brand.success,
    },
    action: {
      backgroundColor: theme.isDark ? '#F4F7FB' : '#E9EEF3',
      color: theme.isDark
        ? theme.colors.background.app
        : theme.colors.text.primary,
      borderColor: theme.isDark ? '#F4F7FB' : '#E1E7EE',
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variants.backgroundColor,
          borderColor: variants.borderColor,
        },
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.content}>
        {children ? (
          children
        ) : (
          <Text
            style={[
              styles.label,
              {
                color: variants.color,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    button: {
      flex: 1,
      minWidth: 0,
      aspectRatio: 0.9,
      borderRadius: vs(18),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      shadowColor: theme.isDark ? '#000000' : '#AAB8C5',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: theme.isDark ? 0.14 : 0.1,
      shadowRadius: 12,
      elevation: 1,
    },
    buttonPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: rfs(22),
    },
  });
}
