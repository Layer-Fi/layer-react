import { Fragment, type ReactNode } from 'react'

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  opacity: 0.55,
}

const HEADING_STYLE: React.CSSProperties = { fontSize: 13, fontWeight: 700 }

const FRAME_STYLE: React.CSSProperties = {
  overflow: 'hidden',
  border: '1px dotted rgb(0 0 0 / 24%)',
  borderRadius: 8,
}

export const Label = ({ children, inlineSize }: { children: ReactNode, inlineSize?: number }) => (
  <span style={inlineSize ? { ...LABEL_STYLE, inlineSize, flexShrink: 0 } : LABEL_STYLE}>
    {children}
  </span>
)

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

export const Section = ({ title, children }: { title: string, children: ReactNode }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <span style={HEADING_STYLE}>{title}</span>
    {children}
  </section>
)

export const Frame = ({
  children,
  inlineSize,
  padding = 12,
}: { children: ReactNode, inlineSize?: number, padding?: number }) => (
  <div style={{ ...FRAME_STYLE, inlineSize, padding }}>{children}</div>
)

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

type MatrixProps<TRow, TColumn> = {
  rows: ReadonlyArray<TRow>
  columns: ReadonlyArray<TColumn>
  rowLabel: (row: TRow) => string
  columnLabel: (column: TColumn) => string
  renderCell: (row: TRow, column: TColumn) => ReactNode
  labelColumnSize?: number
  gap?: string
}

export const Matrix = <TRow, TColumn>({
  rows,
  columns,
  rowLabel,
  columnLabel,
  renderCell,
  labelColumnSize = 88,
  gap = '16px 24px',
}: MatrixProps<TRow, TColumn>) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `${labelColumnSize}px repeat(${columns.length}, max-content)`,
      gap,
      alignItems: 'center',
      justifyItems: 'start',
    }}
  >
    <span />
    {columns.map(column => <Label key={columnLabel(column)}>{columnLabel(column)}</Label>)}
    {rows.map(row => (
      <Fragment key={rowLabel(row)}>
        <Label>{rowLabel(row)}</Label>
        {columns.map(column => (
          <Fragment key={columnLabel(column)}>{renderCell(row, column)}</Fragment>
        ))}
      </Fragment>
    ))}
  </div>
)
