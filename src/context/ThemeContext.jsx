import React, { createContext, useContext, useMemo } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { ConfigProvider, App, theme as antdThemeUtils } from "antd";
import { useSelector } from "react-redux";
import { blueTheme } from "../themes/blueTheme";
import { darkTheme } from "../themes/darkTheme";
import { warmTheme } from "../themes/warmTheme";

const ThemeContext = createContext();

// Map theme strings from DB to theme objects
const themeMap = {
  blue: blueTheme,
  dark: darkTheme,
  warm: warmTheme,
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a CustomThemeProvider");
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  // Read the theme name from tenant config in Redux store
  const themeName = useSelector((state) => state.tenant?.config?.theme);

  // Resolve to a theme object, default to blueTheme
  const theme = themeMap[themeName] || blueTheme;

  // Determine if dark mode for Ant Design
  const isDark = themeName === "dark";

  // Map our custom theme to Ant Design's ConfigProvider theme
  const antdTheme = useMemo(
    () => ({
      algorithm: isDark
        ? antdThemeUtils.darkAlgorithm
        : antdThemeUtils.defaultAlgorithm, // ← this is required

      token: {
        colorPrimary: theme.primary,
        colorInfo: theme.primary,
        borderRadius: parseInt(theme.borderRadius.md),
        fontFamily: "'DM Sans', sans-serif",
        colorTextBase: theme.text.primary,
        colorBgContainer: theme.background.card,
        colorBorder: theme.border,
      },
      components: {
        Button: {
          borderRadius: parseInt(theme.borderRadius.md),
          fontWeight: 600,
          controlHeight: 38,
        },
        Card: {
          borderRadiusLG: parseInt(theme.borderRadius.lg),
        },
        Input: {
          borderRadius: parseInt(theme.borderRadius.md),
          controlHeight: 40,
          colorBgContainer: theme.inputBg,
        },
        Select: {
          borderRadius: parseInt(theme.borderRadius.md),
          controlHeight: 40,
          colorBgContainer: theme.inputBg,
        },
        Table: {
          colorBgContainer: theme.background.card,
          headerBg: theme.primaryLight,
          headerColor: theme.secondary,
        },
        Menu: {
          darkItemBg: "transparent",
        },
      },
    }),
    [theme, isDark],
  );

  const contextValue = useMemo(
    () => ({ theme, themeName: themeName || "blue" }),
    [theme, themeName],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdTheme}>
        <App>
          <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
        </App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
