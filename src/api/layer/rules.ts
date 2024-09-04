
import { Rules } from '../../types/rules'
import { get } from './authenticated_http'

export type GetRulesReturn = {
    data?: Rules
    error?: unknown
}
  
export interface GetRulesParams
    extends Record<string, string | undefined> {
    businessId: string
}

export const getRules = get<
    GetRulesReturn,
    GetRulesParams
>(
    ({
        businessId,
    }: GetRulesParams) =>
        `/v1/businesses/${businessId}/categorization-rules`
)