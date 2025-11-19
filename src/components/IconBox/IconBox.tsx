import { type ReactNode } from 'react'

interface IconBoxProps {
  children: ReactNode
}

export const IconBox = ({ children }: IconBoxProps) => {
  return <span className='Layer__icon-box'>{children}</span>
}
