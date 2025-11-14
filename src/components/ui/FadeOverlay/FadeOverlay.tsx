import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type FadeOverlayProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'> & {
  children: ReactNode
}

export const FadeOverlay = ({ children, ...props }: FadeOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

