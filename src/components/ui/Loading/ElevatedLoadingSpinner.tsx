import type { PropsWithChildren } from 'react'

import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'

import './elevatedLoadingSpinner.scss'

export function ElevatedLoadingSpinner() {
  return (
    <div className='Layer__ElevatedLoadingSpinner'>
      <LoadingSpinner size={48} />
    </div>
  )
}

export function ElevatedLoadingSpinnerContainer({ children }: PropsWithChildren) {
  return (
    <div className='Layer__ElevatedLoadingSpinnerContainer'>
      {children}
    </div>
  )
}
