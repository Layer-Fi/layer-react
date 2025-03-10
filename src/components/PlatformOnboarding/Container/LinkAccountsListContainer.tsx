import type { PropsWithChildren } from 'react'

export function LinkAccountsListContainer({ children }: PropsWithChildren) {
  const CLASS_NAME = 'Layer__LinkAccountsListContainer'

  return <div className={CLASS_NAME}>{children}</div>
}
