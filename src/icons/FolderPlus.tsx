import * as React from 'react'
import { IconSvgProps } from './types'

const FolderPlus = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M16.5 14.25C16.5 14.6478 16.342 15.0294 16.0607 15.3107C15.7794 15.592 15.3978 15.75 15 15.75H3C2.60218 15.75 2.22064 15.592 1.93934 15.3107C1.65804 15.0294 1.5 14.6478 1.5 14.25V3.75C1.5 3.35218 1.65804 2.97064 1.93934 2.68934C2.22064 2.40804 2.60218 2.25 3 2.25H6.75L8.25 4.5H15C15.3978 4.5 15.7794 4.65804 16.0607 4.93934C16.342 5.22064 16.5 5.60218 16.5 6V14.25Z'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M9 8.25V12.75'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M6.75 10.5H11.25'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
)

export default FolderPlus
