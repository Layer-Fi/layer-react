export const resolveEmbedded = <T>(
  id: string | null | undefined,
  base: T,
  resolve: (id: string) => T,
): T =>
  id === undefined
    ? base
    : id === null
      ? (null as T)
      : resolve(id)
