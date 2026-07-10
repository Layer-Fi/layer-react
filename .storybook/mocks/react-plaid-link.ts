import { useCallback, useMemo, useRef } from 'react'

/**
 * Storybook stand-in for `react-plaid-link` (aliased via `.storybook/main.ts`):
 * Plaid's hosted iframe can't run here, so `open()` fakes a successful link by
 * invoking `onSuccess` after a short delay.
 *
 * Like the real SDK, `open` keeps a stable identity per token - a new identity
 * each render would loop `usePlaidLinkModal`'s open effect, while it must change
 * with the token to open the next session ("Link another bank"). Callbacks are
 * read through a ref so `open` only tracks the token without going stale.
 */

type MockPlaidLinkConfig = {
  token?: string | null
  onSuccess?: (publicToken: string, metadata: unknown) => void
  onExit?: (error: unknown, metadata: unknown) => void
}

const MOCK_SUCCESS_METADATA = {
  institution: { name: 'Mock Bank', institution_id: 'ins_mock' },
  accounts: [],
  link_session_id: 'mock-link-session',
  transfer_status: null,
  public_token: 'public-sandbox-mock-token',
}

const FAKE_LINK_DELAY_MS = 800

export function usePlaidLink(config: MockPlaidLinkConfig) {
  const configRef = useRef(config)
  configRef.current = config

  const token = config.token ?? null
  const ready = token != null

  const open = useCallback(() => {
    if (token == null) return
    window.setTimeout(() => {
      configRef.current.onSuccess?.('public-sandbox-mock-token', MOCK_SUCCESS_METADATA)
    }, FAKE_LINK_DELAY_MS)
  }, [token])

  const exit = useCallback(() => {
    configRef.current.onExit?.(null, MOCK_SUCCESS_METADATA)
  }, [])

  return useMemo(() => ({ open, ready, exit, error: null }), [open, ready, exit])
}
