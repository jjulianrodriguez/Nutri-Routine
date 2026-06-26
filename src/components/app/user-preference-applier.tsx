"use client";

import { useEffect } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import {
  REDUCED_MOTION_STORAGE_KEY,
  TEXT_SIZE_STORAGE_KEY,
} from "@/lib/theme";
import type { UserSettingsValues } from "@/lib/user-settings/types";

export function applyDisplayPreferences(
  settings: Pick<UserSettingsValues, "reducedMotion" | "textSize">,
) {
  const root = document.documentElement;

  root.dataset.textSize = settings.textSize;
  root.dataset.reducedMotion = settings.reducedMotion ? "true" : "false";

  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, settings.textSize);
    window.localStorage.setItem(
      REDUCED_MOTION_STORAGE_KEY,
      settings.reducedMotion ? "true" : "false",
    );
  } catch {
  }
}

export function UserPreferenceApplier({
  settings,
}: {
  settings: UserSettingsValues;
}) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(settings.theme);
    applyDisplayPreferences(settings);
  }, [setTheme, settings]);

  return null;
}
