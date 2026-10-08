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

type AppearanceContextValue = {
  appearance: AppearanceMode;
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

  const value = useMemo(
    () => ({
      appearance,
      isAppearanceLoading,
      setAppearance,
    }),
    [appearance, isAppearanceLoading],
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
