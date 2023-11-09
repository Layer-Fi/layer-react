export const formStringFromObject = (object: Object): string =>
  Object.entries(object)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
