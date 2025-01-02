import React from 'react'

export const ErrorMessage = ({ children }: { children: React.ReactNode }) => {
  if (!children) {
    return null
  }

  return <div className='Layer__error-message'>{children}</div>
}
