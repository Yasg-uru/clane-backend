export const GradientThemeId = {
  INSTAGRAM: "instagram",
  OCEAN: "ocean",
  SUNSET: "sunset",
  FOREST: "forest",
  GOLD: "gold",
  MIDNIGHT: "midnight",
} as const;

export type GradientThemeId = (typeof GradientThemeId)[keyof typeof GradientThemeId];

export interface GradientTheme {
  id: string;
  label: string;
  from: string;
  via: string;
  to: string;
  isCustom?: boolean;
}

export const GRADIENT_THEMES: GradientTheme[] = [
  {
    id: GradientThemeId.INSTAGRAM,
    label: "Instagram",
    from: "oklch(0.45 0.22 296)",
    via: "oklch(0.55 0.24 27)",
    to: "oklch(0.78 0.17 70)",
  },
  {
    id: GradientThemeId.OCEAN,
    label: "Ocean",
    from: "oklch(0.50 0.20 250)",
    via: "oklch(0.60 0.18 200)",
    to: "oklch(0.70 0.16 175)",
  },
  {
    id: GradientThemeId.SUNSET,
    label: "Sunset",
    from: "oklch(0.60 0.22 40)",
    via: "oklch(0.55 0.24 15)",
    to: "oklch(0.45 0.22 330)",
  },
  {
    id: GradientThemeId.FOREST,
    label: "Forest",
    from: "oklch(0.45 0.18 150)",
    via: "oklch(0.55 0.16 165)",
    to: "oklch(0.65 0.14 185)",
  },
  {
    id: GradientThemeId.GOLD,
    label: "Gold",
    from: "oklch(0.75 0.18 85)",
    via: "oklch(0.70 0.20 60)",
    to: "oklch(0.65 0.22 40)",
  },
  {
    id: GradientThemeId.MIDNIGHT,
    label: "Midnight",
    from: "oklch(0.40 0.25 270)",
    via: "oklch(0.48 0.28 290)",
    to: "oklch(0.55 0.24 310)",
  },
];
