import { forwardRef } from 'react'
import {
  Heading as ReactAriaHeading,
  type HeadingProps as ReactAriaHeadingProps,
} from 'react-aria-components/Heading'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import type { Spacing } from '@ui/sharedUITypes'

import './heading.scss'

export type HeadingSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

type HeadingDataProps = {
  align?: 'left' | 'center' | 'right' | 'justify'
  pbe?: Spacing
  pie?: Spacing
  size?: HeadingSize
  variant?: 'subtle'
  weight?: 'normal' | 'bold'
  ellipsis?: true
}

const HEADING_CLASS_NAME = 'Layer__UI__Heading'
const Heading = forwardRef<
  HTMLHeadingElement,
  Omit<ReactAriaHeadingProps, 'className'> & HeadingDataProps
>(({ align, pie, pbe, size, variant, weight, ellipsis, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ pbe, pie, size, align, variant, weight, ellipsis })

  return (
    <ReactAriaHeading
      {...restProps}
      {...dataProperties}
      className={HEADING_CLASS_NAME}
      ref={ref}
    />
  )
})
Heading.displayName = 'Heading'

export { Heading }
