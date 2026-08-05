import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLocalizedKey } from '@hooks/utils/swr/useLocalizedKey'

export function useBuildKeyInputs() {
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()

  return { withLocale, businessId, auth }
}
