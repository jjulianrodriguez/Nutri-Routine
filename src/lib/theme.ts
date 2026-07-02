export const THEME_STORAGE_KEY = "nce-theme";
export const TEXT_SIZE_STORAGE_KEY = "nce-text-size";
export const REDUCED_MOTION_STORAGE_KEY = "nce-reduced-motion";

export const themeInitScript = `
(() => {
 try {
 const storageKey = "${THEME_STORAGE_KEY}";
 const textSizeStorageKey = "${TEXT_SIZE_STORAGE_KEY}";
 const reducedMotionStorageKey = "${REDUCED_MOTION_STORAGE_KEY}";
 const storedTheme = window.localStorage.getItem(storageKey);
 const storedTextSize = window.localStorage.getItem(textSizeStorageKey);
 const storedReducedMotion = window.localStorage.getItem(reducedMotionStorageKey);
 const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
 const theme = storedTheme === "light" || storedTheme === "dark"
 ? storedTheme
 : systemPrefersDark
 ? "dark"
 : "light";
 const root = document.documentElement;

 root.classList.toggle("dark", theme === "dark");
 root.dataset.theme = theme;
 root.dataset.textSize = storedTextSize === "large" ? "large" : "normal";
 root.dataset.reducedMotion = storedReducedMotion === "true" ? "true" : "false";
 root.style.colorScheme = theme;
 } catch {
 }
})();
`;
