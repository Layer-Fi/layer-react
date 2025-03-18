import { forwardRef, type ComponentProps } from 'react'
import { Heading as ReactAriaHeading } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import type { Spacing } from '../sharedUITypes'

type HeadingDataProps = {
  align?: 'center'
  pbe?: Spacing
  size?: 'xs' | 'sm' | 'lg'
}

const HEADING_CLASS_NAME = 'Layer__UI__Heading'
const Heading = forwardRef<
  HTMLHeadingElement,
  Omit<ComponentProps<typeof ReactAriaHeading>, 'className'> & HeadingDataProps
>(({ align, pbe, size, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ pbe, size, align })

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
