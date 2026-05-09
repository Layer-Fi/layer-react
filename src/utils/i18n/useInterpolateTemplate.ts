import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export const useInterpolateTemplate = <TVars extends object = object>() => {
  const { i18n } = useTranslation()

  return useCallback(
    (template: string, vars: TVars): string => {
      return i18n.services.interpolator.interpolate(
        template,
        vars,
        i18n.language,
        i18n.options.interpolation ?? {},
      )
    },
    [i18n.language, i18n.options.interpolation, i18n.services.interpolator],
  )
}
