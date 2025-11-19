import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react'
import type { ReactNode } from 'react'

import { variants } from './variants'

type AnimationVariant = 'fade' | 'slideUp' | 'expand'
type AnimatePresenceMode = 'sync' | 'wait' | 'popLayout'

type AnimatedPresenceDivProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition' | 'variants'> & {
  children: ReactNode
  variant: AnimationVariant
  isOpen?: boolean
  slotProps?: {
    AnimatePresence?: { initial?: boolean, mode?: AnimatePresenceMode }
  }
  key?: string | number
}

export const AnimatedPresenceDiv = ({
  children,
  variant,
  isOpen,
  slotProps = { AnimatePresence: { initial: false } },
  ...props
}: AnimatedPresenceDivProps) => {
  const config = variants[variant]

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
