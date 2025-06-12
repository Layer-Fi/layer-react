import type { PropsWithChildren } from 'react'

const CLASS_NAME = 'Layer__TransactionsActions'

export function TransactionsActions({ children }: PropsWithChildren) {
  return (
    <div className={CLASS_NAME}>
      {children}
    </div>
  )
}
