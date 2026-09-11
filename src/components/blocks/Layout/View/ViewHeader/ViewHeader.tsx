import { type ReactNode } from 'react'
import classNames from 'classnames'

import { createOwnLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Heading } from '@ui/Typography/Heading'

import './viewHeader.scss'

const legacyClassNames = createOwnLegacyClassNames()({
  'Layer__ViewHeader': 'Layer__view-header',
  'Layer__ViewHeader__Title': 'Layer__view-header__title',
  'Layer__ViewHeader__Content': 'Layer__view-header__content',
  'Layer__ViewHeader__Children': 'Layer__view-header__children',
  'state:paddings': 'Layer__view-header--paddings',
})

export interface ViewHeaderProps {
  title?: string
  className?: string
  withPadding?: boolean
  children?: ReactNode
}

export const ViewHeader = ({ title, className, withPadding = false, children }: ViewHeaderProps) => {
  return (
    <div
      className={classNames(
        legacyClassNames('Layer__ViewHeader', withPadding && 'state:paddings'),
        className,
      )}
      {...toDataProperties({ paddings: withPadding })}
    >
      <div className={legacyClassNames('Layer__ViewHeader__Content')}>
        {title && (
          <Heading level={2} size='lg' className={legacyClassNames('Layer__ViewHeader__Title')}>{title}</Heading>
        )}
        {children && (
          <div className={legacyClassNames('Layer__ViewHeader__Children')}>{children}</div>
        )}
      </div>
    </div>
  )
}
