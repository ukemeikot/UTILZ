import { useEffect, useMemo, useState } from 'react';

import { router } from 'expo-router';
import {
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CaretRightIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  MoonStarsIcon,
  QuestionIcon,
  ShieldCheckIcon,
  TextAaIcon,
} from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import {
  type FontPreference,
  type LanguagePreference,
  useSettingsStore,
} from '../../src/store/settingsStore';
import { usePasswordVaultStore } from '../../src/store/passwordVaultStore';

type ExpandedPanel = 'font' | 'language' | 'pin' | null;

function getFontLabel(
  copy: ReturnType<typeof useAppCopy>,
  value: FontPreference,
) {
  return copy.settings.fontOptions[value];
}

function getLanguageLabel(
  copy: ReturnType<typeof useAppCopy>,
  value: LanguagePreference,
) {
  return copy.settings.languageOptions[value];
}

export default function SettingsScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const themePreference = useSettingsStore((state) => state.themePreference);
  const fontPreference = useSettingsStore((state) => state.fontPreference);
  const languagePreference = useSettingsStore((state) => state.languagePreference);
  const notesProtectionEnabled = useSettingsStore(
    (state) => state.notesProtectionEnabled,
  );
  const hasNotesPin = useSettingsStore((state) => state.hasNotesPin);
  const setThemePreference = useSettingsStore((state) => state.setThemePreference);
  const setFontPreference = useSettingsStore((state) => state.setFontPreference);
  const setLanguagePreference = useSettingsStore(
    (state) => state.setLanguagePreference,
  );
  const setNotesProtectionEnabled = useSettingsStore(
    (state) => state.setNotesProtectionEnabled,
  );
  const saveNotesPin = useSettingsStore((state) => state.saveNotesPin);
  const lockNotes = useSettingsStore((state) => state.lockNotes);
  const hydrateVault = usePasswordVaultStore((state) => state.hydrate);
  const vaultHasPin = usePasswordVaultStore((state) => state.hasPin);
  const vaultLockState = usePasswordVaultStore((state) => state.lockState);
  const lockVault = usePasswordVaultStore((state) => state.lockVault);

  const [pin, setPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);

  const isDarkMode = themePreference === 'dark';
  const fontSummary = useMemo(
    () => getFontLabel(copy, fontPreference),
    [copy, fontPreference],
  );
  const languageSummary = useMemo(
    () => getLanguageLabel(copy, languagePreference),
    [copy, languagePreference],
  );
  const vaultSummary = useMemo(() => {
    if (!vaultHasPin || vaultLockState === 'setup-required') {
      return copy.settings.vaultSetup;
    }

    if (vaultLockState === 'unlocked') {
      return copy.settings.vaultUnlocked;
    }

    return copy.settings.vaultLocked;
  }, [copy.settings.vaultLocked, copy.settings.vaultSetup, copy.settings.vaultUnlocked, vaultHasPin, vaultLockState]);

  useEffect(() => {
    void hydrateVault();
  }, [hydrateVault]);

  async function handleSavePin() {
    if (pin.replace(/[^0-9]/g, '').length < 4) {
      setPinMessage(copy.settings.pinInvalid);
      setExpandedPanel('pin');
      return;
    }

    await saveNotesPin(pin.replace(/[^0-9]/g, ''));
    setPin('');
    setPinMessage(copy.settings.pinSaved);
    setExpandedPanel(null);
  }

  function toggleDarkMode(nextValue: boolean) {
    void setThemePreference(nextValue ? 'dark' : 'light');
  }

  function handleProtectionToggle(nextValue: boolean) {
    if (nextValue && !hasNotesPin) {
      setPinMessage(copy.settings.pinRequiredFirst);
      setExpandedPanel('pin');
      return;
    }

    void setNotesProtectionEnabled(nextValue);
    setPinMessage(nextValue ? copy.settings.pinSaved : '');
  }

  function openVault() {
    if (vaultLockState === 'unlocked') {
      router.push('/more/tools');
      return;
    }

    router.push({
      pathname: '/more/vault-lock',
      params: { next: '/more/tools' },
    });
  }

  function openVaultPinFlow() {
    if (vaultHasPin) {
      router.push({
        pathname: '/more/vault-lock',
        params: { mode: 'change' },
      });
      return;
    }

    router.push('/more/vault-lock');
  }

  function renderChoiceChip<T extends string>(
    value: T,
    activeValue: T,
    label: string,
    onPress: (next: T) => void,
  ) {
    return (
      <Pressable
        key={value}
        onPress={() => void onPress(value)}
        style={[
          styles.choiceChip,
          activeValue === value && styles.choiceChipActive,
        ]}
      >
        <Text
          style={[
            styles.choiceChipText,
            activeValue === value && styles.choiceChipTextActive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAwareScrollView
        bottomOffset={insets.bottom + vs(20)}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(vs(32), insets.bottom + vs(16)) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon color={theme.colors.text.primary} size={rfs(18)} weight="bold" />
          </Pressable>
          <Text style={styles.title}>{copy.settings.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{copy.settings.protectionSection}</Text>
          <Card style={styles.groupCard}>
            <View style={styles.row}>
              <View style={styles.rowIconWrap}>
                <MoonStarsIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.darkMode}</Text>
                <Text style={styles.rowSubtitle}>
                  {isDarkMode ? copy.home.enabled : copy.home.disabled}
                </Text>
              </View>
              <Switch
                onValueChange={toggleDarkMode}
                thumbColor={theme.colors.text.inverse}
                trackColor={{
                  false: theme.colors.border.strong,
                  true: theme.colors.brand.success,
                }}
                value={isDarkMode}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowIconWrap}>
                <LockKeyIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.protectNotes}</Text>
                <Text style={styles.rowSubtitle}>
                  {notesProtectionEnabled ? copy.home.enabled : copy.home.disabled}
                </Text>
              </View>
              <Switch
                onValueChange={handleProtectionToggle}
                thumbColor={theme.colors.text.inverse}
                trackColor={{
                  false: theme.colors.border.strong,
                  true: theme.colors.brand.success,
                }}
                value={notesProtectionEnabled}
              />
            </View>

            <View style={styles.divider} />

            <Pressable
              onPress={() =>
                setExpandedPanel((current) => (current === 'pin' ? null : 'pin'))
              }
              style={styles.row}
            >
              <View style={styles.rowIconWrap}>
                <ShieldCheckIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.pinLabel}</Text>
                <Text style={styles.rowSubtitle}>
                  {hasNotesPin ? copy.settings.savedSecurely : copy.settings.pinPlaceholder}
                </Text>
              </View>
              <CaretRightIcon
                color={theme.colors.text.muted}
                size={rfs(16)}
                style={[
                  styles.chevron,
                  expandedPanel === 'pin' && styles.chevronExpanded,
                ]}
                weight="bold"
              />
            </Pressable>

            {expandedPanel === 'pin' ? (
              <View style={styles.expandedBlock}>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={(value) => {
                    setPin(value.replace(/[^0-9]/g, ''));
                    setPinMessage('');
                  }}
                  placeholder={copy.settings.pinPlaceholder}
                  placeholderTextColor={theme.colors.text.muted}
                  secureTextEntry
                  style={styles.pinInput}
                  value={pin}
                />
                {pinMessage ? <Text style={styles.pinMessage}>{pinMessage}</Text> : null}
                <View style={styles.actionRow}>
                  <Pressable onPress={() => void handleSavePin()} style={styles.primaryAction}>
                    <Text style={styles.primaryActionText}>{copy.settings.savePin}</Text>
                  </Pressable>
                  <Pressable onPress={lockNotes} style={styles.secondaryAction}>
                    <Text style={styles.secondaryActionText}>{copy.settings.lockNow}</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{copy.settings.privacySection}</Text>
          <Card style={styles.groupCard}>
            <Pressable
              onPress={() =>
                setExpandedPanel((current) => (current === 'font' ? null : 'font'))
              }
              style={styles.row}
            >
              <View style={styles.rowIconWrap}>
                <TextAaIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.font}</Text>
                <Text style={styles.rowSubtitle}>{fontSummary}</Text>
              </View>
              <CaretRightIcon
                color={theme.colors.text.muted}
                size={rfs(16)}
                style={[
                  styles.chevron,
                  expandedPanel === 'font' && styles.chevronExpanded,
                ]}
                weight="bold"
              />
            </Pressable>

            {expandedPanel === 'font' ? (
              <View style={styles.expandedBlock}>
                <View style={styles.choiceRow}>
                  {(['inter', 'system', 'serif'] as FontPreference[]).map((option) =>
                    renderChoiceChip(
                      option,
                      fontPreference,
                      copy.settings.fontOptions[option],
                      setFontPreference,
                    ),
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Pressable
              onPress={() =>
                setExpandedPanel((current) =>
                  current === 'language' ? null : 'language',
                )
              }
              style={styles.row}
            >
              <View style={styles.rowIconWrap}>
                <GlobeHemisphereWestIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.language}</Text>
                <Text style={styles.rowSubtitle}>{languageSummary}</Text>
              </View>
              <CaretRightIcon
                color={theme.colors.text.muted}
                size={rfs(16)}
                style={[
                  styles.chevron,
                  expandedPanel === 'language' && styles.chevronExpanded,
                ]}
                weight="bold"
              />
            </Pressable>

            {expandedPanel === 'language' ? (
              <View style={styles.expandedBlock}>
                <View style={styles.choiceRow}>
                  {(['en', 'fr', 'es'] as LanguagePreference[]).map((option) =>
                    renderChoiceChip(
                      option,
                      languagePreference,
                      copy.settings.languageOptions[option],
                      setLanguagePreference,
                    ),
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Pressable onPress={openVault} style={styles.row}>
              <View style={styles.rowIconWrap}>
                <LockKeyIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.vaultTitle}</Text>
                <Text style={styles.rowSubtitle}>{vaultSummary}</Text>
              </View>
              <CaretRightIcon color={theme.colors.text.muted} size={rfs(16)} weight="bold" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable onPress={openVaultPinFlow} style={styles.row}>
              <View style={styles.rowIconWrap}>
                <ShieldCheckIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>
                  {vaultHasPin ? copy.settings.changeVaultPin : copy.settings.createVaultPin}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {vaultHasPin
                    ? copy.settings.changeVaultPinHint
                    : copy.settings.createVaultPinHint}
                </Text>
              </View>
              <CaretRightIcon color={theme.colors.text.muted} size={rfs(16)} weight="bold" />
            </Pressable>

            {vaultLockState === 'unlocked' ? (
              <>
                <View style={styles.divider} />

                <Pressable
                  onPress={lockVault}
                  style={styles.row}
                >
                  <View style={styles.rowIconWrap}>
                    <LockKeyIcon
                      color={theme.colors.text.primary}
                      size={rfs(18)}
                      weight="regular"
                    />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle}>{copy.settings.lockVaultNow}</Text>
                    <Text style={styles.rowSubtitle}>{copy.settings.lockVaultNowHint}</Text>
                  </View>
                </Pressable>
              </>
            ) : null}

            <View style={styles.divider} />

            <Pressable
              onPress={() => {
                void Linking.openSettings();
              }}
              style={styles.row}
            >
              <View style={styles.rowIconWrap}>
                <ShieldCheckIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.permissions}</Text>
                <Text style={styles.rowSubtitle}>{copy.settings.permissionsHint}</Text>
              </View>
              <CaretRightIcon color={theme.colors.text.muted} size={rfs(16)} weight="bold" />
            </Pressable>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{copy.settings.supportSection}</Text>
          <Card style={styles.groupCard}>
            <Pressable onPress={() => router.push('/more/help')} style={styles.row}>
              <View style={styles.rowIconWrap}>
                <QuestionIcon
                  color={theme.colors.text.primary}
                  size={rfs(18)}
                  weight="regular"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{copy.settings.helpFaq}</Text>
                <Text style={styles.rowSubtitle}>{copy.settings.helpFaqHint}</Text>
              </View>
              <CaretRightIcon color={theme.colors.text.muted} size={rfs(16)} weight="bold" />
            </Pressable>
          </Card>
        </View>
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
      gap: vs(22),
    },
    header: {
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
      letterSpacing: -0.5,
    },
    section: {
      gap: vs(10),
    },
    sectionLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
      letterSpacing: -0.2,
    },
    groupCard: {
      paddingVertical: 0,
      overflow: 'hidden',
    },
    row: {
      minHeight: vs(78),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(14),
      paddingHorizontal: s(6),
    },
    rowIconWrap: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#1B324F' : '#F1F5F9',
    },
    rowContent: {
      flex: 1,
      gap: vs(2),
    },
    rowTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(15),
    },
    rowSubtitle: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(12),
      lineHeight: rfs(18),
    },
    divider: {
      height: 1,
      marginLeft: s(56),
      backgroundColor: theme.colors.border.subtle,
    },
    chevron: {
      transform: [{ rotate: '0deg' }],
    },
    chevronExpanded: {
      transform: [{ rotate: '90deg' }],
    },
    expandedBlock: {
      gap: vs(12),
      paddingHorizontal: s(56),
      paddingBottom: vs(16),
      paddingTop: vs(2),
    },
    choiceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
    choiceChip: {
      minHeight: vs(38),
      paddingHorizontal: s(14),
      borderRadius: 999,
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    choiceChipActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    choiceChipText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    choiceChipTextActive: {
      color: theme.colors.text.inverse,
    },
    pinInput: {
      minHeight: vs(48),
      borderRadius: vs(16),
      borderWidth: 1,
      paddingHorizontal: s(14),
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.subtle,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(15),
    },
    pinMessage: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
      lineHeight: rfs(18),
    },
    actionRow: {
      flexDirection: 'row',
      gap: s(10),
    },
    primaryAction: {
      flex: 1,
      minHeight: vs(44),
      borderRadius: vs(14),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    primaryActionText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(13),
    },
    secondaryAction: {
      minWidth: s(98),
      minHeight: vs(44),
      borderRadius: vs(14),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    secondaryActionText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
  });
}
