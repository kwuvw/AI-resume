"use client";

import Link from "next/link";
import { FileText, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { EASE_APPLE } from "@/lib/animations";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();
  const { user, loading, refresh } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    addToast("Signed out", "success");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight font-mono">
              resume.studio
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/upload"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all duration-150"
            >
              {t.nav.analyze}
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all duration-150"
            >
              {t.nav.pricing}
            </Link>

            <div className="w-px h-4 bg-border mx-1" />

            <ThemeSwitcher />
            <LanguageSwitcher />

            {loading ? null : user ? (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs text-muted-foreground font-mono">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all duration-150"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-150"
                >
                  {t.nav.getStarted}
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_APPLE }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/upload"
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.analyze}
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.pricing}
              </Link>
              <div className="flex items-center gap-2 py-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
              {loading ? null : user ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {user.email}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  <Link
                    href="/login"
                    className="block text-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="block text-center px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.getStarted}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
