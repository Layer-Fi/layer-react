import * as React from 'react'
import { IconSvgProps } from './types'

const SortArrows = ({ size = 13, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 13'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <g clip-path='url(#clip0_1758_75388)'>
      <path
        d='M1.33325 8.5L3.99992 11.1667L6.66659 8.5'
        stroke='currentColor'
        stroke-linecap='round'
        stroke-linejoin='round'
        className='desc-arrow'
      />
      <path
        d='M4 2.5L4 11.1667'
        stroke='currentColor'
        stroke-linecap='round'
        stroke-linejoin='round'
        className='desc-arrow'
      />
      <path
        d='M5.99988 5.16602L8.66654 2.49935L11.3332 5.16602'
        stroke='currentColor'
        stroke-linecap='round'
        stroke-linejoin='round'
        className='asc-arrow'
      />
      <path
        d='M8.66663 11.166L8.66663 2.49935'
        stroke='currentColor'
        stroke-linecap='round'
        stroke-linejoin='round'
        className='asc-arrow'
      />
    </g>
    <defs>
      <clipPath id='clip0_1758_75388'>
        <rect
          width='12'
          height='12'
          fill='white'
          transform='translate(0 0.5)'
        />
      </clipPath>
    </defs>
  </svg>
)

export default SortArrows
