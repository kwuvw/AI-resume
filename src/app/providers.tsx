"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/context";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  );
}
