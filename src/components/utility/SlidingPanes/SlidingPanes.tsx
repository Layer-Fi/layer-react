import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import './slidingPanes.scss'

export type SlidingPanesDirection = 'forward' | 'back'

const PANE_TRANSITION = { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const }

const paneVariants = {
  enter: (direction: SlidingPanesDirection) => ({ x: direction === 'forward' ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: SlidingPanesDirection) => ({ x: direction === 'forward' ? '-100%' : '100%' }),
}

type SlidingPanesProps = {
  /** Changing the key slides the current pane out and the new children in. */
  paneKey: string
  direction: SlidingPanesDirection
  /** Scroll the container into view once it settles at a new height; off while hidden. */
  keepInView?: boolean
  className?: string
  children: ReactNode
}

export const SlidingPanes = ({
  paneKey,
  direction,
  keepInView = false,
  className,
  children,
}: SlidingPanesProps) => {
  const shouldReduceMotion = useReducedMotion()
  const [paneNode, setPaneNode] = useState<HTMLDivElement | null>(null)
  const [paneHeight, setPaneHeight] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // An exiting pane detaches its ref after the next pane attached; ignore the null.
  const measurePane = useCallback((node: HTMLDivElement | null) => {
    if (node) setPaneNode(node)
  }, [])

  useEffect(() => {
    if (!paneNode) return

    const observer = new ResizeObserver(() => setPaneHeight(paneNode.offsetHeight))
    observer.observe(paneNode)

    return () => observer.disconnect()
  }, [paneNode])

  const transition = shouldReduceMotion ? { duration: 0 } : PANE_TRANSITION

  const onSettled = useCallback(() => {
    if (!keepInView) return

    containerRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    })
  }, [keepInView, shouldReduceMotion])

  return (
    <motion.div
      ref={containerRef}
      className={classNames('Layer__SlidingPanes', className)}
      initial={false}
      animate={paneHeight === null ? undefined : { height: paneHeight }}
      transition={transition}
      onAnimationComplete={onSettled}
    >
      <AnimatePresence initial={false} mode='popLayout' custom={direction}>
        <motion.div
          key={paneKey}
          ref={measurePane}
          custom={direction}
          variants={paneVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
