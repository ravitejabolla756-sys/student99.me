import { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "minimal" | "solar" | "slate";

export interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Record<ThemeName, { label: string; color: string }> = {
  minimal: { label: "Minimal", color: "#f5f5f5" },
  solar: { label: "Solar", color: "#fef08a" },
  slate: { label: "Slate", color: "#64748b" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("student-theme");
      if (stored === "minimal" || stored === "solar" || stored === "slate") {
        return stored;
      }
    }
    return "minimal";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("student-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { themes };
