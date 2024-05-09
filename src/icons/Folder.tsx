import * as React from 'react'
import { IconSvgProps } from './types'

const Folder = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 12'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M11 9.5C11 9.76522 10.8946 10.0196 10.7071 10.2071C10.5196 10.3946 10.2652 10.5 10 10.5H2C1.73478 10.5 1.48043 10.3946 1.29289 10.2071C1.10536 10.0196 1 9.76522 1 9.5V2.5C1 2.23478 1.10536 1.98043 1.29289 1.79289C1.48043 1.60536 1.73478 1.5 2 1.5H4.5L5.5 3H10C10.2652 3 10.5196 3.10536 10.7071 3.29289C10.8946 3.48043 11 3.73478 11 4V9.5Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Folder
