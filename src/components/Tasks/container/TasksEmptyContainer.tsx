import type { PropsWithChildren } from 'react'

const CLASS_NAME = 'Layer__TasksEmptyContainer'

export function TasksEmptyContainer({ children }: PropsWithChildren) {
  return (
    <div className={CLASS_NAME}>
      {children}
    </div>
  )
}
