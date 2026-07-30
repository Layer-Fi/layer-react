import { type ReactNode } from 'react'

import './iconBox.scss'

interface IconBoxProps {
  children: ReactNode
}

export const IconBox = ({ children }: IconBoxProps) => {
  return <span className='Layer__IconBox'>{children}</span>
}
