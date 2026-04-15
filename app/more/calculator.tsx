import { useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, BackspaceIcon } from 'phosphor-react-native';
import { router } from 'expo-router';

import { CalcButton } from '../../src/components/calculator/CalcButton';
import { CalcDisplay } from '../../src/components/calculator/CalcDisplay';
import { rfs, s, screenWidth, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import {
  appendToken,
  evaluateExpression,
} from '../../src/modules/calculator/logic';
import { useCalculatorStore } from '../../src/store/calculatorStore';

type CalculatorButtonConfig =
  | {
      label: string;
      action: 'clear' | 'toggle-sign' | 'delete' | 'evaluate';
      variant: 'number' | 'operator' | 'action';
    }
  | {
      label: string;
      token: string;
      variant: 'number' | 'operator' | 'action';
    };

const calculatorRows: CalculatorButtonConfig[][] = [
  [
    { label: 'AC', action: 'clear', variant: 'action' },
    { label: '+/-', action: 'toggle-sign', variant: 'action' },
    { label: '%', token: '%', variant: 'action' },
    { label: '\u00f7', token: '\u00f7', variant: 'operator' },
  ],
  [
    { label: '7', token: '7', variant: 'number' },
    { label: '8', token: '8', variant: 'number' },
    { label: '9', token: '9', variant: 'number' },
    { label: '\u00d7', token: '\u00d7', variant: 'operator' },
  ],
  [
    { label: '4', token: '4', variant: 'number' },
    { label: '5', token: '5', variant: 'number' },
    { label: '6', token: '6', variant: 'number' },
    { label: '-', token: '-', variant: 'operator' },
  ],
  [
    { label: '1', token: '1', variant: 'number' },
    { label: '2', token: '2', variant: 'number' },
    { label: '3', token: '3', variant: 'number' },
    { label: '+', token: '+', variant: 'operator' },
  ],
  [
    { label: '.', token: '.', variant: 'number' },
    { label: '0', token: '0', variant: 'number' },
    { label: 'backspace', action: 'delete', variant: 'number' },
    { label: '=', action: 'evaluate', variant: 'operator' },
  ],
];

const scientificActions = [
  { label: 'sin', token: 'sin(' },
  { label: 'cos', token: 'cos(' },
  { label: 'tan', token: 'tan(' },
  { label: 'log', token: 'log(' },
  { label: 'sqrt', token: 'sqrt(' },
  { label: '\u03c0', token: '\u03c0' },
  { label: 'e', token: 'e' },
  { label: '(', token: '(' },
  { label: ')', token: ')' },
] as const;

function toggleSign(current: string) {
  if (!current) {
    return '-';
  }

  const match = current.match(/-?\d*\.?\d+(?!.*\d)/);

  if (!match || match.index === undefined) {
    return /[+\-\u00d7\u00f7(]$/.test(current) ? `${current}-` : current;
  }

  const value = match[0];
  const toggled = value.startsWith('-') ? value.slice(1) : `-${value}`;

  return (
    current.slice(0, match.index) +
    toggled +
    current.slice(match.index + value.length)
  );
}

export default function CalculatorScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [didEvaluate, setDidEvaluate] = useState(false);
  const addHistoryItem = useCalculatorStore((state) => state.addHistoryItem);

  const handleTokenPress = (token: string) => {
    const isScientificToken =
      token.includes('(') || token === '\u03c0' || token === 'e';

    if (didEvaluate && /[0-9.]/.test(token)) {
      setExpression(token === '.' ? '0.' : token);
      setResult('0');
      setDidEvaluate(false);
      return;
    }

    if (didEvaluate && ['+', '-', '\u00d7', '\u00f7', '%'].includes(token)) {
      setExpression(`${result === 'Error' ? '0' : result}${token}`);
      setDidEvaluate(false);
      return;
    }

    if (didEvaluate && isScientificToken) {
      setExpression(token);
      setResult('0');
      setDidEvaluate(false);
      return;
    }

    setExpression((current) => appendToken(current, token));
    setDidEvaluate(false);
  };

  const handleActionPress = (action: string) => {
    if (action === 'clear') {
      setExpression('');
      setResult('0');
      setDidEvaluate(false);
      return;
    }

    if (action === 'delete') {
      setExpression((current) => current.slice(0, -1));
      setDidEvaluate(false);
      return;
    }

    if (action === 'toggle-sign') {
      setExpression((current) => toggleSign(current));
      setDidEvaluate(false);
      return;
    }

    if (action === 'evaluate') {
      try {
        const source = expression || result;
        const next = evaluateExpression(source);
        setResult(next);
        addHistoryItem(source, next);
        setDidEvaluate(true);
      } catch {
        setResult('Error');
        setDidEvaluate(true);
      }
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRail}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon color={theme.colors.text.primary} size={rfs(18)} weight="bold" />
          </Pressable>
          <View style={styles.modeBadge}>
            <View
              style={[
                styles.modeDot,
                theme.isDark ? styles.modeDotDark : styles.modeDotLight,
              ]}
            />
            <Text style={styles.modeGlyph}>{theme.isDark ? '\u263e' : '\u2600'}</Text>
          </View>
        </View>

        <View style={styles.displayWrap}>
          <CalcDisplay expression={expression} result={result} />
        </View>

        <View style={styles.scientificWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scientificContent}
          >
            {scientificActions.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleTokenPress(item.token)}
                style={({ pressed }) => [
                  styles.scientificButton,
                  pressed && styles.scientificButtonPressed,
                ]}
              >
                <Text style={styles.scientificButtonText}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.keypad}>
          {calculatorRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((button) => (
                <CalcButton
                  key={button.label}
                  label={
                    button.label === 'backspace' ? undefined : button.label
                  }
                  onPress={() =>
                    'token' in button
                      ? handleTokenPress(button.token)
                      : handleActionPress(button.action)
                  }
                  variant={button.variant}
                >
                  {button.label === 'backspace' ? (
                    <BackspaceIcon
                      color={theme.colors.text.primary}
                      size={rfs(24)}
                      weight="regular"
                    />
                  ) : undefined}
                </CalcButton>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const isDark = theme.isDark;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark
        ? theme.colors.background.app
        : theme.colors.background.screen,
    },
    container: {
      flex: 1,
      paddingHorizontal: s(18),
      paddingTop: vs(10),
      paddingBottom: vs(16),
      backgroundColor: isDark
        ? theme.colors.background.app
        : theme.colors.background.screen,
    },
    topRail: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: vs(34),
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
    modeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: vs(8),
      borderRadius: 999,
      paddingHorizontal: vs(14),
      paddingVertical: vs(8),
      backgroundColor: isDark ? '#1D2130' : '#EFF3F7',
      borderWidth: 1,
      borderColor: isDark ? '#2A3142' : '#E1E8EF',
    },
    modeDot: {
      width: vs(10),
      height: vs(10),
      borderRadius: 999,
    },
    modeDotDark: {
      backgroundColor: theme.colors.brand.success,
    },
    modeDotLight: {
      backgroundColor: theme.colors.brand.primary,
    },
    modeGlyph: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(14),
    },
    displayWrap: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingTop: vs(12),
      paddingBottom: vs(6),
    },
    scientificWrap: {
      marginBottom: vs(10),
    },
    scientificContent: {
      gap: s(8),
      paddingHorizontal: 1,
    },
    scientificButton: {
      minWidth: s(54),
      height: vs(34),
      paddingHorizontal: s(14),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#16263B' : '#EAF0F6',
      borderWidth: 1,
      borderColor: theme.isDark ? '#263A54' : '#D8E2EC',
    },
    scientificButtonPressed: {
      opacity: 0.8,
    },
    scientificButtonText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    keypad: {
      gap: vs(10),
      paddingTop: vs(4),
      width: '100%',
      maxWidth: Math.min(screenWidth - s(28), s(388)),
      alignSelf: 'center',
    },
    keypadRow: {
      flexDirection: 'row',
      gap: s(10),
    },
  });
}