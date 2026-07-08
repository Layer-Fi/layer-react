type ResolveEmbeddedArgs<T> = {
  requestedId: string | null | undefined
  fallback: T
  lookup: (id: string) => T
}

export const resolveEmbedded = <T>({ requestedId, fallback, lookup }: ResolveEmbeddedArgs<T>): T =>
  requestedId === undefined
    ? fallback
    : requestedId === null
      ? (null as T)
      : lookup(requestedId)
