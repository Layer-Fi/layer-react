import { createContext } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { endOfYear, startOfYear } from 'date-fns'

export type TasksContextType = ReturnType<typeof useTasks>
export const TasksContext = createContext<TasksContextType>({
  data: undefined,
  isLoading: false,
  loadedStatus: 'initial',
  error: undefined,
  currentDate: new Date(),
  setCurrentDate: () => {},
  dateRange: { startDate: startOfYear(new Date()), endDate: endOfYear(new Date()), mode: 'yearPicker' },
  setDateRange: () => {},
  refetch: () => {},
  submitResponseToTask: () => {},
  updateDocUploadTaskDescription: () => {},
  uploadDocumentsForTask: () => Promise.resolve(),
  deleteUploadsForTask: () => {},
})
