import * as React from 'react'
import { IconSvgProps } from './types'

const File = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 12'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M7.66675 1H3.66675C3.40153 1 3.14718 1.10536 2.95964 1.29289C2.7721 1.48043 2.66675 1.73478 2.66675 2V10C2.66675 10.2652 2.7721 10.5196 2.95964 10.7071C3.14718 10.8946 3.40153 11 3.66675 11H9.66675C9.93196 11 10.1863 10.8946 10.3739 10.7071C10.5614 10.5196 10.6667 10.2652 10.6667 10V4L7.66675 1Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.66675 1V4H10.6667'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.66675 6.5H4.66675'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.66675 8.5H4.66675'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5.66675 4.5H5.16675H4.66675'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default File
