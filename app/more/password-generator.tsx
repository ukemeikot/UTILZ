import { useEffect, useMemo, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  FloppyDiskIcon,
  LockKeyIcon,
  ShieldCheckIcon,
} from 'phosphor-react-native';

import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { generatePassword } from '../../src/modules/password/generator';
import { usePasswordVaultStore } from '../../src/store/passwordVaultStore';
import { copyToClipboard } from '../../src/utils/clipboard';

function getStatusText(
  copy: ReturnType<typeof useAppCopy>,
  hasPin: boolean,
  lockState: 'setup-required' | 'locked' | 'unlocked',
) {
  if (!hasPin || lockState === 'setup-required') {
    return copy.password.statusSetup;
  }

  if (lockState === 'unlocked') {
    return copy.password.statusUnlocked;
  }

  return copy.password.statusLocked;
}

export default function PasswordGeneratorScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const hydrate = usePasswordVaultStore((state) => state.hydrate);
  const hasPin = usePasswordVaultStore((state) => state.hasPin);
  const lockState = usePasswordVaultStore((state) => state.lockState);
  const setPendingDraft = usePasswordVaultStore((state) => state.setPendingDraft);
  const clearPendingDraft = usePasswordVaultStore((state) => state.clearPendingDraft);
  const saveEntry = usePasswordVaultStore((state) => state.saveEntry);

  const [passwordLength, setPasswordLength] = useState(14);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState('');
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'default' | 'success'>('default');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => clearTimeout(timeout);
  }, [copied]);

  const passwordOptions = useMemo(
    () => [
      {
        label: copy.password.options.upper,
        value: includeUppercase,
        toggle: setIncludeUppercase,
      },
      {
        label: copy.password.options.lower,
        value: includeLowercase,
        toggle: setIncludeLowercase,
      },
      {
        label: copy.password.options.number,
        value: includeNumbers,
        toggle: setIncludeNumbers,
      },
      {
        label: copy.password.options.symbol,
        value: includeSymbols,
        toggle: setIncludeSymbols,
      },
    ],
    [
      copy.password.options.lower,
      copy.password.options.number,
      copy.password.options.symbol,
      copy.password.options.upper,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      includeUppercase,
    ],
  );

  function handleGeneratePassword() {
    const nextPassword = generatePassword({
      length: passwordLength,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    });

    if (!nextPassword) {
      setMessageTone('default');
      setMessage(copy.password.noSelection);
      return;
    }

    setPassword(nextPassword);
    setCopied(false);
    setMessageTone('default');
    setMessage('');
  }

  async function handleCopyPassword() {
    if (!password) {
      setMessageTone('default');
      setMessage(copy.password.copyFirst);
      return;
    }

    await copyToClipboard(password);
    setCopied(true);
    setMessageTone('success');
    setMessage(copy.password.copiedSuccess);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleSave() {
    const trimmedSite = site.trim();
    const trimmedUsername = username.trim();

    if (!password) {
      setMessageTone('default');
      setMessage(copy.password.generateBeforeSave);
      return;
    }

    if (!trimmedSite) {
      setMessageTone('default');
      setMessage(copy.password.addSite);
      return;
    }

    if (!trimmedUsername) {
      setMessageTone('default');
      setMessage(copy.password.addUsername);
      return;
    }

    const draft = {
      site: trimmedSite,
      username: trimmedUsername,
      password,
    };

    if (lockState !== 'unlocked') {
      setPendingDraft(draft);
      router.push({
        pathname: '/more/vault-lock',
        params: { next: '/more/tools' },
      });
      return;
    }

    const entry = await saveEntry(draft);
    clearPendingDraft();
    router.replace({
      pathname: '/more/vault-entry',
      params: { id: entry.id },
    });
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          bottomOffset={insets.bottom + vs(88)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + vs(28) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.topIconButton}>
              <ArrowLeftIcon style={styles.topIcon} weight="bold" />
            </Pressable>
            <Text style={styles.title}>{copy.password.title}</Text>
            <Pressable onPress={() => void handleSave()} style={styles.saveButton}>
              <FloppyDiskIcon
                color={theme.colors.text.inverse}
                size={rfs(18)}
                weight="fill"
              />
            </Pressable>
          </View>

          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              {lockState === 'unlocked' ? (
                <ShieldCheckIcon
                  color={theme.colors.brand.success}
                  size={rfs(18)}
                  weight="fill"
                />
              ) : (
                <LockKeyIcon
                  color={theme.colors.brand.success}
                  size={rfs(18)}
                  weight="fill"
                />
              )}
              <Text style={styles.statusText}>{getStatusText(copy, hasPin, lockState)}</Text>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.formLabel}>{copy.password.siteLabel}</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={(value) => {
                setSite(value);
                setMessage('');
              }}
              placeholder={copy.password.sitePlaceholder}
              placeholderTextColor={theme.colors.text.muted}
              style={styles.input}
              value={site}
            />

            <Text style={styles.formLabel}>{copy.password.usernameLabel}</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={(value) => {
                setUsername(value);
                setMessage('');
              }}
              placeholder={copy.password.usernamePlaceholder}
              placeholderTextColor={theme.colors.text.muted}
              style={styles.input}
              value={username}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{copy.password.generatorTitle}</Text>
            <View style={styles.passwordPreview}>
              <Text numberOfLines={2} style={styles.passwordText}>
                {password || copy.password.generatorPlaceholder}
              </Text>
            </View>

            <View style={styles.optionWrap}>
              {passwordOptions.map((option) => (
                <Pressable
                  key={option.label}
                  onPress={() => option.toggle(!option.value)}
                  style={[
                    styles.optionChip,
                    option.value ? styles.optionChipActive : styles.optionChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      option.value
                        ? styles.optionChipTextActive
                        : styles.optionChipTextInactive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{copy.password.length}</Text>
              <Text style={styles.metricValue}>{passwordLength}</Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                label={copy.password.shorter}
                onPress={() => setPasswordLength((value) => Math.max(8, value - 2))}
                variant="secondary"
              />
              <Button
                label={copy.password.longer}
                onPress={() => setPasswordLength((value) => Math.min(32, value + 2))}
                variant="secondary"
              />
            </View>

            <View style={styles.buttonRow}>
              <Button label={copy.password.generate} onPress={handleGeneratePassword} />
              <Button
                label={copied ? copy.password.copied : copy.password.copy}
                onPress={() => void handleCopyPassword()}
                variant="secondary"
                icon={
                  copied ? (
                    <CheckIcon
                      color={theme.colors.brand.success}
                      size={rfs(16)}
                      weight="bold"
                    />
                  ) : (
                    <CopyIcon
                      color={theme.colors.text.primary}
                      size={rfs(16)}
                      weight="regular"
                    />
                  )
                }
              />
            </View>

            {message ? (
              <Text
                style={[
                  styles.message,
                  messageTone === 'success' && styles.messageSuccess,
                ]}
              >
                {message}
              </Text>
            ) : null}
          </Card>

          <Card style={styles.saveCard}>
            <Text style={styles.saveTitle}>{copy.password.saveTitle}</Text>
            <Text style={styles.saveSubtitle}>
              {copy.password.saveBody}
            </Text>
            <Button label={copy.password.saveToVault} onPress={() => void handleSave()} />
          </Card>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.app,
    },
    container: {
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
      justifyContent: 'space-between',
      gap: s(12),
    },
    topIconButton: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    topIcon: {
      color: theme.colors.text.primary,
      fontSize: rfs(18),
    },
    title: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(24),
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    saveButton: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    statusCard: {
      gap: vs(6),
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
    },
    statusText: {
      flex: 1,
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
      lineHeight: rfs(20),
    },
    sectionCard: {
      gap: vs(14),
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
    },
    formLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(14),
    },
    input: {
      minHeight: vs(50),
      borderRadius: vs(16),
      borderWidth: 1,
      paddingHorizontal: s(16),
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.subtle,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
    },
    passwordPreview: {
      minHeight: vs(92),
      borderRadius: vs(22),
      borderWidth: 1,
      paddingHorizontal: s(16),
      paddingVertical: vs(16),
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.subtle,
    },
    passwordText: {
      color: theme.colors.brand.success,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(22),
      lineHeight: rfs(30),
      letterSpacing: 0.3,
    },
    optionWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
    optionChip: {
      minHeight: vs(40),
      paddingHorizontal: s(14),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    optionChipActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    optionChipInactive: {
      backgroundColor: theme.colors.surface.secondary,
      borderColor: theme.colors.border.subtle,
    },
    optionChipText: {
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    optionChipTextActive: {
      color: theme.colors.text.inverse,
    },
    optionChipTextInactive: {
      color: theme.colors.text.primary,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: s(12),
    },
    metricLabel: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
    },
    metricValue: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(18),
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
    message: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
      lineHeight: rfs(18),
    },
    messageSuccess: {
      color: theme.colors.brand.success,
    },
    saveCard: {
      gap: vs(10),
    },
    saveTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
    },
    saveSubtitle: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
      lineHeight: rfs(20),
    },
  });
}
