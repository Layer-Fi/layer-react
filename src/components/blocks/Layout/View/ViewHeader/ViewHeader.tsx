import { type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Heading } from '@ui/Typography/Heading'

import './viewHeader.scss'

type ViewHeaderClassName =
  | 'Layer__ViewHeader'
  | 'Layer__ViewHeader__Title'
  | 'Layer__ViewHeader__Content'
  | 'Layer__ViewHeader__Children'

const legacyClassNames = createLegacyClassNames({
  'Layer__ViewHeader': 'Layer__view-header',
  'Layer__ViewHeader__Title': 'Layer__view-header__title',
  'Layer__ViewHeader__Content': 'Layer__view-header__content',
  'Layer__ViewHeader__Children': 'Layer__view-header__children',
  'state:paddings': 'Layer__view-header--paddings',
} satisfies LegacyClassNameMapFor<ViewHeaderClassName, `state:${string}`>)

export interface ViewHeaderProps {
  title?: string
  className?: string
  withPaddings?: boolean
  children?: ReactNode
}

export const ViewHeader = ({ title, className, withPaddings = false, children }: ViewHeaderProps) => {
  return (
    <div
      className={classNames(
        legacyClassNames('Layer__ViewHeader', withPaddings && 'state:paddings'),
        className,
      )}
      {...toDataProperties({ paddings: withPaddings })}
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
