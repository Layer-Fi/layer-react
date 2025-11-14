import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type SlideUpContentProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'> & {
  children: ReactNode
}

export const SlideUpContent = ({ children, ...props }: SlideUpContentProps) => {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

