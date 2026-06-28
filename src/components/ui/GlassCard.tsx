"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { EASE_APPLE } from "@/lib/animations";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export function GlassCard({ children, hover = true, className = "", ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`glass rounded-2xl ${className}`}
      whileHover={
        hover
          ? {
              scale: 1.01,
              transition: { duration: 0.3, ease: EASE_APPLE },
            }
          : undefined
      }
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_APPLE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
