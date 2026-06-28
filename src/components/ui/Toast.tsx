"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { EASE_APPLE } from "@/lib/animations";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "text-success border-success/20 bg-success/5",
    error: "text-destructive border-destructive/20 bg-destructive/5",
    info: "text-primary border-primary/20 bg-primary/5",
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: EASE_APPLE }}
                className={`pointer-events-auto glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-apple-lg border ${colors[toast.type]} max-w-sm`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm flex-1">{toast.message}</span>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
