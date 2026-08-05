import { createContext, type ReactNode, useContext } from 'react'

import { type LinkingMetadata } from '@internal-types/inAppLink'

export { EntityName, type LinkingMetadata, type RelatedEntityLinkingMetadata } from '@internal-types/inAppLink'

export interface InAppLinkContextType {
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

export interface InAppLinkProviderProps {
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
  children: ReactNode
}

const InAppLinkContext = createContext<InAppLinkContextType>({})

export const useInAppLinkContext = () => useContext(InAppLinkContext)

export const InAppLinkProvider = ({
  renderInAppLink,
  children,
}: InAppLinkProviderProps) => {
  return (
    <InAppLinkContext.Provider value={{ renderInAppLink }}>
      {children}
    </InAppLinkContext.Provider>
  )
}
