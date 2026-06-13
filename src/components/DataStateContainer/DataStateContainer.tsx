import { type PropsWithChildren } from 'react'

import { VStack } from '@ui/Stack/Stack'

import './dataStateContainer.scss'

export const DataStateContainer = ({ children }: PropsWithChildren) => (
  <VStack
    className='Layer__DataStateContainer'
    align='center'
    justify='center'
    pb='2xl'
    pi='sm'
  >
    {children}
  </VStack>
)
