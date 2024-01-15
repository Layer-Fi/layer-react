export const formStringFromObject = (
  object: Record<string, string | number | boolean>,
): string =>
  Object.entries(object)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
