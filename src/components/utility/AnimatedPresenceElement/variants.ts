const COLLAPSE_FADE_S = 0.2
const COLLAPSE_HEIGHT_S = 0.25

export const COLLAPSE_EXIT_MS = (COLLAPSE_FADE_S + COLLAPSE_HEIGHT_S) * 1000

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
  expand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: {
      height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.15, ease: [0, 0, 0.58, 1] as const },
    },
  },
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { delay: COLLAPSE_FADE_S + COLLAPSE_HEIGHT_S, duration: COLLAPSE_HEIGHT_S, ease: [0.4, 0, 0.2, 1] as const },
        opacity: { delay: COLLAPSE_FADE_S + 2 * COLLAPSE_HEIGHT_S, duration: COLLAPSE_FADE_S, ease: [0, 0, 0.58, 1] as const },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        opacity: { duration: COLLAPSE_FADE_S, ease: [0, 0, 0.58, 1] as const },
        height: { delay: COLLAPSE_FADE_S, duration: COLLAPSE_HEIGHT_S, ease: [0.4, 0, 0.2, 1] as const },
      },
    },
    transition: {},
  },
}

const withoutDelay = <T extends object>(target: T) => ('transition' in target && typeof target.transition === 'object' && target.transition
  ? { ...target, transition: Object.fromEntries(Object.entries(target.transition).map(([key, value]) => [key, { ...value, delay: 0 }])) }
  : target)

// Reduced motion already makes height and transforms instant; dropping delays keeps a fade from starting after its row is gone.
export const withoutDelays = (variant: (typeof variants)[keyof typeof variants]) => ({
  ...variant,
  animate: withoutDelay(variant.animate),
  exit: withoutDelay(variant.exit),
})
