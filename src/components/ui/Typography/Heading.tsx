import { forwardRef } from 'react'
import { Heading as ReactAriaHeading, HeadingProps as ReactAriaHeadingProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'
import classNames from 'classnames'

type HeadingDataProps = {
  align?: 'center'
  pbe?: Spacing
  pie?: Spacing
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  variant?: 'subtle' | 'dark'
  weight?: 'normal' | 'bold'
  ellipsis?: true
}

const HEADING_CLASS_NAME = 'Layer__UI__Heading'
const Heading = forwardRef<
  HTMLHeadingElement,
  ReactAriaHeadingProps & HeadingDataProps
>(({ align, pie, pbe, size, variant, weight, ellipsis, className, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ pbe, pie, size, align, variant, weight, ellipsis })

  return (
    <ReactAriaHeading
      {...restProps}
      {...dataProperties}
      className={classNames(HEADING_CLASS_NAME, className)}
      ref={ref}
    />
  )
})
Heading.displayName = 'Heading'

export { Heading }
