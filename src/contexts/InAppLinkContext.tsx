import { createContext, useContext, ReactNode } from 'react'

export interface InAppLink {
  href: string
  text: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export interface InAppLinkContextType<T> {
  convertToInAppLink?: (source: T) => InAppLink | undefined
}

export interface InAppLinkProviderProps<T> {
  convertToInAppLink?: (source: T) => InAppLink | undefined
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
