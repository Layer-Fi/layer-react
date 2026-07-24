import { Loader as LoaderIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

type LoaderProps = PropsWithChildren<{
  size?: number
}>

export const Loader = ({ children, size = 28 }: LoaderProps) => {
  return (
    <span className='Layer__loader'>
      <LoaderIcon size={size} className='Layer__anim--rotating' />
      {children}
    </span>
  )
}
