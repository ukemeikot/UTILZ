import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '../src/constants/theme';

export default function NotFoundScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found</Text>
        <Text style={styles.description}>
          That route does not exist in the current app flow.
        </Text>
        <Link href="/(tabs)" style={styles.link}>
          Return to home
        </Link>
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
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      ...theme.fonts.typography.screenTitle,
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    description: {
      ...theme.fonts.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    link: {
      ...theme.fonts.typography.buttonText,
      color: theme.colors.brand.successBright,
    },
  });
