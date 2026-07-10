import { type ElementType, forwardRef, type ReactNode, type Ref } from 'react'
import { type HTMLMotionProps, motion } from 'motion/react'

import { variants } from '@ui/AnimatedPresenceElement/variants'

type AnimationVariant = 'fade' | 'slideUp' | 'expand'

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
  const config = variants[variant]
  const MotionComponent = motion[as ?? 'div'] as ElementType

  return (
    <MotionComponent
      ref={ref}
      initial={config.initial}
      animate={isVisible ? config.animate : config.exit}
      transition={config.transition}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export const AnimatedElement = forwardRef(AnimatedElementInner) as <T extends ValidHTMLElement = 'div'>(
  props: AnimatedElementProps<T> & { ref?: Ref<HTMLElementTagNameMap[T]> }
) => ReturnType<typeof AnimatedElementInner>
