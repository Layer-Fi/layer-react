import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeAccountId } from '@schemas/common/accountIdentifier'
import { usePostCounterpartyAskResponse } from '@api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { makeP2PCounterpartyAskTask } from '@fixtures/bookkeeping/counterpartyAskTasks'
import { post as postCounterpartyAskResponse } from '@msw/api/businesses/[business-id]/tasks/[task-id]/counterparty-ask-response/post'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

const renderPostCounterpartyAskResponse = () => renderHookWithAuth(() => usePostCounterpartyAskResponse())

describe('usePostCounterpartyAskResponse', () => {
  it('decodes a P2P counterparty ask returned by the API', async () => {
    const p2pTask = makeP2PCounterpartyAskTask()
    server.use(postCounterpartyAskResponse.mock(p2pTask))

    const { result } = await renderPostCounterpartyAskResponse()

    let saved: unknown
    await act(async () => {
      saved = await result.current.trigger({
        taskId: p2pTask.id,
        response: {
          accountIdentifier: makeAccountId(bankTransactionCategories.otherBusinessExpenses.id),
          alwaysThis: false,
        },
      })
    })

    expect(saved).toEqual(p2pTask)
  })
})
