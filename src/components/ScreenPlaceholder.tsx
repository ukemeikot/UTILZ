import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '../constants/theme';

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

export function ScreenPlaceholder({
  title,
  description,
}: ScreenPlaceholderProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.app,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: theme.colors.background.app,
    },
    title: {
      ...theme.fonts.typography.screenTitle,
      color: theme.colors.text.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    description: {
      ...theme.fonts.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });
