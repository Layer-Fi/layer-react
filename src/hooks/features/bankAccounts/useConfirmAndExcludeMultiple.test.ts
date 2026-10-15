import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { useConfirmAndExcludeMultiple } from '@hooks/features/bankAccounts/useConfirmAndExcludeMultiple'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { post as postConfirmExternalAccount } from '@msw/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm/post'
import { post as postExcludeExternalAccount } from '@msw/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude/post'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

describe('useConfirmAndExcludeMultiple', () => {
  it('refetches bookkeeping periods after confirming and excluding accounts', async () => {
    server.use(getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })))
    const onPeriodsRequest = vi.fn()
    server.use(getBookkeepingPeriods.mock([], { onRequest: onPeriodsRequest }))
    const confirm = spyOnEndpoint(postConfirmExternalAccount)
    const exclude = spyOnEndpoint(postExcludeExternalAccount)
    const onSuccess = vi.fn()

    const { result } = await renderHookWithAuth(() => useConfirmAndExcludeMultiple({ onSuccess }))
    await waitFor(() => expect(onPeriodsRequest).toHaveBeenCalledOnce())

    await expect(result.current.trigger({ 'account-1': true, 'account-2': false })).resolves.toBe(true)

    expect(confirm).toHaveBeenCalledOnce()
    expect(exclude).toHaveBeenCalledOnce()
    expect(onSuccess).toHaveBeenCalledOnce()
    await waitFor(() => expect(onPeriodsRequest).toHaveBeenCalledTimes(2))
  })
})
