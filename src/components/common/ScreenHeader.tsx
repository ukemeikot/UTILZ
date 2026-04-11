import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: ScreenHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {eyebrow ? (
        <Text
          style={[
            styles.eyebrow,
            {
              color: theme.colors.brand.success,
              fontFamily: theme.fonts.family.semiBold,
            },
          ]}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.fonts.family.bold,
          },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.family.regular,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
});
