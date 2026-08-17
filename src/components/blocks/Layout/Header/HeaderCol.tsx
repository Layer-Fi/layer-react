import { type CSSProperties, type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './headerCol.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__HeaderCol: 'Layer__header__col',
})

interface HeaderColProps {
  className?: string
  style?: CSSProperties
  noPadding?: boolean
  children: ReactNode
  fluid?: boolean
}

export const HeaderCol = ({ className, children, style, noPadding = false, fluid = false }: HeaderColProps) => {
  const dataProperties = toDataProperties({ 'no-padding': noPadding, fluid })

  return (
    <div {...dataProperties} className={classNames(legacyClassNames('Layer__HeaderCol'), className)} style={style}>
      {children}
    </div>
  )
}
