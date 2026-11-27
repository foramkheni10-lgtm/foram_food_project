
export type ThemeName =
  | "terracotta"
  | "ocean"
  | "forest"
  | "royal"
  | "rose"
  | "dark";

export type RestaurantTheme = {
  themeName: ThemeName;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
};

export const themes: Record<ThemeName, RestaurantTheme> = {
  terracotta: {
    themeName: "terracotta",
    primaryColor: "#c65d3a",
    secondaryColor: "#e7a66a",
    backgroundColor: "#faf7f2",
    cardColor: "#ffffff",
    textColor: "#292524",
  },
  ocean: {
    themeName: "ocean",
    primaryColor: "#176b87",
    secondaryColor: "#64ccc5",
    backgroundColor: "#f0f8fa",
    cardColor: "#ffffff",
    textColor: "#18323b",
  },
  forest: {
    themeName: "forest",
    primaryColor: "#28745b",
    secondaryColor: "#9bcb9a",
    backgroundColor: "#f2f8f1",
    cardColor: "#ffffff",
    textColor: "#25372a",
  },
  royal: {
    themeName: "royal",
    primaryColor: "#7041a6",
    secondaryColor: "#b99ae0",
    backgroundColor: "#f7f3fc",
    cardColor: "#ffffff",
    textColor: "#30263a",
  },
  rose: {
    themeName: "rose",
    primaryColor: "#c05270",
    secondaryColor: "#e9a2b1",
    backgroundColor: "#fff4f6",
    cardColor: "#ffffff",
    textColor: "#3e2930",
  },
  dark: {
    themeName: "dark",
    primaryColor: "#e0a84b",
    secondaryColor: "#d9b77e",
    backgroundColor: "#20242b",
    cardColor: "#303640",
    textColor: "#ffffff",
  },
};

export const defaultTheme = themes.terracotta;

export function getTheme(value: unknown): RestaurantTheme {
  if (typeof value === "string" && value in themes) {
    return themes[value as ThemeName];
  }

  if (value && typeof value === "object") {
    const saved = value as Partial<RestaurantTheme>;
    const name = saved.themeName;

    if (name && name in themes) {
      return {
        ...themes[name as ThemeName],
        ...saved,
        themeName: name as ThemeName,
      };
    }
  }

  return defaultTheme;
}