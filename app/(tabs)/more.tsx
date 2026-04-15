import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChecksIcon,
  HeartbeatIcon,
  NotePencilIcon,
  GearSixIcon,
  ShieldCheckIcon,
  CalculatorIcon,
} from 'phosphor-react-native';

import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';

export default function MoreScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const styles = createStyles(theme);
  const moreSections = [
    {
      ...copy.more.cards.calculator,
      route: '/more/calculator',
      icon: CalculatorIcon,
    },
    {
      ...copy.more.cards.health,
      route: '/more/health',
      icon: HeartbeatIcon,
    },
    {
      ...copy.more.cards.notes,
      route: '/more/notes',
      icon: NotePencilIcon,
    },
    {
      ...copy.more.cards.tools,
      route: '/more/tools',
      icon: ShieldCheckIcon,
    },
    {
      ...copy.more.cards.settings,
      route: '/more/settings',
      icon: GearSixIcon,
    },
  ] as const;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text.primary,
              fontFamily: theme.fonts.family.bold,
            },
          ]}
        >
          {copy.more.title}
        </Text>

        <View style={styles.cardList}>
          {moreSections.map((section) => {
            const Icon = section.icon;

            return (
              <Pressable
                key={section.title}
                onPress={() => router.push(section.route)}
                style={({ pressed }) => [
                  styles.sectionCard,
                  pressed && styles.sectionCardPressed,
                ]}
              >
                <View style={styles.iconWrap}>
                  <Icon
                    color={theme.colors.brand.success}
                    size={rfs(24)}
                    weight="duotone"
                  />
                </View>
                <View style={styles.cardText}>
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.family.semiBold,
                      },
                    ]}
                  >
                    {section.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      {
                        color: theme.colors.text.secondary,
                        fontFamily: theme.fonts.family.regular,
                      },
                    ]}
                  >
                    {section.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
      paddingHorizontal: s(18),
      paddingTop: vs(18),
      paddingBottom: vs(32),
      gap: vs(18),
    },
    title: {
      fontSize: rfs(28),
      letterSpacing: -0.4,
    },
    cardList: {
      gap: vs(14),
    },
    sectionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(14),
      borderRadius: vs(24),
      paddingHorizontal: s(18),
      paddingVertical: vs(18),
      backgroundColor: theme.colors.surface.card,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    sectionCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    iconWrap: {
      width: vs(52),
      height: vs(52),
      borderRadius: vs(18),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#1A2F49' : '#EEF4F8',
    },
    cardText: {
      flex: 1,
      gap: vs(5),
    },
    cardTitle: {
      fontSize: rfs(18),
    },
    cardSubtitle: {
      fontSize: rfs(14),
      lineHeight: rfs(20),
    },
  });
}
