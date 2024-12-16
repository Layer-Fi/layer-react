import classNames from 'classnames'
import React, { PropsWithChildren } from 'react'

type PillKind = 'default' | 'info' | 'success' | 'warning' | 'error'

type Props = PropsWithChildren & { kind?: PillKind; onHover?: () => void; onClick?: () => void }

export const Pill = ({ children, kind = 'default', onHover, onClick }: Props) => (
  <span
    onMouseOver={onHover}
    onClick={onClick}
    className={classNames(`Layer__pill Layer__pill--${kind}`, onHover || onClick ? 'Layer__pill--actionable' : '')}
  >
    {children}
  </span>
)
