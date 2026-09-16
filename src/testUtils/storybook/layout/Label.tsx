import { type ReactNode } from 'react'

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  opacity: 0.55,
}

export const Label = ({ children, inlineSize }: { children: ReactNode, inlineSize?: number }) => (
  <span style={inlineSize ? { ...LABEL_STYLE, inlineSize, flexShrink: 0 } : LABEL_STYLE}>
    {children}
  </span>
)
