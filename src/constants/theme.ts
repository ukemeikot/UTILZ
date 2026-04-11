import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Platform,
  useColorScheme,
  type ColorSchemeName,
  type TextStyle,
} from 'react-native';

import { rfs } from './scale';
import { useSettingsStore } from '../store/settingsStore';

export const palette = {
  navy950: '#07192B',
  navy900: '#0D2742',
  navy800: '#163A5C',
  slate700: '#314A63',
  slate500: '#6B7E92',
  slate300: '#A8B4C1',
  sky100: '#D9ECF9',
  white: '#F8FBFF',
  green500: '#14C759',
  green400: '#2BD86B',
} as const;

const darkColors = {
  brand: {
    primary: palette.navy800,
    primaryDark: palette.navy950,
    primarySurface: palette.navy900,
    accent: palette.sky100,
    success: palette.green500,
    successBright: palette.green400,
  },
  background: {
    app: palette.navy950,
    screen: palette.navy900,
    elevated: palette.navy800,
    subtle: palette.slate700,
  },
  surface: {
    primary: palette.navy900,
    secondary: '#1C3550',
    tertiary: '#24405C',
    card: '#16324C',
    input: '#213B56',
    inverse: palette.white,
  },
  text: {
    primary: palette.white,
    secondary: '#DDE8F2',
    tertiary: palette.slate300,
    muted: palette.slate500,
    inverse: palette.navy950,
    success: palette.green400,
  },
  border: {
    subtle: '#28425E',
    default: '#33506E',
    strong: '#456584',
    accent: '#BFDFF5',
    success: '#1FA454',
  },
  state: {
    success: palette.green500,
    successSoft: '#123A24',
    overlay: 'rgba(7, 25, 43, 0.7)',
  },
} as const;

const lightColors = {
  brand: {
    primary: palette.navy800,
    primaryDark: palette.navy950,
    primarySurface: '#EAF2F8',
    accent: palette.navy800,
    success: palette.green500,
    successBright: '#0FA84A',
  },
  background: {
    app: '#F4F8FB',
    screen: '#FFFFFF',
    elevated: '#EAF2F8',
    subtle: '#DCE6EF',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#EFF4F8',
    tertiary: '#E7EEF5',
    card: '#FFFFFF',
    input: '#EEF3F8',
    inverse: palette.navy950,
  },
  text: {
    primary: palette.navy950,
    secondary: palette.slate700,
    tertiary: '#51677D',
    muted: palette.slate500,
    inverse: palette.white,
    success: '#0FA84A',
  },
  border: {
    subtle: '#DCE5EE',
    default: '#CDD9E4',
    strong: '#AFC0D1',
    accent: palette.navy800,
    success: '#1FA454',
  },
  state: {
    success: palette.green500,
    successSoft: '#DDF6E6',
    overlay: 'rgba(7, 25, 43, 0.14)',
  },
} as const;

export const themeColors = {
  dark: darkColors,
  light: lightColors,
} as const;

export const motion = {
  entry: {
    duration: 1700,
    handoffDelay: 140,
  },
} as const;

export const interFontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
} as const;

export const fontAssets = {
  [interFontFamily.regular]: Inter_400Regular,
  [interFontFamily.medium]: Inter_500Medium,
  [interFontFamily.semiBold]: Inter_600SemiBold,
  [interFontFamily.bold]: Inter_700Bold,
  [interFontFamily.extraBold]: Inter_800ExtraBold,
} as const;

function getFontFamily(fontPreference: 'inter' | 'system' | 'serif') {
  if (fontPreference === 'system') {
    const regular = Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }) as string;
    const medium = Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }) as string;
    const semiBold = Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }) as string;
    const bold = Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }) as string;

    return {
      regular,
      medium,
      semiBold,
      bold,
      extraBold: bold,
    } as const;
  }

  if (fontPreference === 'serif') {
    const serif = Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }) as string;

    return {
      regular: serif,
      medium: serif,
      semiBold: serif,
      bold: serif,
      extraBold: serif,
    } as const;
  }

  return interFontFamily;
}

function getFontRoleMap(fontFamily: ReturnType<typeof getFontFamily>) {
  return {
    heroNumbers: fontFamily.extraBold,
    conversionResults: fontFamily.extraBold,
    screenTitles: fontFamily.bold,
    calculatorDisplay: fontFamily.bold,
    sectionHeaders: fontFamily.semiBold,
    tabLabels: fontFamily.semiBold,
    buttonText: fontFamily.medium,
    inputLabels: fontFamily.medium,
    bodyText: fontFamily.regular,
    descriptions: fontFamily.regular,
    captions: fontFamily.regular,
    unitLabels: fontFamily.regular,
  } as const;
}

