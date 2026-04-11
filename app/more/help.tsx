import { useState } from 'react';

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, CaretDownIcon, QuestionIcon } from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';

export default function HelpScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(vs(32), insets.bottom + vs(16)) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon
              color={theme.colors.text.primary}
              size={rfs(18)}
              weight="bold"
            />
          </Pressable>
          <Text style={styles.title}>{copy.help.title}</Text>
        </View>

        <Card style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <QuestionIcon
              color={theme.colors.brand.success}
              size={rfs(24)}
              weight="duotone"
            />
          </View>
          <Text style={styles.introText}>{copy.help.intro}</Text>
        </Card>

        <View style={styles.faqList}>
          {copy.help.questions.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <Card key={item.question} style={styles.faqCard}>
                <Pressable
                  onPress={() => setOpenIndex((current) => (current === index ? -1 : index))}
                  style={styles.faqHeader}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <CaretDownIcon
                    color={theme.colors.text.muted}
                    size={rfs(18)}
                    style={[styles.chevron, isOpen && styles.chevronOpen]}
                    weight="bold"
                  />
                </Pressable>
                {isOpen ? <Text style={styles.answerText}>{item.answer}</Text> : null}
              </Card>
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
      gap: vs(18),
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },
    backButton: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(28),
      letterSpacing: -0.4,
    },
    introCard: {
      gap: vs(12),
    },
    introIconWrap: {
      width: vs(48),
      height: vs(48),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#1A2F49' : '#EEF4F8',
    },
    introText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(22),
    },
    faqList: {
      gap: vs(14),
    },
    faqCard: {
      gap: vs(12),
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },
    questionText: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
      lineHeight: rfs(24),
    },
    answerText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(22),
    },
    chevron: {
      transform: [{ rotate: '0deg' }],
    },
    chevronOpen: {
      transform: [{ rotate: '180deg' }],
    },
  });
}
