import { del } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'

export const rejectCategorizationRulesUpdateSuggestion = del<never>(
  ({ businessId, suggestionId }) =>
    `/v1/businesses/${businessId}/categorization-rules/suggestions/${suggestionId}`,
)

export function useRejectCategorizationRulesUpdateSuggestion() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  return (suggestionId: string) => {
    if (auth?.apiUrl && auth?.access_token) {
      void rejectCategorizationRulesUpdateSuggestion(
        auth?.apiUrl,
        auth.access_token,
        { params: { businessId, suggestionId } },
      )
    }
  }
}
