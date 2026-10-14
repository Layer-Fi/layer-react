import { type ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'

export const AnimatedPresenceList = ({ children }: { children: ReactNode }) => (
  <AnimatePresence initial={false}>{children}</AnimatePresence>
)
