import { Schema } from 'effect'

import { AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import {
  AskFormNextPageRequestSchema,
  type AskFormNextPageResult,
  AskFormNextPageResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'

import { ASK_FORM_STEP_IDS } from '@fixtures/bookkeeping/unifiedAskFormTasks'
import { assertAskFormRequest, decodeAskFormRequest } from '@msw/api/businesses/[business-id]/tasks/askFormValidation'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(AskFormNextPageResultSchema)

const toResponse = (result: AskFormNextPageResult) => apiData(encodeResult(result))

const ACCOUNT_TYPE_ROUTES: Record<string, string> = { owned: 'connect', vendor: 'vendor', customer: 'customer' }

export const post = createMockEndpoint<AskFormNextPageResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/next-page',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const { pageId, pageHistory, answers } = decodeAskFormRequest(
      AskFormNextPageRequestSchema,
      await readRequestJson(request),
      { allowEmptyAnswers: true },
    )
    assertAskFormRequest(pageHistory.at(-1) === pageId, 'page_id must be the last entry of page_history')

    const accountType = answers[ASK_FORM_STEP_IDS.accountType]
    const choice = accountType && 'choice' in accountType ? accountType.choice : null
    const nextPageId = pageId === ASK_FORM_STEP_IDS.accountType && choice ? ACCOUNT_TYPE_ROUTES[choice] : undefined

    return toResponse({
      next: nextPageId ? { kind: AskFormNextKind.Page, pageId: nextPageId } : { kind: AskFormNextKind.Submit, review: false },
    })
  },
})
