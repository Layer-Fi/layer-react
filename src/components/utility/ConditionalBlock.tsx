type ConditionalBlockProps<T> = {
  data: T | undefined
  children: React.FC<{ data: T }>
} & ({
  isLoading: boolean
  Loading: React.ReactNode
  Inactive: React.ReactNode
} | {
  isLoading?: never
  Loading?: never
  Inactive?: never
}) & ({
  isError: boolean
  Error: React.ReactNode
} | {
  isError?: never
  Error?: never
})

export function ConditionalBlock<T>({
  data,
  children,
  isLoading,
  Loading,
  Inactive,
  isError,
  Error,
}: ConditionalBlockProps<T>) {
  if (isError) {
    return Error
  }

  if (!data && isLoading) {
    return Loading
  }

  if (!data) {
    return Inactive
  }

  return children({ data })
}
