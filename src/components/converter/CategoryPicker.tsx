import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { rfs, s, vs } from '../../constants/scale';
import { converterCategories } from '../../constants/units';
import { type AppTheme, useAppTheme } from '../../constants/theme';
import type { ConverterCategory } from '../../types/converter.types';

type CategoryPickerProps = {
  value: ConverterCategory;
  onChange: (value: ConverterCategory) => void;
};

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
    >
      {converterCategories.map((category) => {
        const active = category.key === value;

        return (
          <Pressable
            key={category.key}
            onPress={() => onChange(category.key)}
            style={[
              styles.card,
              active ? styles.cardActive : styles.cardInactive,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                active ? styles.labelActive : styles.labelInactive,
                { fontFamily: theme.fonts.family.semiBold },
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: s(10),
      paddingVertical: vs(2),
    },
    card: {
      minWidth: s(96),
      minHeight: vs(48),
      borderRadius: vs(16),
      paddingHorizontal: s(16),
      paddingVertical: vs(12),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardActive: {
      backgroundColor: theme.colors.surface.card,
      borderColor: theme.colors.brand.success,
    },
    cardInactive: {
      backgroundColor: theme.isDark ? '#20324B' : '#EEF3F7',
      borderColor: theme.colors.border.subtle,
    },
    label: {
      fontSize: rfs(14),
      textAlign: 'center',
    },
    labelActive: {
      color: theme.colors.text.primary,
    },
    labelInactive: {
      color: theme.colors.text.primary,
    },
  });
}
