import { type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'

import './card.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__Card: 'Layer__card',
})

export interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: CardProps) => {
  return <div className={classNames(legacyClassNames('Layer__UI__Card'), className)}>{children}</div>
}
