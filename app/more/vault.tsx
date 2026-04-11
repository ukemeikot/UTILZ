import { useEffect } from 'react';

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, CaretRightIcon, LockKeyIcon } from 'phosphor-react-native';

import { Card } from '../../src/components/common/Card';
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

export default function VaultScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const hydrate = usePasswordVaultStore((state) => state.hydrate);
  const entries = usePasswordVaultStore((state) => state.entries);
  const lockVault = usePasswordVaultStore((state) => state.lockVault);
  const setSelectedEntryId = usePasswordVaultStore((state) => state.setSelectedEntryId);
  const isAllowed = useVaultProtection('/more/vault');

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!isAllowed) {
    return null;
  }

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
            <ArrowLeftIcon color={theme.colors.text.primary} size={rfs(18)} weight="bold" />
          </Pressable>
          <Text style={styles.title}>Password Vault</Text>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Saved passwords</Text>
              <Text style={styles.summaryMeta}>{entries.length} entries secured</Text>
            </View>
            <Pressable onPress={lockVault} style={styles.lockButton}>
              <LockKeyIcon color={theme.colors.text.inverse} size={rfs(16)} weight="fill" />
            </Pressable>
          </View>
        </Card>

        <View style={styles.list}>
          {entries.length ? (
            entries.map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => {
                  setSelectedEntryId(entry.id);
                  router.push({
                    pathname: '/more/vault-entry',
                    params: { id: entry.id },
                  });
                }}
              >
                <Card style={styles.entryCard}>
                  <View style={styles.entryMeta}>
                    <Text numberOfLines={1} style={styles.siteText}>
                      {entry.site}
                    </Text>
                    <Text numberOfLines={1} style={styles.usernameText}>
                      {entry.username}
                    </Text>
                    <Text style={styles.dateText}>{formatVaultDate(entry.updatedAt)}</Text>
                  </View>
                  <CaretRightIcon color={theme.colors.text.muted} size={rfs(16)} weight="bold" />
                </Card>
              </Pressable>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No saved passwords yet</Text>
              <Text style={styles.emptyText}>
                Generate a password from Utility Tools and save it to the vault
                so you can return to it later.
              </Text>
            </Card>
          )}
        </View>
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
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(26),
      letterSpacing: -0.4,
    },
    summaryCard: {
      gap: vs(8),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: s(12),
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
    lockButton: {
      width: vs(38),
      height: vs(38),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    list: {
      gap: vs(12),
    },
    entryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },
    entryMeta: {
      flex: 1,
      gap: vs(4),
    },
    siteText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(16),
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
  });
}
