import { type CSSProperties, type ReactNode } from 'react'
import classNames from 'classnames'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

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
    <div {...dataProperties} className={classNames('Layer__header__col', className)} style={style}>
      {children}
    </div>
  )
}
