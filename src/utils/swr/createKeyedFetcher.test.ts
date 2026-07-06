import { Schema } from 'effect'
import { describe, expect, it, vi } from 'vitest'

import { type AuthenticatedRequest, createKeyedFetcher, type SWRKeyContext } from '@utils/swr/createKeyedFetcher'

type WidgetParams = { businessId: string, widgetId?: string }
type RawWidget = { id: string, display_name: string }

const RAW_WIDGET: RawWidget = { id: 'w1', display_name: 'Widget One' }

const CONTEXT: SWRKeyContext = {
  accessToken: 'tok',
  apiUrl: 'https://api',
  tags: ['Widgets'],
}

const makeRequest = <T>(impl: () => Promise<T>) =>
  vi.fn<AuthenticatedRequest<T, WidgetParams>>(() => impl)

const WidgetSchema = Schema.Struct({
  id: Schema.String,
  displayName: Schema.propertySignature(Schema.String).pipe(Schema.fromKey('display_name')),
})

describe('createKeyedFetcher', () => {
  it('forwards apiUrl and accessToken and strips the key context from params', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const fetcher = createKeyedFetcher(request)

    await fetcher({ ...CONTEXT, businessId: 'b1', widgetId: 'w1' })

    expect(request).toHaveBeenCalledWith('https://api', 'tok', {
      params: { businessId: 'b1', widgetId: 'w1' },
    })
    const params = request.mock.calls[0][2]?.params
    expect(params).not.toHaveProperty('tags')
    expect(params).not.toHaveProperty('accessToken')
    expect(params).not.toHaveProperty('apiUrl')
  })

  it('returns the raw response when no schema is provided', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const fetcher = createKeyedFetcher(request)

    await expect(fetcher({ ...CONTEXT, businessId: 'b1' })).resolves.toEqual(RAW_WIDGET)
  })

  it('decodes the response with the schema', async () => {
    const request = makeRequest(() => Promise.resolve(RAW_WIDGET))
    const fetcher = createKeyedFetcher(request, WidgetSchema)

    await expect(fetcher({ ...CONTEXT, businessId: 'b1' }))
      .resolves.toEqual({ id: 'w1', displayName: 'Widget One' })
  })

  it('rejects when the response fails schema decoding', async () => {
    const request = makeRequest(() => Promise.resolve({ id: 'w1' } as unknown as RawWidget))
    const fetcher = createKeyedFetcher(request, WidgetSchema)

    await expect(fetcher({ ...CONTEXT, businessId: 'b1' })).rejects.toBeDefined()
  })
})
