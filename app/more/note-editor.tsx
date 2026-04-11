import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CheckIcon,
  ImageIcon,
  MicrophoneIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  WaveformIcon,
  XIcon,
} from 'phosphor-react-native';

import { rfs, s, vs } from '../../src/constants/scale';
import { useAppCopy } from '../../src/constants/copy';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useNotesProtection } from '../../src/hooks/useNotesProtection';
import {
  formatDuration,
  formatEditorDate,
  mergeTranscript,
  noteCategories,
  persistNoteMedia,
} from '../../src/modules/notes/helpers';
import { useNotesStore } from '../../src/store/notesStore';
import type { NoteCategory } from '../../src/types/notes.types';

export default function NoteEditorScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const noteId = Array.isArray(id) ? id[0] : id;
  const isAllowed = useNotesProtection('/more/note-editor', { id: noteId });

  const notes = useNotesStore((state) => state.notes);
  const hydrate = useNotesStore((state) => state.hydrate);
  const saveNote = useNotesStore((state) => state.saveNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const existingNote = useMemo(
    () => notes.find((item) => item.id === noteId),
    [noteId, notes],
  );

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NoteCategory>('personal');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDurationMillis, setAudioDurationMillis] = useState<number | null>(
    null,
  );
  const [recordingMessage, setRecordingMessage] = useState<string | null>(null);
  const [showRecordingSettings, setShowRecordingSettings] = useState(false);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [speechDraft, setSpeechDraft] = useState('');
  const [showSpeechSettings, setShowSpeechSettings] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null, {
    updateInterval: 250,
    keepAudioSessionActive: true,
  });
  const playerStatus = useAudioPlayerStatus(player);

  const dictationAnchorRef = useRef('');
  const dictationLatestRef = useRef('');
  const dictationFinalizedRef = useRef(false);

  useEffect(() => {
    void hydrate().then(() => setIsHydrated(true));
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (existingNote) {
      setTitle(existingNote.title);
      setBody(existingNote.body);
      setCategory(existingNote.category);
      setImageUri(existingNote.imageUri ?? null);
      setAudioUri(existingNote.audioUri ?? null);
      setAudioDurationMillis(existingNote.audioDurationMillis ?? null);
      setRecordingMessage(null);
      setSpeechMessage(null);
      setSpeechDraft('');
      return;
    }

    if (!noteId) {
      setTitle('');
      setBody('');
      setCategory('personal');
      setImageUri(null);
      setAudioUri(null);
      setAudioDurationMillis(null);
      setRecordingMessage(null);
      setSpeechMessage(null);
      setSpeechDraft('');
    }
  }, [existingNote, isHydrated, noteId]);

  useEffect(() => {
    if (!isAllowed || !isHydrated) {
      return;
    }

    void requestMicrophoneAccess({ silent: true });
  }, [isAllowed, isHydrated]);

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort();
      void setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    };
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setIsDictating(true);
    setSpeechMessage('Listening and transcribing...');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim();
    if (!transcript) {
      return;
    }

    dictationLatestRef.current = transcript;

    if (event.isFinal) {
      dictationFinalizedRef.current = true;
      setBody(mergeTranscript(dictationAnchorRef.current, transcript));
      setSpeechDraft('');
      setSpeechMessage('Dictation added to your note.');
      return;
    }

    setSpeechDraft(transcript);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsDictating(false);

    if (!dictationFinalizedRef.current && dictationLatestRef.current) {
      setBody(mergeTranscript(dictationAnchorRef.current, dictationLatestRef.current));
      setSpeechDraft('');
      setSpeechMessage('Dictation added to your note.');
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsDictating(false);
    setSpeechDraft('');
    setShowSpeechSettings(event.error === 'not-allowed');
    setSpeechMessage(event.message || 'Speech recognition is unavailable right now.');
  });

  async function requestMicrophoneAccess(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    const speechPermission = await ExpoSpeechRecognitionModule.getMicrophonePermissionsAsync().catch(
      () => null,
    );
    const resolvedSpeechPermission =
      speechPermission?.granted || speechPermission?.canAskAgain === false
        ? speechPermission
        : await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync().catch(
            () => speechPermission,
          );

    const recordingPermission = await getRecordingPermissionsAsync();
    const resolvedRecordingPermission = recordingPermission.granted
      ? recordingPermission
      : await requestRecordingPermissionsAsync();

    const permissionGranted =
      resolvedSpeechPermission?.granted || resolvedRecordingPermission.granted;

    if (!permissionGranted) {
      const canAskAgain =
        resolvedSpeechPermission?.canAskAgain ??
        resolvedRecordingPermission.canAskAgain ??
        false;
      setShowRecordingSettings(!canAskAgain);

      if (!silent) {
        setRecordingMessage(
          canAskAgain
            ? 'Microphone permission is required before you can record. If no native prompt appears, install the latest development build and try again.'
            : 'Microphone access is blocked. Open system settings and enable it.',
        );
      }

      return false;
    }

    setShowRecordingSettings(false);

    if (!silent) {
      setRecordingMessage(null);
    }

    return true;
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setImageUri(await persistNoteMedia(result.assets[0].uri, 'image'));
  }

  async function handleRecordPress() {
    try {
      if (isDictating) {
        setRecordingMessage('Stop dictation before recording a voice note.');
        return;
      }

      if (recorderState.isRecording) {
        setRecordingMessage('Finalizing voice note...');
        setShowRecordingSettings(false);
        await recorder.stop();
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });

        const storedUri = recorder.uri ?? recorderState.url ?? null;
        if (storedUri) {
          const persistedUri = await persistNoteMedia(storedUri, 'audio');
          const duration = recorderState.durationMillis ?? null;
          setAudioUri(persistedUri);
          setAudioDurationMillis(duration);
          setRecordingMessage(
            `Voice note attached${duration ? ` (${formatDuration(duration)})` : ''}`,
          );
        } else {
          setRecordingMessage('No audio file was returned. Please try again.');
        }

        return;
      }

      const hasMicrophoneAccess = await requestMicrophoneAccess();
      if (!hasMicrophoneAccess) {
        return;
      }

      if (playerStatus.playing) {
        player.pause();
      }

      setRecordingMessage('Recording voice note...');
      setShowRecordingSettings(false);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      recorder.record();
    } catch (error) {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
      setRecordingMessage(
        error instanceof Error ? error.message : 'Could not start recording.',
      );
    }
  }

  async function handleDictationPress() {
    if (recorderState.isRecording) {
      setSpeechMessage('Stop voice recording before starting dictation.');
      return;
    }

    if (isDictating) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const hasMicrophoneAccess = await requestMicrophoneAccess();
    if (!hasMicrophoneAccess) {
      setSpeechMessage(
        'Microphone permission is required for dictation before speech recognition can start.',
      );
      return;
    }

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setSpeechMessage('Speech recognition is not available on this device.');
      return;
    }

    const permission =
      Platform.OS === 'ios'
        ? await ExpoSpeechRecognitionModule.requestPermissionsAsync()
        : await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
    if (!permission.granted) {
      const canAskAgain = permission.canAskAgain ?? false;
      setShowSpeechSettings(!canAskAgain);
      setSpeechMessage(
        canAskAgain
          ? 'Speech recognition permission is required for dictation. If no native prompt appears, install the latest development build and try again.'
          : 'Speech recognition is blocked. Open system settings to enable it.',
      );
      return;
    }

    dictationAnchorRef.current = body;
    dictationLatestRef.current = '';
    dictationFinalizedRef.current = false;
    setSpeechDraft('');
    setSpeechMessage('Starting dictation...');
    setShowSpeechSettings(false);

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
    });
  }

  async function handleSave() {
    if (!(title.trim() || body.trim() || imageUri || audioUri)) {
      return;
    }

    await saveNote({
      id: existingNote?.id,
      title,
      body,
      category,
      imageUri,
      audioUri,
      audioDurationMillis,
    });

    router.back();
  }

  async function handleDelete() {
    if (!existingNote) {
      return;
    }

    await deleteNote(existingNote.id);
    router.back();
  }

  function togglePlayback() {
    if (!audioUri) {
      return;
    }

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.play();
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          bottomOffset={insets.bottom + vs(96)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + vs(128) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.topIconButton}>
              <ArrowLeftIcon style={styles.topIcon} weight="bold" />
            </Pressable>
            <View style={styles.topActions}>
              {existingNote ? (
                <Pressable onPress={() => void handleDelete()} style={styles.topIconButton}>
                  <TrashIcon style={styles.topIcon} weight="regular" />
                </Pressable>
              ) : null}
              <Pressable onPress={() => void handleSave()} style={styles.saveButton}>
                <CheckIcon color={theme.colors.text.inverse} size={rfs(18)} weight="bold" />
              </Pressable>
            </View>
          </View>

          <Text style={styles.metaText}>
            Edited:{' '}
            {formatEditorDate(existingNote?.updatedAt ?? Date.now())}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {noteCategories.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setCategory(option.key)}
                style={[
                  styles.categoryChip,
                  category === option.key && styles.categoryChipActive,
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    option.key === 'personal'
                      ? styles.dotGold
                      : option.key === 'work'
                        ? styles.dotGreen
                        : styles.dotBlue,
                  ]}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === option.key && styles.categoryTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={theme.colors.text.muted}
            style={styles.titleInput}
            value={title}
          />

          <View style={styles.divider} />

          <TextInput
            multiline
            onChangeText={setBody}
            placeholder="Please enter content here..."
            placeholderTextColor={theme.colors.text.muted}
            style={styles.bodyInput}
            textAlignVertical="top"
            value={body}
          />

          {speechDraft ? (
            <View style={styles.messageCard}>
              <Text style={styles.messageLabel}>Live dictation</Text>
              <Text style={styles.messageText}>{speechDraft}</Text>
            </View>
          ) : null}

          {speechMessage ? (
            <View style={styles.messageCard}>
              <Text style={styles.messageLabel}>Dictation</Text>
              <Text style={styles.messageText}>{speechMessage}</Text>
              {showSpeechSettings ? (
                <Pressable
                  onPress={() => {
                    void Linking.openSettings();
                  }}
                  style={styles.settingsButton}
                >
                  <Text style={styles.settingsButtonText}>Open settings</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {recordingMessage ? (
            <View style={styles.messageCard}>
              <Text style={styles.messageLabel}>Voice note</Text>
              <Text style={styles.messageText}>{recordingMessage}</Text>
              {showRecordingSettings ? (
                <Pressable
                  onPress={() => {
                    void Linking.openSettings();
                  }}
                  style={styles.settingsButton}
                >
                  <Text style={styles.settingsButtonText}>Open settings</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {imageUri ? (
            <View style={styles.mediaCard}>
              <View style={styles.mediaHeader}>
                <Text style={styles.mediaTitle}>Attached image</Text>
                <Pressable onPress={() => setImageUri(null)} style={styles.clearMediaButton}>
                  <XIcon style={styles.clearMediaIcon} weight="bold" />
                </Pressable>
              </View>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            </View>
          ) : null}

          {audioUri ? (
            <View style={styles.mediaCard}>
              <View style={styles.mediaHeader}>
                <Text style={styles.mediaTitle}>
                  Voice note {audioDurationMillis ? `(${formatDuration(audioDurationMillis)})` : ''}
                </Text>
                <Pressable onPress={() => setAudioUri(null)} style={styles.clearMediaButton}>
                  <XIcon style={styles.clearMediaIcon} weight="bold" />
                </Pressable>
              </View>
              <View style={styles.audioPreviewRow}>
                <Pressable onPress={togglePlayback} style={styles.audioPreviewButton}>
                  {playerStatus.playing ? (
                    <PauseIcon color={theme.colors.text.inverse} size={rfs(16)} weight="fill" />
                  ) : (
                    <PlayIcon color={theme.colors.text.inverse} size={rfs(16)} weight="fill" />
                  )}
                </Pressable>
                <Text style={styles.audioPreviewText}>
                  {playerStatus.playing ? 'Playing attached voice note' : 'Play attached voice note'}
                </Text>
              </View>
            </View>
          ) : null}
        </KeyboardAwareScrollView>

        <View style={[styles.toolbar, { paddingBottom: insets.bottom + vs(12) }]}>
          <Pressable onPress={handlePickImage} style={styles.toolbarAction}>
            <ImageIcon style={styles.toolbarIcon} weight="regular" />
            <Text style={styles.toolbarText}>Image</Text>
          </Pressable>
          <Pressable
            onPress={() => void handleDictationPress()}
            style={[styles.toolbarAction, isDictating && styles.toolbarActionActive]}
          >
            <WaveformIcon
              color={
                isDictating ? theme.colors.text.inverse : theme.colors.text.primary
              }
              size={rfs(20)}
              weight="regular"
            />
            <Text
              style={[styles.toolbarText, isDictating && styles.toolbarTextActive]}
            >
              {isDictating ? 'Stop' : 'Dictate'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void handleRecordPress()}
            style={[
              recorderState.isRecording
                ? styles.toolbarStopAction
                : styles.toolbarAction,
            ]}
          >
            {recorderState.isRecording ? (
              <XIcon
                color={theme.colors.text.inverse}
                size={rfs(20)}
                weight="bold"
              />
            ) : (
              <MicrophoneIcon
                color={theme.colors.text.primary}
                size={rfs(20)}
                weight="regular"
              />
            )}
            <Text
              style={[
                styles.toolbarText,
                recorderState.isRecording && styles.toolbarTextActive,
              ]}
            >
              {recorderState.isRecording
                ? `Stop ${formatDuration(recorderState.durationMillis)}`
                : 'Record'}
            </Text>
          </Pressable>
          <Pressable onPress={() => void handleSave()} style={styles.toolbarSave}>
            <CheckIcon color={theme.colors.text.inverse} size={rfs(22)} weight="bold" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.isDark ? '#111318' : theme.colors.background.app,
    },
    container: {
      flex: 1,
      backgroundColor: theme.isDark ? '#111318' : theme.colors.background.app,
    },
    content: {
      paddingHorizontal: s(22),
      paddingTop: vs(16),
      gap: vs(18),
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    topActions: {
      flexDirection: 'row',
      gap: s(10),
    },
    topIconButton: {
      width: vs(44),
      height: vs(44),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#1B1F27' : theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.isDark ? '#262C37' : theme.colors.border.subtle,
    },
    topIcon: {
      color: theme.colors.text.primary,
      fontSize: rfs(18),
    },
    saveButton: {
      width: vs(44),
      height: vs(44),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.success,
    },
    metaText: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    categoryRow: {
      gap: s(10),
      paddingRight: s(18),
    },
    categoryChip: {
      minHeight: vs(40),
      paddingHorizontal: s(14),
      borderRadius: 999,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      backgroundColor: theme.isDark ? '#1A1E26' : theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.isDark ? '#2B313D' : theme.colors.border.subtle,
    },
    categoryChipActive: {
      borderColor: theme.colors.brand.success,
    },
    categoryDot: {
      width: s(10),
      height: s(10),
      borderRadius: 999,
    },
    dotGold: {
      backgroundColor: '#F1B80F',
    },
    dotGreen: {
      backgroundColor: theme.colors.brand.success,
    },
    dotBlue: {
      backgroundColor: '#4A8DFF',
    },
    categoryText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(14),
    },
    categoryTextActive: {
      color: theme.colors.text.primary,
    },
    titleInput: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(30),
      letterSpacing: -0.6,
      minHeight: vs(56),
      paddingVertical: 0,
    },
    divider: {
      height: 1,
      backgroundColor: theme.isDark ? '#252A34' : theme.colors.border.subtle,
    },
    bodyInput: {
      minHeight: vs(280),
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(18),
      lineHeight: rfs(28),
      paddingTop: 0,
    },
    messageCard: {
      gap: vs(8),
      borderRadius: vs(20),
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      backgroundColor: theme.isDark ? '#191D25' : theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.isDark ? '#2B313D' : theme.colors.border.subtle,
    },
    messageLabel: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    messageText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(21),
    },
    settingsButton: {
      alignSelf: 'flex-start',
      minHeight: vs(38),
      paddingHorizontal: s(14),
      borderRadius: 999,
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#242A34' : theme.colors.surface.secondary,
    },
    settingsButtonText: {
      color: theme.colors.brand.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(13),
    },
    mediaCard: {
      gap: vs(12),
      borderRadius: vs(20),
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      backgroundColor: theme.isDark ? '#191D25' : theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.isDark ? '#2B313D' : theme.colors.border.subtle,
    },
    mediaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },
    mediaTitle: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(15),
    },
    clearMediaButton: {
      width: vs(30),
      height: vs(30),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#242A34' : theme.colors.surface.secondary,
    },
    clearMediaIcon: {
      color: theme.colors.text.primary,
      fontSize: rfs(14),
    },
    previewImage: {
      width: '100%',
      height: vs(190),
      borderRadius: vs(18),
      backgroundColor: theme.colors.surface.secondary,
    },
    audioPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },
    audioPreviewButton: {
      width: vs(38),
      height: vs(38),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    audioPreviewText: {
      flex: 1,
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
      lineHeight: rfs(20),
    },
    toolbar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      paddingHorizontal: s(18),
      paddingTop: vs(12),
      backgroundColor: theme.isDark ? '#1A1E26' : theme.colors.surface.primary,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? '#2B313D' : theme.colors.border.subtle,
    },
    toolbarAction: {
      flex: 1,
      minHeight: vs(48),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      gap: vs(4),
      backgroundColor: theme.isDark ? '#242A34' : theme.colors.surface.secondary,
    },
    toolbarActionActive: {
      backgroundColor: theme.colors.brand.primary,
    },
    toolbarStopAction: {
      flex: 1,
      minHeight: vs(48),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      gap: vs(4),
      backgroundColor: '#D64545',
    },
    toolbarIcon: {
      color: theme.colors.text.primary,
      fontSize: rfs(20),
    },
    toolbarText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
    },
    toolbarTextActive: {
      color: theme.colors.text.inverse,
    },
    toolbarSave: {
      width: vs(52),
      minHeight: vs(52),
      borderRadius: vs(18),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.success,
    },
  });
}