type TypographyStyle = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'
>;

function getTypography(fontRoleMap: ReturnType<typeof getFontRoleMap>) {
  return {
    heroNumber: {
      fontFamily: fontRoleMap.heroNumbers,
      fontSize: rfs(40),
      lineHeight: rfs(46),
      letterSpacing: -0.8,
    },
    conversionResult: {
      fontFamily: fontRoleMap.conversionResults,
      fontSize: rfs(32),
      lineHeight: rfs(38),
      letterSpacing: -0.4,
    },
    screenTitle: {
      fontFamily: fontRoleMap.screenTitles,
      fontSize: rfs(18),
      lineHeight: rfs(34),
      letterSpacing: -0.3,
    },
    calculatorDisplay: {
      fontFamily: fontRoleMap.calculatorDisplay,
      fontSize: rfs(30),
      lineHeight: rfs(36),
      letterSpacing: -0.4,
    },
    sectionHeader: {
      fontFamily: fontRoleMap.sectionHeaders,
      fontSize: rfs(20),
      lineHeight: rfs(26),
      letterSpacing: -0.2,
    },
    tabLabel: {
      fontFamily: fontRoleMap.tabLabels,
      fontSize: rfs(12),
      lineHeight: rfs(16),
      letterSpacing: 0.1,
    },
    buttonText: {
      fontFamily: fontRoleMap.buttonText,
      fontSize: rfs(16),
      lineHeight: rfs(20),
      letterSpacing: 0.1,
    },
    inputLabel: {
      fontFamily: fontRoleMap.inputLabels,
      fontSize: rfs(14),
      lineHeight: rfs(18),
      letterSpacing: 0.1,
    },
    body: {
      fontFamily: fontRoleMap.bodyText,
      fontSize: rfs(16),
      lineHeight: rfs(24),
      letterSpacing: 0,
    },
    description: {
      fontFamily: fontRoleMap.descriptions,
      fontSize: rfs(14),
      lineHeight: rfs(22),
      letterSpacing: 0,
    },
    caption: {
      fontFamily: fontRoleMap.captions,
      fontSize: rfs(12),
      lineHeight: rfs(16),
      letterSpacing: 0.2,
    },
    unitLabel: {
      fontFamily: fontRoleMap.unitLabels,
      fontSize: rfs(12),
      lineHeight: rfs(16),
      letterSpacing: 0.2,
    },
  } as const satisfies Record<string, TypographyStyle>;
}

export function getTheme(
  colorScheme?: ColorSchemeName,
  preferences?: {
    themePreference?: 'auto' | 'light' | 'dark';
    fontPreference?: 'inter' | 'system' | 'serif';
  },
) {
  const resolvedColorScheme =
    preferences?.themePreference === 'light'
      ? 'light'
      : preferences?.themePreference === 'dark'
        ? 'dark'
        : colorScheme;
  const isDark = resolvedColorScheme !== 'light';
  const colors = isDark ? themeColors.dark : themeColors.light;
  const fontFamily = getFontFamily(preferences?.fontPreference ?? 'inter');
  const fontRoleMap = getFontRoleMap(fontFamily);
  const typography = getTypography(fontRoleMap);

  return {
    colorScheme: isDark ? 'dark' : 'light',
    isDark,
    colors,
    motion,
    palette,
    splash: {
      backgroundColor: colors.background.app,
      iconSize: 176,
      orbitRadius: 112,
      backdropOpacity: isDark ? 0.12 : 0.08,
    },
    fonts: {
      assets: fontAssets,
      family: fontFamily,
      roles: fontRoleMap,
      typography,
    },
  } as const;
}

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const themePreference = useSettingsStore((state) => state.themePreference);
  const fontPreference = useSettingsStore((state) => state.fontPreference);
  return getTheme(colorScheme, { themePreference, fontPreference });
}

export const theme = getTheme('dark');

export const staticTheme = {
  fonts: {
    assets: fontAssets,
    family: interFontFamily,
    roles: getFontRoleMap(interFontFamily),
    typography: getTypography(getFontRoleMap(interFontFamily)),
  },
} as const;

export type FontFamily = ReturnType<typeof getFontFamily>[keyof ReturnType<
  typeof getFontFamily
>];
export type TypographyKey = keyof ReturnType<typeof getTypography>;
export type AppTheme = ReturnType<typeof getTheme>;
