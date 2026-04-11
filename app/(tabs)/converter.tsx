import { useEffect, useMemo, useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowsDownUpIcon } from 'phosphor-react-native';

import { CategoryPicker } from '../../src/components/converter/CategoryPicker';
import { ConversionResult } from '../../src/components/converter/ConversionResult';
import { rfs, s, vs } from '../../src/constants/scale';
import {
  areaUnits,
  converterCategories,
  currencyUnits,
  lengthUnits,
  speedUnits,
  temperatureUnits,
  weightUnits,
} from '../../src/constants/units';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useCurrency } from '../../src/hooks/useCurrency';
import { convertArea } from '../../src/modules/converter/area';
import { convertCurrency } from '../../src/modules/converter/currency';
import { convertLength } from '../../src/modules/converter/length';
import { convertSpeed } from '../../src/modules/converter/speed';
import { convertTemperature } from '../../src/modules/converter/temperature';
import { convertWeight } from '../../src/modules/converter/weight';
import type {
  ConverterCategory,
  ConverterResult,
  ConverterUnit,
  CurrencyCode,
  UnitOption,
} from '../../src/types/converter.types';
import { formatCompactNumber } from '../../src/utils/format';

const BASE_MODES = ['2', '8', '10', '16'] as const;

function getUnitOptions(category: ConverterCategory): UnitOption[] {
  switch (category) {
    case 'length':
      return lengthUnits;
    case 'weight':
      return weightUnits;
    case 'temperature':
      return temperatureUnits;
    case 'area':
      return areaUnits;
    case 'speed':
      return speedUnits;
    case 'currency':
      return currencyUnits;
    case 'numberBase':
      return [];
  }
}

function convertByCategory(
  category: ConverterCategory,
  value: number,
  from: ConverterUnit,
  to: ConverterUnit,
  rates: ReturnType<typeof useCurrency>['rates'],
) {
  switch (category) {
    case 'length':
      return convertLength(value, from as never, to as never);
    case 'weight':
      return convertWeight(value, from as never, to as never);
    case 'temperature':
      return convertTemperature(value, from as never, to as never);
    case 'area':
      return convertArea(value, from as never, to as never);
    case 'speed':
      return convertSpeed(value, from as never, to as never);
    case 'currency':
      return convertCurrency(value, from as never, to as never, rates);
    case 'numberBase':
      return value;
  }
}

function findOption(options: UnitOption[], value: ConverterUnit) {
  return options.find((option) => option.value === value) ?? options[0];
}

