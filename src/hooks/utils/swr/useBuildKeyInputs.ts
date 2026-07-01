import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useBuildKeyInputs() {
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()

  return { withLocale, businessId, auth }
}
