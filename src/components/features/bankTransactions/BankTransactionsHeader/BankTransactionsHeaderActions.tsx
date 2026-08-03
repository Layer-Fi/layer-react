import type { PropsWithChildren } from 'react'

import './bankTransactionsHeaderActions.scss'

const CLASS_NAME = 'Layer__BankTransactionsActions'

export function BankTransactionsHeaderActions({ children }: PropsWithChildren) {
  return (
    <div className={CLASS_NAME}>
      {children}
    </div>
  )
}
