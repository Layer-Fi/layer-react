import { type ElementType, forwardRef, type Key, type ReactNode, type Ref } from 'react'
import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react'

import { variants } from '@ui/AnimatedPresenceElement/variants'

type AnimationVariant = 'fade' | 'slideUp' | 'expand'
type AnimatePresenceMode = 'sync' | 'wait' | 'popLayout'

type ValidHTMLElement = keyof HTMLElementTagNameMap

type AnimatedPresenceElementProps<T extends ValidHTMLElement = 'div'> = Omit<HTMLMotionProps<T>, 'initial' | 'animate' | 'exit' | 'transition' | 'variants' | 'ref'> & {
  as?: T
  children: ReactNode
  variant: AnimationVariant
  isOpen?: boolean
  slotProps?: {
    AnimatePresence?: { initial?: boolean, mode?: AnimatePresenceMode }
  }
  motionKey: Key
}

function AnimatedPresenceElementInner<T extends ValidHTMLElement = 'div'>(
  {
    as,
    children,
    variant,
    isOpen,
    slotProps = { AnimatePresence: { initial: false } },
    motionKey,
    ...props
  }: AnimatedPresenceElementProps<T>,
  ref: Ref<HTMLElementTagNameMap[T]>,
) {
  const config = variants[variant]
  const MotionComponent = motion[as ?? 'div'] as ElementType

  return (
    <AnimatePresence {...slotProps.AnimatePresence}>
      {isOpen && (
        <MotionComponent
          ref={ref}
          key={motionKey}
          initial={config.initial}
          animate={config.animate}
          exit={config.exit}
          transition={config.transition}
          {...props}
        >
          {children}
        </MotionComponent>
      )}
    </AnimatePresence>
  )
}

export const AnimatedPresenceElement = forwardRef(AnimatedPresenceElementInner) as <T extends ValidHTMLElement = 'div'>(
  props: AnimatedPresenceElementProps<T> & { ref?: Ref<HTMLElementTagNameMap[T]> }
) => ReturnType<typeof AnimatedPresenceElementInner>
