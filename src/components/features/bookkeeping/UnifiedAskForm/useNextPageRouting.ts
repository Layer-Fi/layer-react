import { useCallback, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-form'

import { type AskFormStaticNext } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { type AskFormNextPageRequest } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { usePostAskFormNextPage } from '@api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormValues } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'

export type NextPageRouting = 'idle' | 'loading' | 'error'

type NextPageRequest = {
  id: number
  values: UnifiedAskFormValues
  hasFailed: boolean
}

/**
 * Asks the server where a SERVER page goes. A request only counts while the form still holds the answers it was
 * sent with, so editing an answer drops it back to idle and its late response is ignored. `onNext` returns false
 * for a route it can't follow, which shows as an error.
 */
export const useNextPageRouting = (form: UnifiedAskFormApi) => {
  const { trigger: postNextPage } = usePostAskFormNextPage()
  const [request, setRequest] = useState<NextPageRequest | null>(null)
  const latestIdRef = useRef(0)

  const isRequestCurrent = useStore(form.store, state => request !== null && state.values === request.values)
  const routing: NextPageRouting = !isRequestCurrent ? 'idle' : request?.hasFailed ? 'error' : 'loading'

  const cancel = useCallback(() => {
    latestIdRef.current += 1
    setRequest(null)
  }, [])

  const requestNextPage = useCallback(async (
    url: string,
    body: AskFormNextPageRequest,
    onNext: (next: AskFormStaticNext) => boolean,
  ) => {
    const id = latestIdRef.current + 1
    const values = form.state.values
    latestIdRef.current = id
    setRequest({ id, values, hasFailed: false })

    const isCurrent = () => latestIdRef.current === id && form.state.values === values

    try {
      const { next } = await postNextPage({ url, request: body })
      if (!isCurrent()) return

      setRequest(onNext(next) ? null : { id, values, hasFailed: true })
    }
    catch {
      if (isCurrent()) setRequest({ id, values, hasFailed: true })
    }
  }, [form, postNextPage])

  return useMemo(() => ({ routing, requestNextPage, cancel }), [cancel, requestNextPage, routing])
}
