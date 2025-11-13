import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type ExpandableContentProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'> & {
  children: ReactNode
  key?: string | number
}

export const ExpandableContent = ({ children, ...props }: ExpandableContentProps) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.15, ease: 'easeOut' },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
