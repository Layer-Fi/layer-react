import { Schema } from 'effect'

import { isChoiceAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import {
  AskFormNextPageRequestSchema,
  type AskFormNextPageResult,
  AskFormNextPageResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'

import { ACCOUNT_MASK_ENTRY_PAGE_ID, ACCOUNT_MASK_ROUTES } from '@fixtures/bookkeeping/unifiedAskFormTasks/accountMask'
import { ASK_FORM_STEP_IDS, SUBMIT, toPage } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { assertAskFormRequest, decodeAskFormRequest } from '@msw/api/businesses/[business-id]/unified-tasks/askFormValidation'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeResult = Schema.encodeSync(AskFormNextPageResultSchema)

const toResponse = (result: AskFormNextPageResult) => apiData(encodeResult(result))

const routes: Partial<Record<string, string>> = ACCOUNT_MASK_ROUTES

export const post = createMockEndpoint<AskFormNextPageResult, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/next-page',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const { pageId, pageHistory, answers } = decodeAskFormRequest(AskFormNextPageRequestSchema, await readRequestJson(request))
    assertAskFormRequest(pageHistory.at(-1) === pageId, 'page_id must be the last entry of page_history')

    const accountType = answers[ASK_FORM_STEP_IDS.accountType]
    const nextPageId = pageId === ACCOUNT_MASK_ENTRY_PAGE_ID && isChoiceAnswer(accountType) ? routes[accountType.choice] : undefined

    return toResponse({ next: nextPageId ? toPage(nextPageId) : SUBMIT })
  },
})
