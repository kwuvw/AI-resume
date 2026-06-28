"use client";

import { useI18n } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { EASE_APPLE } from "@/lib/animations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl glass-light">
      {(["en", "ru"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
            locale === l ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {locale === l && (
            <motion.div
              layoutId="lang-switcher"
              className="absolute inset-0 bg-secondary rounded-lg"
              transition={{ duration: 0.25, ease: EASE_APPLE }}
            />
          )}
          <span className="relative z-10 uppercase">{l}</span>
        </button>
      ))}
    </div>
  );
}
