import { forwardRef, type ComponentProps } from 'react'
import { Heading as ReactAriaHeading } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'

type HeadingDataProps = {
  align?: 'center'
  pbe?: Spacing
  size?: '2xs' | 'xs' | 'sm' | 'lg'
  variant?: 'subtle'
  weight?: 'normal' | 'bold'
}

const HEADING_CLASS_NAME = 'Layer__UI__Heading'
const Heading = forwardRef<
  HTMLHeadingElement,
  Omit<ComponentProps<typeof ReactAriaHeading>, 'className'> & HeadingDataProps
>(({ align, pbe, size, variant, weight, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ pbe, size, align, variant, weight })

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
