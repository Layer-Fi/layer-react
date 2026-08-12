import { type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Heading } from '@ui/Typography/Heading'

import './viewHeader.scss'

/*
 * The header kept its own names through the rename; only the title's was dropped when the `Heading`
 * stopped being given a class.
 */
const legacyClassNames = createLegacyClassNames({
  Layer__ViewHeader__Title: 'Layer__view-header__title',
})

export interface ViewHeaderProps {
  title?: string
  className?: string
  children?: ReactNode
}

export const ViewHeader = ({ title, className, children }: ViewHeaderProps) => {
  return (
    <div className={classNames('Layer__view-header', className)}>
      <div className='Layer__view-header__content'>
        {title && (
          <Heading level={2} size='lg' className={legacyClassNames('Layer__ViewHeader__Title')}>{title}</Heading>
        )}
        {children && (
          <div className='Layer__view-header__children'>{children}</div>
        )}
      </div>
    </div>
  )
}
