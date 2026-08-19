import type { HttpHandler, PathParams } from 'msw'
import { vi } from 'vitest'

import { server } from '@msw/node'

type MockableEndpoint = {
  mock: (
    override: undefined,
    options: { onRequest: (context: { request: Request, params: PathParams }) => Promise<void> },
  ) => HttpHandler
}

type RequestSpy = (record: { params: PathParams, body: unknown }) => void

/**
 * Registers a runtime handler that swaps in a spy for `onRequest`, then returns the spy.
 * Reads the body as JSON when present, and `undefined` when the endpoint sends none.
 */
export const spyOnEndpoint = (endpoint: MockableEndpoint) => {
  const onRequest = vi.fn<RequestSpy>()

  server.use(endpoint.mock(undefined, {
    onRequest: async ({ request, params }) => {
      const body = await request.text()
      onRequest({ params, body: body ? JSON.parse(body) : undefined })
    },
  }))

  return onRequest
}
