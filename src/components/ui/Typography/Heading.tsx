import { forwardRef, type ComponentProps } from 'react'
import { Heading as ReactAriaHeading } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

type HeadingDataProps = {
  size?: 'sm' | 'lg'
  pbe?: '2xs' | 'xs' | 'sm' | 'md' | 'lg'
}

const HEADING_CLASS_NAME = 'Layer__UI__Heading'
const Heading = forwardRef<
  HTMLHeadingElement,
  Omit<ComponentProps<typeof ReactAriaHeading>, 'className'> & HeadingDataProps
>(({ pbe, size, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ pbe, size })

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
