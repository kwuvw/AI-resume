"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/context";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/context";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
