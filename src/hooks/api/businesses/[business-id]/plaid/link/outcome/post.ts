import {
  encodeReportPlaidLinkOutcomeParams,
  type ReportPlaidLinkOutcomeParams,
  type ReportPlaidLinkOutcomeParamsEncoded,
} from '@schemas/features/linkedAccounts/plaidLinkOutcome'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REPORT_PLAID_LINK_OUTCOME_TAG_KEY = '#report-plaid-link-outcome'

const reportPlaidLinkOutcome = post<
  Record<string, unknown>,
  ReportPlaidLinkOutcomeParamsEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/outcome`)

export const usePostPlaidLinkOutcome = createMutationHook({
  tags: [REPORT_PLAID_LINK_OUTCOME_TAG_KEY],
  request: reportPlaidLinkOutcome,
  argToBody: (params: ReportPlaidLinkOutcomeParams) => encodeReportPlaidLinkOutcomeParams(params),
})
