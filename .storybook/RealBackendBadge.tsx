import { useEffect, useState } from 'react'

type RealBackendBadgeProps = {
  businessId: string
  /** Null until the legal name resolves, or when the business has none. */
  name: string | null
  environment: string
}

// Fixed rather than in flow: nearly every story is `layout: 'fullscreen'` and would reflow.
const BADGE_STYLE = {
  position: 'fixed',
  insetBlockEnd: 8,
  insetInlineEnd: 8,
  zIndex: 2147483647,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 1,
  padding: '5px 8px',
  border: '1px solid rgb(255 255 255 / 0.25)',
  borderRadius: 4,
  background: '#7a1f1f',
  color: '#fff',
  font: '11px/1.35 ui-monospace, monospace',
  textAlign: 'right',
  cursor: 'pointer',
} as const

export const RealBackendBadge = ({ businessId, name, environment }: RealBackendBadgeProps) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type='button'
      aria-label='Copy business ID'
      title='Click to copy the business ID'
      onClick={() => {
        void navigator.clipboard.writeText(businessId).then(() => setCopied(true))
      }}
      style={BADGE_STYLE}
    >
      <span style={{ fontWeight: 600 }}>{name ?? 'Real backend'}</span>
      <span style={{ opacity: 0.75 }}>
        {copied ? 'copied' : `${environment} · ${businessId}`}
      </span>
    </button>
  )
}
