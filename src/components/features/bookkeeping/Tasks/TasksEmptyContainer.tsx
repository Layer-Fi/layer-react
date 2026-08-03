import type { PropsWithChildren } from 'react'

import './tasksEmptyContainer.scss'

const CLASS_NAME = 'Layer__TasksEmptyContainer'

export function TasksEmptyContainer({ children }: PropsWithChildren) {
  return (
    <div className={CLASS_NAME}>
      {children}
    </div>
  )
}
