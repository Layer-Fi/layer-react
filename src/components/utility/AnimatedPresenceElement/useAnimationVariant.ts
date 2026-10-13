import { useReducedMotionConfig } from 'motion/react'

import { type AnimationVariant, reducedMotionVariants, variants } from '@components/utility/AnimatedPresenceElement/variants'

export const useAnimationVariant = (variant: AnimationVariant) => (useReducedMotionConfig() ? reducedMotionVariants : variants)[variant]
