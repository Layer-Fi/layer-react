import { useCallback, useMemo, useRef, useState } from 'react'

import { type AskFormStaticNext } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { type AskFormNextPageRequest } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { usePostAskFormNextPage } from '@api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'

export type NextPageRouting = 'idle' | 'loading' | 'error'

/**
 * Asks the server where a SERVER page goes. A response is followed only if it answers the latest request for
 * unchanged answers; `onNext` returns false for a route it can't follow, which shows as an error.
 */
export const useNextPageRouting = (form: UnifiedAskFormApi) => {
  const { trigger: postNextPage } = usePostAskFormNextPage()
  const [routing, setRouting] = useState<NextPageRouting>('idle')
  const latestRequestRef = useRef(0)

  const cancel = useCallback(() => {
    latestRequestRef.current += 1
    setRouting('idle')
  }, [])

  const requestNextPage = useCallback(async (
    url: string,
    request: AskFormNextPageRequest,
    onNext: (next: AskFormStaticNext) => boolean,
  ) => {
    const requestId = latestRequestRef.current + 1
    const sentValues = form.state.values
    latestRequestRef.current = requestId
    setRouting('loading')

    try {
      const { next } = await postNextPage({ url, request })
      if (latestRequestRef.current !== requestId) return

      const isFollowed = form.state.values !== sentValues || onNext(next)
      setRouting(isFollowed ? 'idle' : 'error')
    }
    catch {
      if (latestRequestRef.current === requestId) setRouting('error')
    }
  }, [form, postNextPage])

  return useMemo(() => ({ routing, requestNextPage, cancel }), [cancel, requestNextPage, routing])
}
