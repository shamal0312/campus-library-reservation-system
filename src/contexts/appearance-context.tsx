import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "app_appearance";

export type AppearanceMode = "light" | "dark";

export const LIGHT_THEME = {
  background: "#F3F7FC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8FAFD",
  text: "#102A43",
  textSecondary: "#718096",
  primary: "#2F80ED",
  primarySoft: "#EAF4FF",
  border: "#E4EAF2",
  inputBackground: "#F8FAFD",
  navBackground: "#FFFFFF",
  iconInactive: "#8A94A6",
  danger: "#EF4444",
  success: "#22C55E",
};

export const DARK_THEME = {
  background: "#0F172A",
  surface: "#1E293B",
  surfaceSecondary: "#162033",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  primary: "#60A5FA",
  primarySoft: "#1E3A5F",
  border: "#334155",
  inputBackground: "#162033",
  navBackground: "#111827",
  iconInactive: "#94A3B8",
  danger: "#F87171",
  success: "#4ADE80",
};

export type AppTheme = typeof LIGHT_THEME;

type AppearanceContextValue = {
  appearance: AppearanceMode;
  theme: AppTheme;
  isAppearanceLoading: boolean;
  setAppearance: (mode: AppearanceMode) => Promise<void>;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceMode>("light");

  const [isAppearanceLoading, setIsAppearanceLoading] = useState(true);

  useEffect(() => {
    loadAppearance();
  }, []);

  async function loadAppearance() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored === "light" || stored === "dark") {
        setAppearanceState(stored);
      }
    } finally {
      setIsAppearanceLoading(false);
    }
  }

  async function setAppearance(mode: AppearanceMode) {
    setAppearanceState(mode);

    await AsyncStorage.setItem(STORAGE_KEY, mode);
  }

  const theme = appearance === "dark" ? DARK_THEME : LIGHT_THEME;

  const value = useMemo(
    () => ({
      appearance,
      theme,
      isAppearanceLoading,
      setAppearance,
    }),
    [appearance, theme, isAppearanceLoading],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }

  return context;
}
