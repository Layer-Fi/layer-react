import { createContext } from 'react'
import { useDrawer } from '../../hooks/useDrawer'

export type DrawerContextType = ReturnType<typeof useDrawer>
export const DrawerContext = createContext<DrawerContextType>({
  content: undefined,
  setContent: () => undefined,
  close: () => undefined,
})
