import { forwardRef } from 'react'
import classNames from 'classnames'
import {
  Heading as ReactAriaHeading,
  type HeadingProps as ReactAriaHeadingProps,
} from 'react-aria-components/Heading'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import type { Spacing } from '@ui/sharedUITypes'

import './heading.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Heading': 'Layer__heading',
  'align:left': 'Layer__heading--left',
  'align:center': 'Layer__heading--center',
  'align:right': 'Layer__heading--right',
})

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

const HEADING_CLASS_NAME = legacyClassNames('Layer__UI__Heading')
const Heading = forwardRef<
  HTMLHeadingElement,
  Omit<ReactAriaHeadingProps, 'className'> & HeadingDataProps & { className?: string }
>(({ align, className, pie, pbe, size, variant, weight, ellipsis, ...restProps }, ref) => {
  const dataProperties = toDataProperties({ pbe, pie, size, align, variant, weight, ellipsis })

  return (
    <ReactAriaHeading
      {...restProps}
      {...dataProperties}
      className={classNames(
        HEADING_CLASS_NAME,
        align !== 'justify' && legacyClassNames(`align:${align ?? 'center'}`),
        className,
      )}
      ref={ref}
    />
  )
})
Heading.displayName = 'Heading'

export { Heading }
