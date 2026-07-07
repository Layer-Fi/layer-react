import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLocalizedKey } from '@hooks/utils/swr/useLocalizedKey'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useBuildKeyInputs() {
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()

  return { withLocale, businessId, auth }
}
