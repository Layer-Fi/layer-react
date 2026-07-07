import { type JsonBodyType, type PathParams } from 'msw'

import { type MockStore } from '@msw/utils/createMockStore'
import { readRequestJson } from '@msw/utils/request'

type WithId = { id: string }

/* Present body fields win (undefined is normalized to null); absent fields keep their base values. */
export const createUpsertRequestEcho = <TItem>(decode: (input: unknown) => Partial<TItem>) =>
  async (request: Request, base: TItem): Promise<TItem> => {
    const body = decode(await readRequestJson(request))
    const fields = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, value === undefined ? null : value]),
    )

    return { ...base, ...fields }
  }

type EchoResolverConfig<TItem extends WithId, TBody extends JsonBodyType> = {
  store: MockStore<TItem>
  makeBase: (id: string) => TItem
  fromRequest: (request: Request, base: TItem) => Promise<TItem>
  toResponse: (item: TItem) => TBody
}

/*
 * Echo the request body over a base item, persist it to the resource's store,
 * and respond with it. A `.mock(...)` override is returned as-is and never
 * touches the store.
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

export const createEchoTransformationResolver = <TItem extends WithId, TBody extends JsonBodyType>(
  { store, makeBase, toResponse, idParam, transform }:
  Omit<EchoResolverConfig<TItem, TBody>, 'fromRequest'> & { idParam: string, transform: (item: TItem) => TItem },
) =>
  ({ override, params }: { override?: TItem, params: PathParams }) => {
    const id = params[idParam] as string

    if (override) return toResponse(transform({ ...override, id }))

    const item = transform(store.findById(id) ?? makeBase(id))
    store.save(item)

    return toResponse(item)
  }
