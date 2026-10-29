export const FONT_SCALE_OPTIONS = [1, 1.125, 1.25] as const;

export type FontScale = (typeof FONT_SCALE_OPTIONS)[number];

export const DEFAULT_FONT_SCALE: FontScale = FONT_SCALE_OPTIONS[0];

export const isFontScale = (value: unknown): value is FontScale => {
  return FONT_SCALE_OPTIONS.some((fontScale) => fontScale === value);
};
