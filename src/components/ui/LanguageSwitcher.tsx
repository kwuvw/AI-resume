"use client";

import { useI18n } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { EASE_APPLE } from "@/lib/animations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-secondary/50">
      {(["en", "ru"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`relative px-2 py-1 text-xs font-mono font-medium rounded transition-colors duration-150 ${
            locale === l
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {locale === l && (
            <motion.div
              layoutId="lang-switcher"
              className="absolute inset-0 bg-background rounded border border-border"
              transition={{ duration: 0.2, ease: EASE_APPLE }}
            />
          )}
          <span className="relative z-10 uppercase">{l}</span>
        </button>
      ))}
    </div>
  );
}
