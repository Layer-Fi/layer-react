import { renderHook, type RenderHookOptions, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

import { useAuth } from '@hooks/utils/auth/useAuth'

import { LayerTestProvider } from '@test-utils/LayerTestProvider'

/**
 * Renders a hook inside `LayerTestProvider` and resolves only after auth has landed.
 */
export async function renderHookWithAuth<Result, Props = undefined>(
  useHook: (props: Props) => Result,
  options?: RenderHookOptions<Props>,
) {
  let authReady = false

  const view = renderHook(
    (props) => {
      authReady = useAuth().data !== undefined
      return useHook(props)
    },
    { wrapper: LayerTestProvider, ...options },
  )

  await waitFor(() => expect(authReady).toBe(true))

  return view
}
