import { http, type HttpHandler, HttpResponse, type JsonBodyType, type PathParams } from 'msw'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

type ResolveContext<TOverride> = {
  /** Test-supplied override from `.mock(...)`; undefined for the default handler. */
  override?: TOverride
  /** The intercepted request — read query params, headers, or body from it. */
  request: Request
  /** Matched path params, e.g. `:businessId`. */
  params: PathParams
}

type CreateMockEndpointConfig<TOverride, TBody extends JsonBodyType> = {
  /** HTTP method to intercept. */
  method: HttpMethod
  /**
   * MSW path pattern. Start it with a `*` wildcard (no space after it) so it
   * matches the endpoint on any base URL — prod, staging, localhost. For
   * example, a wildcard immediately followed by
   * `/v1/businesses/:businessId/custom-accounts`.
   */
  path: string
  /**
   * Builds the JSON response body from the request context. `override` is the
   * value passed to `.mock(...)`, or undefined for the default handler.
   */
  resolve: (context: ResolveContext<TOverride>) => TBody
}

/*
 * Bundles an endpoint's default MSW handler with a per-test override builder.
 *
 * - `handler` is registered once in `handlers.ts` and serves the default payload.
 * - `mock(override)` returns a runtime handler for `server.use(...)` so a single
 *   test can swap the payload without touching the global handler list.
 */
export function createMockEndpoint<TOverride, TBody extends JsonBodyType>({
  method,
  path,
  resolve,
}: CreateMockEndpointConfig<TOverride, TBody>) {
  const toHandler = (override?: TOverride): HttpHandler =>
    http[method](path, ({ request, params }) =>
      HttpResponse.json(resolve({ override, request, params })))

  return {
    path,
    handler: toHandler(),
    mock: (override: TOverride) => toHandler(override),
  }
}
