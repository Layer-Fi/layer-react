import { createContext, useContext } from 'react'
import { useTasks } from '../../hooks/useTasks'

export type TasksContextType = ReturnType<typeof useTasks>
export const TasksContext = createContext<TasksContextType>({
  data: undefined,
  isLoading: undefined,
  isValidating: undefined,
  error: undefined,
  refetch: () => {},
  submitResponseToTask: () => {},
  uploadDocumentsForTask: () => Promise.resolve(),
  deleteUploadsForTask: () => {},
  updateDocUploadTaskDescription: () => {},
  currentDate: new Date(),
  setCurrentDate: () => {},
})

export const useTasksContext = () => useContext(TasksContext)
