import { type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './card.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Card': 'Layer__card',
  'state:reset': 'Layer__card--reset',
} satisfies LegacyClassNameMapFor<'Layer__UI__Card', `state:${string}`>)

export interface CardProps {
  children: ReactNode
  className?: string
  reset?: boolean
}

export const Card = ({ children, className, reset }: CardProps) => {
  return (
    <div
      className={classNames(legacyClassNames('Layer__UI__Card', reset && 'state:reset'), className)}
      {...toDataProperties({ reset })}
    >
      {children}
    </div>
  )
}
