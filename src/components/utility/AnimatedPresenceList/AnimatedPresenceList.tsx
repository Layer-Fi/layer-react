import { type ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'

// popLayout takes an exiting child out of the flow at once, so siblings with `layout` slide into its space
// instead of jumping when it unmounts. The parent must be positioned.
export const AnimatedPresenceList = ({ children }: { children: ReactNode }) => (
  <AnimatePresence initial={false} mode='popLayout'>{children}</AnimatePresence>
)
