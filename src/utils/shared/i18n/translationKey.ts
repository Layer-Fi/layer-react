export function translationKey(
  key: string,
  defaultValue: string,
  ns?: string,
): { i18nKey: string, defaultValue: string, ns?: string } {
  return { i18nKey: key, defaultValue, ns }
}
