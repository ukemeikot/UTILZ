import { useEffect, useMemo, useState } from 'react';

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'phosphor-react-native';

import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { Input } from '../../src/components/common/Input';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { calculateBmi } from '../../src/modules/bmi/logic';
import { getStoredItem, setStoredItem } from '../../src/utils/storage';

const TRACKER_STORAGE_KEY = 'utilz-trackers';

export default function HealthScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [waterGoal, setWaterGoal] = useState(8);
  const [waterCount, setWaterCount] = useState(3);
  const [calories, setCalories] = useState('520');

  useEffect(() => {
    let active = true;

    getStoredItem(TRACKER_STORAGE_KEY, {
      waterGoal: 8,
      waterCount: 3,
      calories: '520',
    }).then((value) => {
      if (active) {
        setWaterGoal(value.waterGoal);
        setWaterCount(value.waterCount);
        setCalories(value.calories);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void setStoredItem(TRACKER_STORAGE_KEY, {
      waterGoal,
      waterCount,
      calories,
    });
  }, [waterGoal, waterCount, calories]);

  const bmiResult = useMemo(() => {
    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (!height || !weight) {
      return null;
    }

    return calculateBmi(height, weight);
  }, [heightCm, weightKg]);

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
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.bold,
              },
            ]}
          >
            {copy.health.title}
          </Text>
        </View>

        <Card style={styles.sectionCard}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.semiBold,
              },
            ]}
          >
            {copy.health.bmiTitle}
          </Text>
          <Input
            keyboardType="decimal-pad"
            label={copy.health.heightLabel}
            onChangeText={setHeightCm}
            value={heightCm}
          />
          <Input
            keyboardType="decimal-pad"
            label={copy.health.weightLabel}
            onChangeText={setWeightKg}
            value={weightKg}
          />
          {bmiResult ? (
            <View style={styles.metricRow}>
              <Text
                style={[
                  styles.metricValue,
                  {
                    color: theme.colors.text.primary,
                    fontFamily: theme.fonts.family.bold,
                  },
                ]}
              >
                {bmiResult.bmi.toFixed(1)}
              </Text>
              <Text
                style={[
                  styles.metricLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.regular,
                  },
                ]}
              >
                {bmiResult.category}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card style={styles.sectionCard}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.semiBold,
              },
            ]}
          >
            {copy.health.trackerTitle}
          </Text>
          <View style={styles.metricRow}>
            <Text
              style={[
                styles.metricLabel,
                {
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fonts.family.regular,
                },
              ]}
            >
              {copy.health.waterGoal}
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
              {waterCount}/{waterGoal} {copy.health.glasses}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Button
              label={copy.health.removeGlass}
              onPress={() => setWaterCount((value) => Math.max(0, value - 1))}
              variant="secondary"
            />
            <Button
              label={copy.health.addGlass}
              onPress={() =>
                setWaterCount((value) => Math.min(waterGoal, value + 1))
              }
            />
          </View>
          <Input
            keyboardType="number-pad"
            label={copy.health.caloriesToday}
            onChangeText={setCalories}
            value={calories}
          />
        </Card>
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
      fontSize: rfs(28),
      letterSpacing: -0.4,
    },
    sectionTitle: {
      fontSize: rfs(18),
    },
    sectionCard: {
      gap: s(14),
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: s(12),
    },
    metricLabel: {
      fontSize: rfs(14),
    },
    metricValue: {
      fontSize: rfs(18),
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
  });
}
