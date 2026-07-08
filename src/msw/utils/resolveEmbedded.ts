type ResolveEmbeddedArgs<T> = {
  requestedId: string | null | undefined
  fallback: T | null
  lookup: (id: string) => T | undefined
}

export const resolveEmbedded = <T>({ requestedId, fallback, lookup }: ResolveEmbeddedArgs<T>): T | null =>
  requestedId === undefined
    ? fallback
    : requestedId === null
      ? null
      : lookup(requestedId) ?? fallback
