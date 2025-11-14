import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type AnimationVariant = 'fade' | 'slideUp' | 'expand'
type AnimatePresenceMode = 'sync' | 'wait' | 'popLayout'

type MotionContentProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition' | 'variants'> & {
  children: ReactNode
  variant: AnimationVariant
  isOpen?: boolean
  slotProps?: {
    AnimatePresence?: { initial?: boolean, mode?: AnimatePresenceMode }
  }
  key?: string | number
}

const animations = {
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
}

export const MotionContent = ({
  children,
  variant,
  isOpen,
  slotProps = { AnimatePresence: { initial: false } },
  ...props
}: MotionContentProps) => {
  const config = animations[variant]

  if (isOpen !== undefined) {
    return (
      <AnimatePresence {...slotProps.AnimatePresence}>
        {isOpen && (
          <motion.div
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
            transition={config.transition}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
}
