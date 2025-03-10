import type { PropsWithChildren } from 'react'

type ConditionalListProps<T> = {
  list: ReadonlyArray<T>
  Empty: React.ReactNode
  children: React.FC<{ item: T, index: number }>
  Container?: React.FC<PropsWithChildren>
} & ({
  isLoading: boolean
  Loading: React.ReactNode
} | {
  isLoading?: never
  Loading?: never
}) & ({
  isError: boolean
  Error: React.ReactNode
} | {
  isError?: never
  Error?: never
})

export function ConditionalList<T>({
  list,
  Empty,
  Container,
  isLoading,
  Loading,
  isError,
  Error,
  children,
}: ConditionalListProps<T>) {
  if (isError) {
    return Error
  }
  if (isLoading) {
    return Loading
  }
  if (list.length === 0) {
    return Empty
  }

  const listItems = list.map((item, index) => children({ item, index }))

  return Container ? <Container>{listItems}</Container> : listItems
}
