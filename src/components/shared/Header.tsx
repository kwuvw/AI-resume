"use client";

import Link from "next/link";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { EASE_APPLE } from "@/lib/animations";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Resume Studio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/upload"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              {t.nav.analyze}
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              {t.nav.pricing}
            </Link>
            <LanguageSwitcher />
            <Link
              href="/upload"
              className="ml-2 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98]"
            >
              {t.nav.getStarted}
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_APPLE }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/upload"
                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.analyze}
              </Link>
              <Link
                href="/pricing"
                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.pricing}
              </Link>
              <div className="flex justify-center py-2">
                <LanguageSwitcher />
              </div>
              <Link
                href="/upload"
                className="block w-full text-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.getStarted}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
