import React from 'react'
import { ReactNode } from 'react'

interface Props {
  children?: ReactNode | ReactNode[];
  id: string;
}

const Page = ({ children, id }: Props) => {
  const PAGE_WIDTH = '800px'
  const PAGE_HEIGHT = '1132px'
  return (
    <div
      className='Layer__pdf-page'
      style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
      id={id}
    >
      <div>
        {/*<img src='/imgs/moxie-logo.png' width={120} height={30} />*/}
      </div>
      {children}
    </div>
  )
}

export default Page
