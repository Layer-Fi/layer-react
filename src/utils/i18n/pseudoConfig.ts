import { DEFAULT_LOCALE } from '@utils/i18n/supportedLocale'

export const pseudoOptions = ({ enabled }: { enabled: boolean }) => ({
  enabled,
  wrapped: true,
  languageToPseudo: DEFAULT_LOCALE,
})
