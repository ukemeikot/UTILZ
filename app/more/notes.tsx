import { useEffect, useMemo, useState } from 'react';

import { router } from 'expo-router';
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
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  NotePencilIcon,
  PlayIcon,
  PlusIcon,
} from 'phosphor-react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useNotesProtection } from '../../src/hooks/useNotesProtection';
import {
  formatDuration,
  getCategoryLabel,
  formatNoteDate,
  getNoteExcerpt,
  noteFilterCategories,
} from '../../src/modules/notes/helpers';
import { useNotesStore } from '../../src/store/notesStore';
import type { NoteCategory, NoteItem } from '../../src/types/notes.types';

type FilterKey = 'all' | NoteCategory;

export default function NotesScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const isAllowed = useNotesProtection('/more/notes');
  const notes = useNotesStore((state) => state.notes);
  const hydrate = useNotesStore((state) => state.hydrate);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const player = useAudioPlayer(playbackUri ? { uri: playbackUri } : null, {
    updateInterval: 250,
    keepAudioSessionActive: true,
  });
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (playbackUri) {
      player.play();
    }
  }, [playbackUri, player]);

  const filteredNotes = useMemo(() => {
    const search = query.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesFilter =
        activeFilter === 'all' ? true : note.category === activeFilter;
      const matchesSearch = search
        ? [note.title, note.body, note.category]
            .join(' ')
            .toLowerCase()
            .includes(search)
        : true;

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, notes, query]);

  function openEditor(id?: string) {
    if (id) {
      router.push({
        pathname: '/more/note-editor',
        params: { id },
      });
      return;
    }

    router.push('/more/note-editor');
  }

  function togglePlayback(note: NoteItem) {
    if (!note.audioUri) {
      return;
    }

    if (activeAudioId === note.id && playerStatus.playing) {
      player.pause();
      return;
    }

    if (activeAudioId === note.id) {
      player.play();
      return;
    }

    setActiveAudioId(note.id);
    setPlaybackUri(note.audioUri);
  }

  const filterStyles = {
    all: [styles.filterBlue, activeFilter === 'all' && styles.filterBlueActive],
    personal: [
      styles.filterGold,
      activeFilter === 'personal' && styles.filterGoldActive,
    ],
    work: [styles.filterGreen, activeFilter === 'work' && styles.filterGreenActive],
    ideas: [
      styles.filterPurple,
      activeFilter === 'ideas' && styles.filterPurpleActive,
    ],
  } as const;

  const cardAccentStyles = {
    personal: styles.cardAccentGold,
    work: styles.cardAccentGreen,
    ideas: styles.cardAccentBlue,
  } as const;

  const cardChipStyles = {
    personal: styles.noteChipGold,
    work: styles.noteChipGreen,
    ideas: styles.noteChipBlue,
  } as const;

  if (!isAllowed) {
    return null;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          bottomOffset={insets.bottom + vs(28)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + vs(112), vs(132)) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeftIcon style={styles.icon} weight="bold" />
            </Pressable>
            <Text style={styles.title}>{copy.more.cards.notes.title}</Text>
            <Pressable onPress={() => openEditor()} style={styles.iconButton}>
              <NotePencilIcon style={styles.icon} weight="regular" />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <MagnifyingGlassIcon style={styles.searchIcon} weight="regular" />
              <TextInput
                onChangeText={setQuery}
                placeholder="Search notes"
                placeholderTextColor={theme.colors.text.muted}
                style={styles.searchInput}
                value={query}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {noteFilterCategories.map((category) => (
              <Pressable
                key={category.key}
                onPress={() => setActiveFilter(category.key)}
                style={[
                  styles.filterChip,
                  ...filterStyles[category.key],
                ]}
              >
                <Text style={styles.filterText}>{category.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Previous notes</Text>
            <Text style={styles.sectionMeta}>{filteredNotes.length} saved</Text>
          </View>

          <View style={styles.list}>
            {filteredNotes.length ? (
              filteredNotes.map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => openEditor(note.id)}
                  style={styles.notePressable}
                >
                  <Card style={styles.noteCard}>
                    <View
                      style={[styles.cardAccent, cardAccentStyles[note.category]]}
                    />
                    <View style={styles.noteContent}>
                      <View style={styles.noteHeader}>
                        <View style={styles.noteMeta}>
                          <Text numberOfLines={1} style={styles.noteTitle}>
                            {note.title}
                          </Text>
                          <Text numberOfLines={2} style={styles.noteExcerpt}>
                            {getNoteExcerpt(note)}
                          </Text>
                        </View>
                        {note.audioUri ? (
                          <Pressable
                            onPress={() => togglePlayback(note)}
                            style={styles.audioButton}
                          >
                            {activeAudioId === note.id && playerStatus.playing ? (
                              <MicrophoneIcon
                                color={theme.colors.text.inverse}
                                size={rfs(15)}
                                weight="fill"
                              />
                            ) : (
                              <PlayIcon
                                color={theme.colors.text.inverse}
                                size={rfs(15)}
                                weight="fill"
                              />
                            )}
                          </Pressable>
                        ) : null}
                      </View>

                      <View style={styles.noteFooter}>
                        <View
                          style={[styles.noteChip, cardChipStyles[note.category]]}
                        >
                          <Text style={styles.noteChipText}>
                            {getCategoryLabel(note.category)}
                          </Text>
                        </View>
                        <Text style={styles.noteDate}>
                          {formatNoteDate(note.updatedAt)}
                        </Text>
                        {note.audioUri ? (
                          <Text style={styles.noteDate}>
                            {formatDuration(note.audioDurationMillis)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No notes here yet</Text>
                <Text style={styles.emptyText}>
                  Tap the compose button to create a fresh note, dictate ideas,
                  or save a voice memo.
                </Text>
              </Card>
            )}
          </View>
        </KeyboardAwareScrollView>

        <Pressable
          onPress={() => openEditor()}
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
    },
    searchRow: {
      flexDirection: 'row',
    },
    searchBox: {
      flex: 1,
      minHeight: vs(52),
      borderRadius: vs(18),
      paddingHorizontal: s(14),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      backgroundColor: theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    searchIcon: {
      color: theme.colors.text.muted,
      fontSize: rfs(16),
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      paddingVertical: 0,
    },
    filterRow: {
      gap: s(12),
      paddingRight: s(18),
    },
    filterChip: {
      minHeight: vs(44),
      paddingHorizontal: s(18),
      borderRadius: 999,
      justifyContent: 'center',
      borderWidth: 1,
    },
    filterBlue: {
      backgroundColor: theme.isDark ? '#142746' : '#E9F2FF',
      borderColor: theme.isDark ? '#21497E' : '#C6D9F8',
    },
    filterBlueActive: {
      backgroundColor: '#2F95F6',
      borderColor: '#2F95F6',
    },
    filterGold: {
      backgroundColor: theme.isDark ? '#332812' : '#F9F0C9',
      borderColor: theme.isDark ? '#664C12' : '#E9D36B',
    },
    filterGoldActive: {
      backgroundColor: '#C99A16',
      borderColor: '#C99A16',
    },
    filterGreen: {
      backgroundColor: theme.isDark ? '#123121' : '#DFF5E8',
      borderColor: theme.isDark ? '#1B6540' : '#8FD5AA',
    },
    filterGreenActive: {
      backgroundColor: '#1C9C5D',
      borderColor: '#1C9C5D',
    },
    filterPurple: {
      backgroundColor: theme.isDark ? '#292043' : '#EBE5FF',
      borderColor: theme.isDark ? '#4E4092' : '#CBBEFF',
    },
    filterPurpleActive: {
      backgroundColor: '#6E63D9',
      borderColor: '#6E63D9',
    },
    filterText: {
      color: theme.isDark ? theme.colors.text.primary : '#07192B',
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(14),
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
      letterSpacing: -0.2,
    },
    sectionMeta: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
    },
    list: {
      gap: vs(14),
    },
    notePressable: {
      width: '100%',
    },
    noteCard: {
      flexDirection: 'row',
      gap: s(14),
      paddingLeft: 0,
      overflow: 'hidden',
    },
    cardAccent: {
      width: s(8),
      borderTopLeftRadius: vs(24),
      borderBottomLeftRadius: vs(24),
    },
    cardAccentGold: {
      backgroundColor: '#F1B80F',
    },
    cardAccentGreen: {
      backgroundColor: theme.colors.brand.success,
    },
    cardAccentBlue: {
      backgroundColor: '#4A8DFF',
    },
    noteContent: {
      flex: 1,
      paddingVertical: vs(2),
      gap: vs(12),
    },
    noteHeader: {
      flexDirection: 'row',
      gap: s(12),
      alignItems: 'flex-start',
    },
    noteMeta: {
      flex: 1,
      gap: vs(6),
    },
    noteTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(20),
      letterSpacing: -0.4,
    },
    noteExcerpt: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
      lineHeight: rfs(20),
    },
    audioButton: {
      width: vs(34),
      height: vs(34),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    noteFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: s(10),
    },
    noteChip: {
      minHeight: vs(26),
      paddingHorizontal: s(10),
      borderRadius: 999,
      justifyContent: 'center',
    },
    noteChipGold: {
      backgroundColor: theme.isDark ? '#3A2D0D' : '#FFF2C6',
    },
    noteChipGreen: {
      backgroundColor: theme.isDark ? '#143323' : '#DFF6E7',
    },
    noteChipBlue: {
      backgroundColor: theme.isDark ? '#1A2848' : '#E6EEFF',
    },
    noteChipText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
      textTransform: 'capitalize',
    },
    noteDate: {
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
      backgroundColor: '#2F7DFF',
      shadowColor: '#000000',
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 10 },
      elevation: 7,
    },
  });
}
