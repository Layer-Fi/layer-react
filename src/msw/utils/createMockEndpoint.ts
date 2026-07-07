import { delay, http, type HttpHandler, HttpResponse, type JsonBodyType, type PathParams } from 'msw'

let minimumResponseDelayMs = 0

/** Off by default to keep unit tests fast; Storybook opts in to make loading states visible. */
export const setMinimumResponseDelay = (ms: number) => {
  minimumResponseDelayMs = ms
}

const applyMinimumResponseDelay = async () => {
  if (minimumResponseDelayMs > 0) await delay(minimumResponseDelayMs)
}

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

type ResolveContext<TOverride> = {
  /** Test-supplied override from `.mock(...)`; undefined for the default handler. */
  override?: TOverride
  /** The intercepted request - read query params, headers, or body from it. */
  request: Request
  /** Matched path params, e.g. `:businessId`. */
  params: PathParams
}

type CreateMockEndpointConfig<TOverride, TBody extends JsonBodyType> = {
  /** HTTP method to intercept. */
  method: HttpMethod
  /**
   * MSW path pattern. Start it with a `*` wildcard (no space after it) so it
   * matches the endpoint on any base URL - prod, staging, localhost.
   */
  path: string
  /**
   * Builds the JSON response body from the request context. `override` is the
   * value passed to `.mock(...)`, or undefined for the default handler. May be
   * async, e.g. to echo fields from the request body.
   */
  resolve: (context: ResolveContext<TOverride>) => TBody | Promise<TBody>
}

type MockOptions<TOverride> = {
  onRequest?: (context: ResolveContext<TOverride>) => Promise<void> | void
}

type MockErrorOptions<TOverride> = MockOptions<TOverride> & ResponseInit

/*
 * Bundles an endpoint's default MSW handler with per-test override builders.
 *
 * - `handler` is registered once in `handlers.ts` and serves the default payload.
 * - `mock(override)` returns a runtime handler for `server.use(...)` so a single
 *   test can swap the payload without touching the global handler list.
 * - `mockError(body)` returns a runtime error handler for API failure states.
 */
export const createMockEndpoint = <TOverride, TBody extends JsonBodyType>({
  method,
  path,
  resolve,
}: CreateMockEndpointConfig<TOverride, TBody>) => {
  const toHandler = (override?: TOverride, options?: MockOptions<TOverride>): HttpHandler =>
    http[method](path, async ({ request, params }) => {
      const { onRequest } = options ?? {}
      const context = { override, request, params }

      await onRequest?.({ ...context, request: request.clone() })
      await applyMinimumResponseDelay()

      return HttpResponse.json(await resolve(context))
    })

  const toErrorHandler = (body: JsonBodyType, options?: MockErrorOptions<TOverride>): HttpHandler =>
    http[method](path, async ({ request, params }) => {
      const { onRequest, ...responseInit } = options ?? {}
      const context = { request, params }

      await onRequest?.({ ...context, request: request.clone() })
      await applyMinimumResponseDelay()

      return HttpResponse.json(body, { status: 500, ...responseInit })
    })

  return {
    path,
    handler: toHandler(),
    mock: (override: TOverride, options?: MockOptions<TOverride>) => toHandler(override, options),
    mockError: (body: JsonBodyType, options?: MockErrorOptions<TOverride>) => toErrorHandler(body, options),
  }
}
