import React, { type PropsWithChildren } from 'react'

type ConditionalListProps<T> = {
  list: ReadonlyArray<T>
  Empty: React.ReactNode
  children: React.FC<{ item: T }>
  Container?: React.FC<PropsWithChildren>
} & ({
  isLoading: boolean
  Loading: React.ReactNode
} | {
  isLoading?: never
  Loading?: never
})

export function ConditionalList<T>({
  list,
  isLoading,
  Empty,
  Container,
  Loading,
  children,
}: ConditionalListProps<T>) {
  if (isLoading) {
    return Loading
  }
  if (list.length === 0) {
    return Empty
  }

  const listItems = list.map(item => children({ item }))

  return Container ? <Container>{listItems}</Container> : listItems
}
