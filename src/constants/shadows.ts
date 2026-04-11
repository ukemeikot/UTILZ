import { Platform, type ViewStyle } from 'react-native';

export type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export type ShadowLevel = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ShadowConfig = {
  color?: string;
  offsetY: number;
  opacity: number;
  radius: number;
  elevation: number;
};

const DEFAULT_COLOR = '#000000';

const createBaseShadow = ({
  color = DEFAULT_COLOR,
  offsetY,
  opacity,
  radius,
  elevation,
}: ShadowConfig): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const createShadow = (config: ShadowConfig): ShadowStyle => {
  const iosShadow = createBaseShadow({
    ...config,
    elevation: 0,
  });

  const androidShadow = createBaseShadow(config);

  return (
    Platform.select<ShadowStyle>({
      ios: iosShadow,
      android: androidShadow,
      default: androidShadow,
    }) ?? androidShadow
  );
};

export const shadowPresets: Record<ShadowLevel, ShadowStyle> = {
  none: createShadow({
    offsetY: 0,
    opacity: 0,
    radius: 0,
    elevation: 0,
  }),
  xs: createShadow({
    offsetY: 1,
    opacity: 0.12,
    radius: 2,
    elevation: 1,
  }),
  sm: createShadow({
    offsetY: 2,
    opacity: 0.14,
    radius: 4,
    elevation: 2,
  }),
  md: createShadow({
    offsetY: 4,
    opacity: 0.16,
    radius: 8,
    elevation: 4,
  }),
  lg: createShadow({
    offsetY: 8,
    opacity: 0.18,
    radius: 16,
    elevation: 8,
  }),
  xl: createShadow({
    offsetY: 12,
    opacity: 0.22,
    radius: 24,
    elevation: 12,
  }),
};

export const shadows = shadowPresets;

export const getShadow = (level: ShadowLevel = 'md'): ShadowStyle =>
  shadowPresets[level];

export const cardShadow = shadowPresets.md;
export const floatingShadow = shadowPresets.lg;
export const modalShadow = shadowPresets.xl;
