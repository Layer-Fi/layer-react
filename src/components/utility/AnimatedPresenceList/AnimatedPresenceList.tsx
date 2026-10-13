import { type ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'

/** Plays the exit animation of an `AnimatedElement` child whose key leaves the list. */
export const AnimatedPresenceList = ({ children }: { children: ReactNode }) => (
  <AnimatePresence initial={false}>{children}</AnimatePresence>
)
