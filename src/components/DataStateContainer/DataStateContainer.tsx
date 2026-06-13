import { type PropsWithChildren } from 'react'

import './dataStateContainer.scss'

export const DataStateContainer = ({ children }: PropsWithChildren) => (
  <div className='Layer__DataStateContainer'>
    {children}
  </div>
)
