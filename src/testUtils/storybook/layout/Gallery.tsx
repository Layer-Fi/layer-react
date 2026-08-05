import { type ReactNode } from 'react'

type GalleryProps = {
  children: ReactNode
  direction?: 'row' | 'column'
  wrap?: boolean
  gap?: number
  padding?: number
  inlineSize?: number
  minBlockSize?: number
}

export const Gallery = ({
  children,
  direction = 'column',
  wrap = false,
  gap = 24,
  padding = 24,
  inlineSize,
  minBlockSize,
}: GalleryProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap ? 'wrap' : undefined,
      alignItems: direction === 'row' ? 'flex-start' : undefined,
      gap,
      padding,
      inlineSize,
      minBlockSize,
    }}
  >
    {children}
  </div>
)
