import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AskFormSearchEntity } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { useGetUnifiedSearch } from '@api/businesses/[business-id]/search/get'

import { get as getUnifiedSearch } from '@msw/api/businesses/[business-id]/search/get'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

describe('useGetUnifiedSearch', () => {
  it('sends taskId as task_id', async () => {
    const onRequest = vi.fn<(url: string) => void>()
    server.use(getUnifiedSearch.mock([], { onRequest: ({ request }) => onRequest(request.url) }))

    const { result } = await renderHookWithAuth(() => useGetUnifiedSearch())
    expect(onRequest).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.trigger({ entity: AskFormSearchEntity.Vendor, q: 'cost', taskId: 'task-1' })
    })

    expect(onRequest).toHaveBeenCalledTimes(1)
    const { searchParams } = new URL(onRequest.mock.calls[0]?.[0] ?? '')
    expect(searchParams.get('task_id')).toBe('task-1')
    expect(searchParams.has('taskId')).toBe(false)
  })
})
