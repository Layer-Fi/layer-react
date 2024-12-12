import React, { PropsWithChildren } from 'react'

type PillKind = 'default' | 'info' | 'success' | 'warning' | 'error'

type Props = PropsWithChildren & { kind?: PillKind, onHover?: () => void }

export const Pill = ({ children, kind = 'default', onHover }: Props) => (
  <span
    onMouseOver={onHover}
    className={`Layer__pill ${kind === 'error' ? 'Layer__pill--error' : ''}`}
  >
    {children}
  </span>
)
