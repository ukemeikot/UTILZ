import { useEffect, useMemo, useState } from 'react';

import * as Haptics from 'expo-haptics';
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

import { StopwatchDisplay } from '../../src/components/time/StopwatchDisplay';
import { TimerDisplay } from '../../src/components/time/TimerDisplay';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useCountdown } from '../../src/hooks/useCountdown';
import { useStopwatch } from '../../src/hooks/useStopwatch';
import {
  convertTimeBetweenZones,
  formatWorldDate,
  formatWorldTime,
  getWorldPeriod,
  type HourFormat,
  type Meridiem,
  timeConversionZones,
  worldClockZones,
} from '../../src/modules/time/worldclock';

const timerPresets = [5, 10, 25, 45] as const;

export default function TimeScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'countdown' | 'world'>(
    'world',
  );
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [tick, setTick] = useState(Date.now());
  const [selectedZone, setSelectedZone] = useState(worldClockZones[4].zone);
  const [hourFormat, setHourFormat] = useState<HourFormat>('24h');
  const [conversionFromZone, setConversionFromZone] = useState(
    timeConversionZones[0].zone,
  );
  const [conversionToZone, setConversionToZone] = useState(
    timeConversionZones[1].zone,
  );
  const [converterHour, setConverterHour] = useState('08');
  const [converterMinute, setConverterMinute] = useState('30');
  const [converterMeridiem, setConverterMeridiem] = useState<Meridiem>('AM');
  const stopwatch = useStopwatch();
  const countdown = useCountdown(600);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown.remaining === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [countdown.remaining]);

  const selectedCity = useMemo(
    () =>
      worldClockZones.find((clock) => clock.zone === selectedZone) ??
      worldClockZones[0],
    [selectedZone],
  );
  const remainingCities = useMemo(
    () => worldClockZones.filter((clock) => clock.zone !== selectedZone),
    [selectedZone],
  );
  const cityRows = useMemo(() => {
    const rows: (typeof remainingCities)[] = [];

    for (let index = 0; index < remainingCities.length; index += 2) {
      rows.push(remainingCities.slice(index, index + 2));
    }

    return rows;
  }, [remainingCities]);

  const selectedPeriod = getWorldPeriod(selectedCity.zone);
  const conversionFrom = useMemo(
    () =>
      timeConversionZones.find((zone) => zone.zone === conversionFromZone) ??
      timeConversionZones[0],
    [conversionFromZone],
  );
  const conversionTo = useMemo(
    () =>
      timeConversionZones.find((zone) => zone.zone === conversionToZone) ??
      timeConversionZones[1],
    [conversionToZone],
  );
  const convertedTime = useMemo(
    () =>
      convertTimeBetweenZones({
        fromZone: conversionFrom.zone,
        toZone: conversionTo.zone,
        hour: Number(converterHour) || 0,
        minute: Number(converterMinute) || 0,
        meridiem: converterMeridiem,
        format: hourFormat,
      }),
    [
      conversionFrom.zone,
      conversionTo.zone,
      converterHour,
      converterMinute,
      converterMeridiem,
      hourFormat,
    ],
  );

  useEffect(() => {
    if (conversionFromZone === conversionToZone) {
      const fallbackTarget =
        timeConversionZones.find((zone) => zone.zone !== conversionFromZone)
          ?.zone ?? conversionFromZone;
      setConversionToZone(fallbackTarget);
    }
  }, [conversionFromZone, conversionToZone]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={styles.safeArea}
    >
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
              styles.headerEyebrow,
              {
                color: theme.colors.text.muted,
                fontFamily: theme.fonts.family.medium,
              },
            ]}
          >
            {copy.time.title}
          </Text>
        </View>

        <View style={styles.tabRail}>
          {(['stopwatch', 'countdown', 'world'] as const).map((tab) => {
            const active = tab === activeTab;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  active ? styles.tabButtonActive : styles.tabButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: active
                        ? theme.colors.text.inverse
                        : theme.colors.text.primary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {copy.time.tabs[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'stopwatch' ? (
          <>
            <StopwatchDisplay
              elapsed={stopwatch.elapsed}
              isRunning={stopwatch.isRunning}
              laps={stopwatch.laps}
            />

            <View style={styles.actionRow}>
              <Pressable
                onPress={stopwatch.isRunning ? stopwatch.stop : stopwatch.start}
                style={[styles.actionButton, styles.primaryAction]}
              >
                <Text style={[styles.actionButtonText, styles.primaryActionText]}>
                  {stopwatch.isRunning ? copy.time.stop : copy.time.start}
                </Text>
              </Pressable>
              <Pressable
                onPress={stopwatch.lap}
                style={[styles.actionButton, styles.secondaryAction]}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {copy.time.lap}
                </Text>
              </Pressable>
              <Pressable
                onPress={stopwatch.reset}
                style={[styles.actionButton, styles.secondaryAction]}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {copy.time.reset}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {activeTab === 'countdown' ? (
          <>
            <TimerDisplay
              configuredMinutes={timerMinutes}
              isRunning={countdown.isRunning}
              seconds={countdown.remaining}
            />

            <View style={styles.presetsWrap}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                {copy.time.presets}
              </Text>
              <View style={styles.presetRow}>
                {timerPresets.map((preset) => {
                  const active = preset === timerMinutes;

                  return (
                    <Pressable
                      key={preset}
                      onPress={() => {
                        setTimerMinutes(preset);
                        countdown.reset(preset * 60);
                      }}
                      style={[
                        styles.presetButton,
                        active
                          ? styles.presetButtonActive
                          : styles.presetButtonInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetButtonText,
                          {
                            color: active
                              ? theme.colors.text.inverse
                              : theme.colors.text.primary,
                            fontFamily: theme.fonts.family.medium,
                          },
                        ]}
                      >
                        {preset}m
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                onPress={countdown.isRunning ? countdown.pause : countdown.start}
                style={[styles.actionButton, styles.primaryAction]}
              >
                <Text style={[styles.actionButtonText, styles.primaryActionText]}>
                  {countdown.isRunning ? copy.time.pause : copy.time.start}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => countdown.reset(timerMinutes * 60)}
                style={[styles.actionButton, styles.secondaryAction]}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {copy.time.reset}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {activeTab === 'world' ? (
          <>
            <View style={styles.featuredClock}>
              <View style={styles.featuredTopRow}>
                <View>
                  <Text
                    style={[
                      styles.featuredCity,
                      {
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.family.semiBold,
                      },
                    ]}
                  >
                    {selectedCity.city}
                  </Text>
                  <Text
                    style={[
                      styles.featuredCountry,
                      {
                        color: theme.colors.text.muted,
                        fontFamily: theme.fonts.family.regular,
                      },
                    ]}
                  >
                    {selectedCity.country}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.utcLabel,
                    {
                      color: theme.colors.text.secondary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {selectedCity.utcLabel}
                </Text>
              </View>

              <Text
                style={[
                  styles.periodLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.regular,
                  },
                ]}
              >
                {selectedPeriod.label} {selectedPeriod.icon}
              </Text>

              <Text
                key={tick}
                adjustsFontSizeToFit
                minimumFontScale={0.58}
                numberOfLines={1}
                ellipsizeMode="clip"
                style={[
                  styles.featuredTime,
                  {
                    color: theme.colors.text.primary,
                    fontFamily: theme.fonts.family.extraBold,
                  },
                ]}
              >
                {formatWorldTime(selectedCity.zone, hourFormat)}
              </Text>

              <Text
                style={[
                  styles.featuredDate,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.fonts.family.medium,
                  },
                ]}
              >
                {formatWorldDate(selectedCity.zone)}
              </Text>
            </View>

            <View style={styles.formatAndConversionWrap}>
              <View style={styles.formatCard}>
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      color: theme.colors.text.secondary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {copy.time.clockFormat}
                </Text>
                <View style={styles.formatToggleRow}>
                  {(['12h', '24h'] as const).map((format) => {
                    const active = format === hourFormat;

                    return (
                      <Pressable
                        key={format}
                        onPress={() => setHourFormat(format)}
                        style={[
                          styles.formatToggle,
                          active
                            ? styles.formatToggleActive
                            : styles.formatToggleInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.formatToggleText,
                            {
                              color: active
                                ? theme.colors.text.inverse
                                : theme.colors.text.primary,
                              fontFamily: theme.fonts.family.medium,
                            },
                          ]}
                        >
                          {format}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.converterCard}>
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      color: theme.colors.text.secondary,
                      fontFamily: theme.fonts.family.medium,
                    },
                  ]}
                >
                  {copy.time.timeConversion}
                </Text>

                <View style={styles.converterInputRow}>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={setConverterHour}
                      placeholder={hourFormat === '24h' ? '14' : '08'}
                      placeholderTextColor={theme.colors.text.muted}
                      style={[
                        styles.timeInput,
                        {
                          color: theme.colors.text.primary,
                          fontFamily: theme.fonts.family.semiBold,
                        },
                      ]}
                      value={converterHour}
                    />
                    <Text
                      style={[
                        styles.timeSeparator,
                        {
                          color: theme.colors.text.secondary,
                          fontFamily: theme.fonts.family.medium,
                        },
                      ]}
                    >
                      :
                    </Text>
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={setConverterMinute}
                      placeholder="30"
                      placeholderTextColor={theme.colors.text.muted}
                      style={[
                        styles.timeInput,
                        {
                          color: theme.colors.text.primary,
                          fontFamily: theme.fonts.family.semiBold,
                        },
                      ]}
                      value={converterMinute}
                    />
                  </View>

                  {hourFormat === '12h' ? (
                    <View style={styles.meridiemRow}>
                      {(['AM', 'PM'] as const).map((period) => {
                        const active = period === converterMeridiem;

                        return (
                          <Pressable
                            key={period}
                            onPress={() => setConverterMeridiem(period)}
                            style={[
                              styles.meridiemButton,
                              active
                                ? styles.meridiemButtonActive
                                : styles.meridiemButtonInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.meridiemText,
                                {
                                  color: active
                                    ? theme.colors.text.inverse
                                    : theme.colors.text.primary,
                                  fontFamily: theme.fonts.family.medium,
                                },
                              ]}
                            >
                              {period}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>

                <View style={styles.zonePairRow}>
                  <View style={styles.zoneCard}>
                    <Text
                      style={[
                        styles.zoneLabel,
                        {
                          color: theme.colors.text.muted,
                          fontFamily: theme.fonts.family.medium,
                        },
                      ]}
                    >
                      {copy.time.from}
                    </Text>
                    <Text
                      style={[
                        styles.zoneName,
                        {
                          color: theme.colors.text.primary,
                          fontFamily: theme.fonts.family.semiBold,
                        },
                      ]}
                    >
                      {conversionFrom.label}
                    </Text>
                    <Text
                      style={[
                        styles.zoneUtc,
                        {
                          color: theme.colors.text.muted,
                          fontFamily: theme.fonts.family.regular,
                        },
                      ]}
                    >
                      {conversionFrom.utcLabel}
                    </Text>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                      ellipsizeMode="clip"
                      style={[
                        styles.zoneTime,
                        {
                          color: theme.colors.brand.success,
                          fontFamily: theme.fonts.family.bold,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {convertedTime.sourceTime}
                    </Text>
                  </View>
                  <View style={styles.zoneCard}>
                    <Text
                      style={[
                        styles.zoneLabel,
                        {
                          color: theme.colors.text.muted,
                          fontFamily: theme.fonts.family.medium,
                        },
                      ]}
                    >
                      {copy.time.to}
                    </Text>
                    <Text
                      style={[
                        styles.zoneName,
                        {
                          color: theme.colors.text.primary,
                          fontFamily: theme.fonts.family.semiBold,
                        },
                      ]}
                    >
                      {conversionTo.label}
                    </Text>
                    <Text
                      style={[
                        styles.zoneUtc,
                        {
                          color: theme.colors.text.muted,
                          fontFamily: theme.fonts.family.regular,
                        },
                      ]}
                    >
                      {conversionTo.utcLabel}
                    </Text>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                      ellipsizeMode="clip"
                      style={[
                        styles.zoneTime,
                        {
                          color: theme.colors.brand.success,
                          fontFamily: theme.fonts.family.bold,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {convertedTime.targetTime}
                    </Text>
                    <Text
                      style={[
                        styles.zoneDate,
                        {
                          color: theme.colors.text.secondary,
                          fontFamily: theme.fonts.family.regular,
                        },
                      ]}
                    >
                      {convertedTime.targetDate}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.targetRail}
                >
                  {timeConversionZones.map((zone) => {
                    const active = zone.zone === conversionFromZone;

                    return (
                      <Pressable
                        key={`from-${zone.zone}`}
                        onPress={() => setConversionFromZone(zone.zone)}
                        style={[
                          styles.targetChip,
                          active
                            ? styles.targetChipActive
                            : styles.targetChipInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.targetChipText,
                            {
                              color: active
                                ? theme.colors.text.inverse
                                : theme.colors.text.primary,
                              fontFamily: theme.fonts.family.medium,
                            },
                          ]}
                        >
                          {zone.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.targetRail}
                >
                  {timeConversionZones.map((zone) => {
                    const active = zone.zone === conversionToZone;

                    return (
                      <Pressable
                        key={`to-${zone.zone}`}
                        onPress={() => setConversionToZone(zone.zone)}
                        style={[
                          styles.targetChip,
                          active
                            ? styles.targetChipActive
                            : styles.targetChipInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.targetChipText,
                            {
                              color: active
                                ? theme.colors.text.inverse
                                : theme.colors.text.primary,
                              fontFamily: theme.fonts.family.medium,
                            },
                          ]}
                        >
                          {zone.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.clockGrid}>
              {cityRows.map((row, rowIndex) => (
                <View
                  key={`row-${rowIndex}`}
                  style={[
                    styles.clockRow,
                    row.length === 1 && styles.clockRowCentered,
                  ]}
                >
                  {row.map((clock) => {
                    const period = getWorldPeriod(clock.zone);

                    return (
                      <Pressable
                        key={clock.zone}
                        onPress={() => setSelectedZone(clock.zone)}
                        style={[styles.clockCard, styles.clockCardInactive]}
                      >
                        <View style={styles.clockCardTop}>
                          <Text
                            style={[
                              styles.clockCardCity,
                              {
                                color: theme.colors.text.primary,
                                fontFamily: theme.fonts.family.medium,
                              },
                            ]}
                          >
                            {clock.city}
                          </Text>
                          <Text
                            style={[
                              styles.clockCardUtc,
                              {
                                color: theme.colors.text.muted,
                                fontFamily: theme.fonts.family.regular,
                              },
                            ]}
                          >
                            {clock.utcLabel}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.clockCardPeriod,
                            {
                              color: theme.colors.text.secondary,
                              fontFamily: theme.fonts.family.regular,
                            },
                          ]}
                        >
                          {period.label} {period.icon}
                        </Text>
                        <Text
                          key={`${clock.zone}-${tick}`}
                          adjustsFontSizeToFit
                          minimumFontScale={0.65}
                          ellipsizeMode="clip"
                          numberOfLines={1}
                          style={[
                            styles.clockCardTime,
                        {
                              color: theme.colors.text.primary,
                              fontFamily: theme.fonts.family.semiBold,
                            },
                          ]}
                        >
                          {formatWorldTime(clock.zone, hourFormat)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const isDark = theme.isDark;

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
      gap: vs(2),
    },
    headerEyebrow: {
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    tabRail: {
      flexDirection: 'row',
      gap: s(10),
    },
    tabButton: {
      borderRadius: 999,
      paddingHorizontal: s(16),
      paddingVertical: vs(10),
    },
    tabButtonActive: {
      backgroundColor: theme.colors.brand.primary,
    },
    tabButtonInactive: {
      backgroundColor: theme.isDark ? '#1A2C43' : '#EEF3F8',
    },
    tabButtonText: {
      fontSize: rfs(13),
      textTransform: 'capitalize',
    },
    actionRow: {
      flexDirection: 'row',
      gap: s(10),
    },
    actionButton: {
      flex: 1,
      minHeight: vs(48),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    primaryAction: {
      backgroundColor: theme.colors.brand.success,
      borderColor: theme.colors.brand.success,
    },
    secondaryAction: {
      backgroundColor: isDark ? '#1A2C43' : '#EEF3F8',
      borderColor: theme.colors.border.subtle,
    },
    actionButtonText: {
      fontSize: rfs(15),
    },
    primaryActionText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.fonts.family.semiBold,
    },
    presetsWrap: {
      borderRadius: vs(24),
      padding: vs(18),
      backgroundColor: isDark ? '#122238' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      gap: vs(12),
    },
    sectionLabel: {
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
    presetButton: {
      minWidth: s(64),
      borderRadius: 999,
      paddingHorizontal: s(16),
      paddingVertical: vs(10),
      borderWidth: 1,
    },
    presetButtonActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    presetButtonInactive: {
      backgroundColor: isDark ? '#1A304B' : '#F2F6FA',
      borderColor: theme.colors.border.subtle,
    },
    presetButtonText: {
      textAlign: 'center',
      fontSize: rfs(13),
    },
    featuredClock: {
      borderRadius: vs(30),
      paddingHorizontal: s(22),
      paddingVertical: vs(26),
      backgroundColor: isDark ? '#122238' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      gap: vs(10),
      minHeight: vs(250),
    },
    featuredTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: s(12),
    },
    featuredCity: {
      fontSize: rfs(24),
      lineHeight: rfs(30),
    },
    featuredCountry: {
      fontSize: rfs(14),
      marginTop: vs(3),
    },
    utcLabel: {
      fontSize: rfs(12),
    },
    periodLabel: {
      fontSize: rfs(13),
      marginTop: vs(6),
    },
    featuredTime: {
      fontSize: rfs(56),
      lineHeight: rfs(66),
      letterSpacing: -1.8,
      width: '100%',
      flexShrink: 1,
    },
    featuredDate: {
      fontSize: rfs(15),
    },
    formatAndConversionWrap: {
      gap: vs(14),
    },
    formatCard: {
      borderRadius: vs(22),
      padding: vs(16),
      backgroundColor: isDark ? '#122238' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      gap: vs(12),
    },
    formatToggleRow: {
      flexDirection: 'row',
      gap: s(10),
    },
    formatToggle: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: vs(10),
      alignItems: 'center',
      borderWidth: 1,
    },
    formatToggleActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    formatToggleInactive: {
      backgroundColor: isDark ? '#1A304B' : '#F2F6FA',
      borderColor: theme.colors.border.subtle,
    },
    formatToggleText: {
      fontSize: rfs(13),
    },
    converterCard: {
      borderRadius: vs(24),
      padding: vs(18),
      backgroundColor: isDark ? '#122238' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      gap: vs(14),
    },
    converterInputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: s(12),
      flexWrap: 'wrap',
    },
    timeInputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      minWidth: s(150),
    },
    timeInput: {
      width: s(62),
      height: vs(52),
      borderRadius: vs(16),
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: rfs(18),
      lineHeight: rfs(22),
      paddingVertical: 0,
      backgroundColor: isDark ? '#1A304B' : '#F2F6FA',
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    timeSeparator: {
      fontSize: rfs(24),
    },
    meridiemRow: {
      flexDirection: 'row',
      gap: s(8),
    },
    meridiemButton: {
      minWidth: s(56),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    meridiemButtonActive: {
      backgroundColor: theme.colors.brand.success,
      borderColor: theme.colors.brand.success,
    },
    meridiemButtonInactive: {
      backgroundColor: isDark ? '#1A304B' : '#F2F6FA',
      borderColor: theme.colors.border.subtle,
    },
    meridiemText: {
      fontSize: rfs(13),
    },
    zonePairRow: {
      flexDirection: 'row',
      gap: s(10),
    },
    zoneCard: {
      flex: 1,
      borderRadius: vs(20),
      padding: vs(14),
      backgroundColor: isDark ? '#1A304B' : '#F2F6FA',
      gap: vs(3),
    },
    zoneLabel: {
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    zoneName: {
      fontSize: rfs(16),
    },
    zoneUtc: {
      fontSize: rfs(11),
    },
    zoneTime: {
      fontSize: rfs(15),
      width: '100%',
      flexShrink: 1,
    },
    zoneDate: {
      fontSize: rfs(12),
    },
    targetRail: {
      gap: s(10),
    },
    targetChip: {
      borderRadius: 999,
      paddingHorizontal: s(14),
      paddingVertical: vs(10),
      borderWidth: 1,
    },
    targetChipActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    targetChipInactive: {
      backgroundColor: isDark ? '#1A304B' : '#F2F6FA',
      borderColor: theme.colors.border.subtle,
    },
    targetChipText: {
      fontSize: rfs(13),
    },
    clockGrid: {
      gap: s(12),
    },
    clockRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(12),
    },
    clockRowCentered: {
      justifyContent: 'center',
    },
    clockCard: {
      width: '47.2%',
      borderRadius: vs(24),
      padding: vs(16),
      gap: vs(8),
      borderWidth: 1,
    },
    clockCardInactive: {
      backgroundColor: isDark ? '#18293F' : '#FFFFFF',
      borderColor: theme.colors.border.subtle,
    },
    clockCardTop: {
      gap: vs(3),
    },
    clockCardCity: {
      fontSize: rfs(16),
    },
    clockCardUtc: {
      fontSize: rfs(11),
    },
    clockCardPeriod: {
      fontSize: rfs(12),
    },
    clockCardTime: {
      fontSize: rfs(14),
      letterSpacing: -0.2,
      width: '100%',
      flexShrink: 1,
    },
  });
}
