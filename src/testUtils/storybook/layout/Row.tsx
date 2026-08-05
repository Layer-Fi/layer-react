import { type ReactNode } from 'react'

import { Label } from './Label'

export const Row = ({
  label,
  children,
  labelSize = 96,
  gap = 12,
  align = 'center',
}: {
  label: string
  children: ReactNode
  labelSize?: number
  gap?: number
  align?: 'center' | 'baseline'
}) => (
  <div style={{ display: 'flex', alignItems: align, gap }}>
    <Label inlineSize={labelSize}>{label}</Label>
    {children}
  </div>
)
