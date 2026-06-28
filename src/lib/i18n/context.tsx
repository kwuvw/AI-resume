"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import en from "./dictionaries/en.json";
import ru from "./dictionaries/ru.json";

type Locale = "en" | "ru";
type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ru };

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const value = {
    locale,
    t: dictionaries[locale],
    setLocale: useCallback((l: Locale) => setLocale(l), []),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export type { Locale, Dictionary };
