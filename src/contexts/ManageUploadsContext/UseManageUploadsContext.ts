import { createContext, useContext } from 'react'


export type ManageUploadsContextType = any

export const ManageUploadsContext =
  createContext<ManageUploadsContextType>({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: () => {},
  })

export const useManageUploadsContext = () =>
  useContext(ManageUploadsContext)
