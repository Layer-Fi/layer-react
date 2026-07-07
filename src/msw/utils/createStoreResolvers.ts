import { type JsonBodyType, type PathParams } from 'msw'

import { type MockStore } from '@msw/utils/createMockStore'

type WithId = { id: string }

type StoreResolverConfig<TItem extends WithId, TBody extends JsonBodyType> = {
  store: MockStore<TItem>
  makeBase: (id: string) => TItem
  fromRequest: (request: Request, base: TItem) => Promise<TItem>
  toResponse: (item: TItem) => TBody
}

export const createStoreCreateResolver = <TItem extends WithId, TBody extends JsonBodyType>(
  { store, makeBase, fromRequest, toResponse }: StoreResolverConfig<TItem, TBody>,
) =>
  async ({ override, request }: { override?: TItem, request: Request }) => {
    if (override) return toResponse(override)

    const item = await fromRequest(request, makeBase(crypto.randomUUID()))
    store.save(item)

    return toResponse(item)
  }

export const createStoreUpdateResolver = <TItem extends WithId, TBody extends JsonBodyType>(
  { store, makeBase, fromRequest, toResponse, idParam }: StoreResolverConfig<TItem, TBody> & { idParam: string },
) =>
  async ({ override, request, params }: { override?: TItem, request: Request, params: PathParams }) => {
    const id = params[idParam] as string

    if (override) return toResponse({ ...override, id })

    const base = store.findById(id) ?? makeBase(id)
    const item = await fromRequest(request, base)
    store.save(item)

    return toResponse(item)
  }

export const createStoreTransformResolver = <TItem extends WithId, TBody extends JsonBodyType>(
  { store, makeBase, toResponse, idParam, transform }:
  Omit<StoreResolverConfig<TItem, TBody>, 'fromRequest'> & { idParam: string, transform: (item: TItem) => TItem },
) =>
  ({ override, params }: { override?: TItem, params: PathParams }) => {
    const id = params[idParam] as string

    if (override) return toResponse(transform({ ...override, id }))

    const item = transform(store.findById(id) ?? makeBase(id))
    store.save(item)

    return toResponse(item)
  }
