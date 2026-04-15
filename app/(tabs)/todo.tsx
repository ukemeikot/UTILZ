import { useEffect, useMemo, useState } from 'react';

import {
  Modal,
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
  CaretDownIcon,
  CaretUpIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  ChecksIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from 'phosphor-react-native';
import * as Notifications from 'expo-notifications';

import { Card } from '../../src/components/common/Card';
import { useAppCopy } from '../../src/constants/copy';
import { rfs, s, vs } from '../../src/constants/scale';
import { type AppTheme, useAppTheme } from '../../src/constants/theme';
import { useTodoStore } from '../../src/store/todoStore';
import type { TodoFilter, TodoItem, TodoPriority } from '../../src/types/todo.types';

function formatTodoDate(value: number) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type ComposerState = {
  id: string | null;
  title: string;
  details: string;
  dueDate: string;
  priority: TodoPriority;
};

const initialComposerState: ComposerState = {
  id: null,
  title: '',
  details: '',
  dueDate: '',
  priority: 'medium',
};

export default function TodoTabScreen() {
  const theme = useAppTheme();
  const copy = useAppCopy();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const todos = useTodoStore((state) => state.todos);
  const hydrate = useTodoStore((state) => state.hydrate);
  const saveTodo = useTodoStore((state) => state.saveTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const reorderTodos = useTodoStore((state) => state.reorderTodos);

  const [activeFilter, setActiveFilter] = useState<TodoFilter>('all');
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [composer, setComposer] = useState<ComposerState>(initialComposerState);
  const [composerDate, setComposerDate] = useState(new Date());
  const [composerMessage, setComposerMessage] = useState('');

  // Fix: SafeAreaView no longer consumes 'bottom', so insets.bottom now
  // returns the real device bottom inset and correctly clears the tab bar.
  const contentPaddingBottom = insets.bottom + vs(90);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Request notification permissions on app start
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    };

    void requestPermissions();
  }, []); // Empty dependency array - runs once on mount

  useEffect(() => {
    // Reschedule notifications for existing todos with due dates
    const rescheduleNotifications = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const todo of todos) {
        if (todo.dueDate && !todo.completed) {
          const dueDate = new Date(todo.dueDate);
          const notificationTime = new Date(dueDate.getTime() - 15 * 60 * 1000); // 15 minutes before
          if (notificationTime > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Task Due Soon',
                body: `Your task "${todo.title}" is due in 15 minutes.`,
                sound: 'default',
              },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notificationTime },
              identifier: todo.id,
            });
          }
        }
      }
    };

    if (todos.length > 0) {
      void rescheduleNotifications();
    }
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      if (activeFilter === 'open') {
        return !item.completed;
      }

      if (activeFilter === 'done') {
        return item.completed;
      }

      return true;
    });
  }, [activeFilter, todos]);

  const stats = useMemo(
    () => ({
      total: todos.length,
      open: todos.filter((item) => !item.completed).length,
      done: todos.filter((item) => item.completed).length,
    }),
    [todos],
  );

  function parseComposerDate(value: string | null) {
    const parsed = value ? new Date(value) : new Date();
    return Number.isNaN(parsed.valueOf()) ? new Date() : parsed;
  }

  function formatSelectedDate(value: string) {
    const parsed = new Date(value);
    if (!value || Number.isNaN(parsed.valueOf())) {
      return copy.todo.placeholders.dueDate;
    }
    return parsed.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatSelectedTime(value: string) {
    const parsed = new Date(value);
    if (!value || Number.isNaN(parsed.valueOf())) {
      return '';
    }
    return parsed.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function updateComposerDate(value: Date) {
    setComposerDate(value);
    setComposer((current) => ({
      ...current,
      dueDate: value.toISOString(),
    }));
  }

  function openComposer(todo?: TodoItem) {
    const dueDateValue = todo?.dueDate ? todo.dueDate : '';
    const parsedDate = parseComposerDate(dueDateValue);

    if (todo) {
      setComposer({
        id: todo.id,
        title: todo.title,
        details: todo.details,
        dueDate: dueDateValue,
        priority: todo.priority,
      });
    } else {
      setComposer(initialComposerState);
    }

    setComposerDate(parsedDate);
    setComposerMessage('');
    setShowDatePicker(false);
    setIsComposerVisible(true);
  }

  function closeComposer() {
    setIsComposerVisible(false);
    setComposer(initialComposerState);
    setComposerMessage('');
    setShowDatePicker(false);
    setComposerDate(new Date());
  }

  async function handleSaveTodo() {
    if (!composer.title.trim()) {
      setComposerMessage(copy.todo.titleRequired);
      return;
    }

    await saveTodo({
      id: composer.id ?? undefined,
      title: composer.title,
      details: composer.details,
      dueDate: composer.dueDate,
      priority: composer.priority,
    });

    closeComposer();
  }

  function setDueDateOffset(days: number) {
    const next = new Date(composerDate);
    next.setDate(next.getDate() + days);
    updateComposerDate(next);
  }

  function setDueTimeOffset(minutes: number) {
    const next = new Date(composerDate);
    next.setMinutes(next.getMinutes() + minutes);
    updateComposerDate(next);
  }

  function clearDueDate() {
    setComposer((current) => ({ ...current, dueDate: '' }));
    setComposerDate(new Date());
    setShowDatePicker(false);
  }

  async function handleMoveTodo(id: string, direction: 'up' | 'down') {
    const visibleIndex = filteredTodos.findIndex((item) => item.id === id);
    const targetVisibleIndex =
      direction === 'up' ? visibleIndex - 1 : visibleIndex + 1;

    if (
      visibleIndex === -1 ||
      targetVisibleIndex < 0 ||
      targetVisibleIndex >= filteredTodos.length
    ) {
      return;
    }

    const currentFullIndex = todos.findIndex((item) => item.id === id);
    const targetTodo = filteredTodos[targetVisibleIndex];
    const targetFullIndex = todos.findIndex((item) => item.id === targetTodo.id);

    if (currentFullIndex === -1 || targetFullIndex === -1) {
      return;
    }

    const next = [...todos];
    const [movedTodo] = next.splice(currentFullIndex, 1);
    next.splice(targetFullIndex, 0, movedTodo);

    await reorderTodos(next);
  }

  const filterItems = [
    { key: 'all', label: copy.todo.filters.all },
    { key: 'open', label: copy.todo.filters.open },
    { key: 'done', label: copy.todo.filters.done },
  ] as const satisfies ReadonlyArray<{ key: TodoFilter; label: string }>;

  const priorityLabels = {
    low: copy.todo.priority.low,
    medium: copy.todo.priority.medium,
    high: copy.todo.priority.high,
  } as const;

  const dueDateLabel = composer.dueDate
    ? `${formatSelectedDate(composer.dueDate)} · ${formatSelectedTime(composer.dueDate)}`
    : copy.todo.placeholders.dueDate;

  return (
    // Fix: removed 'bottom' from edges so that useSafeAreaInsets() returns
    // the real bottom inset value, allowing contentPaddingBottom to correctly
    // push content above the tab bar.
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: contentPaddingBottom },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Text style={styles.title}>{copy.todo.title}</Text>
            <Pressable onPress={() => openComposer()} style={styles.iconButton}>
              <PlusIcon color={theme.colors.text.primary} size={rfs(18)} weight="bold" />
            </Pressable>
          </View>

          <Card style={styles.summaryCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricValue}>{stats.total}</Text>
                <Text style={styles.metricLabel}>{copy.todo.stats.total}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricValue}>{stats.open}</Text>
                <Text style={styles.metricLabel}>{copy.todo.stats.open}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricValue}>{stats.done}</Text>
                <Text style={styles.metricLabel}>{copy.todo.stats.done}</Text>
              </View>
            </View>
          </Card>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filterItems.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setActiveFilter(item.key)}
                style={[
                  styles.filterChip,
                  activeFilter === item.key && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === item.key && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{copy.todo.listTitle}</Text>
            <Text style={styles.sectionMeta}>
              {filteredTodos.length} {copy.todo.itemsLabel}
            </Text>
          </View>

          <View style={styles.list}>
            {filteredTodos.length ? (
              filteredTodos.map((todo, index) => (
                <Pressable
                  key={todo.id}
                  onPress={() => openComposer(todo)}
                  style={({ pressed }) => [
                    styles.todoCardPressable,
                    pressed && styles.todoCardPressed,
                  ]}
                >
                  <Card
                    style={[
                      styles.todoCard,
                      todo.completed && styles.todoCardCompleted,
                    ]}
                  >
                  <View style={styles.todoHeader}>
                    <Pressable
                      onPress={() => void toggleTodo(todo.id)}
                      style={[
                        styles.statusButton,
                        todo.completed && styles.statusButtonActive,
                      ]}
                    >
                      {todo.completed ? (
                        <CheckCircleIcon
                          color={theme.colors.text.inverse}
                          size={rfs(18)}
                          weight="fill"
                        />
                      ) : (
                        <CircleDashedIcon
                          color={theme.colors.brand.primary}
                          size={rfs(18)}
                          weight="regular"
                        />
                      )}
                    </Pressable>

                    <View style={styles.todoCopy}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.todoTitle,
                          todo.completed && styles.todoTitleCompleted,
                        ]}
                      >
                        {todo.title}
                      </Text>
                      {todo.details ? (
                        <Text numberOfLines={3} style={styles.todoDetails}>
                          {todo.details}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.reorderColumn}>
                      <Pressable
                        disabled={index === 0}
                        onPress={() => void handleMoveTodo(todo.id, 'up')}
                        style={[
                          styles.reorderButton,
                          index === 0 && styles.reorderButtonDisabled,
                        ]}
                      >
                        <CaretUpIcon
                          color={theme.colors.text.primary}
                          size={rfs(15)}
                          weight="bold"
                        />
                      </Pressable>
                      <Pressable
                        disabled={index === filteredTodos.length - 1}
                        onPress={() => void handleMoveTodo(todo.id, 'down')}
                        style={[
                          styles.reorderButton,
                          index === filteredTodos.length - 1 &&
                            styles.reorderButtonDisabled,
                        ]}
                      >
                        <CaretDownIcon
                          color={theme.colors.text.primary}
                          size={rfs(15)}
                          weight="bold"
                        />
                      </Pressable>
                      <Pressable
                        onPress={async (event) => {
                          event.stopPropagation?.();
                          await Notifications.cancelScheduledNotificationAsync(todo.id);
                          void deleteTodo(todo.id);
                        }}
                        style={styles.cardAction}
                      >
                        <TrashIcon
                          color={theme.colors.text.primary}
                          size={rfs(16)}
                          weight="regular"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.todoFooter}>
                    <View
                      style={[
                        styles.priorityToneBase,
                        todo.priority === 'low'
                          ? styles.priorityLow
                          : todo.priority === 'medium'
                            ? styles.priorityMedium
                            : styles.priorityHigh,
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityTextBase,
                          todo.priority === 'low'
                            ? styles.priorityTextLow
                            : todo.priority === 'medium'
                              ? styles.priorityTextMedium
                              : styles.priorityTextHigh,
                        ]}
                      >
                        {priorityLabels[todo.priority]}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {todo.completed ? copy.todo.completed : copy.todo.pending}
                      </Text>
                    </View>
                    {todo.dueDate ? (
                      <View style={styles.duePill}>
                        <Text style={styles.duePillText}>
                          {copy.todo.dueShort} {formatSelectedDate(todo.dueDate)} · {formatSelectedTime(todo.dueDate)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Card>
              </Pressable>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{copy.todo.emptyTitle}</Text>
                <Text style={styles.emptyText}>{copy.todo.emptyBody}</Text>
                <Pressable onPress={() => openComposer()} style={styles.emptyAction}>
                  <Text style={styles.emptyActionText}>{copy.todo.createAction}</Text>
                </Pressable>
              </Card>
            )}
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          onRequestClose={closeComposer}
          transparent
          visible={isComposerVisible}
        >
          <View style={styles.modalRoot}>
            <Pressable onPress={closeComposer} style={styles.backdrop} />
            <View style={[styles.sheetWrap, { paddingBottom: insets.bottom + vs(14) }]}>
              <KeyboardAwareScrollView
                bottomOffset={insets.bottom + vs(16)}
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {composer.id ? copy.todo.editTitle : copy.todo.createTitle}
                  </Text>
                  <Pressable onPress={closeComposer} style={styles.sheetCloseButton}>
                    <XIcon
                      color={theme.colors.text.primary}
                      size={rfs(16)}
                      weight="bold"
                    />
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{copy.todo.fields.title}</Text>
                  <TextInput
                    onChangeText={(value) => {
                      setComposer((current) => ({ ...current, title: value }));
                      setComposerMessage('');
                    }}
                    placeholder={copy.todo.placeholders.title}
                    placeholderTextColor={theme.colors.text.muted}
                    style={styles.input}
                    value={composer.title}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{copy.todo.fields.details}</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    onChangeText={(value) =>
                      setComposer((current) => ({ ...current, details: value }))
                    }
                    placeholder={copy.todo.placeholders.details}
                    placeholderTextColor={theme.colors.text.muted}
                    style={[styles.input, styles.multilineInput]}
                    textAlignVertical="top"
                    value={composer.details}
                  />
                </View>

                <View style={styles.fieldGroupRow}> 
                  <View style={styles.fieldGroupFlex}>
                    <Text style={styles.fieldLabel}>{copy.todo.fields.dueDate}</Text>
                    <Pressable
                      onPress={() => setShowDatePicker((current) => !current)}
                      style={styles.dueDateField}
                    >
                      <Text
                        style={
                          composer.dueDate
                            ? styles.dueDateText
                            : styles.dueDatePlaceholder
                        }
                      >
                        {dueDateLabel}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={clearDueDate} style={styles.clearDueButton}>
                    <XIcon
                      color={theme.colors.text.primary}
                      size={rfs(16)}
                      weight="bold"
                    />
                  </Pressable>
                </View>

                {showDatePicker ? (
                  <View style={styles.datePickerPanel}>
                    <Text style={styles.pickerLabel}>Date</Text>
                    <View style={styles.pickerRow}>
                      <Pressable
                        onPress={() => setDueDateOffset(-1)}
                        style={styles.pickerButton}
                      >
                        <Text style={styles.pickerButtonText}>Prev</Text>
                      </Pressable>
                      <Text style={styles.pickerValue}>
                        {composerDate.toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Pressable
                        onPress={() => setDueDateOffset(1)}
                        style={styles.pickerButton}
                      >
                        <Text style={styles.pickerButtonText}>Next</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.pickerLabel}>Time</Text>
                    <View style={styles.pickerRow}>
                      <Pressable
                        onPress={() => setDueTimeOffset(-15)}
                        style={styles.pickerButton}
                      >
                        <Text style={styles.pickerButtonText}>-15m</Text>
                      </Pressable>
                      <Text style={styles.pickerValue}>
                        {composerDate.toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Pressable
                        onPress={() => setDueTimeOffset(15)}
                        style={styles.pickerButton}
                      >
                        <Text style={styles.pickerButtonText}>+15m</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{copy.todo.fields.priority}</Text>
                  <View style={styles.priorityRow}>
                    {(['low', 'medium', 'high'] as TodoPriority[]).map((priority) => (
                      <Pressable
                        key={priority}
                        onPress={() =>
                          setComposer((current) => ({ ...current, priority }))
                        }
                        style={[
                          styles.priorityPicker,
                          composer.priority === priority && styles.priorityPickerActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityPickerText,
                            composer.priority === priority &&
                              styles.priorityPickerTextActive,
                          ]}
                        >
                          {priorityLabels[priority]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {composerMessage ? (
                  <Text style={styles.composerMessage}>{composerMessage}</Text>
                ) : null}

                <View style={styles.sheetActions}>
                  <Pressable onPress={closeComposer} style={styles.secondaryAction}>
                    <Text style={styles.secondaryActionText}>
                      {copy.todo.cancelAction}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => void handleSaveTodo()} style={styles.primaryAction}>
                    <Text style={styles.primaryActionText}>{copy.todo.saveAction}</Text>
                  </Pressable>
                </View>
              </KeyboardAwareScrollView>
            </View>
          </View>
        </Modal>
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
    scrollView: {
      flex: 1,
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
    title: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(26),
      letterSpacing: -0.4,
      textAlign: 'left',
    },
    summaryCard: {
      gap: vs(18),
      padding: vs(20),
      backgroundColor: theme.colors.surface.card,
      borderRadius: vs(24),
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(14),
    },
    summaryIconWrap: {
      width: vs(54),
      height: vs(54),
      borderRadius: vs(18),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? '#1A2F49' : '#EEF4F8',
    },
    summaryTextWrap: {
      flex: 1,
      gap: vs(4),
    },
    summaryTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(18),
    },
    summarySubtitle: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
      lineHeight: rfs(20),
    },
    metricRow: {
      flexDirection: 'row',
      gap: s(12),
    },
    metricBlock: {
      flex: 1,
      gap: vs(4),
    },
    metricValue: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(24),
    },
    metricLabel: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(12),
    },
    filterRow: {
      gap: s(10),
      paddingRight: s(18),
    },
    filterChip: {
      minHeight: vs(42),
      paddingHorizontal: s(16),
      borderRadius: 999,
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    filterChipActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    filterChipText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    filterChipTextActive: {
      color: theme.colors.text.inverse,
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
    todoCardPressable: {
      borderRadius: vs(22),
      overflow: 'hidden',
    },
    todoCardPressed: {
      opacity: 0.88,
    },
    todoCard: {
      gap: vs(14),
    },
    todoCardCompleted: {
      opacity: 0.86,
    },
    todoHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(12),
    },
    statusButton: {
      width: vs(38),
      height: vs(38),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    statusButtonActive: {
      backgroundColor: theme.colors.brand.success,
      borderColor: theme.colors.brand.success,
    },
    todoCopy: {
      flex: 1,
      gap: vs(6),
      paddingTop: vs(2),
    },
    todoTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(18),
      lineHeight: rfs(24),
      letterSpacing: -0.25,
    },
    todoTitleCompleted: {
      textDecorationLine: 'line-through',
    },
    todoDetails: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(13),
      lineHeight: rfs(20),
    },
    reorderColumn: {
      gap: vs(8),
    },
    reorderButton: {
      width: vs(34),
      height: vs(34),
      borderRadius: vs(12),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    reorderButtonDisabled: {
      opacity: 0.38,
    },
    todoFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: s(10),
    },
    duePill: {
      minHeight: vs(28),
      paddingHorizontal: s(12),
      borderRadius: 999,
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    duePillText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
    },
    priorityToneBase: {
      minHeight: vs(28),
      paddingHorizontal: s(12),
      borderRadius: 999,
      justifyContent: 'center',
      borderWidth: 1,
    },
    priorityLow: {
      backgroundColor: theme.isDark ? '#173422' : '#E4F7EB',
      borderColor: theme.isDark ? '#1E6A3F' : '#BFE6CD',
    },
    priorityMedium: {
      backgroundColor: theme.isDark ? '#23374E' : '#E9F1FA',
      borderColor: theme.isDark ? '#3C5A7D' : '#C7D7E9',
    },
    priorityHigh: {
      backgroundColor: theme.isDark ? '#402122' : '#FDEBEC',
      borderColor: theme.isDark ? '#7F3A3D' : '#F1B6BA',
    },
    priorityTextBase: {
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
    },
    priorityTextLow: {
      color: theme.isDark ? '#C8F0D6' : '#16673D',
    },
    priorityTextMedium: {
      color: theme.isDark ? '#D7E7F8' : '#254D76',
    },
    priorityTextHigh: {
      color: theme.isDark ? '#F6D3D5' : '#8B2930',
    },
    statusPill: {
      minHeight: vs(28),
      paddingHorizontal: s(12),
      borderRadius: 999,
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    statusPillText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
    },
    bottomMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },
    metaText: {
      flex: 1,
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(11),
      lineHeight: rfs(16),
    },
    actionRow: {
      flexDirection: 'row',
      gap: s(8),
    },
    cardAction: {
      width: vs(34),
      height: vs(34),
      borderRadius: vs(12),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    emptyCard: {
      gap: vs(12),
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
    emptyAction: {
      minHeight: vs(44),
      paddingHorizontal: s(16),
      borderRadius: vs(14),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    emptyActionText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(13),
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.state.overlay,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheetWrap: {
      maxHeight: '90%',
      borderTopLeftRadius: vs(28),
      borderTopRightRadius: vs(28),
      backgroundColor: theme.colors.surface.card,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    sheetContent: {
      paddingHorizontal: s(18),
      paddingTop: vs(12),
      gap: vs(16),
    },
    sheetHandle: {
      alignSelf: 'center',
      width: s(52),
      height: vs(6),
      borderRadius: 999,
      backgroundColor: theme.colors.border.default,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },
    sheetTitle: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.bold,
      fontSize: rfs(20),
      letterSpacing: -0.25,
    },
    sheetCloseButton: {
      width: vs(36),
      height: vs(36),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
    },
    fieldGroup: {
      gap: vs(8),
    },
    fieldGroupRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(12),
    },
    fieldGroupFlex: {
      flex: 1,
      gap: vs(8),
    },
    fieldLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(13),
      letterSpacing: 0.15,
    },
    input: {
      minHeight: vs(52),
      borderRadius: vs(18),
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      backgroundColor: theme.colors.surface.input,
      paddingHorizontal: s(14),
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
    },
    multilineInput: {
      minHeight: vs(110),
      paddingTop: vs(14),
      paddingBottom: vs(14),
    },
    dueDateField: {
      minHeight: vs(52),
      borderRadius: vs(18),
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      backgroundColor: theme.colors.surface.input,
      paddingHorizontal: s(14),
      justifyContent: 'center',
    },
    dueDateText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
    },
    dueDatePlaceholder: {
      color: theme.colors.text.muted,
      fontFamily: theme.fonts.family.regular,
      fontSize: rfs(14),
    },
    clearDueButton: {
      width: vs(42),
      height: vs(42),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    datePickerPanel: {
      gap: vs(12),
      padding: vs(14),
      borderRadius: vs(20),
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    pickerLabel: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },
    pickerButton: {
      flex: 1,
      minHeight: vs(44),
      borderRadius: vs(14),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    pickerButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    pickerValue: {
      flex: 2,
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(14),
    },
    priorityRow: {
      flexDirection: 'row',
      gap: s(10),
      flexWrap: 'wrap',
    },
    priorityPicker: {
      minHeight: vs(40),
      paddingHorizontal: s(14),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
    },
    priorityPickerActive: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
    },
    priorityPickerText: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(13),
    },
    priorityPickerTextActive: {
      color: theme.colors.text.inverse,
    },
    composerMessage: {
      color: theme.colors.text.secondary,
      fontFamily: theme.fonts.family.medium,
      fontSize: rfs(12),
      lineHeight: rfs(18),
    },
    sheetActions: {
      flexDirection: 'row',
      gap: s(10),
      paddingTop: vs(4),
    },
    secondaryAction: {
      flex: 1,
      minHeight: vs(48),
      borderRadius: vs(16),
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
    primaryAction: {
      flex: 1,
      minHeight: vs(48),
      borderRadius: vs(16),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.brand.primary,
    },
    primaryActionText: {
      color: theme.colors.text.inverse,
      fontFamily: theme.fonts.family.semiBold,
      fontSize: rfs(13),
    },
  });
}