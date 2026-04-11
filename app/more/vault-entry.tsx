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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  FloppyDiskIcon,
  TrashIcon,
} from 'phosphor-react-native';

import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useVaultProtection } from '../../src/hooks/useVaultProtection';
import { usePasswordVaultStore } from '../../src/store/passwordVaultStore';
import { copyToClipboard } from '../../src/utils/clipboard';

function formatUpdatedAt(value: number) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function VaultEntryScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const entryId = Array.isArray(id) ? id[0] : id;
  const hydrate = usePasswordVaultStore((state) => state.hydrate);
  const entries = usePasswordVaultStore((state) => state.entries);
  const saveEntry = usePasswordVaultStore((state) => state.saveEntry);
  const deleteEntry = usePasswordVaultStore((state) => state.deleteEntry);
  const setSelectedEntryId = usePasswordVaultStore((state) => state.setSelectedEntryId);
  const isAllowed = useVaultProtection('/more/vault-entry', { id: entryId });

  const entry = useMemo(
    () => entries.find((item) => item.id === entryId),
    [entries, entryId],
  );

  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (entry) {
      setSite(entry.site);
      setUsername(entry.username);
      setSelectedEntryId(entry.id);
    }

    return () => {
      setSelectedEntryId(undefined);
    };
  }, [entry, setSelectedEntryId]);

  if (!isAllowed) {
    return null;
  }

  if (!entry) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.missingWrap}>
          <Text style={styles.missingTitle}>{copy.vault.notFoundTitle}</Text>
          <Text style={styles.missingText}>
            {copy.vault.notFoundBody}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentEntry = entry;
  const hiddenPassword = '*'.repeat(Math.max(currentEntry.password.length, 12));

  async function handleSave() {
    if (!site.trim()) {
      setMessage(copy.vault.siteEmpty);
      return;
    }

    if (!username.trim()) {
      setMessage(copy.vault.usernameEmpty);
      return;
    }

    await saveEntry({
      id: currentEntry.id,
      site,
      username,
      password: currentEntry.password,
    });
    setMessage(copy.vault.updatedMessage);
  }

  async function handleDelete() {
    await deleteEntry(currentEntry.id);
    router.replace('/more/tools');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          bottomOffset={insets.bottom + vs(88)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + vs(132) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeftIcon style={styles.icon} weight="bold" />
            </Pressable>
            <Text style={styles.title}>{copy.vault.entryTitle}</Text>
            <View style={styles.spacer} />
          </View>

          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{copy.vault.lastUpdated}</Text>
            <Text style={styles.summaryValue}>{formatUpdatedAt(entry.updatedAt)}</Text>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.label}>{copy.vault.site}</Text>
            <TextInput
              onChangeText={(value) => {
                setSite(value);
                setMessage('');
              }}
              placeholder={copy.vault.sitePlaceholder}
              placeholderTextColor={theme.colors.text.muted}
              style={styles.input}
              value={site}
            />

            <Text style={styles.label}>{copy.vault.username}</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={(value) => {
                setUsername(value);
                setMessage('');
              }}
              placeholder={copy.vault.usernamePlaceholder}
              placeholderTextColor={theme.colors.text.muted}
              style={styles.input}
              value={username}
            />

            <Text style={styles.label}>{copy.vault.password}</Text>
            <View style={styles.passwordBox}>
              <Text numberOfLines={1} style={styles.passwordValue}>
                {passwordVisible ? currentEntry.password : hiddenPassword}
              </Text>
              <Pressable
                onPress={() => setPasswordVisible((value) => !value)}
                style={styles.smallIconButton}
              >
                {passwordVisible ? (
                  <EyeSlashIcon
                    color={theme.colors.text.primary}
                    size={rfs(16)}
                    weight="regular"
                  />
                ) : (
                  <EyeIcon
                    color={theme.colors.text.primary}
                    size={rfs(16)}
                    weight="regular"
                  />
                )}
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              <Button
                label={copy.vault.copyPassword}
                onPress={() => void copyToClipboard(currentEntry.password)}
                variant="secondary"
                icon={
                  <CopyIcon
                    color={theme.colors.text.primary}
                    size={rfs(16)}
                    weight="regular"
                  />
                }
              />
              <Button
                label={copy.vault.copyUsername}
                onPress={() => void copyToClipboard(currentEntry.username)}
                variant="secondary"
                icon={
                  <CopyIcon
                    color={theme.colors.text.primary}
                    size={rfs(16)}
                    weight="regular"
                  />
                }
              />
            </View>

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </Card>
        </KeyboardAwareScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + vs(12) }]}>
          <View style={styles.bottomActions}>
            <Button
              label={copy.vault.saveChanges}
              onPress={() => void handleSave()}
              icon={
                <FloppyDiskIcon
                  color={theme.colors.text.inverse}
                  size={rfs(16)}
                  weight="fill"
                />
              }
            />
            <Button
              label={copy.vault.delete}
              onPress={() => void handleDelete()}
              variant="secondary"
              icon={
                <TrashIcon
                  color={theme.colors.text.primary}
                  size={rfs(16)}
                  weight="regular"
                />
              }
            />
          </View>
        </View>
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
      gap: s(12),
    },
    iconButton: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    icon: {
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
    spacer: {
      width: vs(42),
      height: vs(42),
    },
    summaryCard: {
      gap: vs(6),
    },
    summaryLabel: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    summaryValue: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
    },
    sectionCard: {
      gap: vs(12),
    },
    label: {
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
    passwordBox: {
      minHeight: vs(54),
      borderRadius: vs(18),
      borderWidth: 1,
      paddingHorizontal: s(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(10),
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.subtle,
    },
    passwordValue: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(15),
    },
    smallIconButton: {
      width: vs(34),
      height: vs(34),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
    },
    actionRow: {
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
    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: s(18),
      paddingTop: vs(12),
      backgroundColor: theme.colors.surface.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    bottomActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
    },
    missingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24),
      gap: vs(10),
    },
    missingTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
    },
    missingText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(22),
      textAlign: 'center',
    },
  });
}
