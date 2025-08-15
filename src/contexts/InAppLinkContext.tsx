import { createContext, useContext, ReactNode } from 'react'

export interface InAppLinkContextType<T> {
  convertToInAppLink?: (source: T) => ReactNode | undefined
}

export interface InAppLinkProviderProps<T> {
  convertToInAppLink?: (source: T) => ReactNode | undefined
  children: ReactNode
}

export const createInAppLinkContext = <T,>() => {
  const Context = createContext<InAppLinkContextType<T>>({})

  const useInAppLinkContext = () => useContext(Context)

  const InAppLinkProvider = ({
    convertToInAppLink,
    children,
  }: InAppLinkProviderProps<T>) => {
    return (
      <Context.Provider value={{ convertToInAppLink }}>
        {children}
      </Context.Provider>
    )
  }

  return {
    InAppLinkProvider,
    useInAppLinkContext,
  }
}
