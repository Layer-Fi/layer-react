import { type TargetAndTransition, type Transition } from 'motion/react'

const COLLAPSE_FADE_S = 0.2
const COLLAPSE_HEIGHT_S = 0.25

export const COLLAPSE_EXIT_MS = (COLLAPSE_FADE_S + COLLAPSE_HEIGHT_S) * 1000

type AnimationVariantConfig = {
  initial: TargetAndTransition
  animate: TargetAndTransition
  exit: TargetAndTransition
  transition: Transition
}

const expand = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: {
    height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
    opacity: { duration: 0.15, ease: [0, 0, 0.58, 1] as const },
  },
} satisfies AnimationVariantConfig

export const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: [0, 0, 0.58, 1] as const },
  },
  slideUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
  },
  expand,
  collapse: {
    ...expand,
    animate: {
      ...expand.animate,
      transition: {
        height: { delay: COLLAPSE_FADE_S + COLLAPSE_HEIGHT_S, duration: COLLAPSE_HEIGHT_S, ease: [0.4, 0, 0.2, 1] as const },
        opacity: { delay: COLLAPSE_FADE_S + 2 * COLLAPSE_HEIGHT_S, duration: COLLAPSE_FADE_S, ease: [0, 0, 0.58, 1] as const },
      },
    },
    exit: {
      ...expand.exit,
      transition: {
        opacity: { duration: COLLAPSE_FADE_S, ease: [0, 0, 0.58, 1] as const },
        height: { delay: COLLAPSE_FADE_S, duration: COLLAPSE_HEIGHT_S, ease: [0.4, 0, 0.2, 1] as const },
      },
    },
    transition: {},
  },
} satisfies Record<string, AnimationVariantConfig>

export type AnimationVariant = keyof typeof variants

// Reduced motion snaps height on its own but keeps opacity delays, so the collapse stagger would only leave blank space.
export const reducedMotionVariants: Record<AnimationVariant, AnimationVariantConfig> = { ...variants, collapse: expand }
