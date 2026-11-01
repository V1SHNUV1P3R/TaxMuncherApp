import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "@/src/styles/colors";
type ThemeType = "dark" | "light";
type ThemeContextType = {
  theme: typeof colors.light;
  themeType: ThemeType;
  loading: boolean;
  toggleTheme: () => Promise<void>;
};
const ThemeContext = createContext<ThemeContextType | null>(null);
const STORAGE_KEY = "theme";
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>("light");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (active && (saved === "dark" || saved === "light"))
          setThemeType(saved);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function toggleTheme() {
    const next = themeType === "dark" ? "light" : "dark";
    setThemeType(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }
  const theme = useMemo(() => colors[themeType], [themeType]);
  return (
    <ThemeContext.Provider value={{ theme, themeType, loading, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider.");
  return context;
}
