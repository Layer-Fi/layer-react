import { createContext, useContext, useState, type ReactNode } from 'react'
import { BookkeepingPeriodScale } from '@schemas/bookkeepingPeriods'

type TasksScaleContextType = {
  selectedScale: BookkeepingPeriodScale | null
  setSelectedScale: (scale: BookkeepingPeriodScale | null) => void
}

export const TasksScaleContext = createContext<TasksScaleContextType | undefined>(undefined)

export function TasksScaleProvider({ children }: { children: ReactNode }) {
  const [selectedScale, setSelectedScale] = useState<BookkeepingPeriodScale | null>(null)

  return (
    <TasksScaleContext.Provider value={{ selectedScale, setSelectedScale }}>
      {children}
    </TasksScaleContext.Provider>
  )
}

export function useTasksScale() {
  const context = useContext(TasksScaleContext)
  if (context === undefined) {
    throw new Error('useTasksScale must be used within a TasksScaleProvider')
  }
  return context
}
