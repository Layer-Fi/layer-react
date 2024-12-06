import React from 'react'
import { ReactNode } from 'react'

interface Props {
  children?: ReactNode | ReactNode[];
}

const Header = ({ children }: Props) => {
  return (
    <div className={
      'Layer__pdf-content-header'
      //'pb-4'
    }>
      <h1 className={
        'Layer__pdf-content-header-text'
        //'text-2xl text-black pb-2 font-semibold'
      }>{children}</h1>
      <div className={
        'Layer__pdf-divider'
        //'mb-4 width-full bg-gray-400 h-[3px]'
      } />
    </div>
  )
}

export default Header
