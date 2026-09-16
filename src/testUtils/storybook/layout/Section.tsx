import { type ReactNode } from 'react'

const HEADING_STYLE: React.CSSProperties = { fontSize: 13, fontWeight: 700 }

export const Section = ({ title, children }: { title: string, children: ReactNode }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <span style={HEADING_STYLE}>{title}</span>
    {children}
  </section>
)
