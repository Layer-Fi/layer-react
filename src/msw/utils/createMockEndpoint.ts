import { http, type HttpHandler, HttpResponse, type JsonBodyType } from 'msw'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

type CreateMockEndpointConfig<TOverride, TBody extends JsonBodyType> = {
  /** HTTP method to intercept. */
  method: HttpMethod
  /**
   * MSW path pattern. Prefix with `*` to match any base URL (prod, staging,
   * localhost), e.g. `* /v1/businesses/:businessId/custom-accounts`.
   */
  path: string
  /**
   * Builds the JSON response body. Called with no argument for the default
   * handler, and with a test-supplied `override` from `.mock(...)`.
   */
  resolve: (override?: TOverride) => TBody
}

/*
 * Bundles an endpoint's default MSW handler with a per-test override builder.
 *
 * - `handler` is registered once in `handlers.ts` and serves the default payload.
 * - `mock(override)` returns a runtime handler for `server.use(...)` so a single
 *   test can swap the payload without touching the global handler list.
 *
 * The helper is transport-only: callers own the response shape in `resolve`,
 * which keeps domain concerns (envelopes, schema encoding, fixtures) out here.
 */
export function createMockEndpoint<TOverride, TBody extends JsonBodyType>({
  method,
  path,
  resolve,
}: CreateMockEndpointConfig<TOverride, TBody>) {
  const toHandler = (override?: TOverride): HttpHandler =>
    http[method](path, () => HttpResponse.json(resolve(override)))

  return {
    path,
    handler: toHandler(),
    mock: (override: TOverride) => toHandler(override),
  }
}
