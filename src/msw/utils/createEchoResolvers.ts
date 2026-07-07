import { type JsonBodyType, type PathParams } from 'msw'

import { type MockStore } from '@msw/utils/createMockStore'

type WithId = { id: string }

type EchoResolverConfig<TItem extends WithId, TBody extends JsonBodyType> = {
  /** Backing store the default resolver reads from and persists to. */
  store: MockStore<TItem>
  /** Fixture factory for the base item when none exists yet (create, or update of an unknown id). */
  makeBase: (id: string) => TItem
  /** Echoes the request body over the base item - see the per-resource `*FromUpsertRequest` helpers. */
  fromRequest: (request: Request, base: TItem) => Promise<TItem>
  /** Wraps the item in the endpoint's response envelope. */
  toResponse: (item: TItem) => TBody
}

/*
 * Default resolvers for mutation mocks: echo the request body over a base
 * item, persist it to the resource's store (so later list responses reflect
 * the mutation), and respond with it. A test-supplied `.mock(...)` override
 * is returned as-is and never touches the store.
 */
export const createEchoCreateResolver = <TItem extends WithId, TBody extends JsonBodyType>(
  { store, makeBase, fromRequest, toResponse }: EchoResolverConfig<TItem, TBody>,
) =>
  async ({ override, request }: { override?: TItem, request: Request }) => {
    if (override) return toResponse(override)

    const item = await fromRequest(request, makeBase(crypto.randomUUID()))
    store.save(item)

    return toResponse(item)
  }

export const createEchoUpdateResolver = <TItem extends WithId, TBody extends JsonBodyType>(
  { store, makeBase, fromRequest, toResponse, idParam }: EchoResolverConfig<TItem, TBody> & { idParam: string },
) =>
  async ({ override, request, params }: { override?: TItem, request: Request, params: PathParams }) => {
    const id = params[idParam] as string

    if (override) return toResponse({ ...override, id })

    const base = store.findById(id) ?? makeBase(id)
    const item = await fromRequest(request, base)
    store.save(item)

    return toResponse(item)
  }
