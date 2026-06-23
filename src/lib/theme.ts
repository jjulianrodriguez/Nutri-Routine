export const THEME_STORAGE_KEY = "nce-theme";

export const themeInitScript = `
(() => {
  try {
    const storageKey = "${THEME_STORAGE_KEY}";
    const storedTheme = window.localStorage.getItem(storageKey);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : systemPrefersDark
        ? "dark"
        : "light";
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch {
  }
})();
`;
