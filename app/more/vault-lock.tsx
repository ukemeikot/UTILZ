import { useEffect, useMemo, useState } from 'react';

import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, LockKeyIcon, ShieldCheckIcon } from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { usePasswordVaultStore } from '../../src/store/passwordVaultStore';

export default function VaultLockScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const styles = createStyles(theme);
  const { next, id, mode } = useLocalSearchParams<{
    next?: string | string[];
    id?: string | string[];
    mode?: string | string[];
  }>();
  const hydrate = usePasswordVaultStore((state) => state.hydrate);
  const hydrated = usePasswordVaultStore((state) => state.hydrated);
  const lockState = usePasswordVaultStore((state) => state.lockState);
  const pendingDraft = usePasswordVaultStore((state) => state.pendingDraft);
  const saveVaultPin = usePasswordVaultStore((state) => state.saveVaultPin);
  const verifyVaultPin = usePasswordVaultStore((state) => state.verifyVaultPin);
  const savePendingDraft = usePasswordVaultStore((state) => state.savePendingDraft);

  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const nextRoute = useMemo(
    () => (Array.isArray(next) ? next[0] : next) || '/more/tools',
    [next],
  );
  const entryId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const explicitMode = useMemo(() => (Array.isArray(mode) ? mode[0] : mode), [mode]);
  const screenMode = explicitMode === 'change'
    ? 'change'
    : lockState === 'setup-required'
      ? 'setup'
      : 'unlock';

  async function finishFlow() {
    const savedEntry = await savePendingDraft();

    if (savedEntry) {
      router.replace({
        pathname: '/more/vault-entry',
        params: { id: savedEntry.id },
      });
      return;
    }

    if (nextRoute === '/more/vault-entry' && entryId) {
      router.replace({
        pathname: '/more/vault-entry',
        params: { id: entryId },
      });
      return;
    }

    if (nextRoute === '/more/tools') {
      router.replace('/more/tools');
      return;
    }

    router.replace('/more/vault');
  }

  async function handleSubmit() {
    const normalizedCurrentPin = currentPin.replace(/[^0-9]/g, '');
    const nextPin = pin.replace(/[^0-9]/g, '');

    if (screenMode === 'change') {
      if (normalizedCurrentPin.length < 4) {
        setMessage(copy.vault.lock.currentPinFirst);
        return;
      }

      const isCurrentPinValid = await verifyVaultPin(normalizedCurrentPin);
      if (!isCurrentPinValid) {
        setMessage(copy.vault.lock.currentPinIncorrect);
        return;
      }
    }

    if (screenMode === 'unlock' && nextPin.length < 4) {
      setMessage(copy.vault.lock.pinTooShort);
      return;
    }

    if (screenMode !== 'unlock' && nextPin.length < 4) {
      setMessage(copy.vault.lock.pinTooShort);
      return;
    }

    if (screenMode !== 'unlock' && nextPin !== confirmPin.replace(/[^0-9]/g, '')) {
      setMessage(copy.vault.lock.pinsNoMatch);
      return;
    }

    if (screenMode === 'unlock') {
      const isValid = await verifyVaultPin(nextPin);
      if (!isValid) {
        setMessage(copy.vault.lock.pinMismatch);
        return;
      }
    } else {
      await saveVaultPin(nextPin);
    }

    setMessage('');
    await finishFlow();
  }

  const title =
    screenMode === 'setup'
      ? copy.vault.lock.createTitle
      : screenMode === 'change'
        ? copy.vault.lock.changeTitle
        : copy.vault.lock.unlockTitle;

  const body =
    screenMode === 'setup'
      ? copy.vault.lock.setupBody
      : screenMode === 'change'
        ? copy.vault.lock.changeBody
        : pendingDraft
          ? copy.vault.lock.unlockBodyPending
          : copy.vault.lock.unlockBodyView;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAwareScrollView
        bottomOffset={vs(24)}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.colors.text.primary} size={rfs(18)} weight="bold" />
        </Pressable>

        <Card style={styles.card}>
          <View style={styles.iconWrap}>
            {screenMode === 'unlock' ? (
              <LockKeyIcon color={theme.colors.brand.success} size={rfs(30)} weight="duotone" />
            ) : (
              <ShieldCheckIcon color={theme.colors.brand.success} size={rfs(30)} weight="duotone" />
            )}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {screenMode === 'change' ? (
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => {
                setCurrentPin(value.replace(/[^0-9]/g, ''));
                setMessage('');
              }}
              placeholder={copy.vault.lock.currentPinPlaceholder}
              placeholderTextColor={theme.colors.text.muted}
              secureTextEntry
              style={styles.input}
              value={currentPin}
            />
          ) : null}

          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => {
              setPin(value.replace(/[^0-9]/g, ''));
              setMessage('');
            }}
            placeholder={copy.vault.lock.enterPinPlaceholder}
            placeholderTextColor={theme.colors.text.muted}
            secureTextEntry
            style={styles.input}
            value={pin}
          />

          {screenMode !== 'unlock' ? (
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => {
                setConfirmPin(value.replace(/[^0-9]/g, ''));
                setMessage('');
              }}
              placeholder={copy.vault.lock.confirmPinPlaceholder}
              placeholderTextColor={theme.colors.text.muted}
              secureTextEntry
              style={styles.input}
              value={confirmPin}
            />
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable onPress={() => void handleSubmit()} style={styles.button}>
            <Text style={styles.buttonText}>
              {screenMode === 'unlock'
                ? copy.vault.lock.unlockAction
                : copy.vault.lock.saveAction}
            </Text>
          </Pressable>
        </Card>
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
      flexGrow: 1,
      paddingHorizontal: s(20),
      paddingTop: vs(20),
      justifyContent: 'center',
      gap: vs(18),
    },
    backButton: {
      position: 'absolute',
      top: vs(20),
      left: s(20),
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    card: {
      gap: vs(16),
      alignItems: 'center',
    },
    iconWrap: {
      width: vs(68),
      height: vs(68),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.state.successSoft,
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(24),
      textAlign: 'center',
    },
    body: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(22),
      textAlign: 'center',
    },
    input: {
      width: '100%',
      minHeight: vs(52),
      borderRadius: vs(18),
      backgroundColor: theme.colors.surface.input,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
      textAlign: 'center',
      paddingHorizontal: s(16),
    },
    message: {
      alignSelf: 'flex-start',
      color: '#D94B4B',
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
    },
    button: {
      width: '100%',
      minHeight: vs(50),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(14),
    },
  });
}
