import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const lightTheme = {
  mode: "light",
  background: "#f5f5f5",
  card: "#ffffff",
  text: "#000000",
  textSecondary: "#666666",
  border: "#e9ecef",
  primary: "#6366F1", // Modern Indigo
  tint: "#E3F2FD", // Light Blue tint
};

export const darkTheme = {
  mode: "dark",
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  border: "#333333",
  primary: "#448AFF", // Light Blue for Dark Mode
  tint: "#0D47A1", // Dark Blue tint
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (e) {
      console.log("Failed to load theme");
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
    } catch (e) {
      console.log("Failed to save theme");
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
