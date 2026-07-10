import { useCallback, useMemo, useRef } from 'react'

/**
 * Storybook stand-in for `react-plaid-link` (aliased via `.storybook/main.ts`);
 * `open()` fakes a successful link. Like the real SDK, `open` is stable per
 * token (a per-render identity would loop the open effect) but changes with the
 * token (which is what opens the next session).
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
