import { createContext } from 'react'
import { useTasks } from '../../hooks/useTasks'

export type TasksContextType = ReturnType<typeof useTasks>
export const TasksContext = createContext<TasksContextType>({
  data: undefined,
  isLoading: false,
  error: undefined,
  refetch: () => {},
  update: () => {},
})
