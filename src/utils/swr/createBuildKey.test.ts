import { describe, expect, it, vi } from 'vitest'

import type { PaginatedResponse } from '@schemas/common/pagination'
import { createBuildKey, createInfiniteKeyLoader } from '@utils/swr/createBuildKey'

type WidgetParams = { businessId: string, widgetId?: string }

const AUTH = { access_token: 'tok', token_type: 'Bearer', expires_in: 3600, apiUrl: 'https://api' }

describe('createBuildKey', () => {
  const buildKey = createBuildKey<WidgetParams>(['Widgets'])

  it('returns a key with auth context, params, and tags when enabled and authenticated', () => {
    expect(buildKey({ ...AUTH, businessId: 'b1', widgetId: 'w1' })).toEqual({
      accessToken: 'tok',
      apiUrl: 'https://api',
      businessId: 'b1',
      widgetId: 'w1',
      tags: ['Widgets'],
    })
  })

  it('strips token_type and expires_in from the key', () => {
    const key = buildKey({ ...AUTH, businessId: 'b1' })
    expect(key).not.toHaveProperty('token_type')
    expect(key).not.toHaveProperty('expires_in')
  })

  it('returns undefined when isEnabled is false', () => {
    expect(buildKey({ ...AUTH, businessId: 'b1', isEnabled: false })).toBeUndefined()
  })

  it('returns undefined when the access token is missing', () => {
    expect(buildKey({ apiUrl: 'https://api', businessId: 'b1' })).toBeUndefined()
  })

  it('returns undefined when the apiUrl is missing', () => {
    expect(buildKey({ access_token: 'tok', token_type: 'Bearer', expires_in: 1, businessId: 'b1' })).toBeUndefined()
  })
})

type Page = PaginatedResponse<{ id: string }>

const makePage = (cursor: string | null): Page => ({
  data: [],
  meta: { pagination: { cursor, hasMore: cursor !== null, totalCount: 0 } },
})

describe('createInfiniteKeyLoader', () => {
  const loadKey = createInfiniteKeyLoader<WidgetParams, Page>(['Widgets'])

  it('uses no cursor for the first page', () => {
    expect(loadKey(null, { ...AUTH, businessId: 'b1' })).toEqual({
      accessToken: 'tok',
      apiUrl: 'https://api',
      businessId: 'b1',
      cursor: undefined,
      tags: ['Widgets'],
    })
  })

  it('reads the cursor from the previous page by default', () => {
    const key = loadKey(makePage('cursor-2'), { ...AUTH, businessId: 'b1' })
    expect(key).toMatchObject({ cursor: 'cursor-2' })
  })

  it('supports a custom getCursor', () => {
    const getCursor = vi.fn((prev: Page | null) => prev?.meta?.pagination.cursor ?? 'fallback')
    const customLoader = createInfiniteKeyLoader<WidgetParams, Page>(['Widgets'], getCursor)

    const key = customLoader(null, { ...AUTH, businessId: 'b1' })

    expect(getCursor).toHaveBeenCalledWith(null)
    expect(key).toMatchObject({ cursor: 'fallback' })
  })

  it('returns undefined when isEnabled is false', () => {
    expect(loadKey(null, { ...AUTH, businessId: 'b1', isEnabled: false })).toBeUndefined()
  })

  it('returns undefined when auth is incomplete', () => {
    expect(loadKey(null, { apiUrl: 'https://api', businessId: 'b1' })).toBeUndefined()
  })
})
