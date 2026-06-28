export const EASE_APPLE = [0.25, 1, 0.5, 1] as const;
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_APPLE },
  },
} as const;

export const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;
