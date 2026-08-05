import { type ReactNode } from 'react'

const FRAME_STYLE: React.CSSProperties = {
  overflow: 'hidden',
  border: '1px dotted rgb(0 0 0 / 24%)',
  borderRadius: 8,
}

export const Frame = ({
  children,
  inlineSize,
  padding = 12,
}: { children: ReactNode, inlineSize?: number, padding?: number }) => (
  <div style={{ ...FRAME_STYLE, inlineSize, padding }}>{children}</div>
)
