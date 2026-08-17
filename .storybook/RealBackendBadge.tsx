import { useEffect, useState } from 'react'

type RealBackendBadgeProps = {
  businessId: string
  /** Null until the legal name resolves, or when the business has none. */
  name: string | null
  environment: string
}

// Fixed rather than in flow: nearly every story is `layout: 'fullscreen'` and would reflow.
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
      title={`${businessId} — click to copy`}
      onClick={() => {
        void navigator.clipboard.writeText(businessId).then(() => setCopied(true))
      }}
      style={{
        position: 'fixed',
        insetBlockEnd: 8,
        insetInlineEnd: 8,
        zIndex: 2147483647,
        padding: '4px 8px',
        border: '1px solid rgb(255 255 255 / 0.25)',
        borderRadius: 4,
        background: '#7a1f1f',
        color: '#fff',
        font: '11px/1.4 ui-monospace, monospace',
        cursor: 'pointer',
      }}
    >
      {copied ? 'copied' : `REAL · ${environment}${name ? ` · ${name}` : ''} · ${businessId.slice(0, 8)}…`}
    </button>
  )
}
