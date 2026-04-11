import { useMemo, useState } from 'react';

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
import { ArrowLeftIcon, LockKeyIcon } from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function NotesUnlockScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const styles = createStyles(theme);
  const { next, id } = useLocalSearchParams<{
    next?: string | string[];
    id?: string | string[];
  }>();
  const unlockNotes = useSettingsStore((state) => state.unlockNotes);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const nextRoute = useMemo(
    () => (Array.isArray(next) ? next[0] : next) || '/more/notes',
    [next],
  );
  const noteId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  async function handleUnlock() {
    const isValid = await unlockNotes(pin);

    if (!isValid) {
      setError(copy.notes.pinMismatch);
      return;
    }

    setError('');
    if (nextRoute === '/more/note-editor' && noteId) {
      router.replace({
        pathname: '/more/note-editor',
        params: { id: noteId },
      });
      return;
    }

    router.replace(nextRoute as '/more/notes' | '/more/note-editor');
  }

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
            <LockKeyIcon color={theme.colors.brand.success} size={rfs(28)} weight="duotone" />
          </View>
          <Text style={styles.title}>{copy.notes.lockedTitle}</Text>
          <Text style={styles.body}>{copy.notes.lockedBody}</Text>

          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => {
              setPin(value.replace(/[^0-9]/g, ''));
              setError('');
            }}
            placeholder="••••"
            placeholderTextColor={theme.colors.text.muted}
            secureTextEntry
            style={styles.input}
            value={pin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={() => void handleUnlock()} style={styles.button}>
            <Text style={styles.buttonText}>{copy.notes.unlock}</Text>
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
      width: vs(64),
      height: vs(64),
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
      minHeight: vs(54),
      borderRadius: vs(18),
      backgroundColor: theme.colors.surface.input,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
      letterSpacing: 6,
      textAlign: 'center',
      paddingHorizontal: s(16),
    },
    error: {
      alignSelf: 'flex-start',
      color: '#D94B4B',
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
    },
    button: {
      width: '100%',
      minHeight: vs(52),
      borderRadius: vs(18),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(15),
    },
  });
}
