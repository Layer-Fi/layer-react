/** Layer API responses wrap their payload in a top-level `data` envelope. */
export const apiData = <T>(data: T) => ({ data })
