import type { PropsWithChildren } from 'react'

import './bankTransactionsActions.scss'

const CLASS_NAME = 'Layer__BankTransactionsActions'

export function BankTransactionsActions({ children }: PropsWithChildren) {
  return (
    <div className={CLASS_NAME}>
      {children}
    </div>
  )
}
