import { type PropsWithChildren } from 'react'

import './buttonIconBox.scss'

export function ButtonIconBox({ children }: PropsWithChildren) {
  return <span className='Layer__ButtonIconBox'>{children}</span>
}
