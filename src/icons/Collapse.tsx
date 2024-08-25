import * as React from 'react'
import { IconSvgProps } from './types'

const Collapse = ({ ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='22'
    viewBox='0 0 14 22'
    fill='none'
    {...props}
  >
    <path
      d='M3.5 5.25L7 8.75L10.5 5.25'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.5 16.75L7 13.25L10.5 16.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Collapse