export default function ConverterScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [category, setCategory] = useState<ConverterCategory>('currency');
  const [amount, setAmount] = useState('120');
  const [baseInput, setBaseInput] = useState('42');
  const [baseMode, setBaseMode] = useState<(typeof BASE_MODES)[number]>('10');
  const isNumberBase = category === 'numberBase';

  const options = useMemo(
    () => (isNumberBase ? [] : getUnitOptions(category)),
    [category, isNumberBase],
  );
  const [fromUnit, setFromUnit] = useState<ConverterUnit>(currencyUnits[1].value);
  const [toUnit, setToUnit] = useState<ConverterUnit>(currencyUnits[0].value);
  const currencyBase =
    category === 'currency' ? (fromUnit as CurrencyCode) : 'USD';
  const { rates, source, loading } = useCurrency(currencyBase);

  const parsedValue = useMemo(() => {
    const radix = Number(baseMode);
    return Number.parseInt(baseInput || '0', radix);
  }, [baseInput, baseMode]);

  const baseResults = useMemo(
    () => ({
      binary: Number.isNaN(parsedValue) ? '-' : parsedValue.toString(2),
      octal: Number.isNaN(parsedValue) ? '-' : parsedValue.toString(8),
      decimal: Number.isNaN(parsedValue) ? '-' : parsedValue.toString(10),
      hexadecimal: Number.isNaN(parsedValue)
        ? '-'
        : parsedValue.toString(16).toUpperCase(),
    }),
    [parsedValue],
  );

  useEffect(() => {
    if (isNumberBase || !options.length) {
      return;
    }

    const defaults =
      category === 'currency'
        ? [currencyUnits[1].value, currencyUnits[0].value]
        : [options[0].value, options[1]?.value ?? options[0].value];

    setFromUnit(defaults[0]);
    setToUnit(defaults[1]);
    setAmount(category === 'currency' ? '120' : '1');
  }, [category, isNumberBase, options]);

  const categoryMeta = converterCategories.find((item) => item.key === category);

  const selectedResult =
    !isNumberBase && options.length
      ? convertByCategory(category, Number(amount) || 0, fromUnit, toUnit, rates)
      : 0;

  const fromOption =
    !isNumberBase && options.length ? findOption(options, fromUnit) : null;
  const toOption =
    !isNumberBase && options.length ? findOption(options, toUnit) : null;

  const allResults: ConverterResult[] =
    !isNumberBase && options.length
      ? options
          .filter((option) => option.value !== fromUnit)
          .map((option) => ({
            label: option.label,
            symbol: option.symbol,
            value: convertByCategory(
              category,
              Number(amount) || 0,
              fromUnit,
              option.value,
              rates,
            ),
          }))
      : [];

  const detailMeta = isNumberBase
    ? categoryMeta?.subtitle ?? ''
    : [
        categoryMeta?.subtitle,
        category === 'currency' ? source : '',
        loading ? 'updating' : '',
      ]
        .filter(Boolean)
        .join(' | ');

  const detailLine =
    !isNumberBase && fromOption && toOption
      ? category === 'currency'
        ? `1 ${fromOption.value} = ${formatCompactNumber(
            convertByCategory(category, 1, fromUnit, toUnit, rates),
            4,
          )} ${toOption.value}`
        : `1 ${fromOption.symbol} = ${formatCompactNumber(
            convertByCategory(category, 1, fromUnit, toUnit, rates),
            4,
          )} ${toOption.symbol}`
      : Number.isNaN(parsedValue)
        ? `Enter a valid base ${baseMode} value to convert.`
        : `${baseInput || '0'} (base ${baseMode}) = ${baseResults.decimal} (base 10)`;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAwareScrollView
        bottomOffset={insets.bottom + vs(24)}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + vs(32) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.bold,
              },
            ]}
          >
            Smart Converter
          </Text>
        </View>

        <CategoryPicker value={category} onChange={setCategory} />

        <View style={styles.detailCard}>
          <Text
            style={[
              styles.detailLabel,
              {
                color: theme.colors.text.muted,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            Details
          </Text>
          <Text
            style={[
              styles.detailMeta,
              {
                color: theme.colors.text.tertiary,
                fontFamily: theme.fonts.family.regular,
              },
            ]}
          >
            {detailMeta}
          </Text>
          <Text
            style={[
              styles.detailValue,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            {detailLine}
          </Text>
        </View>

        {isNumberBase ? (
          <>
            <View style={styles.amountCard}>
              <View style={styles.amountMeta}>
                <Text
                  style={[
                    styles.amountLabel,
                    {
                      color: theme.colors.text.muted,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  Input
                </Text>
                <TextInput
                  autoCapitalize="characters"
                  onChangeText={setBaseInput}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.muted}
                  selectionColor={theme.colors.brand.success}
                  style={[
                    styles.amountInput,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.fonts.family.regular,
                    },
                  ]}
                  value={baseInput}
                />
              </View>
              <View style={styles.unitBadge}>
                <Text
                  style={[
                    styles.unitBadgeText,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.fonts.family.semiBold,
                    },
                  ]}
                >
                  Base {baseMode}
                </Text>
              </View>
            </View>

            <View style={styles.selectionSection}>
              <Text
                style={[
                  styles.selectionLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                Interpret as
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionRail}
              >
                {BASE_MODES.map((mode) => {
                  const active = mode === baseMode;

                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setBaseMode(mode)}
                      style={[
                        styles.selectionChip,
                        active && styles.selectionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectionChipText,
                          {
                            color: active
                              ? theme.colors.text.inverse
                              : theme.colors.text.primary,
                            fontFamily: theme.fonts.family.medium,
                          },
                        ]}
                      >
                        Base {mode}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.baseResultsCard}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: theme.colors.text.muted,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                Converted values
              </Text>
              <View style={styles.baseResultsWrap}>
                {[
                  ['Binary', baseResults.binary],
                  ['Octal', baseResults.octal],
                  ['Decimal', baseResults.decimal],
                  ['Hexadecimal', baseResults.hexadecimal],
                ].map(([label, value]) => (
                  <View key={label} style={styles.baseResultRow}>
                    <Text
                      style={[
                        styles.baseResultLabel,
                        {
                          color: theme.colors.text.secondary,
                          fontFamily: theme.fonts.family.regular,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[
                        styles.baseResultValue,
                        {
                          color: theme.colors.text.primary,
                          fontFamily: theme.fonts.family.bold,
                        },
                      ]}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.converterWrap}>
              <View style={styles.amountCard}>
                <View style={styles.amountMeta}>
                  <Text
                    style={[
                      styles.amountLabel,
                      {
                        color: theme.colors.text.muted,
                        fontFamily: theme.fonts.family.medium,
                      },
                    ]}
                  >
                    From
                  </Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.muted}
                    selectionColor={theme.colors.brand.success}
                    style={[
                      styles.amountInput,
                      {
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.family.regular,
                      },
                    ]}
                    value={amount}
                  />
                </View>
                <View style={styles.unitBadge}>
                  <Text
                    style={[
                      styles.unitBadgeText,
                      {
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.family.semiBold,
                      },
                    ]}
                  >
                    {fromOption ? `${fromOption.label} (${fromOption.symbol})` : ''}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  setFromUnit(toUnit);
                  setToUnit(fromUnit);
                }}
                style={styles.swapButton}
              >
                <ArrowsDownUpIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="bold"
                />
              </Pressable>

              <View style={styles.amountCard}>
                <View style={styles.amountMeta}>
                  <Text
                    style={[
                      styles.amountLabel,
                      {
                        color: theme.colors.text.muted,
                        fontFamily: theme.fonts.family.medium,
                      },
                    ]}
                  >
                    To
                  </Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      styles.amountOutput,
                      {
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.family.regular,
                      },
                    ]}
                  >
                    {formatCompactNumber(selectedResult, 6)}
                  </Text>
                </View>
                <View style={styles.unitBadge}>
                  <Text
                    style={[
                      styles.unitBadgeText,
                      {
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.family.semiBold,
                      },
                    ]}
                  >
                    {toOption ? `${toOption.label} (${toOption.symbol})` : ''}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.selectionSection}>
              <Text
                style={[
                  styles.selectionLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                From
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionRail}
              >
                {options.map((option) => {
                  const active = option.value === fromUnit;

                  return (
                    <Pressable
                      key={`from-${option.value}`}
                      onPress={() => setFromUnit(option.value)}
                      style={[
                        styles.selectionChip,
                        active && styles.selectionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectionChipText,
                          {
                            color: active
                              ? theme.colors.text.inverse
                              : theme.colors.text.primary,
                            fontFamily: theme.fonts.family.medium,
                          },
                        ]}
                      >
                        {option.symbol} {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.selectionSection}>
              <Text
                style={[
                  styles.selectionLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                To
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionRail}
              >
                {options.map((option) => {
                  const active = option.value === toUnit;

                  return (
                    <Pressable
                      key={`to-${option.value}`}
                      onPress={() => setToUnit(option.value)}
                      style={[
                        styles.selectionChip,
                        active && styles.selectionChipSuccess,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectionChipText,
                          {
                            color: active
                              ? theme.colors.text.inverse
                              : theme.colors.text.primary,
                            fontFamily: theme.fonts.family.medium,
                          },
                        ]}
                      >
                        {option.symbol} {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {category !== 'length' ? (
              <ConversionResult
                results={allResults}
                title={`${categoryMeta?.label ?? 'More'} outputs`}
              />
            ) : null}
          </>
        )}
      </KeyboardAwareScrollView>
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
    header: {
      alignItems: 'center',
    },
    title: {
      fontSize: rfs(24),
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    detailCard: {
      borderRadius: vs(22),
      padding: vs(16),
      gap: vs(6),
      backgroundColor: theme.isDark ? '#1C2B3F' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    detailLabel: {
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    detailMeta: {
      fontSize: rfs(12),
    },
    detailValue: {
      fontSize: rfs(16),
      lineHeight: rfs(24),
      marginTop: vs(4),
    },
    converterWrap: {
      gap: vs(12),
    },
    amountCard: {
      minHeight: vs(84),
      borderRadius: vs(20),
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      backgroundColor: theme.isDark ? '#22344C' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(14),
    },
    amountMeta: {
      flex: 1,
      gap: vs(4),
      minWidth: 0,
    },
    amountLabel: {
      fontSize: rfs(11),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    amountInput: {
      flex: 1,
      fontSize: rfs(28),
      paddingVertical: 0,
    },
    amountOutput: {
      flex: 1,
      fontSize: rfs(28),
    },
    unitBadge: {
      minWidth: s(108),
      maxWidth: s(132),
      borderRadius: vs(16),
      paddingHorizontal: s(12),
      paddingVertical: vs(12),
      backgroundColor: theme.isDark ? '#314765' : '#F5F8FB',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unitBadgeText: {
      fontSize: rfs(12),
      textAlign: 'center',
      lineHeight: rfs(16),
    },
    swapButton: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#101A28' : '#EEF3F8',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      marginVertical: vs(-2),
    },
    selectionSection: {
      gap: vs(10),
    },
    selectionLabel: {
      fontSize: rfs(13),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    selectionRail: {
      gap: s(10),
      paddingVertical: vs(2),
    },
    selectionChip: {
      borderRadius: 999,
      paddingHorizontal: s(14),
      paddingVertical: vs(11),
      backgroundColor: theme.isDark ? '#122238' : '#EEF3F7',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    selectionChipActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    selectionChipSuccess: {
      backgroundColor: theme.colors.brand.success,
      borderColor: theme.colors.brand.success,
    },
    selectionChipText: {
      fontSize: rfs(13),
    },
    baseResultsCard: {
      borderRadius: vs(22),
      padding: vs(16),
      gap: vs(14),
      backgroundColor: theme.isDark ? '#1C2B3F' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    baseResultsWrap: {
      gap: vs(10),
    },
    baseResultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
      borderRadius: vs(16),
      paddingHorizontal: s(14),
      paddingVertical: vs(12),
      backgroundColor: theme.isDark ? '#22344C' : '#F8FAFC',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    baseResultLabel: {
      fontSize: rfs(14),
    },
    baseResultValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: rfs(18),
    },
  });
}
