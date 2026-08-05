import { type ReactNode } from 'react'

import { Label } from './Label'

export const Col = ({
  label,
  children,
  inlineSize,
  align,
}: { label: string, children: ReactNode, inlineSize?: number, align?: 'center' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      gap: 6,
      inlineSize,
    }}
  >
    <Label>{label}</Label>
    {children}
  </div>
)
