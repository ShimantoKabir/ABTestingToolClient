"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // Configuration
  const lightTheme = "lara-light-indigo";
  const darkTheme = "lara-dark-indigo";

  useEffect(() => {
    // 1. Check Local Storage on mount
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      changeThemeFile(savedTheme === "light" ? lightTheme : darkTheme);
    }
  }, []);

  const changeThemeFile = (themeName: string) => {
    // Find the existing theme link
    const themeLink = document.getElementById("theme-link") as HTMLLinkElement;

    if (themeLink) {
      // Swap the href
      const newHref = `/themes/${themeName}/theme.css`;
      themeLink.href = newHref;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const newThemeFile = newTheme === "light" ? lightTheme : darkTheme;

    setTheme(newTheme);
    changeThemeFile(newThemeFile);
    localStorage.setItem("app-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
