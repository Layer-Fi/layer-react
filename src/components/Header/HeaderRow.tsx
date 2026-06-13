import { type CSSProperties, type ReactNode } from 'react'
import classNames from 'classnames'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './headerRow.scss'

interface HeaderRowProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
  direction?: 'row' | 'col'
}

export const HeaderRow = ({ className, children, direction, style }: HeaderRowProps) => {
  const dataProps = toDataProperties({ direction })

  return (
    <div {...dataProps} className={classNames('Layer__HeaderRow', className)} style={style}>
      {children}
    </div>
  )
}
