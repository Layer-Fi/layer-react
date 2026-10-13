import { type ElementType, forwardRef, type ReactNode, type Ref } from 'react'
import { type HTMLMotionProps, motion, useReducedMotionConfig } from 'motion/react'

import { variants, withoutDelays } from '@components/utility/AnimatedPresenceElement/variants'

type AnimationVariant = keyof typeof variants

type ValidHTMLElement = keyof HTMLElementTagNameMap

type AnimatedElementProps<T extends ValidHTMLElement = 'div'> = Omit<HTMLMotionProps<T>, 'initial' | 'animate' | 'exit' | 'transition' | 'variants' | 'ref'> & {
  as?: T
  children: ReactNode
  variant: AnimationVariant
  isVisible?: boolean
}

function AnimatedElementInner<T extends ValidHTMLElement = 'div'>(
  {
    as,
    children,
    variant,
    isVisible = true,
    ...props
  }: AnimatedElementProps<T>,
  ref: Ref<HTMLElementTagNameMap[T]>,
) {
  const shouldReduceMotion = useReducedMotionConfig()
  const config = shouldReduceMotion ? withoutDelays(variants[variant]) : variants[variant]
  const MotionComponent = motion[as ?? 'div'] as ElementType

  return (
    <MotionComponent
      ref={ref}
      initial={config.initial}
      animate={isVisible ? config.animate : config.exit}
      exit={config.exit}
      transition={config.transition}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export const AnimatedElement = forwardRef(AnimatedElementInner) as <T extends ValidHTMLElement = 'div'>(
  props: AnimatedElementProps<T> & { ref?: Ref<HTMLElementTagNameMap[T]> },
) => ReturnType<typeof AnimatedElementInner>
