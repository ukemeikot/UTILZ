import { useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, type AppTheme } from '../src/constants/theme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function EntryScreen() {
  const theme = useAppTheme();
  const dynamicStyles = createStyles(theme);
  const progress = useSharedValue(0);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      progress.value = withTiming(1, {
        duration: theme.motion.entry.duration,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
    });

    const timeout = setTimeout(() => {
      router.replace('/(tabs)');
    }, theme.motion.entry.duration + theme.motion.entry.handoffDelay);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeout);
    };
  }, [progress, theme.motion.entry.duration, theme.motion.entry.handoffDelay]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const angle = interpolate(progress.value, [0, 0.82, 1], [0, Math.PI * 3, Math.PI * 4]);
    const radius = interpolate(
      progress.value,
      [0, 0.8, 1],
      [theme.splash.orbitRadius, 28, 0],
    );
    const scale = interpolate(progress.value, [0, 0.75, 1], [0.82, 0.96, 1]);
    const opacity = interpolate(progress.value, [0, 0.2, 1], [0.48, 0.86, 1]);
    const rotate = interpolate(progress.value, [0, 1], [-18, 0]);

    return {
      opacity,
      transform: [
        { translateX: Math.cos(angle) * radius },
        { translateY: Math.sin(angle) * radius },
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 0.8, 1], [0, 0.3, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0.5, 1], [16, 0]),
      },
    ],
  }));

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <ImageBackground
        resizeMode="cover"
        source={require('../assets/splash.png')}
        style={dynamicStyles.background}
        imageStyle={dynamicStyles.backgroundImage}
      >
        <View style={dynamicStyles.overlay} />
        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.iconStage}>
            <View style={dynamicStyles.glow} />
            <AnimatedImage
              resizeMode="contain"
              source={require('../assets/splash-icon.png')}
              style={[dynamicStyles.icon, animatedIconStyle]}
            />
          </View>
          <Animated.View style={[dynamicStyles.copyBlock, animatedTextStyle]}>
            <Text style={dynamicStyles.title}>UTILZ</Text>
            <Text style={dynamicStyles.subtitle}>
              Powered by Credianlab.
            </Text>
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.splash.backgroundColor,
    },
    background: {
      flex: 1,
      backgroundColor: theme.splash.backgroundColor,
    },
    backgroundImage: {
      opacity: theme.splash.backdropOpacity,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.state.overlay,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    iconStage: {
      width: theme.splash.iconSize + theme.splash.orbitRadius * 2,
      height: theme.splash.iconSize + theme.splash.orbitRadius * 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    glow: {
      position: 'absolute',
      width: theme.splash.iconSize + 48,
      height: theme.splash.iconSize + 48,
      borderRadius: 999,
      backgroundColor: theme.isDark
        ? 'rgba(217, 236, 249, 0.08)'
        : 'rgba(13, 39, 66, 0.08)',
    },
    icon: {
      width: theme.splash.iconSize,
      height: theme.splash.iconSize,
    },
    copyBlock: {
      alignItems: 'center',
      maxWidth: 280,
      marginTop: 40,
    },
    title: {
      ...theme.fonts.typography.screenTitle,
      color: theme.colors.text.primary,
      letterSpacing: 1.2,
      marginBottom: 10,
    },
    subtitle: {
      ...theme.fonts.typography.description,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });
