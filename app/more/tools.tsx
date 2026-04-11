import { useEffect } from 'react';

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CaretRightIcon,
  LockKeyIcon,
  PlusIcon,
} from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useVaultProtection } from '../../src/hooks/useVaultProtection';
import { usePasswordVaultStore } from '../../src/store/passwordVaultStore';

function formatVaultDate(value: number) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ToolsScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const hydrate = usePasswordVaultStore((state) => state.hydrate);
  const entries = usePasswordVaultStore((state) => state.entries);
  const lockVault = usePasswordVaultStore((state) => state.lockVault);
  const setSelectedEntryId = usePasswordVaultStore((state) => state.setSelectedEntryId);
  const isAllowed = useVaultProtection('/more/tools');

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  function openEntry(id: string) {
    setSelectedEntryId(id);
    router.push({
      pathname: '/more/vault-entry',
      params: { id },
    });
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + vs(112), vs(132)) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeftIcon style={styles.icon} weight="bold" />
            </Pressable>
            <Text style={styles.title}>{copy.vault.title}</Text>
            <Pressable onPress={lockVault} style={styles.iconButton}>
              <LockKeyIcon style={styles.icon} weight="regular" />
            </Pressable>
          </View>

          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{copy.vault.savedPasswords}</Text>
            <Text style={styles.summaryMeta}>
              {entries.length}{' '}
              {entries.length === 1 ? copy.vault.entry : copy.vault.entries}{' '}
              {copy.vault.secured}
            </Text>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{copy.vault.previousPasswords}</Text>
            <Text style={styles.sectionMeta}>
              {entries.length} {copy.vault.saved}
            </Text>
          </View>

          <View style={styles.list}>
            {entries.length ? (
              entries.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => openEntry(entry.id)}
                  style={styles.entryPressable}
                >
                  <Card style={styles.entryCard}>
                    <View style={styles.cardAccent} />
                    <View style={styles.entryContent}>
                      <View style={styles.entryMeta}>
                        <Text numberOfLines={1} style={styles.siteText}>
                          {entry.site}
                        </Text>
                        <Text numberOfLines={1} style={styles.usernameText}>
                          {entry.username}
                        </Text>
                        <Text style={styles.dateText}>
                          {copy.vault.updated} {formatVaultDate(entry.updatedAt)}
                        </Text>
                      </View>
                      <CaretRightIcon
                        color={theme.colors.text.muted}
                        size={rfs(16)}
                        weight="bold"
                      />
                    </View>
                  </Card>
                </Pressable>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{copy.vault.emptyTitle}</Text>
                <Text style={styles.emptyText}>
                  {copy.vault.emptyBody}
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>

        <Pressable
          onPress={() => router.push('/more/password-generator')}
          style={[styles.fab, { bottom: insets.bottom + vs(26) }]}
        >
          <PlusIcon color={theme.colors.text.inverse} size={rfs(22)} weight="bold" />
        </Pressable>
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
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    summaryCard: {
      gap: vs(6),
    },
    summaryTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
    },
    summaryMeta: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
    },
    sectionMeta: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
    },
    list: {
      gap: vs(14),
    },
    entryPressable: {
      width: '100%',
    },
    entryCard: {
      flexDirection: 'row',
      gap: s(14),
      paddingLeft: 0,
      overflow: 'hidden',
    },
    cardAccent: {
      width: s(8),
      borderTopLeftRadius: vs(24),
      borderBottomLeftRadius: vs(24),
      backgroundColor: theme.colors.brand.success,
    },
    entryContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
      paddingVertical: vs(2),
    },
    entryMeta: {
      flex: 1,
      gap: vs(5),
    },
    siteText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(19),
      letterSpacing: -0.3,
    },
    usernameText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
    },
    dateText: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
    },
    emptyCard: {
      gap: vs(10),
      alignItems: 'flex-start',
    },
    emptyTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
    },
    emptyText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(22),
    },
    fab: {
      position: 'absolute',
      right: s(22),
      width: vs(60),
      height: vs(60),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
      shadowColor: '#000000',
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 10 },
      elevation: 7,
    },
  });
}
