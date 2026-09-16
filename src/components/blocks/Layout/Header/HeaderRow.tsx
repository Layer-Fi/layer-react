import { type CSSProperties, type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './headerRow.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__HeaderRow: 'Layer__header__row',
})

interface HeaderRowProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
  direction?: 'row' | 'col'
  /** Scroll horizontally instead of clipping overflowing content */
  scrollable?: boolean
}

export const HeaderRow = ({ className, children, direction, style, scrollable }: HeaderRowProps) => {
  const dataProps = toDataProperties({ direction, scrollable })

  return (
    <div {...dataProps} className={classNames(legacyClassNames('Layer__HeaderRow'), className)} style={style}>
      {children}
    </div>
  )
}
